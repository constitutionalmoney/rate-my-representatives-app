CREATE TABLE rmr_registry.lifecycle_review (
  review_id text PRIMARY KEY CHECK (review_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  actor_type text NOT NULL CHECK (actor_type IN ('reviewer', 'admin', 'source_process')),
  actor_reference text NOT NULL CHECK (
    actor_reference ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  process text NOT NULL CHECK (
    process IN ('manual_review', 'reviewed_import', 'synthetic_seed')
  ),
  reason_code text NOT NULL CHECK (reason_code ~ '^[A-Z][A-Z0-9_]{0,63}$'),
  recorded_at timestamptz NOT NULL,
  private_notes text CHECK (private_notes IS NULL OR char_length(private_notes) <= 1000)
);

COMMENT ON TABLE rmr_registry.lifecycle_review IS
  'Restricted actor/process metadata for source-attributed public-role transitions. Public views omit actor_reference and private_notes.';

CREATE OR REPLACE FUNCTION rmr_registry.reject_public_role_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'public-role lifecycle history is append-only';
END
$$;

CREATE TRIGGER lifecycle_review_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_registry.lifecycle_review
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_public_role_history_mutation();

CREATE TABLE rmr_registry.person (
  person_id text PRIMARY KEY CHECK (person_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  record_state text NOT NULL CHECK (record_state IN ('active', 'historical', 'superseded')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMENT ON TABLE rmr_registry.person IS
  'Stable natural-person identity record. It is distinct from office, term, election, candidacy, account, authorization, and external identity references.';

CREATE TABLE rmr_registry.person_name (
  person_name_id text PRIMARY KEY CHECK (
    person_name_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  person_id text NOT NULL REFERENCES rmr_registry.person(person_id),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 200),
  kind text NOT NULL CHECK (kind IN ('primary', 'alias', 'previous', 'transliteration')),
  language_tag text CHECK (
    language_tag IS NULL OR language_tag ~ '^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*$'
  ),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT person_name_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  EXCLUDE USING gist (person_id WITH =, effective_period WITH &&)
    WHERE (kind = 'primary')
);

CREATE TABLE rmr_registry.election (
  election_id text PRIMARY KEY CHECK (
    election_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  jurisdiction_id text NOT NULL REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  district_id text REFERENCES rmr_registry.district(district_id),
  public_body_id text NOT NULL REFERENCES rmr_registry.public_body(public_body_id),
  office_id text NOT NULL REFERENCES rmr_registry.office(office_id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE rmr_registry.election_version (
  version_id text PRIMARY KEY CHECK (version_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  election_id text NOT NULL REFERENCES rmr_registry.election(election_id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  kind text NOT NULL CHECK (kind IN ('general', 'by_election', 'primary', 'special', 'other')),
  state text NOT NULL CHECK (state IN ('scheduled', 'active', 'completed', 'cancelled', 'superseded')),
  scheduled_at timestamptz NOT NULL,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  supersedes_version_id text REFERENCES rmr_registry.election_version(version_id),
  CONSTRAINT election_version_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  CONSTRAINT election_version_no_self_supersession CHECK (
    supersedes_version_id IS NULL OR supersedes_version_id <> version_id
  ),
  EXCLUDE USING gist (election_id WITH =, effective_period WITH &&)
);

CREATE TABLE rmr_registry.office_term (
  office_term_id text PRIMARY KEY CHECK (
    office_term_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  person_id text NOT NULL REFERENCES rmr_registry.person(person_id),
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  jurisdiction_id text NOT NULL REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  district_id text REFERENCES rmr_registry.district(district_id),
  public_body_id text NOT NULL REFERENCES rmr_registry.public_body(public_body_id),
  office_id text NOT NULL REFERENCES rmr_registry.office(office_id),
  origin text NOT NULL CHECK (origin IN ('scheduled', 'election_result', 'appointment', 'ex_officio')),
  selection_method text NOT NULL CHECK (
    selection_method IN ('elected', 'appointed', 'mixed', 'ex_officio', 'unknown')
  ),
  service_capacity text NOT NULL CHECK (service_capacity IN ('regular', 'acting', 'interim')),
  planned_start timestamptz NOT NULL,
  planned_end timestamptz,
  planned_period tstzrange GENERATED ALWAYS AS (
    tstzrange(planned_start, planned_end, '[)')
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT office_term_nonempty_period CHECK (
    planned_end IS NULL OR planned_end > planned_start
  ),
  EXCLUDE USING gist (person_id WITH =, office_id WITH =, planned_period WITH &&)
);

CREATE TABLE rmr_registry.office_term_transition (
  transition_id text PRIMARY KEY CHECK (
    transition_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  office_term_id text NOT NULL REFERENCES rmr_registry.office_term(office_term_id),
  from_state text CHECK (from_state IS NULL OR from_state IN (
    'pending', 'active', 'cancelled', 'ended', 'resigned', 'removed',
    'deceased', 'disqualified', 'superseded'
  )),
  to_state text NOT NULL CHECK (to_state IN (
    'pending', 'active', 'cancelled', 'ended', 'resigned', 'removed',
    'deceased', 'disqualified', 'superseded'
  )),
  effective_at timestamptz NOT NULL,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  review_id text NOT NULL REFERENCES rmr_registry.lifecycle_review(review_id),
  UNIQUE (office_term_id, effective_at)
);

CREATE TABLE rmr_registry.office_term_relationship (
  relationship_id text PRIMARY KEY CHECK (
    relationship_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  office_term_id text NOT NULL REFERENCES rmr_registry.office_term(office_term_id),
  related_office_term_id text NOT NULL REFERENCES rmr_registry.office_term(office_term_id),
  kind text NOT NULL CHECK (kind IN ('predecessor_of', 'successor_of', 'supersedes')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT office_term_relationship_not_self CHECK (
    office_term_id <> related_office_term_id
  ),
  CONSTRAINT office_term_relationship_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  )
);

CREATE TABLE rmr_registry.office_term_contact (
  contact_id text PRIMARY KEY CHECK (contact_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  office_term_id text NOT NULL REFERENCES rmr_registry.office_term(office_term_id),
  kind text NOT NULL CHECK (kind IN ('office_email', 'office_phone', 'office_url')),
  value text NOT NULL CHECK (char_length(value) BETWEEN 1 AND 300),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT office_term_contact_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  )
);

CREATE TABLE rmr_registry.candidacy (
  candidacy_id text PRIMARY KEY CHECK (
    candidacy_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  person_id text NOT NULL REFERENCES rmr_registry.person(person_id),
  election_id text NOT NULL REFERENCES rmr_registry.election(election_id),
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  jurisdiction_id text NOT NULL REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  district_id text REFERENCES rmr_registry.district(district_id),
  office_id text NOT NULL REFERENCES rmr_registry.office(office_id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (person_id, election_id, office_id)
);

CREATE TABLE rmr_registry.candidacy_transition (
  transition_id text PRIMARY KEY CHECK (
    transition_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  candidacy_id text NOT NULL REFERENCES rmr_registry.candidacy(candidacy_id),
  from_state text CHECK (from_state IS NULL OR from_state IN (
    'declared', 'registered', 'qualified', 'withdrawn', 'suspended', 'rejected',
    'disqualified', 'active', 'won', 'defeated', 'cancelled', 'superseded'
  )),
  to_state text NOT NULL CHECK (to_state IN (
    'declared', 'registered', 'qualified', 'withdrawn', 'suspended', 'rejected',
    'disqualified', 'active', 'won', 'defeated', 'cancelled', 'superseded'
  )),
  effective_at timestamptz NOT NULL,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  review_id text NOT NULL REFERENCES rmr_registry.lifecycle_review(review_id),
  UNIQUE (candidacy_id, effective_at)
);

CREATE TABLE rmr_registry.public_role_official_identifier (
  official_identifier_id text PRIMARY KEY CHECK (
    official_identifier_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  person_id text REFERENCES rmr_registry.person(person_id),
  office_term_id text REFERENCES rmr_registry.office_term(office_term_id),
  election_id text REFERENCES rmr_registry.election(election_id),
  candidacy_id text REFERENCES rmr_registry.candidacy(candidacy_id),
  issuer text NOT NULL CHECK (issuer ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  identifier text NOT NULL CHECK (char_length(identifier) BETWEEN 1 AND 200),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT public_role_identifier_one_entity CHECK (
    num_nonnulls(person_id, office_term_id, election_id, candidacy_id) = 1
  ),
  CONSTRAINT public_role_identifier_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  )
);

CREATE TABLE rmr_registry.person_resolution_decision (
  decision_id text PRIMARY KEY CHECK (
    decision_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  kind text NOT NULL CHECK (kind IN ('merge', 'split', 'distinct')),
  effective_at timestamptz NOT NULL,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  review_id text NOT NULL REFERENCES rmr_registry.lifecycle_review(review_id),
  supersedes_decision_id text REFERENCES rmr_registry.person_resolution_decision(decision_id),
  CONSTRAINT person_resolution_no_self_supersession CHECK (
    supersedes_decision_id IS NULL OR supersedes_decision_id <> decision_id
  )
);

CREATE TABLE rmr_registry.person_resolution_party (
  decision_id text NOT NULL REFERENCES rmr_registry.person_resolution_decision(decision_id),
  person_id text NOT NULL REFERENCES rmr_registry.person(person_id),
  party_role text NOT NULL CHECK (party_role IN ('input', 'output')),
  PRIMARY KEY (decision_id, person_id, party_role)
);

CREATE TABLE rmr_registry.person_resolution_evidence (
  evidence_id text PRIMARY KEY CHECK (
    evidence_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  decision_id text NOT NULL REFERENCES rmr_registry.person_resolution_decision(decision_id),
  kind text NOT NULL CHECK (kind IN (
    'name', 'official_identifier', 'office_context', 'district_context',
    'effective_date', 'source_conflict'
  )),
  reference text NOT NULL CHECK (char_length(reference) BETWEEN 1 AND 300),
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id)
);

CREATE TABLE rmr_registry.external_identity_reference (
  external_identity_reference_id text PRIMARY KEY CHECK (
    external_identity_reference_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  person_id text NOT NULL REFERENCES rmr_registry.person(person_id),
  kind text NOT NULL CHECK (kind IN ('public_identifier', 'verus_id')),
  immutable_reference text NOT NULL CHECK (char_length(immutable_reference) BETWEEN 1 AND 200),
  display_name_snapshot text CHECK (
    display_name_snapshot IS NULL OR char_length(display_name_snapshot) BETWEEN 1 AND 200
  ),
  canonical_authority boolean NOT NULL DEFAULT false CHECK (canonical_authority = false),
  grants_authorization boolean NOT NULL DEFAULT false CHECK (grants_authorization = false),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT external_identity_reference_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  )
);

COMMENT ON TABLE rmr_registry.external_identity_reference IS
  'Optional inert public reference only. It cannot overwrite canonical civic facts, prove office, or grant application authorization; no proof or identity-update flow is implemented.';

CREATE OR REPLACE FUNCTION rmr_registry.reject_public_role_cross_country()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  structural_country text;
  election_country text;
  election_office text;
  election_jurisdiction text;
  election_district text;
BEGIN
  SELECT country_code INTO structural_country
  FROM rmr_registry.jurisdiction
  WHERE jurisdiction_id = NEW.jurisdiction_id;
  IF structural_country IS DISTINCT FROM NEW.country_code THEN
    RAISE EXCEPTION 'public-role record crosses a country boundary' USING ERRCODE = '23514';
  END IF;

  SELECT country_code INTO structural_country FROM rmr_registry.office WHERE office_id = NEW.office_id;
  IF structural_country IS DISTINCT FROM NEW.country_code THEN
    RAISE EXCEPTION 'public-role record crosses a country boundary' USING ERRCODE = '23514';
  END IF;

  IF TG_TABLE_NAME IN ('election', 'office_term') THEN
    SELECT country_code INTO structural_country
    FROM rmr_registry.public_body WHERE public_body_id = NEW.public_body_id;
    IF structural_country IS DISTINCT FROM NEW.country_code THEN
      RAISE EXCEPTION 'public-role record crosses a country boundary' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.district_id IS NOT NULL THEN
    SELECT country_code INTO structural_country
    FROM rmr_registry.district WHERE district_id = NEW.district_id;
    IF structural_country IS DISTINCT FROM NEW.country_code THEN
      RAISE EXCEPTION 'public-role record crosses a country boundary' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF TG_TABLE_NAME = 'candidacy' THEN
    SELECT country_code, office_id, jurisdiction_id, district_id
      INTO election_country, election_office, election_jurisdiction, election_district
    FROM rmr_registry.election WHERE election_id = NEW.election_id;
    IF election_country IS DISTINCT FROM NEW.country_code
      OR election_office IS DISTINCT FROM NEW.office_id
      OR election_jurisdiction IS DISTINCT FROM NEW.jurisdiction_id
      OR election_district IS DISTINCT FROM NEW.district_id THEN
      RAISE EXCEPTION 'candidacy does not match its election context' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER election_reject_cross_country
BEFORE INSERT OR UPDATE ON rmr_registry.election
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_public_role_cross_country();
CREATE TRIGGER office_term_reject_cross_country
BEFORE INSERT OR UPDATE ON rmr_registry.office_term
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_public_role_cross_country();
CREATE TRIGGER candidacy_reject_cross_country
BEFORE INSERT OR UPDATE ON rmr_registry.candidacy
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_public_role_cross_country();

CREATE OR REPLACE FUNCTION rmr_registry.office_term_transition_allowed(from_state text, to_state text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE from_state
    WHEN 'pending' THEN to_state IN ('active', 'cancelled')
    WHEN 'active' THEN to_state IN (
      'ended', 'resigned', 'removed', 'deceased', 'disqualified', 'superseded'
    )
    WHEN 'cancelled' THEN to_state = 'superseded'
    WHEN 'ended' THEN to_state = 'superseded'
    WHEN 'resigned' THEN to_state = 'superseded'
    WHEN 'removed' THEN to_state = 'superseded'
    WHEN 'deceased' THEN to_state = 'superseded'
    WHEN 'disqualified' THEN to_state = 'superseded'
    ELSE false
  END
$$;

CREATE OR REPLACE FUNCTION rmr_registry.candidacy_transition_allowed(from_state text, to_state text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE from_state
    WHEN 'declared' THEN to_state IN (
      'registered', 'qualified', 'active', 'withdrawn', 'suspended', 'rejected',
      'disqualified', 'cancelled', 'superseded'
    )
    WHEN 'registered' THEN to_state IN (
      'qualified', 'active', 'withdrawn', 'suspended', 'rejected', 'disqualified',
      'cancelled', 'superseded'
    )
    WHEN 'qualified' THEN to_state IN (
      'active', 'withdrawn', 'suspended', 'rejected', 'disqualified', 'cancelled', 'superseded'
    )
    WHEN 'suspended' THEN to_state IN (
      'active', 'withdrawn', 'rejected', 'disqualified', 'cancelled', 'superseded'
    )
    WHEN 'active' THEN to_state IN (
      'won', 'defeated', 'withdrawn', 'suspended', 'disqualified', 'cancelled', 'superseded'
    )
    WHEN 'withdrawn' THEN to_state = 'superseded'
    WHEN 'rejected' THEN to_state = 'superseded'
    WHEN 'disqualified' THEN to_state = 'superseded'
    WHEN 'won' THEN to_state = 'superseded'
    WHEN 'defeated' THEN to_state = 'superseded'
    WHEN 'cancelled' THEN to_state = 'superseded'
    ELSE false
  END
$$;

CREATE OR REPLACE FUNCTION rmr_registry.reject_illegal_public_role_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  entity_column text;
  entity_value text;
  previous_state text;
  next_from_state text;
  allowed boolean;
BEGIN
  IF TG_TABLE_NAME = 'office_term_transition' THEN
    entity_column := 'office_term_id';
    entity_value := NEW.office_term_id;
  ELSE
    entity_column := 'candidacy_id';
    entity_value := NEW.candidacy_id;
  END IF;

  EXECUTE format(
    'SELECT to_state FROM rmr_registry.%I WHERE %I = $1 AND effective_at < $2 ORDER BY effective_at DESC LIMIT 1',
    TG_TABLE_NAME,
    entity_column
  ) INTO previous_state USING entity_value, NEW.effective_at;

  EXECUTE format(
    'SELECT from_state FROM rmr_registry.%I WHERE %I = $1 AND effective_at > $2 ORDER BY effective_at LIMIT 1',
    TG_TABLE_NAME,
    entity_column
  ) INTO next_from_state USING entity_value, NEW.effective_at;

  IF previous_state IS NULL THEN
    IF NEW.from_state IS NOT NULL OR (
      TG_TABLE_NAME = 'office_term_transition' AND NEW.to_state <> 'pending'
    ) OR (
      TG_TABLE_NAME = 'candidacy_transition'
      AND NEW.to_state NOT IN ('declared', 'registered', 'qualified', 'active')
    ) THEN
      RAISE EXCEPTION 'invalid initial public-role lifecycle transition' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.from_state IS DISTINCT FROM previous_state THEN
      RAISE EXCEPTION 'discontinuous public-role lifecycle transition' USING ERRCODE = '23514';
    END IF;
    IF TG_TABLE_NAME = 'office_term_transition' THEN
      allowed := rmr_registry.office_term_transition_allowed(NEW.from_state, NEW.to_state);
    ELSE
      allowed := rmr_registry.candidacy_transition_allowed(NEW.from_state, NEW.to_state);
    END IF;
    IF NOT allowed THEN
      RAISE EXCEPTION 'illegal public-role lifecycle transition' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF next_from_state IS NOT NULL AND next_from_state IS DISTINCT FROM NEW.to_state THEN
    RAISE EXCEPTION 'public-role lifecycle insertion would break later history' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER office_term_transition_guard
BEFORE INSERT ON rmr_registry.office_term_transition
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_illegal_public_role_transition();
CREATE TRIGGER candidacy_transition_guard
BEFORE INSERT ON rmr_registry.candidacy_transition
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_illegal_public_role_transition();

CREATE TRIGGER office_term_transition_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_registry.office_term_transition
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_public_role_history_mutation();
CREATE TRIGGER candidacy_transition_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_registry.candidacy_transition
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_public_role_history_mutation();
CREATE TRIGGER person_resolution_decision_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_registry.person_resolution_decision
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_public_role_history_mutation();
CREATE TRIGGER person_resolution_party_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_registry.person_resolution_party
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_public_role_history_mutation();
CREATE TRIGGER person_resolution_evidence_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_registry.person_resolution_evidence
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_public_role_history_mutation();

CREATE OR REPLACE FUNCTION rmr_registry.enforce_person_resolution_context()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_decision_id text;
  decision_kind text;
  decision_actor_type text;
  input_count integer;
  output_count integer;
  evidence_count integer;
  non_name_count integer;
  assertion_count integer;
BEGIN
  target_decision_id := NEW.decision_id;
  SELECT decision.kind, review.actor_type
    INTO decision_kind, decision_actor_type
  FROM rmr_registry.person_resolution_decision AS decision
  JOIN rmr_registry.lifecycle_review AS review USING (review_id)
  WHERE decision.decision_id = target_decision_id;

  SELECT
    count(*) FILTER (WHERE party_role = 'input'),
    count(*) FILTER (WHERE party_role = 'output')
    INTO input_count, output_count
  FROM rmr_registry.person_resolution_party
  WHERE decision_id = target_decision_id;

  SELECT count(*), count(*) FILTER (WHERE kind <> 'name'), count(DISTINCT assertion_id)
    INTO evidence_count, non_name_count, assertion_count
  FROM rmr_registry.person_resolution_evidence
  WHERE decision_id = target_decision_id;

  IF decision_actor_type NOT IN ('reviewer', 'admin') THEN
    RAISE EXCEPTION 'person resolution requires accountable human review' USING ERRCODE = '23514';
  END IF;
  IF evidence_count < 2 OR non_name_count < 1 OR assertion_count < 2 THEN
    RAISE EXCEPTION 'name-only person resolution is forbidden' USING ERRCODE = '23514';
  END IF;
  IF (decision_kind = 'merge' AND (input_count < 2 OR output_count <> 1))
    OR (decision_kind = 'split' AND (input_count <> 1 OR output_count < 2))
    OR (decision_kind = 'distinct' AND input_count < 2) THEN
    RAISE EXCEPTION 'person resolution has invalid merge/split parties' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END
$$;

CREATE CONSTRAINT TRIGGER person_resolution_decision_context_guard
AFTER INSERT ON rmr_registry.person_resolution_decision
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION rmr_registry.enforce_person_resolution_context();
CREATE CONSTRAINT TRIGGER person_resolution_party_context_guard
AFTER INSERT ON rmr_registry.person_resolution_party
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION rmr_registry.enforce_person_resolution_context();
CREATE CONSTRAINT TRIGGER person_resolution_evidence_context_guard
AFTER INSERT ON rmr_registry.person_resolution_evidence
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION rmr_registry.enforce_person_resolution_context();

CREATE VIEW rmr_registry.public_person_name
WITH (security_barrier = true)
AS
SELECT
  person.person_id,
  person.record_state,
  name.person_name_id,
  name.display_name,
  name.kind,
  name.language_tag,
  name.effective_from,
  name.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.person
JOIN rmr_registry.person_name AS name USING (person_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_office_term
WITH (security_barrier = true)
AS
SELECT
  term.office_term_id,
  term.person_id,
  term.country_code,
  term.jurisdiction_id,
  term.district_id,
  term.public_body_id,
  term.office_id,
  term.origin,
  term.selection_method,
  term.service_capacity,
  term.planned_start,
  term.planned_end,
  latest.to_state AS current_state,
  CASE
    WHEN latest.to_state = 'pending' THEN 'pending'
    WHEN latest.to_state = 'active' THEN 'current'
    WHEN latest.to_state = 'superseded' THEN 'historical'
    ELSE 'former'
  END AS tenure_classification
FROM rmr_registry.office_term AS term
JOIN LATERAL (
  SELECT transition.to_state
  FROM rmr_registry.office_term_transition AS transition
  WHERE transition.office_term_id = term.office_term_id
  ORDER BY transition.effective_at DESC
  LIMIT 1
) AS latest ON true;

CREATE VIEW rmr_registry.public_office_term_transition
WITH (security_barrier = true)
AS
SELECT
  transition.transition_id,
  transition.office_term_id,
  transition.from_state,
  transition.to_state,
  transition.effective_at,
  review.actor_type,
  review.process,
  review.reason_code,
  review.recorded_at,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.office_term_transition AS transition
JOIN rmr_registry.lifecycle_review AS review USING (review_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_office_term_relationship
WITH (security_barrier = true)
AS
SELECT relationship.*, assertion.source_reference, assertion.observed_at,
  assertion.freshness_state, assertion.coverage_state, assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.office_term_relationship AS relationship
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_office_term_contact
WITH (security_barrier = true)
AS
SELECT contact.*, assertion.source_reference, assertion.observed_at,
  assertion.freshness_state, assertion.coverage_state, assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.office_term_contact AS contact
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_election_version
WITH (security_barrier = true)
AS
SELECT
  election.election_id,
  election.country_code,
  election.jurisdiction_id,
  election.district_id,
  election.public_body_id,
  election.office_id,
  version.version_id,
  version.name,
  version.kind,
  version.state,
  version.scheduled_at,
  version.effective_from,
  version.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.election
JOIN rmr_registry.election_version AS version USING (election_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_candidacy
WITH (security_barrier = true)
AS
SELECT
  candidacy.candidacy_id,
  candidacy.person_id,
  candidacy.election_id,
  candidacy.country_code,
  candidacy.jurisdiction_id,
  candidacy.district_id,
  candidacy.office_id,
  latest.to_state AS current_state
FROM rmr_registry.candidacy
JOIN LATERAL (
  SELECT transition.to_state
  FROM rmr_registry.candidacy_transition AS transition
  WHERE transition.candidacy_id = candidacy.candidacy_id
  ORDER BY transition.effective_at DESC
  LIMIT 1
) AS latest ON true;

CREATE VIEW rmr_registry.public_candidacy_transition
WITH (security_barrier = true)
AS
SELECT
  transition.transition_id,
  transition.candidacy_id,
  transition.from_state,
  transition.to_state,
  transition.effective_at,
  review.actor_type,
  review.process,
  review.reason_code,
  review.recorded_at,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.candidacy_transition AS transition
JOIN rmr_registry.lifecycle_review AS review USING (review_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_role_identifier
WITH (security_barrier = true)
AS
SELECT
  identifier.official_identifier_id,
  CASE
    WHEN person_id IS NOT NULL THEN 'person'
    WHEN office_term_id IS NOT NULL THEN 'office_term'
    WHEN election_id IS NOT NULL THEN 'election'
    ELSE 'candidacy'
  END AS entity_kind,
  COALESCE(person_id, office_term_id, election_id, candidacy_id) AS entity_id,
  identifier.issuer,
  identifier.identifier,
  identifier.effective_from,
  identifier.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.public_role_official_identifier AS identifier
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_person_resolution
WITH (security_barrier = true)
AS
SELECT
  decision.decision_id,
  decision.kind,
  decision.effective_at,
  decision.supersedes_decision_id,
  ARRAY(
    SELECT party.person_id
    FROM rmr_registry.person_resolution_party AS party
    WHERE party.decision_id = decision.decision_id AND party.party_role = 'input'
    ORDER BY party.person_id
  ) AS input_person_ids,
  ARRAY(
    SELECT party.person_id
    FROM rmr_registry.person_resolution_party AS party
    WHERE party.decision_id = decision.decision_id AND party.party_role = 'output'
    ORDER BY party.person_id
  ) AS output_person_ids,
  review.actor_type,
  review.process,
  review.reason_code,
  review.recorded_at,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.person_resolution_decision AS decision
JOIN rmr_registry.lifecycle_review AS review USING (review_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_person_resolution_evidence
WITH (security_barrier = true)
AS
SELECT evidence.*, assertion.source_reference, assertion.observed_at,
  assertion.freshness_state, assertion.coverage_state, assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.person_resolution_evidence AS evidence
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_external_identity_reference
WITH (security_barrier = true)
AS
SELECT reference.*, assertion.source_reference, assertion.observed_at,
  assertion.freshness_state, assertion.coverage_state, assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.external_identity_reference AS reference
JOIN rmr_registry.assertion USING (assertion_id);

REVOKE ALL ON ALL TABLES IN SCHEMA rmr_registry FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA rmr_registry FROM PUBLIC;
GRANT SELECT ON
  rmr_registry.public_person_name,
  rmr_registry.public_office_term,
  rmr_registry.public_office_term_transition,
  rmr_registry.public_office_term_relationship,
  rmr_registry.public_office_term_contact,
  rmr_registry.public_election_version,
  rmr_registry.public_candidacy,
  rmr_registry.public_candidacy_transition,
  rmr_registry.public_role_identifier,
  rmr_registry.public_person_resolution,
  rmr_registry.public_person_resolution_evidence,
  rmr_registry.public_external_identity_reference
TO rmr_registry_reader;

COMMENT ON SCHEMA rmr_registry IS
  'Canonical PostgreSQL civic registry: jurisdictions, districts, bodies, offices, people, office terms, elections, candidacies, and reviewed public identity history. No accounts, participation, source-ingestion pipeline, scoring, identity proof, provenance write, or Verus operation is implemented.';
