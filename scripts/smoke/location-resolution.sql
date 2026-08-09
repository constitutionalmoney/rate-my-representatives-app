BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'rmr_location'
  ) THEN
    RAISE EXCEPTION 'Transient location schema must not persist tables.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'rmr_account'
      AND table_name IN ('saved_broad_jurisdiction', 'broad_jurisdiction_write_receipt')
      AND replace(lower(column_name), '_', '') ~
        '(address|coordinate|latitude|longitude|postalcode|preciselocation|resolutiontoken)'
  ) THEN
    RAISE EXCEPTION 'Broad jurisdiction storage contains a prohibited precise field.';
  END IF;

  IF has_table_privilege(
    'rmr_account_service', 'rmr_account.saved_broad_jurisdiction', 'INSERT'
  ) OR has_table_privilege(
    'rmr_location_service', 'rmr_account.saved_broad_jurisdiction', 'SELECT'
  ) THEN
    RAISE EXCEPTION 'Broad preference table bypasses the account-domain function boundary.';
  END IF;

  IF NOT has_function_privilege(
    'rmr_account_service',
    'rmr_account.put_broad_jurisdiction(text,text,text,text,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) OR NOT has_function_privilege(
    'rmr_account_service',
    'rmr_account.delete_broad_jurisdiction(text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Account service cannot use the scoped broad preference functions.';
  END IF;
END
$$;

SET LOCAL ROLE rmr_account_service;

SELECT count(*) = 1 AS saved
FROM rmr_account.put_broad_jurisdiction(
  'account:synthetic:location-smoke',
  'preference:synthetic:location-smoke',
  'CA',
  'jurisdiction:ca:maple',
  'province',
  'Maple Province',
  repeat('a', 64),
  repeat('b', 64),
  'event:synthetic:location-put',
  'request:synthetic:location-put',
  'correlation:synthetic:location-put',
  '2026-06-01T12:00:00.000Z'::timestamptz
) \gset

\if :saved
\else
  \quit 1
\endif

SELECT count(*) = 1 AS replayed
FROM rmr_account.put_broad_jurisdiction(
  'account:synthetic:location-smoke',
  'preference:synthetic:location-smoke',
  'CA',
  'jurisdiction:ca:maple',
  'province',
  'Maple Province',
  repeat('a', 64),
  repeat('b', 64),
  'event:synthetic:location-put-replay',
  'request:synthetic:location-put-replay',
  'correlation:synthetic:location-put-replay',
  '2026-06-01T12:00:00.000Z'::timestamptz
) \gset

\if :replayed
\else
  \quit 1
\endif

SELECT rmr_account.delete_broad_jurisdiction(
  'account:synthetic:location-smoke',
  'preference:synthetic:location-smoke',
  repeat('c', 64),
  repeat('d', 64),
  'event:synthetic:location-delete',
  'request:synthetic:location-delete',
  'correlation:synthetic:location-delete',
  '2026-06-01T12:01:00.000Z'::timestamptz
) AS deleted \gset

\if :deleted
\else
  \quit 1
\endif

RESET ROLE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM rmr_audit.event
    WHERE event_id IN ('event:synthetic:location-put', 'event:synthetic:location-delete')
      AND rmr_internal.jsonb_has_prohibited_audit_key(safe_detail)
  ) THEN
    RAISE EXCEPTION 'Location preference audit event contains a prohibited payload.';
  END IF;
END
$$;

ROLLBACK;
