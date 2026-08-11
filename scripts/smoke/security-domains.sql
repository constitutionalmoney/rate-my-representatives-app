BEGIN;

DO $$
DECLARE
  unsafe_suffix text := txid_current()::text;
BEGIN
  IF NOT pg_has_role('rmr_api_runtime', 'rmr_api_public_service', 'member') THEN
    RAISE EXCEPTION 'API runtime is not bound to its public service role.';
  END IF;
  IF NOT pg_has_role('rmr_worker_runtime', 'rmr_core_worker_service', 'member') THEN
    RAISE EXCEPTION 'Worker runtime is not bound to its scoped core service role.';
  END IF;
  IF pg_has_role('rmr_api_runtime', 'rmr_outbox_worker', 'member')
    OR pg_has_role('rmr_worker_runtime', 'rmr_outbox_worker', 'member') THEN
    RAISE EXCEPTION 'A runtime identity inherited the all-event outbox worker role.';
  END IF;

  IF NOT has_table_privilege('rmr_api_runtime', 'rmr_public.current_profile_read', 'SELECT')
    OR NOT has_table_privilege('rmr_api_runtime', 'rmr_registry.public_jurisdiction_version', 'SELECT') THEN
    RAISE EXCEPTION 'API runtime cannot read an allowlisted public view.';
  END IF;
  IF has_table_privilege('rmr_api_runtime', 'rmr_source.retrieval', 'SELECT')
    OR has_table_privilege('rmr_api_runtime', 'rmr_audit.event', 'SELECT')
    OR has_schema_privilege('rmr_api_runtime', 'rmr_account', 'USAGE')
    OR has_schema_privilege('rmr_api_runtime', 'rmr_identity', 'USAGE')
    OR has_schema_privilege('rmr_api_runtime', 'rmr_participation', 'USAGE')
    OR has_schema_privilege('rmr_api_runtime', 'rmr_signer', 'USAGE') THEN
    RAISE EXCEPTION 'API runtime can reach a restricted database domain.';
  END IF;

  IF NOT has_function_privilege(
    'rmr_worker_runtime', 'rmr_outbox.claim_core_events(text,integer,interval)', 'EXECUTE'
  ) OR NOT has_function_privilege(
    'rmr_worker_runtime', 'rmr_outbox.complete_core_event(text,text,text)', 'EXECUTE'
  ) OR NOT has_function_privilege(
    'rmr_worker_runtime', 'rmr_outbox.fail_core_event(text,text,text,text)', 'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Core worker cannot use its scoped claim/transition functions.';
  END IF;
  IF has_function_privilege(
    'rmr_worker_runtime', 'rmr_outbox.claim_events(text,integer,interval)', 'EXECUTE'
  ) OR has_function_privilege(
    'rmr_worker_runtime', 'rmr_outbox.claim_provenance_events(text,integer,interval)', 'EXECUTE'
  ) OR has_function_privilege(
    'rmr_worker_runtime', 'rmr_outbox.complete_event(text,text,text)', 'EXECUTE'
  ) OR has_function_privilege(
    'rmr_worker_runtime', 'rmr_outbox.fail_event(text,text,text,text)', 'EXECUTE'
  ) OR has_function_privilege(
    'rmr_worker_runtime', 'rmr_outbox.complete_provenance_event(text,text,text)', 'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Core worker can claim or transition all-event/provenance queues.';
  END IF;

  IF has_schema_privilege('rmr_signer_service', 'rmr_registry', 'USAGE')
    OR has_schema_privilege('rmr_signer_service', 'rmr_audit', 'USAGE')
    OR has_schema_privilege('rmr_signer_service', 'rmr_outbox', 'USAGE')
    OR NOT has_schema_privilege('rmr_signer_service', 'rmr_signer', 'USAGE') THEN
    RAISE EXCEPTION 'Signer service database isolation is invalid.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'rmr_security'
      AND table_name = 'access_review_event'
      AND replace(lower(column_name), '_', '') IN (
        'accountid', 'address', 'identityevidence', 'moderatornotes',
        'preciselocation', 'representativesignal', 'walletpayload'
      )
  ) THEN
    RAISE EXCEPTION 'Access-review storage includes a prohibited payload field.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname LIKE 'rmr%'
      AND (
        replace(lower(viewname), '_', '') ~ '(citizenscore|socialcredit|politicalprofile|civicreputation|ideology(profile|score)|loyaltyscore|reputationscore|trustworthinessscore|citizenriskscore)'
        OR lower(definition) ~ '(social[_ ]?credit|citizen[_ ]?(score|risk)|civic[_ ]?reputation|ideology[_ ]?(profile|score)|loyalty[_ ]?score|political[_ ]?profile|reputation[_ ]?score|trustworthiness[_ ]?score)'
      )
  ) THEN
    RAISE EXCEPTION 'A forbidden generalized citizen-score view exists.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema LIKE 'rmr%'
      AND replace(lower(column_name), '_', '') ~
        '(citizenscore|socialcredit|politicalprofile|civicreputation|ideology(profile|score)|loyaltyscore|reputationscore|trustworthinessscore|citizenriskscore)'
  ) THEN
    RAISE EXCEPTION 'A forbidden generalized citizen-score column exists.';
  END IF;

  BEGIN
    PERFORM rmr.record_synthetic_command(
      'synthetic-security-unsafe-' || unsafe_suffix,
      'synthetic-state-v1',
      'synthetic-security-audit-' || unsafe_suffix,
      'synthetic-security-outbox-' || unsafe_suffix,
      'synthetic-security-command-' || unsafe_suffix,
      'synthetic-security-correlation-' || unsafe_suffix,
      '{"nested":{"preciseLocation":"synthetic private address","representativeSignal":"concern"}}'::jsonb
    );
    RAISE EXCEPTION 'Precise location or private civic activity entered audit/outbox storage.';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;
END
$$;

SET ROLE rmr_api_public_service;
SELECT rmr_security.record_access_decision(
  'access:synthetic:api-public-read',
  'rmr_api_public_service',
  NULL,
  'public_registry',
  'read',
  'allow',
  'explicit_allow',
  'correlation:synthetic:security-domain-smoke'
);
RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM rmr_security.access_review_event
      WHERE access_event_id = 'access:synthetic:api-public-read') <> 1 THEN
    RAISE EXCEPTION 'Payload-free access decision was not recorded.';
  END IF;
END
$$;

ROLLBACK;
