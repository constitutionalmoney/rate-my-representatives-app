\set ON_ERROR_STOP on

DO $$
DECLARE
  forbidden_table_count integer;
BEGIN
  IF (SELECT count(*) FROM rmr_registry.jurisdiction WHERE country_code = 'CA') < 6 THEN
    RAISE EXCEPTION 'Canada jurisdiction fixture is incomplete';
  END IF;
  IF (SELECT count(*) FROM rmr_registry.jurisdiction WHERE country_code = 'US') < 5 THEN
    RAISE EXCEPTION 'United States jurisdiction fixture is incomplete';
  END IF;
  IF (
    SELECT count(*)
    FROM rmr_registry.jurisdiction_relationship
    WHERE subject_jurisdiction_id = 'jurisdiction:ca:harbour'
      AND kind = 'contained_by'
      AND effective_period @> '2026-08-06T12:00:00Z'::timestamptz
  ) <> 2 THEN
    RAISE EXCEPTION 'Multiple effective parents are not represented';
  END IF;
  IF (
    SELECT count(DISTINCT name)
    FROM rmr_registry.jurisdiction_version
    WHERE jurisdiction_id = 'jurisdiction:ca:harbour'
  ) <> 2 THEN
    RAISE EXCEPTION 'Stable jurisdiction ID did not preserve rename history';
  END IF;
  IF (
    SELECT count(DISTINCT identifier)
    FROM rmr_registry.external_identifier
    WHERE jurisdiction_id = 'jurisdiction:ca:harbour'
  ) <> 2 THEN
    RAISE EXCEPTION 'External identifier history is incomplete';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM rmr_registry.district_lineage
    WHERE kind = 'redistricted_from'
  ) THEN
    RAISE EXCEPTION 'Redistricting lineage is missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM rmr_registry.jurisdiction_version
    WHERE status = 'amalgamated'
  ) THEN
    RAISE EXCEPTION 'Amalgamation history is missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM rmr_registry.office_version
    WHERE selection_method = 'appointed'
  ) OR NOT EXISTS (
    SELECT 1
    FROM rmr_registry.office_version
    WHERE operational_state IN ('acting', 'vacant')
  ) THEN
    RAISE EXCEPTION 'Appointment, acting, or vacancy states are missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM rmr_registry.office_version
    WHERE operational_state = 'abolished'
  ) THEN
    RAISE EXCEPTION 'Abolished office history is missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM rmr_registry.public_gap_view
    WHERE coverage_state = 'gap' AND conflict_state = 'conflicting'
  ) THEN
    RAISE EXCEPTION 'Public coverage/conflict metadata is missing';
  END IF;
  IF has_table_privilege('rmr_registry_reader', 'rmr_registry.jurisdiction', 'SELECT') THEN
    RAISE EXCEPTION 'Registry reader can access a base table';
  END IF;
  IF NOT has_table_privilege(
    'rmr_registry_reader',
    'rmr_registry.public_jurisdiction_version',
    'SELECT'
  ) THEN
    RAISE EXCEPTION 'Registry reader cannot access the public view';
  END IF;

  SELECT count(*) INTO forbidden_table_count
  FROM information_schema.tables
  WHERE table_schema = 'rmr_registry'
    AND table_name ~ '(person|candidacy|office_term|treasury|reserve|currency|verus)';
  IF forbidden_table_count <> 0 THEN
    RAISE EXCEPTION 'A deferred or prohibited table family was created';
  END IF;

  BEGIN
    INSERT INTO rmr_registry.jurisdiction_version (
      version_id, jurisdiction_id, name, slug, kind, status,
      effective_from, effective_to, assertion_id
    ) VALUES (
      'smoke:overlap', 'jurisdiction:ca:harbour', 'Overlap fixture', 'overlap-fixture',
      'municipality', 'active', '2026-06-01T00:00:00Z', NULL,
      'assertion:seed:ca:harbour:new'
    );
    RAISE EXCEPTION 'Temporal overlap was accepted';
  EXCEPTION
    WHEN exclusion_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO rmr_registry.jurisdiction_relationship (
      relationship_id, subject_jurisdiction_id, object_jurisdiction_id, kind,
      effective_from, effective_to, assertion_id
    ) VALUES (
      'smoke:cycle', 'jurisdiction:ca:maple', 'jurisdiction:ca:harbour',
      'contained_by', '2026-08-06T00:00:00Z', NULL,
      'assertion:seed:relationship:ca:province'
    );
    RAISE EXCEPTION 'Containment cycle was accepted';
  EXCEPTION
    WHEN raise_exception THEN
      IF SQLERRM = 'Containment cycle was accepted' THEN
        RAISE;
      END IF;
  END;

  BEGIN
    INSERT INTO rmr_registry.jurisdiction_relationship (
      relationship_id, subject_jurisdiction_id, object_jurisdiction_id, kind,
      effective_from, effective_to, assertion_id
    ) VALUES (
      'smoke:cross-country', 'jurisdiction:ca:maple', 'jurisdiction:us:example-state',
      'administered_by', '2026-08-06T00:00:00Z', NULL,
      'assertion:seed:relationship:ca:province'
    );
    RAISE EXCEPTION 'Cross-country edge was accepted';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;
END
$$;

SELECT 'jurisdiction registry smoke passed' AS result;
