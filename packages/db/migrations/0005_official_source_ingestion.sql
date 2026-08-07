CREATE SCHEMA IF NOT EXISTS rmr_source;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_source_worker') THEN
    CREATE ROLE rmr_source_worker NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_source_reviewer') THEN
    CREATE ROLE rmr_source_reviewer NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_source_public_reader') THEN
    CREATE ROLE rmr_source_public_reader NOLOGIN;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION rmr_internal.jsonb_has_prohibited_source_key(value jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  item jsonb;
  item_key text;
  normalized text;
BEGIN
  IF jsonb_typeof(value) = 'object' THEN
    FOR item_key, item IN SELECT key, object_value FROM jsonb_each(value) AS entry(key, object_value)
    LOOP
      normalized := regexp_replace(lower(item_key), '[^a-z]', '', 'g');
      IF normalized = ANY (ARRAY[
        'accountid', 'address', 'credential', 'email', 'identityevidence',
        'moderatornotes', 'preciseaddress', 'preciselocation', 'privateactivity',
        'privatekey', 'representativesignal', 'seedphrase', 'sessiontoken',
        'walletpayload', 'wif'
      ]) THEN
        RETURN true;
      END IF;
      IF rmr_internal.jsonb_has_prohibited_source_key(item) THEN
        RETURN true;
      END IF;
    END LOOP;
  ELSIF jsonb_typeof(value) = 'array' THEN
    FOR item IN SELECT array_value FROM jsonb_array_elements(value) AS entry(array_value)
    LOOP
      IF rmr_internal.jsonb_has_prohibited_source_key(item) THEN
        RETURN true;
      END IF;
    END LOOP;
  END IF;
  RETURN false;
END
$$;

-- Repair the same camelCase normalization edge at the audit/outbox boundary before
-- source-review commands can use it. Migration 0002 remains immutable once applied;
-- this replacement is the forward migration.
CREATE OR REPLACE FUNCTION rmr_internal.jsonb_has_prohibited_audit_key(value jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  item jsonb;
  item_key text;
  normalized text;
BEGIN
  IF jsonb_typeof(value) = 'object' THEN
    FOR item_key, item IN SELECT key, object_value FROM jsonb_each(value) AS entry(key, object_value)
    LOOP
      normalized := regexp_replace(lower(item_key), '[^a-z]', '', 'g');
      IF normalized = ANY (ARRAY[
        'accountid', 'address', 'credential', 'email', 'evidence', 'identityevidence',
        'location', 'moderatornotes', 'passphrase', 'passkey', 'preciseaddress',
        'preciselocation', 'privatekey', 'recoverytoken', 'seed', 'seedphrase',
        'signal', 'token', 'walletpayload', 'wif'
      ]) THEN
        RETURN true;
      END IF;
      IF rmr_internal.jsonb_has_prohibited_audit_key(item) THEN
        RETURN true;
      END IF;
    END LOOP;
  ELSIF jsonb_typeof(value) = 'array' THEN
    FOR item IN SELECT array_value FROM jsonb_array_elements(value) AS entry(array_value)
    LOOP
      IF rmr_internal.jsonb_has_prohibited_audit_key(item) THEN
        RETURN true;
      END IF;
    END LOOP;
  END IF;
  RETURN false;
END
$$;

CREATE OR REPLACE FUNCTION rmr_source.reject_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'official-source ingestion history is append-only';
END
$$;

CREATE TABLE rmr_source.source (
  source_id text PRIMARY KEY CHECK (source_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'),
  publisher text NOT NULL CHECK (char_length(publisher) BETWEEN 1 AND 300),
  authoritative_scope text NOT NULL CHECK (char_length(authoritative_scope) BETWEEN 1 AND 2000),
  data_mode text NOT NULL CHECK (data_mode IN ('synthetic', 'production')),
  countries text[] NOT NULL CHECK (cardinality(countries) > 0 AND countries <@ ARRAY['CA', 'US']),
  jurisdiction_ids text[] NOT NULL CHECK (cardinality(jurisdiction_ids) > 0),
  record_types text[] NOT NULL CHECK (cardinality(record_types) > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE rmr_source.connector_version (
  connector_id text NOT NULL CHECK (connector_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'),
  connector_version text NOT NULL CHECK (connector_version ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'),
  source_id text NOT NULL REFERENCES rmr_source.source(source_id),
  capability_schema text NOT NULL CHECK (capability_schema = 'source-connector-capability.v1'),
  capability jsonb NOT NULL CHECK (jsonb_typeof(capability) = 'object'),
  capability_sha256 text NOT NULL CHECK (capability_sha256 ~ '^[a-f0-9]{64}$'),
  approval_state text NOT NULL CHECK (
    approval_state IN ('synthetic_approved', 'production_approved', 'suspended')
  ),
  approval_reference text NOT NULL,
  reviewed_at timestamptz NOT NULL,
  parser_version text NOT NULL,
  schema_version text NOT NULL,
  license_name text NOT NULL,
  terms_url text NOT NULL CHECK (terms_url ~ '^https://'),
  attribution_text text NOT NULL,
  retention_days integer NOT NULL CHECK (retention_days >= 0),
  redistribution text NOT NULL CHECK (redistribution IN ('metadata_only', 'permitted_snapshots')),
  snapshot_storage text NOT NULL CHECK (
    snapshot_storage IN ('prohibited', 'quarantine_only', 'permitted')
  ),
  owner_team text NOT NULL,
  incident_runbook text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (connector_id, connector_version),
  CONSTRAINT connector_version_synthetic_approval CHECK (
    (capability->>'dataMode' = 'synthetic' AND approval_state = 'synthetic_approved')
    OR (capability->>'dataMode' = 'production' AND approval_state IN ('production_approved', 'suspended'))
  ),
  CONSTRAINT connector_version_metadata_rights CHECK (
    redistribution <> 'metadata_only' OR snapshot_storage = 'prohibited'
  )
);

CREATE TABLE rmr_source.retrieval (
  retrieval_id text PRIMARY KEY CHECK (
    retrieval_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'
  ),
  connector_id text NOT NULL,
  connector_version text NOT NULL,
  source_id text NOT NULL REFERENCES rmr_source.source(source_id),
  retrieved_url text NOT NULL CHECK (retrieved_url ~ '^https://'),
  retrieved_at timestamptz NOT NULL,
  http_status integer NOT NULL CHECK (http_status BETWEEN 100 AND 599),
  content_type text NOT NULL,
  content_encoding text NOT NULL,
  wire_bytes bigint NOT NULL CHECK (wire_bytes >= 0),
  decoded_bytes bigint NOT NULL CHECK (decoded_bytes >= 0),
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  etag text,
  last_modified text,
  parser_version text NOT NULL,
  schema_version text NOT NULL,
  license_name text NOT NULL,
  terms_url text NOT NULL CHECK (terms_url ~ '^https://'),
  attribution_text text NOT NULL,
  raw_snapshot_state text NOT NULL CHECK (
    raw_snapshot_state IN ('not_stored', 'quarantine_reference', 'approved_reference')
  ),
  object_reference text CHECK (
    object_reference IS NULL OR object_reference ~ '^(quarantine|approved)://'
  ),
  availability text NOT NULL CHECK (
    availability IN ('available', 'stale', 'missing', 'retracted', 'unavailable')
  ),
  freshness_state text NOT NULL CHECK (freshness_state IN ('current', 'stale', 'unknown')),
  FOREIGN KEY (connector_id, connector_version)
    REFERENCES rmr_source.connector_version(connector_id, connector_version),
  CONSTRAINT retrieval_snapshot_reference_consistency CHECK (
    (raw_snapshot_state = 'not_stored' AND object_reference IS NULL)
    OR (raw_snapshot_state <> 'not_stored' AND object_reference IS NOT NULL)
  )
);

CREATE TABLE rmr_source.ingestion_run (
  run_id text PRIMARY KEY CHECK (run_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'),
  connector_id text NOT NULL,
  connector_version text NOT NULL,
  trigger_kind text NOT NULL CHECK (trigger_kind IN ('scheduled', 'manual', 'replay')),
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  state text NOT NULL CHECK (
    state IN ('completed', 'not_modified', 'duplicate', 'quarantined', 'dead_letter')
  ),
  retrieval_id text REFERENCES rmr_source.retrieval(retrieval_id),
  idempotency_key text UNIQUE,
  candidate_count integer NOT NULL DEFAULT 0 CHECK (candidate_count >= 0),
  quarantine_count integer NOT NULL DEFAULT 0 CHECK (quarantine_count >= 0),
  safe_summary_code text NOT NULL,
  code_revision text NOT NULL,
  FOREIGN KEY (connector_id, connector_version)
    REFERENCES rmr_source.connector_version(connector_id, connector_version)
);

CREATE TABLE rmr_source.checkpoint_history (
  checkpoint_history_id text PRIMARY KEY CHECK (
    checkpoint_history_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'
  ),
  connector_id text NOT NULL,
  connector_version text NOT NULL,
  run_id text NOT NULL REFERENCES rmr_source.ingestion_run(run_id),
  checkpoint_version text NOT NULL,
  cursor_value text,
  etag text,
  last_modified text,
  recorded_at timestamptz NOT NULL,
  FOREIGN KEY (connector_id, connector_version)
    REFERENCES rmr_source.connector_version(connector_id, connector_version)
);

CREATE TABLE rmr_source.checkpoint_current (
  connector_id text PRIMARY KEY,
  connector_version text NOT NULL,
  checkpoint_history_id text NOT NULL UNIQUE REFERENCES rmr_source.checkpoint_history(checkpoint_history_id),
  lock_version bigint NOT NULL DEFAULT 1 CHECK (lock_version > 0),
  updated_at timestamptz NOT NULL,
  FOREIGN KEY (connector_id, connector_version)
    REFERENCES rmr_source.connector_version(connector_id, connector_version)
);

CREATE TABLE rmr_source.candidate_record (
  candidate_id text PRIMARY KEY CHECK (
    candidate_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'
  ),
  run_id text NOT NULL REFERENCES rmr_source.ingestion_run(run_id),
  retrieval_id text NOT NULL REFERENCES rmr_source.retrieval(retrieval_id),
  source_id text NOT NULL REFERENCES rmr_source.source(source_id),
  source_record_id text NOT NULL,
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  jurisdiction_id text NOT NULL,
  record_type text NOT NULL,
  source_effective_at timestamptz NOT NULL,
  subject_kind text NOT NULL,
  subject_reference text NOT NULL,
  public_payload jsonb NOT NULL CHECK (
    jsonb_typeof(public_payload) = 'object'
    AND NOT rmr_internal.jsonb_has_prohibited_source_key(public_payload)
  ),
  normalized_sha256 text NOT NULL CHECK (normalized_sha256 ~ '^[a-f0-9]{64}$'),
  match_outcome text NOT NULL CHECK (
    match_outcome IN ('unmatched', 'candidate_match', 'ambiguous', 'conflict')
  ),
  initial_review_state text NOT NULL CHECK (
    initial_review_state IN ('pending_review', 'quarantined')
  ),
  material boolean NOT NULL,
  source_availability text NOT NULL CHECK (
    source_availability IN ('available', 'stale', 'missing', 'retracted', 'unavailable')
  ),
  created_at timestamptz NOT NULL,
  UNIQUE (source_id, source_record_id, normalized_sha256),
  CONSTRAINT candidate_unavailable_quarantined CHECK (
    source_availability = 'available' OR initial_review_state = 'quarantined'
  ),
  CONSTRAINT candidate_conflict_quarantined CHECK (
    match_outcome <> 'conflict' OR initial_review_state = 'quarantined'
  )
);

CREATE TABLE rmr_source.candidate_transformation (
  step_id text PRIMARY KEY,
  candidate_id text NOT NULL REFERENCES rmr_source.candidate_record(candidate_id),
  kind text NOT NULL CHECK (kind IN ('parse', 'normalize', 'classify', 'compare')),
  process_version text NOT NULL,
  input_sha256 text NOT NULL CHECK (input_sha256 ~ '^[a-f0-9]{64}$'),
  output_sha256 text NOT NULL CHECK (output_sha256 ~ '^[a-f0-9]{64}$'),
  assisted_by_ai boolean NOT NULL,
  model_process_version text,
  confidence numeric(5,4) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  requires_human_review boolean NOT NULL DEFAULT true CHECK (requires_human_review),
  created_at timestamptz NOT NULL,
  CONSTRAINT candidate_transformation_ai_metadata CHECK (
    NOT assisted_by_ai OR (model_process_version IS NOT NULL AND confidence IS NOT NULL)
  )
);

CREATE TABLE rmr_source.candidate_match_evidence (
  match_evidence_id text PRIMARY KEY,
  candidate_id text NOT NULL REFERENCES rmr_source.candidate_record(candidate_id),
  kind text NOT NULL CHECK (
    kind IN ('name', 'official_identifier', 'office_context', 'district_context', 'effective_date', 'source_conflict')
  ),
  evidence_value text NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE TABLE rmr_source.candidate_review_transition (
  transition_id text PRIMARY KEY,
  candidate_id text NOT NULL REFERENCES rmr_source.candidate_record(candidate_id),
  from_state text CHECK (
    from_state IS NULL OR from_state IN ('pending_review', 'quarantined', 'approved', 'rejected', 'needs_correction', 'superseded')
  ),
  to_state text NOT NULL CHECK (
    to_state IN ('pending_review', 'quarantined', 'approved', 'rejected', 'needs_correction', 'superseded')
  ),
  actor_type text NOT NULL CHECK (actor_type IN ('source_process', 'reviewer', 'admin')),
  actor_reference text NOT NULL,
  reason_code text NOT NULL CHECK (reason_code ~ '^[A-Z][A-Z0-9_]{0,63}$'),
  policy_version text NOT NULL,
  decided_at timestamptz NOT NULL,
  UNIQUE (candidate_id, decided_at),
  CONSTRAINT candidate_review_human_decision CHECK (
    (actor_type = 'source_process' AND to_state IN ('pending_review', 'quarantined'))
    OR (actor_type IN ('reviewer', 'admin') AND to_state IN ('approved', 'rejected', 'needs_correction', 'superseded'))
  )
);

CREATE TABLE rmr_source.quarantine_item (
  item_id text PRIMARY KEY,
  connector_id text NOT NULL,
  connector_version text NOT NULL,
  run_id text NOT NULL REFERENCES rmr_source.ingestion_run(run_id),
  retrieval_id text REFERENCES rmr_source.retrieval(retrieval_id),
  candidate_id text REFERENCES rmr_source.candidate_record(candidate_id),
  failure_code text NOT NULL,
  safe_summary text NOT NULL CHECK (char_length(safe_summary) BETWEEN 1 AND 500),
  object_reference text CHECK (
    object_reference IS NULL OR object_reference ~ '^quarantine://'
  ),
  created_at timestamptz NOT NULL,
  FOREIGN KEY (connector_id, connector_version)
    REFERENCES rmr_source.connector_version(connector_id, connector_version)
);

CREATE TABLE rmr_source.dead_letter_item (
  dead_letter_id text PRIMARY KEY,
  quarantine_item_id text NOT NULL UNIQUE REFERENCES rmr_source.quarantine_item(item_id),
  attempt_count integer NOT NULL CHECK (attempt_count > 0),
  maximum_attempts integer NOT NULL CHECK (maximum_attempts > 0),
  last_failed_at timestamptz NOT NULL,
  replayed_by_run_id text REFERENCES rmr_source.ingestion_run(run_id)
);

CREATE TABLE rmr_source.reviewed_record (
  record_id text PRIMARY KEY,
  record_type text NOT NULL,
  subject_kind text NOT NULL,
  subject_reference text NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE TABLE rmr_source.reviewed_record_version (
  version_id text PRIMARY KEY,
  record_id text NOT NULL REFERENCES rmr_source.reviewed_record(record_id),
  candidate_id text NOT NULL UNIQUE REFERENCES rmr_source.candidate_record(candidate_id),
  review_transition_id text NOT NULL UNIQUE REFERENCES rmr_source.candidate_review_transition(transition_id),
  public_payload jsonb NOT NULL CHECK (
    jsonb_typeof(public_payload) = 'object'
    AND NOT rmr_internal.jsonb_has_prohibited_source_key(public_payload)
  ),
  source_id text NOT NULL REFERENCES rmr_source.source(source_id),
  retrieval_id text NOT NULL REFERENCES rmr_source.retrieval(retrieval_id),
  source_effective_at timestamptz NOT NULL,
  approved_at timestamptz NOT NULL,
  supersedes_version_id text REFERENCES rmr_source.reviewed_record_version(version_id),
  correction_state text NOT NULL CHECK (
    correction_state IN ('active', 'corrected', 'superseded')
  ),
  CONSTRAINT reviewed_version_no_self_supersession CHECK (
    supersedes_version_id IS NULL OR supersedes_version_id <> version_id
  )
);

CREATE OR REPLACE FUNCTION rmr_source.assert_human_reviewed_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  review_actor text;
  review_state text;
BEGIN
  SELECT actor_type, to_state INTO review_actor, review_state
  FROM rmr_source.candidate_review_transition
  WHERE transition_id = NEW.review_transition_id AND candidate_id = NEW.candidate_id;
  IF review_actor NOT IN ('reviewer', 'admin') OR review_state <> 'approved' THEN
    RAISE EXCEPTION 'reviewed source records require an explicit human approval';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER reviewed_record_version_human_approval
BEFORE INSERT ON rmr_source.reviewed_record_version
FOR EACH ROW EXECUTE FUNCTION rmr_source.assert_human_reviewed_version();

CREATE TABLE rmr_source.coverage_snapshot (
  snapshot_id text PRIMARY KEY,
  schema_version text NOT NULL CHECK (schema_version = 'source-coverage-snapshot.v1'),
  data_mode text NOT NULL CHECK (data_mode = 'synthetic'),
  generated_at timestamptz NOT NULL,
  method_version text NOT NULL,
  code_revision text NOT NULL,
  missing_data_meaning text NOT NULL CHECK (missing_data_meaning = 'coverage_gap_not_misconduct'),
  provenance_state text NOT NULL CHECK (provenance_state = 'not_anchored'),
  snapshot_sha256 text NOT NULL CHECK (snapshot_sha256 ~ '^[a-f0-9]{64}$')
);

CREATE TABLE rmr_source.coverage_item (
  snapshot_id text NOT NULL REFERENCES rmr_source.coverage_snapshot(snapshot_id),
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  jurisdiction_id text NOT NULL,
  record_type text NOT NULL,
  source_availability text NOT NULL CHECK (
    source_availability IN ('available', 'stale', 'missing', 'retracted', 'unavailable')
  ),
  candidate_count integer NOT NULL CHECK (candidate_count >= 0),
  pending_review_count integer NOT NULL CHECK (pending_review_count >= 0),
  conflict_count integer NOT NULL CHECK (conflict_count >= 0),
  last_retrieved_at timestamptz,
  PRIMARY KEY (snapshot_id, country_code, jurisdiction_id, record_type, source_availability)
);

CREATE VIEW rmr_source.reviewed_record_read AS
SELECT
  record.record_id,
  record.record_type,
  record.subject_kind,
  record.subject_reference,
  version.version_id,
  version.public_payload,
  version.source_id,
  version.source_effective_at,
  version.approved_at,
  version.supersedes_version_id,
  version.correction_state
FROM rmr_source.reviewed_record AS record
JOIN rmr_source.reviewed_record_version AS version USING (record_id);

CREATE VIEW rmr_source.coverage_snapshot_read AS
SELECT
  snapshot.snapshot_id,
  snapshot.data_mode,
  snapshot.generated_at,
  snapshot.method_version,
  snapshot.code_revision,
  snapshot.missing_data_meaning,
  snapshot.provenance_state,
  snapshot.snapshot_sha256,
  item.country_code,
  item.jurisdiction_id,
  item.record_type,
  item.source_availability,
  item.candidate_count,
  item.pending_review_count,
  item.conflict_count,
  item.last_retrieved_at
FROM rmr_source.coverage_snapshot AS snapshot
JOIN rmr_source.coverage_item AS item USING (snapshot_id);

DO $$
DECLARE
  relation_name text;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'source', 'connector_version', 'retrieval', 'ingestion_run', 'checkpoint_history',
    'candidate_record', 'candidate_transformation', 'candidate_match_evidence',
    'candidate_review_transition', 'quarantine_item', 'dead_letter_item',
    'reviewed_record', 'reviewed_record_version', 'coverage_snapshot', 'coverage_item'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER %I_reject_update_delete BEFORE UPDATE OR DELETE ON rmr_source.%I FOR EACH ROW EXECUTE FUNCTION rmr_source.reject_history_mutation()',
      relation_name,
      relation_name
    );
  END LOOP;
END
$$;

GRANT USAGE ON SCHEMA rmr_source TO rmr_source_worker, rmr_source_reviewer, rmr_source_public_reader;
GRANT SELECT, INSERT ON
  rmr_source.source,
  rmr_source.connector_version,
  rmr_source.retrieval,
  rmr_source.ingestion_run,
  rmr_source.checkpoint_history,
  rmr_source.candidate_record,
  rmr_source.candidate_transformation,
  rmr_source.candidate_match_evidence,
  rmr_source.candidate_review_transition,
  rmr_source.quarantine_item,
  rmr_source.dead_letter_item,
  rmr_source.coverage_snapshot,
  rmr_source.coverage_item
TO rmr_source_worker;
GRANT SELECT, INSERT ON
  rmr_source.candidate_review_transition,
  rmr_source.reviewed_record,
  rmr_source.reviewed_record_version
TO rmr_source_reviewer;
GRANT SELECT ON rmr_source.reviewed_record_read, rmr_source.coverage_snapshot_read
TO rmr_source_public_reader;
GRANT SELECT, INSERT, UPDATE ON rmr_source.checkpoint_current TO rmr_source_worker;

COMMENT ON SCHEMA rmr_source IS
  'Official-source connector metadata, immutable retrieval/candidate history, review decisions, and coverage. Raw source bytes are never stored in PostgreSQL.';
COMMENT ON VIEW rmr_source.reviewed_record_read IS
  'Allowlisted reviewed records only. No HTTP operation exposes this view until issue #11.';
