DO $$
DECLARE
  role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY[
    'rmr_api_public_service',
    'rmr_core_worker_service',
    'rmr_account_service',
    'rmr_location_service',
    'rmr_identity_service',
    'rmr_participation_service',
    'rmr_moderation_service',
    'rmr_publication_service',
    'rmr_source_service',
    'rmr_provenance_service',
    'rmr_signer_service',
    'rmr_security_auditor',
    'rmr_backup_operator'
  ]
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', role_name);
    END IF;
  END LOOP;
END
$$;

CREATE SCHEMA rmr_account;
CREATE SCHEMA rmr_location;
CREATE SCHEMA rmr_identity;
CREATE SCHEMA rmr_participation;
CREATE SCHEMA rmr_moderation;
CREATE SCHEMA rmr_provenance;
CREATE SCHEMA rmr_signer;
CREATE SCHEMA rmr_security;

COMMENT ON SCHEMA rmr_account IS 'Reserved account/authentication security domain; no issue #22 account feature.';
COMMENT ON SCHEMA rmr_location IS 'Reserved transient location-resolution security domain; precise input must never persist.';
COMMENT ON SCHEMA rmr_identity IS 'Reserved identity/attestation security domain; no Verus identity work in issue #22.';
COMMENT ON SCHEMA rmr_participation IS 'Reserved private civic-activity security domain; no signal or rating feature in issue #22.';
COMMENT ON SCHEMA rmr_moderation IS 'Reserved restricted moderation security domain.';
COMMENT ON SCHEMA rmr_provenance IS 'Reserved public methodology/provenance domain; no provenance writer in issue #22.';
COMMENT ON SCHEMA rmr_signer IS 'Reserved signing/RPC domain, isolated from public and general worker service identities.';
COMMENT ON SCHEMA rmr_security IS 'Payload-free security-domain access decisions and reviewed access matrix.';

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
        'accountid', 'abuseindicator', 'address', 'categoryrating', 'credential',
        'deviceid', 'email', 'evidence', 'identityevidence', 'identityproof', 'location',
        'moderatornotes', 'passphrase', 'passkey', 'preciseaddress', 'preciselocation',
        'preference', 'privateactivity', 'privatekey', 'recoverytoken',
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

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA
  rmr_account,
  rmr_location,
  rmr_identity,
  rmr_participation,
  rmr_moderation,
  rmr_provenance,
  rmr_signer,
  rmr_security
FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE rmr IN SCHEMA
  rmr, rmr_internal, rmr_registry, rmr_source, rmr_public, rmr_audit, rmr_outbox,
  rmr_account, rmr_location, rmr_identity, rmr_participation, rmr_moderation,
  rmr_provenance, rmr_signer, rmr_security
REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE rmr IN SCHEMA
  rmr, rmr_internal, rmr_registry, rmr_source, rmr_public, rmr_audit, rmr_outbox,
  rmr_account, rmr_location, rmr_identity, rmr_participation, rmr_moderation,
  rmr_provenance, rmr_signer, rmr_security
REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE rmr IN SCHEMA
  rmr, rmr_internal, rmr_registry, rmr_source, rmr_public, rmr_audit, rmr_outbox,
  rmr_account, rmr_location, rmr_identity, rmr_participation, rmr_moderation,
  rmr_provenance, rmr_signer, rmr_security
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE rmr IN SCHEMA
  rmr, rmr_internal, rmr_registry, rmr_source, rmr_public, rmr_audit, rmr_outbox,
  rmr_account, rmr_location, rmr_identity, rmr_participation, rmr_moderation,
  rmr_provenance, rmr_signer, rmr_security
REVOKE USAGE ON TYPES FROM PUBLIC;

CREATE TABLE rmr_security.access_review_event (
  access_event_id text PRIMARY KEY,
  service_principal text NOT NULL CHECK (service_principal ~ '^rmr_[a-z_]+$'),
  source_domain text,
  target_domain text NOT NULL,
  operation text NOT NULL CHECK (operation IN (
    'read', 'write', 'transient_process', 'public_serialize', 'backup', 'restore', 'audit_review'
  )),
  decision text NOT NULL CHECK (decision IN ('allow', 'deny')),
  reason_code text NOT NULL CHECK (reason_code ~ '^[a-z0-9._:-]{1,128}$'),
  correlation_id text NOT NULL CHECK (correlation_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'),
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT security_domain_names CHECK (
    source_domain IS NULL OR source_domain IN (
      'public_registry', 'account_authentication', 'location_resolver', 'identity_attestation',
      'private_civic_activity', 'moderation', 'public_methodology_provenance', 'verus_signing_rpc'
    )
  ),
  CONSTRAINT security_target_domain_name CHECK (target_domain IN (
    'public_registry', 'account_authentication', 'location_resolver', 'identity_attestation',
    'private_civic_activity', 'moderation', 'public_methodology_provenance', 'verus_signing_rpc'
  ))
);

COMMENT ON TABLE rmr_security.access_review_event IS
  'Append-only, payload-free access decisions. Subject IDs, precise location, civic activity, evidence, wallet payloads, and moderation content are structurally absent.';

CREATE OR REPLACE FUNCTION rmr_security.reject_access_review_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'security access review events are append-only';
END
$$;

CREATE TRIGGER access_review_event_append_only
BEFORE UPDATE OR DELETE OR TRUNCATE ON rmr_security.access_review_event
FOR EACH STATEMENT EXECUTE FUNCTION rmr_security.reject_access_review_mutation();

CREATE OR REPLACE FUNCTION rmr_security.record_access_decision(
  target_access_event_id text,
  target_service_principal text,
  target_source_domain text,
  target_target_domain text,
  target_operation text,
  target_decision text,
  target_reason_code text,
  target_correlation_id text
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_security
AS $$
  INSERT INTO rmr_security.access_review_event (
    access_event_id, service_principal, source_domain, target_domain, operation,
    decision, reason_code, correlation_id
  ) VALUES (
    target_access_event_id, target_service_principal, target_source_domain,
    target_target_domain, target_operation, target_decision, target_reason_code,
    target_correlation_id
  );
$$;

CREATE VIEW rmr_security.domain_access_matrix AS
SELECT * FROM (VALUES
  ('rmr_api_public_service', 'public_registry', 'read/public_serialize'),
  ('rmr_account_service', 'account_authentication', 'read/write'),
  ('rmr_location_service', 'location_resolver', 'transient_process'),
  ('rmr_identity_service', 'identity_attestation', 'read/write'),
  ('rmr_participation_service', 'private_civic_activity', 'read/write'),
  ('rmr_moderation_service', 'moderation', 'read/write'),
  ('rmr_publication_service', 'public_methodology_provenance', 'read/write'),
  ('rmr_signer_service', 'verus_signing_rpc', 'read/write'),
  ('rmr_security_auditor', '*', 'audit_review'),
  ('rmr_backup_operator', '*', 'backup/restore')
) AS matrix(service_principal, security_domain, allowed_operations);

CREATE OR REPLACE FUNCTION rmr_outbox.claim_events_for_types(
  worker_ref text,
  target_event_types text[],
  batch_size integer,
  lease_duration interval
)
RETURNS SETOF rmr_outbox.event
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  WITH exhausted AS (
    UPDATE rmr_outbox.event
    SET state = 'dead_letter',
        lease_owner = NULL,
        lease_until = NULL,
        last_failure_code = 'lease.expired',
        last_failure_summary = 'maximum_attempts_exhausted',
        updated_at = clock_timestamp()
    WHERE state = 'leased'
      AND lease_until <= clock_timestamp()
      AND attempt_count >= max_attempts
      AND event_type = ANY(target_event_types)
    RETURNING event_id
  ), candidates AS (
    SELECT queued.event_id
    FROM rmr_outbox.event AS queued
    WHERE queued.event_type = ANY(target_event_types)
      AND (
        (queued.state = 'pending' AND queued.available_at <= clock_timestamp())
        OR (queued.state = 'leased' AND queued.lease_until <= clock_timestamp())
      )
      AND queued.attempt_count < queued.max_attempts
      AND worker_ref ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
      AND batch_size BETWEEN 1 AND 100
      AND lease_duration BETWEEN interval '1 second' AND interval '15 minutes'
      AND NOT EXISTS (SELECT 1 FROM exhausted WHERE exhausted.event_id = queued.event_id)
    ORDER BY queued.available_at, queued.created_at
    LIMIT batch_size
    FOR UPDATE OF queued SKIP LOCKED
  )
  UPDATE rmr_outbox.event AS queued
  SET state = 'leased',
      lease_owner = worker_ref,
      lease_until = clock_timestamp() + lease_duration,
      attempt_count = attempt_count + 1,
      updated_at = clock_timestamp()
  FROM candidates
  WHERE queued.event_id = candidates.event_id
  RETURNING queued.*;
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.claim_core_events(
  worker_ref text,
  batch_size integer DEFAULT 25,
  lease_duration interval DEFAULT interval '1 minute'
)
RETURNS SETOF rmr_outbox.event
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  SELECT * FROM rmr_outbox.claim_events_for_types(
    worker_ref,
    ARRAY['notification.dispatch', 'search.index', 'aggregate.recompute'],
    batch_size,
    lease_duration
  );
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.claim_source_events(
  worker_ref text,
  batch_size integer DEFAULT 25,
  lease_duration interval DEFAULT interval '1 minute'
)
RETURNS SETOF rmr_outbox.event
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  SELECT * FROM rmr_outbox.claim_events_for_types(
    worker_ref, ARRAY['source.retrieve'], batch_size, lease_duration
  );
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.claim_provenance_events(
  worker_ref text,
  batch_size integer DEFAULT 25,
  lease_duration interval DEFAULT interval '1 minute'
)
RETURNS SETOF rmr_outbox.event
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  SELECT * FROM rmr_outbox.claim_events_for_types(
    worker_ref,
    ARRAY['public_manifest.materialize', 'provenance.anchor.requested'],
    batch_size,
    lease_duration
  );
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.complete_event_for_types(
  target_event_id text,
  worker_ref text,
  target_handler_name text,
  target_event_types text[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM rmr_outbox.event
    WHERE event_id = target_event_id AND event_type = ANY(target_event_types)
  ) THEN
    RETURN false;
  END IF;
  RETURN rmr_outbox.complete_event(target_event_id, worker_ref, target_handler_name);
END
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.fail_event_for_types(
  target_event_id text,
  worker_ref text,
  failure_code text,
  failure_summary text,
  target_event_types text[]
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM rmr_outbox.event
    WHERE event_id = target_event_id AND event_type = ANY(target_event_types)
  ) THEN
    RETURN NULL;
  END IF;
  RETURN rmr_outbox.fail_event(target_event_id, worker_ref, failure_code, failure_summary);
END
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.complete_core_event(text, text, text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  SELECT rmr_outbox.complete_event_for_types(
    $1, $2, $3, ARRAY['notification.dispatch', 'search.index', 'aggregate.recompute']
  );
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.fail_core_event(text, text, text, text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  SELECT rmr_outbox.fail_event_for_types(
    $1, $2, $3, $4, ARRAY['notification.dispatch', 'search.index', 'aggregate.recompute']
  );
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.complete_source_event(text, text, text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  SELECT rmr_outbox.complete_event_for_types($1, $2, $3, ARRAY['source.retrieve']);
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.fail_source_event(text, text, text, text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  SELECT rmr_outbox.fail_event_for_types($1, $2, $3, $4, ARRAY['source.retrieve']);
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.complete_provenance_event(text, text, text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  SELECT rmr_outbox.complete_event_for_types(
    $1, $2, $3, ARRAY['public_manifest.materialize', 'provenance.anchor.requested']
  );
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.fail_provenance_event(text, text, text, text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
  SELECT rmr_outbox.fail_event_for_types(
    $1, $2, $3, $4, ARRAY['public_manifest.materialize', 'provenance.anchor.requested']
  );
$$;

REVOKE ALL ON ALL TABLES IN SCHEMA rmr_security FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA rmr_security FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.claim_events_for_types(text, text[], integer, interval) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.claim_core_events(text, integer, interval) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.claim_source_events(text, integer, interval) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.claim_provenance_events(text, integer, interval) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.complete_event_for_types(text, text, text, text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.fail_event_for_types(text, text, text, text, text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.complete_core_event(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.fail_core_event(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.complete_source_event(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.fail_source_event(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.complete_provenance_event(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr_outbox.fail_provenance_event(text, text, text, text) FROM PUBLIC;

GRANT rmr_registry_reader, rmr_source_public_reader, rmr_public_profile_reader,
  rmr_public_provenance_reader TO rmr_api_public_service;
GRANT rmr_registry_reader TO rmr_core_worker_service, rmr_location_service, rmr_source_service;
GRANT rmr_source_worker, rmr_app_audit_writer TO rmr_source_service;
GRANT rmr_source_reviewer, rmr_moderation_audit_reader, rmr_app_audit_writer
  TO rmr_moderation_service;
GRANT rmr_security_audit_reader TO rmr_security_auditor;

GRANT USAGE ON SCHEMA rmr_account TO rmr_account_service;
GRANT USAGE ON SCHEMA rmr_location TO rmr_location_service;
GRANT USAGE ON SCHEMA rmr_identity TO rmr_identity_service;
GRANT USAGE ON SCHEMA rmr_participation TO rmr_participation_service;
GRANT USAGE ON SCHEMA rmr_moderation TO rmr_moderation_service;
GRANT USAGE ON SCHEMA rmr_provenance TO rmr_publication_service, rmr_provenance_service;
GRANT USAGE ON SCHEMA rmr_signer TO rmr_signer_service;
GRANT USAGE ON SCHEMA rmr_security TO
  rmr_api_public_service, rmr_core_worker_service, rmr_account_service,
  rmr_location_service, rmr_identity_service, rmr_participation_service,
  rmr_moderation_service, rmr_publication_service, rmr_source_service,
  rmr_provenance_service, rmr_signer_service, rmr_security_auditor,
  rmr_backup_operator;
GRANT SELECT ON rmr_security.access_review_event, rmr_security.domain_access_matrix
  TO rmr_security_auditor;

GRANT USAGE ON SCHEMA rmr_outbox TO
  rmr_core_worker_service,
  rmr_source_service,
  rmr_provenance_service;
GRANT EXECUTE ON FUNCTION rmr_outbox.claim_core_events(text, integer, interval)
  TO rmr_core_worker_service;
GRANT EXECUTE ON FUNCTION rmr_outbox.claim_source_events(text, integer, interval)
  TO rmr_source_service;
GRANT EXECUTE ON FUNCTION rmr_outbox.claim_provenance_events(text, integer, interval)
  TO rmr_provenance_service;
GRANT EXECUTE ON FUNCTION rmr_outbox.complete_core_event(text, text, text),
  rmr_outbox.fail_core_event(text, text, text, text)
  TO rmr_core_worker_service;
GRANT EXECUTE ON FUNCTION rmr_outbox.complete_source_event(text, text, text),
  rmr_outbox.fail_source_event(text, text, text, text)
  TO rmr_source_service;
GRANT EXECUTE ON FUNCTION rmr_outbox.complete_provenance_event(text, text, text),
  rmr_outbox.fail_provenance_event(text, text, text, text)
  TO rmr_provenance_service;

GRANT EXECUTE ON FUNCTION rmr_security.record_access_decision(text, text, text, text, text, text, text, text)
  TO rmr_api_public_service, rmr_core_worker_service, rmr_account_service,
  rmr_location_service, rmr_identity_service, rmr_participation_service,
  rmr_moderation_service, rmr_publication_service, rmr_source_service,
  rmr_provenance_service, rmr_signer_service, rmr_backup_operator;

COMMENT ON DATABASE rmr IS
  'Canonical PostgreSQL registry with deny-by-default security-domain roles. Issue #22 adds isolation only: no scoring, source expansion, Verus identity, identity update, provenance write, or mainnet operation.';
