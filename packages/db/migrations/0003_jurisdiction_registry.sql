CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE SCHEMA IF NOT EXISTS rmr_registry;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_registry_reader') THEN
    CREATE ROLE rmr_registry_reader NOLOGIN;
  END IF;
END
$$;

CREATE TABLE rmr_registry.assertion (
  assertion_id text PRIMARY KEY CHECK (assertion_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  source_reference text NOT NULL CHECK (
    source_reference ~ '^synthetic://[a-zA-Z0-9][a-zA-Z0-9./_-]{0,240}$'
  ),
  observed_at timestamptz NOT NULL,
  freshness_state text NOT NULL CHECK (
    freshness_state IN ('current', 'stale', 'unknown', 'unavailable')
  ),
  coverage_state text NOT NULL CHECK (
    coverage_state IN ('supported', 'partial', 'gap', 'unsupported')
  ),
  conflict_state text NOT NULL CHECK (
    conflict_state IN ('clear', 'conflicting', 'unsupported')
  ),
  supersedes_assertion_id text REFERENCES rmr_registry.assertion(assertion_id),
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT registry_assertion_no_self_supersession CHECK (
    supersedes_assertion_id IS NULL OR supersedes_assertion_id <> assertion_id
  )
);

COMMENT ON TABLE rmr_registry.assertion IS
  'Immutable attribution and public coverage/freshness/conflict state. Issue #55 will attach reviewed source records without rewriting registry history.';

CREATE OR REPLACE FUNCTION rmr_registry.reject_assertion_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'rmr_registry.assertion is append-only';
END
$$;

CREATE TRIGGER registry_assertion_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_registry.assertion
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_assertion_mutation();

CREATE TABLE rmr_registry.jurisdiction (
  jurisdiction_id text PRIMARY KEY CHECK (
    jurisdiction_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE rmr_registry.jurisdiction_version (
  version_id text PRIMARY KEY CHECK (version_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  jurisdiction_id text NOT NULL REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,127}$'),
  kind text NOT NULL CHECK (kind IN (
    'country', 'province', 'state', 'territory', 'municipality', 'locality',
    'unincorporated_area', 'county', 'regional_district', 'region', 'special_district'
  )),
  status text NOT NULL CHECK (status IN (
    'active', 'future', 'former', 'amalgamated', 'dissolved', 'superseded'
  )),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  supersedes_version_id text REFERENCES rmr_registry.jurisdiction_version(version_id),
  CONSTRAINT jurisdiction_version_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  CONSTRAINT jurisdiction_version_no_self_supersession CHECK (
    supersedes_version_id IS NULL OR supersedes_version_id <> version_id
  ),
  EXCLUDE USING gist (jurisdiction_id WITH =, effective_period WITH &&)
);

CREATE INDEX jurisdiction_version_effective_idx
  ON rmr_registry.jurisdiction_version USING gist (effective_period);

CREATE TABLE rmr_registry.jurisdiction_relationship (
  relationship_id text PRIMARY KEY CHECK (
    relationship_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  subject_jurisdiction_id text NOT NULL REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  object_jurisdiction_id text NOT NULL REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  kind text NOT NULL CHECK (kind IN (
    'contained_by', 'administered_by', 'overlaps', 'represented_by', 'successor_of'
  )),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT jurisdiction_relationship_not_self CHECK (
    subject_jurisdiction_id <> object_jurisdiction_id
  ),
  CONSTRAINT jurisdiction_relationship_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  EXCLUDE USING gist (
    subject_jurisdiction_id WITH =,
    object_jurisdiction_id WITH =,
    kind WITH =,
    effective_period WITH &&
  )
);

CREATE INDEX jurisdiction_relationship_subject_effective_idx
  ON rmr_registry.jurisdiction_relationship
  USING gist (subject_jurisdiction_id, effective_period);
CREATE INDEX jurisdiction_relationship_object_effective_idx
  ON rmr_registry.jurisdiction_relationship
  USING gist (object_jurisdiction_id, effective_period);

CREATE OR REPLACE FUNCTION rmr_registry.reject_containment_cycle()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  cycle_exists boolean;
BEGIN
  IF NEW.kind <> 'contained_by' THEN
    RETURN NEW;
  END IF;

  WITH RECURSIVE ancestry(jurisdiction_id) AS (
    SELECT NEW.object_jurisdiction_id
    UNION
    SELECT relationship.object_jurisdiction_id
    FROM rmr_registry.jurisdiction_relationship AS relationship
    JOIN ancestry
      ON relationship.subject_jurisdiction_id = ancestry.jurisdiction_id
    WHERE relationship.kind = 'contained_by'
      AND relationship.effective_period && NEW.effective_period
  )
  SELECT EXISTS (
    SELECT 1 FROM ancestry WHERE jurisdiction_id = NEW.subject_jurisdiction_id
  ) INTO cycle_exists;

  IF cycle_exists THEN
    RAISE EXCEPTION 'effective-dated jurisdiction containment cycle';
  END IF;
  RETURN NEW;
END
$$;

CREATE CONSTRAINT TRIGGER jurisdiction_relationship_reject_cycle
AFTER INSERT OR UPDATE ON rmr_registry.jurisdiction_relationship
DEFERRABLE INITIALLY IMMEDIATE
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_containment_cycle();

CREATE TABLE rmr_registry.district (
  district_id text PRIMARY KEY CHECK (
    district_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE rmr_registry.district_version (
  version_id text PRIMARY KEY CHECK (version_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  district_id text NOT NULL REFERENCES rmr_registry.district(district_id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,127}$'),
  kind text NOT NULL CHECK (kind IN (
    'federal_electoral', 'provincial_electoral', 'state_legislative',
    'local_electoral', 'special'
  )),
  status text NOT NULL CHECK (status IN ('active', 'future', 'former', 'superseded')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  supersedes_version_id text REFERENCES rmr_registry.district_version(version_id),
  CONSTRAINT district_version_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  CONSTRAINT district_version_no_self_supersession CHECK (
    supersedes_version_id IS NULL OR supersedes_version_id <> version_id
  ),
  EXCLUDE USING gist (district_id WITH =, effective_period WITH &&)
);

CREATE TABLE rmr_registry.district_boundary_version (
  boundary_version_id text PRIMARY KEY CHECK (
    boundary_version_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  district_id text NOT NULL REFERENCES rmr_registry.district(district_id),
  geometry_reference text NOT NULL CHECK (
    geometry_reference ~ '^synthetic://[a-zA-Z0-9][a-zA-Z0-9./_-]{0,240}$'
  ),
  geometry_sha256 text NOT NULL CHECK (geometry_sha256 ~ '^[a-f0-9]{64}$'),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT district_boundary_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  EXCLUDE USING gist (district_id WITH =, effective_period WITH &&)
);

CREATE TABLE rmr_registry.district_jurisdiction_relationship (
  relationship_id text PRIMARY KEY CHECK (
    relationship_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  district_id text NOT NULL REFERENCES rmr_registry.district(district_id),
  jurisdiction_id text NOT NULL REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  kind text NOT NULL CHECK (kind IN ('contained_by', 'overlaps', 'represents', 'successor_of')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT district_jurisdiction_relationship_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  EXCLUDE USING gist (district_id WITH =, jurisdiction_id WITH =, kind WITH =, effective_period WITH &&)
);

CREATE TABLE rmr_registry.district_lineage (
  lineage_id text PRIMARY KEY CHECK (lineage_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  district_id text NOT NULL REFERENCES rmr_registry.district(district_id),
  predecessor_district_id text NOT NULL REFERENCES rmr_registry.district(district_id),
  kind text NOT NULL CHECK (kind IN ('redistricted_from', 'split_from', 'merged_from')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT district_lineage_not_self CHECK (district_id <> predecessor_district_id),
  CONSTRAINT district_lineage_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  )
);

CREATE TABLE rmr_registry.public_body (
  public_body_id text PRIMARY KEY CHECK (
    public_body_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE rmr_registry.public_body_version (
  version_id text PRIMARY KEY CHECK (version_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  public_body_id text NOT NULL REFERENCES rmr_registry.public_body(public_body_id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,127}$'),
  kind text NOT NULL CHECK (kind IN ('legislature', 'council', 'board', 'agency', 'commission')),
  status text NOT NULL CHECK (status IN ('active', 'future', 'former', 'abolished')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  supersedes_version_id text REFERENCES rmr_registry.public_body_version(version_id),
  CONSTRAINT public_body_version_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  CONSTRAINT public_body_version_no_self_supersession CHECK (
    supersedes_version_id IS NULL OR supersedes_version_id <> version_id
  ),
  EXCLUDE USING gist (public_body_id WITH =, effective_period WITH &&)
);

CREATE TABLE rmr_registry.body_jurisdiction_relationship (
  relationship_id text PRIMARY KEY CHECK (
    relationship_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  public_body_id text NOT NULL REFERENCES rmr_registry.public_body(public_body_id),
  jurisdiction_id text NOT NULL REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  kind text NOT NULL CHECK (kind IN ('governs', 'serves', 'overlaps')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT body_jurisdiction_relationship_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  EXCLUDE USING gist (public_body_id WITH =, jurisdiction_id WITH =, kind WITH =, effective_period WITH &&)
);

CREATE TABLE rmr_registry.office (
  office_id text PRIMARY KEY CHECK (office_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE rmr_registry.office_version (
  version_id text PRIMARY KEY CHECK (version_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  office_id text NOT NULL REFERENCES rmr_registry.office(office_id),
  public_body_id text NOT NULL REFERENCES rmr_registry.public_body(public_body_id),
  district_id text REFERENCES rmr_registry.district(district_id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,127}$'),
  selection_method text NOT NULL CHECK (
    selection_method IN ('elected', 'appointed', 'mixed', 'ex_officio', 'unknown')
  ),
  operational_state text NOT NULL CHECK (
    operational_state IN ('active', 'vacant', 'acting', 'future', 'abolished')
  ),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  supersedes_version_id text REFERENCES rmr_registry.office_version(version_id),
  CONSTRAINT office_version_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  CONSTRAINT office_version_no_self_supersession CHECK (
    supersedes_version_id IS NULL OR supersedes_version_id <> version_id
  ),
  EXCLUDE USING gist (office_id WITH =, effective_period WITH &&)
);

CREATE OR REPLACE FUNCTION rmr_registry.reject_cross_country_edge()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  left_country text;
  right_country text;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'jurisdiction_relationship' THEN
      SELECT country_code INTO left_country
      FROM rmr_registry.jurisdiction
      WHERE jurisdiction_id = NEW.subject_jurisdiction_id;
      SELECT country_code INTO right_country
      FROM rmr_registry.jurisdiction
      WHERE jurisdiction_id = NEW.object_jurisdiction_id;
    WHEN 'district_jurisdiction_relationship' THEN
      SELECT country_code INTO left_country
      FROM rmr_registry.district
      WHERE district_id = NEW.district_id;
      SELECT country_code INTO right_country
      FROM rmr_registry.jurisdiction
      WHERE jurisdiction_id = NEW.jurisdiction_id;
    WHEN 'district_lineage' THEN
      SELECT country_code INTO left_country
      FROM rmr_registry.district
      WHERE district_id = NEW.district_id;
      SELECT country_code INTO right_country
      FROM rmr_registry.district
      WHERE district_id = NEW.predecessor_district_id;
    WHEN 'body_jurisdiction_relationship' THEN
      SELECT country_code INTO left_country
      FROM rmr_registry.public_body
      WHERE public_body_id = NEW.public_body_id;
      SELECT country_code INTO right_country
      FROM rmr_registry.jurisdiction
      WHERE jurisdiction_id = NEW.jurisdiction_id;
    WHEN 'office_version' THEN
      SELECT country_code INTO left_country
      FROM rmr_registry.office
      WHERE office_id = NEW.office_id;
      SELECT country_code INTO right_country
      FROM rmr_registry.public_body
      WHERE public_body_id = NEW.public_body_id;
      IF left_country IS DISTINCT FROM right_country THEN
        RAISE EXCEPTION 'registry edge crosses a country boundary'
          USING ERRCODE = '23514';
      END IF;
      IF NEW.district_id IS NOT NULL THEN
        SELECT country_code INTO right_country
        FROM rmr_registry.district
        WHERE district_id = NEW.district_id;
      END IF;
    ELSE
      RAISE EXCEPTION 'unsupported registry integrity trigger table';
  END CASE;

  IF left_country IS DISTINCT FROM right_country THEN
    RAISE EXCEPTION 'registry edge crosses a country boundary'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER jurisdiction_relationship_reject_cross_country
BEFORE INSERT OR UPDATE ON rmr_registry.jurisdiction_relationship
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_cross_country_edge();
CREATE TRIGGER district_relationship_reject_cross_country
BEFORE INSERT OR UPDATE ON rmr_registry.district_jurisdiction_relationship
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_cross_country_edge();
CREATE TRIGGER district_lineage_reject_cross_country
BEFORE INSERT OR UPDATE ON rmr_registry.district_lineage
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_cross_country_edge();
CREATE TRIGGER body_relationship_reject_cross_country
BEFORE INSERT OR UPDATE ON rmr_registry.body_jurisdiction_relationship
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_cross_country_edge();
CREATE TRIGGER office_version_reject_cross_country
BEFORE INSERT OR UPDATE ON rmr_registry.office_version
FOR EACH ROW EXECUTE FUNCTION rmr_registry.reject_cross_country_edge();

CREATE TABLE rmr_registry.external_identifier (
  external_identifier_id text PRIMARY KEY CHECK (
    external_identifier_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  jurisdiction_id text REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  district_id text REFERENCES rmr_registry.district(district_id),
  public_body_id text REFERENCES rmr_registry.public_body(public_body_id),
  office_id text REFERENCES rmr_registry.office(office_id),
  issuer text NOT NULL CHECK (issuer ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  identifier text NOT NULL CHECK (char_length(identifier) BETWEEN 1 AND 200),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_period tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT external_identifier_one_entity CHECK (
    num_nonnulls(jurisdiction_id, district_id, public_body_id, office_id) = 1
  ),
  CONSTRAINT external_identifier_nonempty_period CHECK (
    effective_to IS NULL OR effective_to > effective_from
  )
);

CREATE UNIQUE INDEX external_identifier_jurisdiction_unique
  ON rmr_registry.external_identifier (jurisdiction_id, issuer, identifier, effective_from)
  WHERE jurisdiction_id IS NOT NULL;
CREATE UNIQUE INDEX external_identifier_district_unique
  ON rmr_registry.external_identifier (district_id, issuer, identifier, effective_from)
  WHERE district_id IS NOT NULL;
CREATE UNIQUE INDEX external_identifier_body_unique
  ON rmr_registry.external_identifier (public_body_id, issuer, identifier, effective_from)
  WHERE public_body_id IS NOT NULL;
CREATE UNIQUE INDEX external_identifier_office_unique
  ON rmr_registry.external_identifier (office_id, issuer, identifier, effective_from)
  WHERE office_id IS NOT NULL;

CREATE TABLE rmr_registry.public_gap (
  gap_id text PRIMARY KEY CHECK (gap_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'),
  jurisdiction_id text REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  district_id text REFERENCES rmr_registry.district(district_id),
  public_body_id text REFERENCES rmr_registry.public_body(public_body_id),
  office_id text REFERENCES rmr_registry.office(office_id),
  code text NOT NULL CHECK (code ~ '^[A-Z][A-Z0-9_]{0,63}$'),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 256),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  effective_range tstzrange GENERATED ALWAYS AS (
    tstzrange(effective_from, effective_to, '[)')
  ) STORED,
  assertion_id text NOT NULL REFERENCES rmr_registry.assertion(assertion_id),
  CONSTRAINT public_gap_effective_order CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  CONSTRAINT public_gap_one_entity CHECK (
    num_nonnulls(jurisdiction_id, district_id, public_body_id, office_id) = 1
  )
);

CREATE VIEW rmr_registry.public_jurisdiction_version
WITH (security_barrier = true)
AS
SELECT
  jurisdiction.jurisdiction_id,
  jurisdiction.country_code,
  version.version_id,
  version.name,
  version.slug,
  version.kind,
  version.status,
  version.effective_from,
  version.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.jurisdiction
JOIN rmr_registry.jurisdiction_version AS version USING (jurisdiction_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_jurisdiction_relationship
WITH (security_barrier = true)
AS
SELECT
  relationship.relationship_id,
  subject.country_code,
  relationship.subject_jurisdiction_id,
  relationship.object_jurisdiction_id,
  relationship.kind,
  relationship.effective_from,
  relationship.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.jurisdiction_relationship AS relationship
JOIN rmr_registry.jurisdiction AS subject
  ON subject.jurisdiction_id = relationship.subject_jurisdiction_id
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_district_version
WITH (security_barrier = true)
AS
SELECT
  district.district_id,
  district.country_code,
  version.version_id,
  version.name,
  version.slug,
  version.kind,
  version.status,
  version.effective_from,
  version.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.district
JOIN rmr_registry.district_version AS version USING (district_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_district_boundary_version
WITH (security_barrier = true)
AS
SELECT
  boundary.boundary_version_id,
  boundary.district_id,
  district.country_code,
  boundary.geometry_reference,
  boundary.geometry_sha256,
  boundary.effective_from,
  boundary.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.district_boundary_version AS boundary
JOIN rmr_registry.district USING (district_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_district_jurisdiction_relationship
WITH (security_barrier = true)
AS
SELECT
  relationship.relationship_id,
  relationship.district_id,
  district.country_code,
  relationship.jurisdiction_id,
  relationship.kind,
  relationship.effective_from,
  relationship.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.district_jurisdiction_relationship AS relationship
JOIN rmr_registry.district USING (district_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_district_lineage
WITH (security_barrier = true)
AS
SELECT
  lineage.lineage_id,
  lineage.district_id,
  district.country_code,
  lineage.predecessor_district_id,
  lineage.kind,
  lineage.effective_from,
  lineage.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.district_lineage AS lineage
JOIN rmr_registry.district USING (district_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_body_read
WITH (security_barrier = true)
AS
SELECT
  body.public_body_id,
  body.country_code,
  version.version_id,
  version.name,
  version.slug,
  version.kind,
  version.status,
  version.effective_from,
  version.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.public_body AS body
JOIN rmr_registry.public_body_version AS version USING (public_body_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_body_jurisdiction_relationship
WITH (security_barrier = true)
AS
SELECT
  relationship.relationship_id,
  relationship.public_body_id,
  body.country_code,
  relationship.jurisdiction_id,
  relationship.kind,
  relationship.effective_from,
  relationship.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.body_jurisdiction_relationship AS relationship
JOIN rmr_registry.public_body AS body USING (public_body_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_office_version
WITH (security_barrier = true)
AS
SELECT
  office.office_id,
  office.country_code,
  version.version_id,
  version.public_body_id,
  version.district_id,
  version.name,
  version.slug,
  version.selection_method,
  version.operational_state,
  version.effective_from,
  version.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.office
JOIN rmr_registry.office_version AS version USING (office_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_external_identifier
WITH (security_barrier = true)
AS
SELECT
  identifier.external_identifier_id,
  coalesce(
    jurisdiction.country_code,
    district.country_code,
    body.country_code,
    office.country_code
  ) AS country_code,
  CASE
    WHEN identifier.jurisdiction_id IS NOT NULL THEN 'jurisdiction'
    WHEN identifier.district_id IS NOT NULL THEN 'district'
    WHEN identifier.public_body_id IS NOT NULL THEN 'public_body'
    ELSE 'office'
  END AS entity_kind,
  coalesce(
    identifier.jurisdiction_id,
    identifier.district_id,
    identifier.public_body_id,
    identifier.office_id
  ) AS entity_id,
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
FROM rmr_registry.external_identifier AS identifier
LEFT JOIN rmr_registry.jurisdiction USING (jurisdiction_id)
LEFT JOIN rmr_registry.district USING (district_id)
LEFT JOIN rmr_registry.public_body AS body USING (public_body_id)
LEFT JOIN rmr_registry.office USING (office_id)
JOIN rmr_registry.assertion USING (assertion_id);

CREATE VIEW rmr_registry.public_gap_view
WITH (security_barrier = true)
AS
SELECT
  gap.gap_id,
  coalesce(
    jurisdiction.country_code,
    district.country_code,
    body.country_code,
    office.country_code
  ) AS country_code,
  CASE
    WHEN gap.jurisdiction_id IS NOT NULL THEN 'jurisdiction'
    WHEN gap.district_id IS NOT NULL THEN 'district'
    WHEN gap.public_body_id IS NOT NULL THEN 'public_body'
    ELSE 'office'
  END AS entity_kind,
  coalesce(gap.jurisdiction_id, gap.district_id, gap.public_body_id, gap.office_id) AS entity_id,
  gap.code,
  gap.message,
  gap.effective_from,
  gap.effective_to,
  assertion.assertion_id,
  assertion.source_reference,
  assertion.observed_at,
  assertion.freshness_state,
  assertion.coverage_state,
  assertion.conflict_state,
  assertion.supersedes_assertion_id
FROM rmr_registry.public_gap AS gap
LEFT JOIN rmr_registry.jurisdiction USING (jurisdiction_id)
LEFT JOIN rmr_registry.district USING (district_id)
LEFT JOIN rmr_registry.public_body AS body USING (public_body_id)
LEFT JOIN rmr_registry.office USING (office_id)
JOIN rmr_registry.assertion USING (assertion_id);

REVOKE ALL ON SCHEMA rmr_registry FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA rmr_registry FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA rmr_registry FROM PUBLIC;
GRANT USAGE ON SCHEMA rmr_registry TO rmr_registry_reader;
GRANT SELECT ON
  rmr_registry.public_jurisdiction_version,
  rmr_registry.public_jurisdiction_relationship,
  rmr_registry.public_district_version,
  rmr_registry.public_district_boundary_version,
  rmr_registry.public_district_jurisdiction_relationship,
  rmr_registry.public_district_lineage,
  rmr_registry.public_body_read,
  rmr_registry.public_body_jurisdiction_relationship,
  rmr_registry.public_office_version,
  rmr_registry.public_external_identifier,
  rmr_registry.public_gap_view
TO rmr_registry_reader;

COMMENT ON SCHEMA rmr_registry IS
  'Canonical PostgreSQL jurisdiction, district, public-body, and office structure. Contains no person, office-term, candidacy, precise-location, Verus, treasury, reserve, or currency records.';
