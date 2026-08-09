BEGIN;

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
        'accountid', 'abuseindicator', 'address', 'categoryrating', 'coordinate', 'coordinates', 'credential',
        'deviceid', 'email', 'evidence', 'identityevidence', 'identityproof', 'latitude',
        'location', 'longitude', 'moderatornotes', 'passphrase', 'passkey', 'postalcode',
        'preciseaddress', 'preciselocation', 'preference', 'privateactivity', 'privatekey',
        'providerquery', 'recoverytoken',
        'representativesignal', 'seed', 'seedphrase', 'session', 'sessionid',
        'sessiontoken', 'signal', 'subscription', 'token', 'walletpayload',
        'walletrequest', 'wif'
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

REVOKE ALL ON FUNCTION rmr_internal.jsonb_has_prohibited_audit_key(jsonb) FROM PUBLIC;

CREATE TABLE rmr_account.saved_broad_jurisdiction (
  account_id text PRIMARY KEY,
  preference_id text NOT NULL UNIQUE,
  country_code text NOT NULL CHECK (country_code IN ('CA', 'US')),
  jurisdiction_id text NOT NULL REFERENCES rmr_registry.jurisdiction(jurisdiction_id),
  jurisdiction_kind text NOT NULL CHECK (
    jurisdiction_kind IN ('country', 'province', 'state', 'territory')
  ),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 160),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT saved_broad_jurisdiction_stable_ids CHECK (
    account_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND preference_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND jurisdiction_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  ),
  CONSTRAINT saved_broad_jurisdiction_chronology CHECK (updated_at >= created_at)
);

CREATE TABLE rmr_account.broad_jurisdiction_write_receipt (
  account_id text NOT NULL,
  idempotency_key_sha256 text NOT NULL CHECK (idempotency_key_sha256 ~ '^[a-f0-9]{64}$'),
  command_sha256 text NOT NULL CHECK (command_sha256 ~ '^[a-f0-9]{64}$'),
  operation text NOT NULL CHECK (operation IN ('put', 'delete')),
  preference_id text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (account_id, idempotency_key_sha256),
  CONSTRAINT broad_jurisdiction_receipt_stable_ids CHECK (
    account_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND preference_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  )
);

COMMENT ON TABLE rmr_account.saved_broad_jurisdiction IS
  'Optional country/province/state/territory preference. Districts, municipalities, postal codes, addresses, coordinates, resolution tokens, and submitted values are structurally absent.';
COMMENT ON TABLE rmr_account.broad_jurisdiction_write_receipt IS
  'Hashed write receipts for idempotency. Contains no request body or precise location material.';
COMMENT ON SCHEMA rmr_location IS
  'Transient location-resolution security domain. It intentionally owns no tables, sequences, persistent cache, queue, audit payload, or object-storage references.';

CREATE OR REPLACE FUNCTION rmr_account.validate_saved_broad_jurisdiction()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, rmr_account, rmr_registry
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM rmr_registry.jurisdiction AS jurisdiction
    JOIN rmr_registry.jurisdiction_version AS version
      ON version.jurisdiction_id = jurisdiction.jurisdiction_id
    WHERE jurisdiction.jurisdiction_id = NEW.jurisdiction_id
      AND jurisdiction.country_code = NEW.country_code
      AND version.kind = NEW.jurisdiction_kind
      AND version.name = NEW.label
      AND version.effective_from <= NEW.updated_at
      AND (version.effective_to IS NULL OR version.effective_to > NEW.updated_at)
  ) THEN
    RAISE EXCEPTION 'saved jurisdiction must match an effective canonical broad jurisdiction'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER saved_broad_jurisdiction_validate_canonical
BEFORE INSERT OR UPDATE ON rmr_account.saved_broad_jurisdiction
FOR EACH ROW EXECUTE FUNCTION rmr_account.validate_saved_broad_jurisdiction();

ALTER TABLE rmr_account.saved_broad_jurisdiction ENABLE ROW LEVEL SECURITY;
ALTER TABLE rmr_account.saved_broad_jurisdiction FORCE ROW LEVEL SECURITY;
ALTER TABLE rmr_account.broad_jurisdiction_write_receipt ENABLE ROW LEVEL SECURITY;
ALTER TABLE rmr_account.broad_jurisdiction_write_receipt FORCE ROW LEVEL SECURITY;

CREATE POLICY saved_broad_jurisdiction_account_isolation
ON rmr_account.saved_broad_jurisdiction
FOR ALL
TO rmr_account_service
USING (account_id = current_setting('rmr.account_id', true))
WITH CHECK (account_id = current_setting('rmr.account_id', true));

CREATE POLICY broad_jurisdiction_receipt_account_isolation
ON rmr_account.broad_jurisdiction_write_receipt
FOR ALL
TO rmr_account_service
USING (account_id = current_setting('rmr.account_id', true))
WITH CHECK (account_id = current_setting('rmr.account_id', true));

CREATE OR REPLACE FUNCTION rmr_account.put_broad_jurisdiction(
  target_account_id text,
  target_preference_id text,
  target_country_code text,
  target_jurisdiction_id text,
  target_jurisdiction_kind text,
  target_label text,
  target_idempotency_key_sha256 text,
  target_command_sha256 text,
  target_event_id text,
  target_request_id text,
  target_correlation_id text,
  target_occurred_at timestamptz
)
RETURNS SETOF rmr_account.saved_broad_jurisdiction
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_account, rmr_audit
AS $$
DECLARE
  prior_receipt rmr_account.broad_jurisdiction_write_receipt%ROWTYPE;
BEGIN
  SELECT * INTO prior_receipt
  FROM rmr_account.broad_jurisdiction_write_receipt
  WHERE account_id = target_account_id
    AND idempotency_key_sha256 = target_idempotency_key_sha256;

  IF FOUND THEN
    IF prior_receipt.command_sha256 <> target_command_sha256 OR prior_receipt.operation <> 'put' THEN
      RAISE EXCEPTION 'idempotency key conflict' USING ERRCODE = '23505';
    END IF;
    RETURN QUERY
      SELECT * FROM rmr_account.saved_broad_jurisdiction
      WHERE account_id = target_account_id;
    RETURN;
  END IF;

  INSERT INTO rmr_account.saved_broad_jurisdiction (
    account_id, preference_id, country_code, jurisdiction_id,
    jurisdiction_kind, label, created_at, updated_at
  ) VALUES (
    target_account_id, target_preference_id, target_country_code, target_jurisdiction_id,
    target_jurisdiction_kind, target_label, target_occurred_at, target_occurred_at
  )
  ON CONFLICT (account_id) DO UPDATE SET
    preference_id = EXCLUDED.preference_id,
    country_code = EXCLUDED.country_code,
    jurisdiction_id = EXCLUDED.jurisdiction_id,
    jurisdiction_kind = EXCLUDED.jurisdiction_kind,
    label = EXCLUDED.label,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO rmr_account.broad_jurisdiction_write_receipt (
    account_id, idempotency_key_sha256, command_sha256, operation, preference_id
  ) VALUES (
    target_account_id, target_idempotency_key_sha256, target_command_sha256,
    'put', target_preference_id
  );

  INSERT INTO rmr_audit.event (
    event_id, event_schema, aggregate_type, aggregate_id, actor_type, actor_ref,
    action, prior_state_ref, new_state_ref, policy_version, method_version,
    request_id, idempotency_key, correlation_id, occurred_at, reason_code,
    privacy_class, redaction_version, code_revision, environment, safe_detail
  ) VALUES (
    target_event_id, 'audit.location-preference.v1', 'broad_jurisdiction', target_preference_id,
    'human', target_account_id, 'location_preference.put', NULL, target_preference_id,
    'location-privacy-v1', 'broad-preference-v1', target_request_id,
    target_idempotency_key_sha256, target_correlation_id, target_occurred_at,
    'user_request', 'restricted', 'location-redaction-v1', 'issue-29', 'test',
    jsonb_build_object('countryCode', target_country_code, 'jurisdictionKind', target_jurisdiction_kind)
  );

  RETURN QUERY
    SELECT * FROM rmr_account.saved_broad_jurisdiction
    WHERE account_id = target_account_id;
END
$$;

CREATE OR REPLACE FUNCTION rmr_account.delete_broad_jurisdiction(
  target_account_id text,
  target_preference_id text,
  target_idempotency_key_sha256 text,
  target_command_sha256 text,
  target_event_id text,
  target_request_id text,
  target_correlation_id text,
  target_occurred_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_account, rmr_audit
AS $$
DECLARE
  prior_receipt rmr_account.broad_jurisdiction_write_receipt%ROWTYPE;
  deleted_rows integer;
BEGIN
  SELECT * INTO prior_receipt
  FROM rmr_account.broad_jurisdiction_write_receipt
  WHERE account_id = target_account_id
    AND idempotency_key_sha256 = target_idempotency_key_sha256;

  IF FOUND THEN
    IF prior_receipt.command_sha256 <> target_command_sha256 OR prior_receipt.operation <> 'delete' THEN
      RAISE EXCEPTION 'idempotency key conflict' USING ERRCODE = '23505';
    END IF;
    RETURN true;
  END IF;

  DELETE FROM rmr_account.saved_broad_jurisdiction
  WHERE account_id = target_account_id AND preference_id = target_preference_id;
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  IF deleted_rows = 0 THEN RETURN false; END IF;

  INSERT INTO rmr_account.broad_jurisdiction_write_receipt (
    account_id, idempotency_key_sha256, command_sha256, operation, preference_id
  ) VALUES (
    target_account_id, target_idempotency_key_sha256, target_command_sha256,
    'delete', target_preference_id
  );

  INSERT INTO rmr_audit.event (
    event_id, event_schema, aggregate_type, aggregate_id, actor_type, actor_ref,
    action, prior_state_ref, new_state_ref, policy_version, method_version,
    request_id, idempotency_key, correlation_id, occurred_at, reason_code,
    privacy_class, redaction_version, code_revision, environment, safe_detail
  ) VALUES (
    target_event_id, 'audit.location-preference.v1', 'broad_jurisdiction', target_preference_id,
    'human', target_account_id, 'location_preference.delete', target_preference_id, NULL,
    'location-privacy-v1', 'broad-preference-v1', target_request_id,
    target_idempotency_key_sha256, target_correlation_id, target_occurred_at,
    'user_request', 'restricted', 'location-redaction-v1', 'issue-29', 'test', '{}'::jsonb
  );

  RETURN true;
END
$$;

REVOKE ALL ON TABLE rmr_account.saved_broad_jurisdiction FROM PUBLIC;
REVOKE ALL ON TABLE rmr_account.broad_jurisdiction_write_receipt FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_account.validate_saved_broad_jurisdiction() FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_account.put_broad_jurisdiction(
  text, text, text, text, text, text, text, text, text, text, text, timestamptz
) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_account.delete_broad_jurisdiction(
  text, text, text, text, text, text, text, timestamptz
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION rmr_account.put_broad_jurisdiction(
  text, text, text, text, text, text, text, text, text, text, text, timestamptz
) TO rmr_account_service;
GRANT EXECUTE ON FUNCTION rmr_account.delete_broad_jurisdiction(
  text, text, text, text, text, text, text, timestamptz
) TO rmr_account_service;
GRANT SELECT ON rmr_account.saved_broad_jurisdiction TO rmr_account_service;

COMMIT;
