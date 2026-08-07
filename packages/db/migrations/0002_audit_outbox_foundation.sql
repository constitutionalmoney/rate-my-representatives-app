CREATE SCHEMA IF NOT EXISTS rmr_internal;
CREATE SCHEMA IF NOT EXISTS rmr_audit;
CREATE SCHEMA IF NOT EXISTS rmr_outbox;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_app_audit_writer') THEN
    CREATE ROLE rmr_app_audit_writer NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_participant_audit_reader') THEN
    CREATE ROLE rmr_participant_audit_reader NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_moderation_audit_reader') THEN
    CREATE ROLE rmr_moderation_audit_reader NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_security_audit_reader') THEN
    CREATE ROLE rmr_security_audit_reader NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_public_provenance_reader') THEN
    CREATE ROLE rmr_public_provenance_reader NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_outbox_worker') THEN
    CREATE ROLE rmr_outbox_worker NOLOGIN;
  END IF;
END
$$;

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
      normalized := lower(regexp_replace(item_key, '[^a-z]', '', 'g'));
      IF normalized = ANY (ARRAY[
        'accountid', 'address', 'credential', 'email', 'evidence', 'identityevidence',
        'location', 'moderatornotes', 'passphrase', 'passkey', 'preciseaddress',
        'preciselocation', 'privatekey', 'recoverytoken', 'seed', 'seedphrase', 'signal', 'token',
        'walletpayload', 'wif'
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

CREATE TABLE rmr_audit.event (
  event_id text PRIMARY KEY,
  event_schema text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  actor_type text NOT NULL CHECK (
    actor_type IN ('human', 'representative', 'staff', 'reviewer', 'admin', 'service', 'agent')
  ),
  actor_ref text NOT NULL,
  action text NOT NULL,
  prior_state_ref text,
  new_state_ref text,
  policy_version text NOT NULL,
  method_version text NOT NULL,
  consent_version text,
  request_id text NOT NULL,
  idempotency_key text NOT NULL,
  correlation_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  reason_code text NOT NULL,
  reason_ref text,
  privacy_class text NOT NULL CHECK (
    privacy_class IN ('public', 'internal', 'restricted', 'security')
  ),
  redaction_version text NOT NULL,
  code_revision text NOT NULL,
  environment text NOT NULL,
  safe_detail jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (
    jsonb_typeof(safe_detail) = 'object'
    AND NOT rmr_internal.jsonb_has_prohibited_audit_key(safe_detail)
  ),
  retention_class text NOT NULL DEFAULT 'operational',
  retention_until timestamptz,
  CONSTRAINT audit_event_stable_fields CHECK (
    event_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND event_schema ~ '^[a-z0-9][a-z0-9._-]{0,127}$'
    AND aggregate_type ~ '^[a-z][a-z0-9._-]{0,63}$'
    AND aggregate_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND actor_ref ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND action ~ '^[a-z][a-z0-9._-]{0,127}$'
    AND (prior_state_ref IS NULL OR prior_state_ref ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$')
    AND (new_state_ref IS NULL OR new_state_ref ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$')
    AND policy_version ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND method_version ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND (consent_version IS NULL OR consent_version ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$')
    AND request_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND idempotency_key ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'
    AND correlation_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND reason_code ~ '^[a-z][a-z0-9._-]{0,63}$'
    AND (reason_ref IS NULL OR reason_ref ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$')
    AND redaction_version ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND code_revision ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND environment ~ '^[a-z][a-z0-9_-]{0,31}$'
    AND retention_class ~ '^[a-z][a-z0-9._-]{0,63}$'
  ),
  CONSTRAINT audit_event_no_public_individual_signal CHECK (
    privacy_class <> 'public' OR action NOT LIKE 'representative_signal.%'
  ),
  CONSTRAINT audit_event_retention_after_occurrence CHECK (
    retention_until IS NULL OR retention_until >= occurred_at
  ),
  UNIQUE (action, idempotency_key)
);

COMMENT ON TABLE rmr_audit.event IS
  'Append-only, privacy-minimized audit history. Ordinary application roles cannot update, delete, or truncate rows.';
COMMENT ON COLUMN rmr_audit.event.safe_detail IS
  'Allowlisted operational metadata only; recursively rejects sensitive civic, identity, location, wallet, and credential keys.';

CREATE OR REPLACE FUNCTION rmr_internal.reject_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'rmr_audit.event is append-only';
END
$$;

CREATE TRIGGER audit_event_reject_update_delete
BEFORE UPDATE OR DELETE ON rmr_audit.event
FOR EACH ROW EXECUTE FUNCTION rmr_internal.reject_audit_mutation();

CREATE TRIGGER audit_event_reject_truncate
BEFORE TRUNCATE ON rmr_audit.event
FOR EACH STATEMENT EXECUTE FUNCTION rmr_internal.reject_audit_mutation();

CREATE TABLE rmr_audit.record_policy (
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  retention_until timestamptz,
  legal_hold boolean NOT NULL DEFAULT false,
  reason_ref text NOT NULL,
  applied_by_actor_ref text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (aggregate_type, aggregate_id),
  CONSTRAINT audit_record_policy_stable_fields CHECK (
    aggregate_type ~ '^[a-z][a-z0-9._-]{0,63}$'
    AND aggregate_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND reason_ref ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND applied_by_actor_ref ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
  )
);

COMMENT ON TABLE rmr_audit.record_policy IS
  'Record-specific retention and legal-hold control. This foundation does not implement audit deletion.';

CREATE TABLE rmr_outbox.event (
  event_id text PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN (
    'notification.dispatch',
    'search.index',
    'aggregate.recompute',
    'source.retrieve',
    'ai.draft.requested',
    'public_manifest.materialize',
    'provenance.anchor.requested'
  )),
  event_schema text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  correlation_id text NOT NULL,
  privacy_class text NOT NULL CHECK (
    privacy_class IN ('public', 'internal', 'restricted', 'security')
  ),
  payload jsonb NOT NULL CHECK (
    jsonb_typeof(payload) = 'object'
    AND NOT rmr_internal.jsonb_has_prohibited_audit_key(payload)
  ),
  state text NOT NULL DEFAULT 'pending' CHECK (
    state IN ('pending', 'leased', 'delivered', 'dead_letter')
  ),
  available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  lease_owner text,
  lease_until timestamptz,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts integer NOT NULL DEFAULT 8 CHECK (max_attempts BETWEEN 1 AND 32),
  last_failure_code text,
  last_failure_summary text,
  replay_count integer NOT NULL DEFAULT 0 CHECK (replay_count >= 0),
  last_replay_reason_ref text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  delivered_at timestamptz,
  CONSTRAINT outbox_event_safe_failure_metadata CHECK (
    (last_failure_code IS NULL OR last_failure_code ~ '^[a-z0-9._:-]{1,128}$')
    AND (last_failure_summary IS NULL OR last_failure_summary ~ '^[a-z0-9._:-]{1,128}$')
  ),
  CONSTRAINT outbox_event_stable_fields CHECK (
    event_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND event_schema ~ '^[a-z0-9][a-z0-9._-]{0,127}$'
    AND aggregate_type ~ '^[a-z][a-z0-9._-]{0,63}$'
    AND aggregate_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND idempotency_key ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'
    AND correlation_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND (lease_owner IS NULL OR lease_owner ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$')
    AND (
      last_replay_reason_ref IS NULL
      OR last_replay_reason_ref ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    )
  ),
  CONSTRAINT outbox_event_lease_consistency CHECK (
    (state = 'leased' AND lease_owner IS NOT NULL AND lease_until IS NOT NULL)
    OR (state <> 'leased' AND lease_owner IS NULL AND lease_until IS NULL)
  )
);

COMMENT ON TABLE rmr_outbox.event IS
  'Transactional at-least-once delivery queue. A provenance event is an inert request until issue #35 implements an approved worker.';

CREATE INDEX outbox_event_claim_idx
  ON rmr_outbox.event (available_at, created_at)
  WHERE state IN ('pending', 'leased');
CREATE INDEX outbox_event_aggregate_idx
  ON rmr_outbox.event (aggregate_type, aggregate_id, created_at);

CREATE TABLE rmr_outbox.delivery_receipt (
  handler_name text NOT NULL,
  idempotency_key text NOT NULL,
  event_id text NOT NULL REFERENCES rmr_outbox.event(event_id),
  delivered_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (handler_name, idempotency_key),
  CONSTRAINT delivery_receipt_stable_fields CHECK (
    handler_name ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
    AND idempotency_key ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$'
  )
);

CREATE OR REPLACE FUNCTION rmr_outbox.claim_events(
  worker_ref text,
  batch_size integer DEFAULT 25,
  lease_duration interval DEFAULT interval '1 minute'
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
    RETURNING event_id
  ), candidates AS (
    SELECT queued.event_id
    FROM rmr_outbox.event AS queued
    WHERE (
      (queued.state = 'pending' AND queued.available_at <= clock_timestamp())
      OR (queued.state = 'leased' AND queued.lease_until <= clock_timestamp())
    )
      AND queued.attempt_count < queued.max_attempts
      AND worker_ref ~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$'
      AND batch_size BETWEEN 1 AND 100
      AND lease_duration BETWEEN interval '1 second' AND interval '15 minutes'
      AND NOT EXISTS (
        SELECT 1 FROM exhausted WHERE exhausted.event_id = queued.event_id
      )
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

CREATE OR REPLACE FUNCTION rmr_outbox.complete_event(
  target_event_id text,
  worker_ref text,
  target_handler_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
DECLARE
  completed rmr_outbox.event;
BEGIN
  UPDATE rmr_outbox.event
  SET state = 'delivered',
      lease_owner = NULL,
      lease_until = NULL,
      delivered_at = clock_timestamp(),
      updated_at = clock_timestamp()
  WHERE event_id = target_event_id
    AND state = 'leased'
    AND lease_owner = worker_ref
  RETURNING * INTO completed;

  IF completed.event_id IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO rmr_outbox.delivery_receipt (handler_name, idempotency_key, event_id)
  VALUES (target_handler_name, completed.idempotency_key, completed.event_id)
  ON CONFLICT (handler_name, idempotency_key) DO NOTHING;
  RETURN true;
END
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.fail_event(
  target_event_id text,
  worker_ref text,
  failure_code text,
  failure_summary text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
DECLARE
  failed_attempt integer;
  allowed_attempts integer;
  next_state text;
  base_seconds numeric;
  jitter numeric;
BEGIN
  IF failure_code !~ '^[a-z0-9._:-]{1,128}$'
    OR failure_summary !~ '^[a-z0-9._:-]{1,128}$' THEN
    RAISE EXCEPTION 'failure metadata must be a safe code, not raw exception text';
  END IF;

  SELECT attempt_count, max_attempts
  INTO failed_attempt, allowed_attempts
  FROM rmr_outbox.event
  WHERE event_id = target_event_id
    AND state = 'leased'
    AND lease_owner = worker_ref
  FOR UPDATE;

  IF failed_attempt IS NULL THEN
    RETURN NULL;
  END IF;

  next_state := CASE WHEN failed_attempt >= allowed_attempts THEN 'dead_letter' ELSE 'pending' END;
  base_seconds := least(900, power(2, least(failed_attempt - 1, 20)));
  jitter := 0.8 + (
    (('x' || substr(md5(target_event_id || ':' || failed_attempt::text), 1, 8))::bit(32)::bigint % 4001)
    / 10000.0
  );

  UPDATE rmr_outbox.event
  SET state = next_state,
      available_at = CASE
        WHEN next_state = 'pending' THEN clock_timestamp() + make_interval(secs => (base_seconds * jitter)::double precision)
        ELSE available_at
      END,
      lease_owner = NULL,
      lease_until = NULL,
      last_failure_code = failure_code,
      last_failure_summary = failure_summary,
      updated_at = clock_timestamp()
  WHERE event_id = target_event_id;
  RETURN next_state;
END
$$;

CREATE OR REPLACE FUNCTION rmr_outbox.replay_dead_letter(
  target_event_id text,
  replay_reason_ref text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, rmr_outbox
AS $$
BEGIN
  UPDATE rmr_outbox.event
  SET state = 'pending',
      available_at = clock_timestamp(),
      attempt_count = 0,
      replay_count = replay_count + 1,
      last_replay_reason_ref = replay_reason_ref,
      lease_owner = NULL,
      lease_until = NULL,
      updated_at = clock_timestamp()
  WHERE event_id = target_event_id AND state = 'dead_letter';
  RETURN FOUND;
END
$$;

CREATE TABLE rmr.synthetic_command_state (
  aggregate_id text PRIMARY KEY,
  state_ref text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE OR REPLACE FUNCTION rmr.record_synthetic_command(
  target_aggregate_id text,
  target_state_ref text,
  audit_event_id text,
  outbox_event_id text,
  command_idempotency_key text,
  target_correlation_id text,
  target_safe_detail jsonb DEFAULT '{"fixture":true}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  inserted_rows integer;
BEGIN
  INSERT INTO rmr.synthetic_command_state (aggregate_id, state_ref)
  VALUES (target_aggregate_id, target_state_ref)
  ON CONFLICT (aggregate_id) DO NOTHING;
  GET DIAGNOSTICS inserted_rows = ROW_COUNT;

  IF inserted_rows = 0 THEN
    RETURN false;
  END IF;

  INSERT INTO rmr_audit.event (
    event_id, event_schema, aggregate_type, aggregate_id, actor_type, actor_ref,
    action, prior_state_ref, new_state_ref, policy_version, method_version,
    consent_version, request_id, idempotency_key, correlation_id, occurred_at,
    reason_code, reason_ref, privacy_class, redaction_version, code_revision,
    environment, safe_detail
  ) VALUES (
    audit_event_id, 'audit.synthetic.v1', 'synthetic_fixture', target_aggregate_id,
    'service', 'synthetic-command-service', 'synthetic_fixture.recorded', NULL,
    target_state_ref, 'synthetic-policy-v1', 'synthetic-method-v1', NULL,
    command_idempotency_key, command_idempotency_key, target_correlation_id,
    clock_timestamp(), 'synthetic_test', NULL, 'internal', 'redaction-v1',
    'synthetic-revision', 'test', target_safe_detail
  );

  INSERT INTO rmr_outbox.event (
    event_id, event_type, event_schema, aggregate_type, aggregate_id,
    idempotency_key, correlation_id, privacy_class, payload, max_attempts
  ) VALUES (
    outbox_event_id, 'public_manifest.materialize', 'outbox.synthetic.v1',
    'synthetic_fixture', target_aggregate_id, command_idempotency_key || ':manifest',
    target_correlation_id, 'internal', target_safe_detail, 3
  );
  RETURN true;
END
$$;

CREATE VIEW rmr_audit.participant_action_history
WITH (security_barrier = true)
AS
SELECT
  event_id, event_schema, aggregate_type, aggregate_id, action, prior_state_ref,
  new_state_ref, occurred_at, recorded_at, reason_code, policy_version, method_version
FROM rmr_audit.event
WHERE actor_type = 'human'
  AND actor_ref = current_setting('rmr.actor_ref', true)
  AND privacy_class IN ('internal', 'restricted')
  AND action NOT LIKE 'abuse.%'
  AND action NOT LIKE 'security.%';

CREATE VIEW rmr_audit.moderation_history
WITH (security_barrier = true)
AS
SELECT * FROM rmr_audit.event WHERE privacy_class <> 'security';

CREATE VIEW rmr_audit.public_provenance_history
WITH (security_barrier = true)
AS
SELECT
  event_id, event_schema, aggregate_type, aggregate_id, action, new_state_ref,
  policy_version, method_version, occurred_at, recorded_at, code_revision
FROM rmr_audit.event
WHERE privacy_class = 'public'
  AND action IN ('public_manifest.published', 'provenance.anchor.confirmed');

CREATE VIEW rmr_outbox.health_metrics
WITH (security_barrier = true)
AS
SELECT
  event_type,
  state,
  count(*)::bigint AS event_count,
  min(created_at) AS oldest_created_at,
  max(attempt_count) AS maximum_attempt_count,
  count(*) FILTER (
    WHERE state = 'leased' AND lease_until <= clock_timestamp()
  )::bigint AS expired_lease_count,
  count(*) FILTER (WHERE last_failure_code IS NOT NULL)::bigint AS failed_event_count,
  sum(replay_count)::bigint AS replay_count
FROM rmr_outbox.event
GROUP BY event_type, state;

REVOKE ALL ON SCHEMA rmr_audit, rmr_outbox FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA rmr_audit, rmr_outbox FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA rmr_outbox FROM PUBLIC;
REVOKE ALL ON FUNCTION rmr.record_synthetic_command(text, text, text, text, text, text, jsonb)
  FROM PUBLIC;

GRANT USAGE ON SCHEMA rmr_audit TO
  rmr_app_audit_writer,
  rmr_participant_audit_reader,
  rmr_moderation_audit_reader,
  rmr_security_audit_reader,
  rmr_public_provenance_reader;
GRANT INSERT (
  event_id, event_schema, aggregate_type, aggregate_id, actor_type, actor_ref,
  action, prior_state_ref, new_state_ref, policy_version, method_version,
  consent_version, request_id, idempotency_key, correlation_id, occurred_at,
  reason_code, reason_ref, privacy_class, redaction_version, code_revision,
  environment, safe_detail, retention_class, retention_until
) ON rmr_audit.event TO rmr_app_audit_writer;
GRANT SELECT ON rmr_audit.participant_action_history TO rmr_participant_audit_reader;
GRANT SELECT ON rmr_audit.moderation_history TO rmr_moderation_audit_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA rmr_audit TO rmr_security_audit_reader;
GRANT SELECT ON rmr_audit.public_provenance_history TO rmr_public_provenance_reader;

GRANT USAGE ON SCHEMA rmr_outbox TO
  rmr_app_audit_writer,
  rmr_outbox_worker,
  rmr_security_audit_reader;
GRANT INSERT (
  event_id, event_type, event_schema, aggregate_type, aggregate_id, idempotency_key,
  correlation_id, privacy_class, payload, available_at, max_attempts
) ON rmr_outbox.event TO rmr_app_audit_writer;
GRANT SELECT ON rmr_outbox.event, rmr_outbox.delivery_receipt, rmr_outbox.health_metrics
  TO rmr_outbox_worker, rmr_security_audit_reader;
GRANT EXECUTE ON FUNCTION rmr_outbox.claim_events(text, integer, interval) TO rmr_outbox_worker;
GRANT EXECUTE ON FUNCTION rmr_outbox.complete_event(text, text, text) TO rmr_outbox_worker;
GRANT EXECUTE ON FUNCTION rmr_outbox.fail_event(text, text, text, text) TO rmr_outbox_worker;
GRANT EXECUTE ON FUNCTION rmr_outbox.replay_dead_letter(text, text) TO rmr_security_audit_reader;
