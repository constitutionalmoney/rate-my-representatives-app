CREATE SCHEMA IF NOT EXISTS rmr_public;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_public_profile_reader') THEN
    CREATE ROLE rmr_public_profile_reader NOLOGIN;
  END IF;
END
$$;

CREATE TABLE rmr_public.profile_publication_decision (
  decision_id text PRIMARY KEY CHECK (decision_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  actor_type text NOT NULL CHECK (actor_type IN ('reviewer', 'admin')),
  actor_reference text NOT NULL CHECK (
    actor_reference ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  decision text NOT NULL CHECK (decision IN ('publish', 'withdraw')),
  reason_code text NOT NULL CHECK (reason_code ~ '^[A-Z][A-Z0-9_]{0,63}$'),
  policy_version text NOT NULL CHECK (
    policy_version ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  decided_at timestamptz NOT NULL
);

COMMENT ON TABLE rmr_public.profile_publication_decision IS
  'Explicit human publication or withdrawal decisions. Source ingestion and AI processes cannot publish profiles.';

CREATE TABLE rmr_public.profile (
  profile_id text PRIMARY KEY CHECK (profile_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  person_id text NOT NULL REFERENCES rmr_registry.person(person_id),
  office_term_id text REFERENCES rmr_registry.office_term(office_term_id),
  candidacy_id text REFERENCES rmr_registry.candidacy(candidacy_id),
  created_at timestamptz NOT NULL,
  CONSTRAINT profile_one_public_role_context CHECK (
    num_nonnulls(office_term_id, candidacy_id) = 1
  ),
  UNIQUE (person_id, office_term_id),
  UNIQUE (person_id, candidacy_id)
);

COMMENT ON TABLE rmr_public.profile IS
  'Stable application profile identifier for one person in one office-term or candidacy context; the person and context remain separate canonical registry records.';

CREATE TABLE rmr_public.profile_version (
  profile_version_id text PRIMARY KEY CHECK (
    profile_version_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  profile_id text NOT NULL REFERENCES rmr_public.profile(profile_id),
  record_version integer NOT NULL CHECK (record_version >= 1),
  update_kind text NOT NULL CHECK (update_kind IN ('initial', 'source_refresh', 'correction')),
  publication_decision_id text NOT NULL REFERENCES rmr_public.profile_publication_decision(decision_id),
  public_payload jsonb NOT NULL CHECK (
    jsonb_typeof(public_payload) = 'object'
    AND NOT rmr_internal.jsonb_has_prohibited_source_key(public_payload)
  ),
  updated_at timestamptz NOT NULL,
  supersedes_profile_version_id text REFERENCES rmr_public.profile_version(profile_version_id),
  payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[a-f0-9]{64}$'),
  UNIQUE (profile_id, record_version),
  CONSTRAINT profile_version_no_self_supersession CHECK (
    supersedes_profile_version_id IS NULL OR supersedes_profile_version_id <> profile_version_id
  )
);

CREATE TABLE rmr_public.profile_version_source (
  profile_version_id text NOT NULL REFERENCES rmr_public.profile_version(profile_version_id),
  reviewed_record_version_id text NOT NULL REFERENCES rmr_source.reviewed_record_version(version_id),
  PRIMARY KEY (profile_version_id, reviewed_record_version_id)
);

CREATE TABLE rmr_public.profile_timeline_item (
  timeline_item_id text PRIMARY KEY CHECK (
    timeline_item_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  profile_id text NOT NULL REFERENCES rmr_public.profile(profile_id),
  kind text NOT NULL CHECK (kind IN (
    'office_term_transition', 'candidacy_transition', 'source_refresh',
    'correction', 'response', 'dispute', 'appeal'
  )),
  occurred_at timestamptz NOT NULL,
  public_summary text NOT NULL CHECK (char_length(public_summary) BETWEEN 1 AND 1000),
  freshness text NOT NULL CHECK (
    freshness IN ('current', 'stale', 'not_available', 'unsupported', 'coverage_gap')
  ),
  record_version integer NOT NULL CHECK (record_version >= 1),
  UNIQUE (profile_id, occurred_at, timeline_item_id)
);

CREATE TABLE rmr_public.profile_timeline_source (
  timeline_item_id text NOT NULL REFERENCES rmr_public.profile_timeline_item(timeline_item_id),
  reviewed_record_version_id text NOT NULL REFERENCES rmr_source.reviewed_record_version(version_id),
  PRIMARY KEY (timeline_item_id, reviewed_record_version_id)
);

CREATE OR REPLACE FUNCTION rmr_public.reject_public_profile_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'public profile history is append-only';
END
$$;

CREATE TRIGGER profile_publication_decision_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_public.profile_publication_decision
FOR EACH ROW EXECUTE FUNCTION rmr_public.reject_public_profile_history_mutation();

CREATE TRIGGER profile_version_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_public.profile_version
FOR EACH ROW EXECUTE FUNCTION rmr_public.reject_public_profile_history_mutation();

CREATE TRIGGER profile_timeline_item_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_public.profile_timeline_item
FOR EACH ROW EXECUTE FUNCTION rmr_public.reject_public_profile_history_mutation();

CREATE OR REPLACE FUNCTION rmr_public.require_profile_version_source()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM rmr_public.profile_version_source
    WHERE profile_version_id = NEW.profile_version_id
  ) THEN
    RAISE EXCEPTION 'a public profile version requires at least one reviewed source record';
  END IF;
  RETURN NULL;
END
$$;

CREATE CONSTRAINT TRIGGER profile_version_requires_source
AFTER INSERT ON rmr_public.profile_version
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION rmr_public.require_profile_version_source();

CREATE OR REPLACE FUNCTION rmr_public.require_human_publish_decision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  publication_action text;
  publication_actor text;
BEGIN
  SELECT decision, actor_type INTO publication_action, publication_actor
  FROM rmr_public.profile_publication_decision
  WHERE decision_id = NEW.publication_decision_id;
  IF publication_action <> 'publish' OR publication_actor NOT IN ('reviewer', 'admin') THEN
    RAISE EXCEPTION 'public profile versions require an explicit reviewer or admin publish decision';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER profile_version_human_publication
BEFORE INSERT ON rmr_public.profile_version
FOR EACH ROW EXECUTE FUNCTION rmr_public.require_human_publish_decision();

CREATE VIEW rmr_public.current_profile_read AS
SELECT DISTINCT ON (profile.profile_id)
  profile.profile_id,
  profile.person_id,
  profile.office_term_id,
  profile.candidacy_id,
  version.profile_version_id,
  version.record_version,
  version.updated_at,
  'W/"' || profile.profile_id || '.v' || version.record_version::text || '"' AS etag,
  version.public_payload
FROM rmr_public.profile AS profile
JOIN rmr_public.profile_version AS version USING (profile_id)
ORDER BY profile.profile_id, version.record_version DESC, version.profile_version_id DESC;

CREATE VIEW rmr_public.profile_timeline_read AS
SELECT
  item.timeline_item_id,
  item.profile_id,
  item.kind,
  item.occurred_at,
  item.public_summary,
  item.freshness,
  item.record_version,
  array_agg(source.reviewed_record_version_id ORDER BY source.reviewed_record_version_id) AS reviewed_record_version_ids
FROM rmr_public.profile_timeline_item AS item
JOIN rmr_public.profile_timeline_source AS source USING (timeline_item_id)
GROUP BY item.timeline_item_id;

GRANT USAGE ON SCHEMA rmr_public TO rmr_public_profile_reader;
GRANT SELECT ON rmr_public.current_profile_read, rmr_public.profile_timeline_read
TO rmr_public_profile_reader;

COMMENT ON VIEW rmr_public.current_profile_read IS
  'Allowlisted public projection only. The API additionally validates exact JSON Schema fields before serialization.';
