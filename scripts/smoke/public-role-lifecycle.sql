DO $$
DECLARE
  prohibited_columns integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM rmr.synthetic_seed_marker
    WHERE fixture_key = 'synthetic.public-role.registry.v1'
  ) THEN
    RAISE EXCEPTION 'public-role seed marker is missing';
  END IF;

  IF (SELECT count(*) FROM rmr_registry.person) < 4
    OR (SELECT count(*) FROM rmr_registry.office_term) < 4
    OR (SELECT count(*) FROM rmr_registry.election) < 2
    OR (SELECT count(*) FROM rmr_registry.candidacy) < 4 THEN
    RAISE EXCEPTION 'public-role entities were not seeded separately';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM rmr_registry.public_office_term
    WHERE tenure_classification = 'current' AND service_capacity = 'acting'
  ) OR NOT EXISTS (
    SELECT 1 FROM rmr_registry.public_office_term
    WHERE tenure_classification = 'former' AND selection_method = 'elected'
  ) OR NOT EXISTS (
    SELECT 1 FROM rmr_registry.public_office_term
    WHERE tenure_classification = 'current' AND service_capacity = 'interim'
  ) THEN
    RAISE EXCEPTION 'term lifecycle classifications are incomplete';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM rmr_registry.public_candidacy candidacy
    JOIN rmr_registry.public_office_term term
      ON term.person_id = candidacy.person_id AND term.office_id = candidacy.office_id
    WHERE candidacy.current_state = 'won'
  ) THEN
    RAISE EXCEPTION 'a won candidacy was treated as an office term';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM rmr_registry.public_candidacy WHERE current_state = 'won'
  ) OR NOT EXISTS (
    SELECT 1 FROM rmr_registry.public_candidacy WHERE current_state = 'defeated'
  ) THEN
    RAISE EXCEPTION 'candidacy outcomes are incomplete';
  END IF;

  SELECT count(*) INTO prohibited_columns
  FROM information_schema.columns
  WHERE table_schema = 'rmr_registry'
    AND table_name LIKE 'public_%'
    AND column_name IN ('actor_reference', 'private_notes');
  IF prohibited_columns <> 0 THEN
    RAISE EXCEPTION 'restricted review fields escaped through a public view';
  END IF;

  IF EXISTS (SELECT 1 FROM rmr_registry.external_identity_reference) THEN
    RAISE EXCEPTION 'the core synthetic fixture must not require an external identity';
  END IF;
END
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO rmr_registry.office_term_transition (
      transition_id, office_term_id, from_state, to_state, effective_at, assertion_id, review_id
    ) VALUES (
      'smoke:illegal-term-transition', 'term:ca:avery:current', 'active', 'pending',
      '2026-08-07T13:00:00Z', 'assertion:role:lifecycle', 'review:role:seed'
    );
    RAISE EXCEPTION 'illegal term transition was accepted';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;

  BEGIN
    INSERT INTO rmr_registry.external_identity_reference (
      external_identity_reference_id, person_id, kind, immutable_reference,
      canonical_authority, grants_authorization, effective_from, assertion_id
    ) VALUES (
      'smoke:authoritative-external-id', 'person:ca:avery-quill', 'verus_id',
      'synthetic-only', true, true, '2026-08-07T00:00:00Z', 'assertion:role:identifier'
    );
    RAISE EXCEPTION 'authoritative external identity reference was accepted';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;

  BEGIN
    INSERT INTO rmr_registry.person_resolution_decision (
      decision_id, kind, effective_at, assertion_id, review_id
    ) VALUES (
      'smoke:name-only-resolution', 'distinct', '2026-08-07T13:00:00Z',
      'assertion:role:resolution', 'review:role:human'
    );
    INSERT INTO rmr_registry.person_resolution_party (decision_id, person_id, party_role) VALUES
      ('smoke:name-only-resolution', 'person:us:morgan-fields', 'input'),
      ('smoke:name-only-resolution', 'person:us:morgan-field', 'input');
    INSERT INTO rmr_registry.person_resolution_evidence (
      evidence_id, decision_id, kind, reference, assertion_id
    ) VALUES
      ('smoke:name-only-a', 'smoke:name-only-resolution', 'name', 'synthetic://name/a', 'assertion:role:resolution'),
      ('smoke:name-only-b', 'smoke:name-only-resolution', 'name', 'synthetic://name/b', 'assertion:role:resolution-context');
    EXECUTE 'SET CONSTRAINTS ALL IMMEDIATE';
    RAISE EXCEPTION 'name-only resolution was accepted';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
END
$$;

SELECT 'public-role-lifecycle-smoke-ok';
