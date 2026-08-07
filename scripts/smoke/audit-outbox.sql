\set ON_ERROR_STOP on

BEGIN;

DO $$
DECLARE
  suffix text := txid_current()::text;
  aggregate_ref text := 'synthetic-aggregate-' || suffix;
  audit_ref text := 'synthetic-audit-' || suffix;
  outbox_ref text := 'synthetic-outbox-' || suffix;
  command_ref text := 'synthetic-command-' || suffix;
  correlation_ref text := 'synthetic-correlation-' || suffix;
  unsafe_aggregate_ref text := 'synthetic-unsafe-aggregate-' || suffix;
  result boolean;
  claimed_count integer;
  current_state text;
  retry_delay interval;
  metric_replays bigint;
BEGIN
  result := rmr.record_synthetic_command(
    aggregate_ref,
    'synthetic-state-v1',
    audit_ref,
    outbox_ref,
    command_ref,
    correlation_ref
  );
  IF NOT result THEN
    RAISE EXCEPTION 'Atomic synthetic command did not insert.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM rmr.synthetic_command_state AS state
    JOIN rmr_audit.event AS audit ON audit.aggregate_id = state.aggregate_id
    JOIN rmr_outbox.event AS queued ON queued.aggregate_id = state.aggregate_id
    WHERE state.aggregate_id = aggregate_ref
      AND audit.correlation_id = correlation_ref
      AND queued.correlation_id = correlation_ref
  ) THEN
    RAISE EXCEPTION 'State, audit, and outbox were not committed together.';
  END IF;

  result := rmr.record_synthetic_command(
    aggregate_ref,
    'synthetic-state-v2',
    audit_ref || '-duplicate',
    outbox_ref || '-duplicate',
    command_ref,
    correlation_ref
  );
  IF result OR (SELECT count(*) FROM rmr_audit.event WHERE aggregate_id = aggregate_ref) <> 1
    OR (SELECT count(*) FROM rmr_outbox.event WHERE aggregate_id = aggregate_ref) <> 1 THEN
    RAISE EXCEPTION 'Duplicate command was not harmless.';
  END IF;

  BEGIN
    PERFORM rmr.record_synthetic_command(
      unsafe_aggregate_ref,
      'synthetic-state-v1',
      audit_ref || '-unsafe',
      outbox_ref || '-unsafe',
      command_ref || '-unsafe',
      correlation_ref || '-unsafe',
      '{"nested":{"private_key":"blocked"}}'::jsonb
    );
    RAISE EXCEPTION 'Sensitive payload unexpectedly passed validation.';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM rmr.synthetic_command_state WHERE aggregate_id = unsafe_aggregate_ref)
    OR EXISTS (SELECT 1 FROM rmr_audit.event WHERE aggregate_id = unsafe_aggregate_ref)
    OR EXISTS (SELECT 1 FROM rmr_outbox.event WHERE aggregate_id = unsafe_aggregate_ref) THEN
    RAISE EXCEPTION 'Sensitive payload failure did not roll the transaction back.';
  END IF;

  BEGIN
    UPDATE rmr_audit.event SET reason_code = 'changed' WHERE event_id = audit_ref;
    RAISE EXCEPTION 'Audit update unexpectedly succeeded.';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM <> 'rmr_audit.event is append-only' THEN
        RAISE;
      END IF;
  END;
  BEGIN
    DELETE FROM rmr_audit.event WHERE event_id = audit_ref;
    RAISE EXCEPTION 'Audit delete unexpectedly succeeded.';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM <> 'rmr_audit.event is append-only' THEN
        RAISE;
      END IF;
  END;

  IF has_table_privilege('rmr_app_audit_writer', 'rmr_audit.event', 'UPDATE')
    OR has_table_privilege('rmr_app_audit_writer', 'rmr_audit.event', 'DELETE')
    OR has_table_privilege('rmr_app_audit_writer', 'rmr_audit.event', 'TRUNCATE') THEN
    RAISE EXCEPTION 'Ordinary audit writer can mutate append-only rows.';
  END IF;
  IF NOT has_column_privilege(
    'rmr_app_audit_writer', 'rmr_audit.event', 'event_id', 'INSERT'
  ) OR NOT has_column_privilege(
    'rmr_app_audit_writer', 'rmr_outbox.event', 'event_id', 'INSERT'
  ) THEN
    RAISE EXCEPTION 'Application writer cannot append the audit/outbox pair.';
  END IF;
  IF NOT has_table_privilege(
    'rmr_public_provenance_reader',
    'rmr_audit.public_provenance_history',
    'SELECT'
  ) THEN
    RAISE EXCEPTION 'Public provenance role cannot read its allowlisted projection.';
  END IF;

  INSERT INTO rmr_audit.event (
    event_id, event_schema, aggregate_type, aggregate_id, actor_type, actor_ref,
    action, prior_state_ref, new_state_ref, policy_version, method_version,
    request_id, idempotency_key, correlation_id, occurred_at, reason_code,
    privacy_class, redaction_version, code_revision, environment, safe_detail
  ) VALUES
  (
    audit_ref || '-participant-own', 'audit.synthetic.v1', 'synthetic_fixture', aggregate_ref,
    'human', 'synthetic-human-a', 'representative_signal.recorded', NULL, 'synthetic-state-v1',
    'synthetic-policy-v1', 'synthetic-method-v1', command_ref || '-participant-own',
    command_ref || '-participant-own', correlation_ref, clock_timestamp(), 'synthetic_test',
    'restricted', 'redaction-v1', 'synthetic-revision', 'test', '{"fixture":true}'::jsonb
  ),
  (
    audit_ref || '-participant-abuse', 'audit.synthetic.v1', 'synthetic_fixture', aggregate_ref,
    'human', 'synthetic-human-a', 'abuse.case_flagged', NULL, 'synthetic-state-v1',
    'synthetic-policy-v1', 'synthetic-method-v1', command_ref || '-participant-abuse',
    command_ref || '-participant-abuse', correlation_ref, clock_timestamp(), 'synthetic_test',
    'restricted', 'redaction-v1', 'synthetic-revision', 'test', '{"fixture":true}'::jsonb
  ),
  (
    audit_ref || '-participant-other', 'audit.synthetic.v1', 'synthetic_fixture', aggregate_ref,
    'human', 'synthetic-human-b', 'synthetic_fixture.viewed', NULL, 'synthetic-state-v1',
    'synthetic-policy-v1', 'synthetic-method-v1', command_ref || '-participant-other',
    command_ref || '-participant-other', correlation_ref, clock_timestamp(), 'synthetic_test',
    'internal', 'redaction-v1', 'synthetic-revision', 'test', '{"fixture":true}'::jsonb
  ),
  (
    audit_ref || '-public-manifest', 'audit.synthetic.v1', 'synthetic_fixture', aggregate_ref,
    'service', 'synthetic-publication-service', 'public_manifest.published', NULL,
    'synthetic-manifest-v1', 'synthetic-policy-v1', 'synthetic-method-v1',
    command_ref || '-public-manifest', command_ref || '-public-manifest', correlation_ref,
    clock_timestamp(), 'synthetic_test', 'public', 'redaction-v1', 'synthetic-revision', 'test',
    '{"fixture":true}'::jsonb
  ),
  (
    audit_ref || '-private-manifest', 'audit.synthetic.v1', 'synthetic_fixture', aggregate_ref,
    'service', 'synthetic-publication-service', 'public_manifest.published', NULL,
    'synthetic-manifest-draft', 'synthetic-policy-v1', 'synthetic-method-v1',
    command_ref || '-private-manifest', command_ref || '-private-manifest', correlation_ref,
    clock_timestamp(), 'synthetic_test', 'internal', 'redaction-v1', 'synthetic-revision', 'test',
    '{"fixture":true}'::jsonb
  );

  PERFORM set_config('rmr.actor_ref', 'synthetic-human-a', true);
  IF (SELECT count(*) FROM rmr_audit.participant_action_history) <> 1
    OR NOT EXISTS (
      SELECT 1 FROM rmr_audit.participant_action_history
      WHERE action = 'representative_signal.recorded'
    ) THEN
    RAISE EXCEPTION 'Participant action history leaked or omitted records.';
  END IF;
  IF (SELECT count(*) FROM rmr_audit.public_provenance_history WHERE aggregate_id = aggregate_ref) <> 1 THEN
    RAISE EXCEPTION 'Public provenance projection leaked non-public history.';
  END IF;

  BEGIN
    INSERT INTO rmr_audit.event (
      event_id, event_schema, aggregate_type, aggregate_id, actor_type, actor_ref,
      action, policy_version, method_version, request_id, idempotency_key,
      correlation_id, occurred_at, reason_code, privacy_class, redaction_version,
      code_revision, environment, safe_detail
    ) VALUES (
      audit_ref || '-unsafe-public-signal', 'audit.synthetic.v1', 'synthetic_fixture',
      aggregate_ref, 'human', 'synthetic-human-a', 'representative_signal.recorded',
      'synthetic-policy-v1', 'synthetic-method-v1', command_ref || '-unsafe-public-signal',
      command_ref || '-unsafe-public-signal', correlation_ref, clock_timestamp(),
      'synthetic_test', 'public', 'redaction-v1', 'synthetic-revision', 'test',
      '{"fixture":true}'::jsonb
    );
    RAISE EXCEPTION 'Individual representative signal was classified public.';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  INSERT INTO rmr_audit.record_policy (
    aggregate_type, aggregate_id, retention_until, legal_hold, reason_ref, applied_by_actor_ref
  ) VALUES (
    'synthetic_fixture', aggregate_ref, clock_timestamp() + interval '30 days', true,
    'synthetic-retention-policy', 'synthetic-security-reviewer'
  );
  IF NOT (SELECT legal_hold FROM rmr_audit.record_policy WHERE aggregate_id = aggregate_ref) THEN
    RAISE EXCEPTION 'Record-specific legal hold was not retained.';
  END IF;

  SELECT count(*) INTO claimed_count
  FROM rmr_outbox.claim_events('synthetic-worker-a', 1, interval '1 minute');
  IF claimed_count <> 1 THEN
    RAISE EXCEPTION 'First worker did not claim exactly one event.';
  END IF;
  SELECT count(*) INTO claimed_count
  FROM rmr_outbox.claim_events('synthetic-worker-b', 1, interval '1 minute');
  IF claimed_count <> 0 THEN
    RAISE EXCEPTION 'Concurrent worker double-claimed a live lease.';
  END IF;

  UPDATE rmr_outbox.event
  SET lease_until = clock_timestamp() - interval '1 second'
  WHERE event_id = outbox_ref;
  SELECT count(*) INTO claimed_count
  FROM rmr_outbox.claim_events('synthetic-worker-b', 1, interval '1 minute');
  IF claimed_count <> 1 THEN
    RAISE EXCEPTION 'Expired lease was not recoverable after a simulated crash.';
  END IF;

  current_state := rmr_outbox.fail_event(
    outbox_ref,
    'synthetic-worker-b',
    'synthetic.transient',
    'synthetic_retryable'
  );
  SELECT available_at - updated_at INTO retry_delay
  FROM rmr_outbox.event WHERE event_id = outbox_ref;
  IF current_state <> 'pending'
    OR retry_delay < interval '1.6 seconds'
    OR retry_delay > interval '2.4 seconds' THEN
    RAISE EXCEPTION 'Bounded exponential retry with jitter is invalid.';
  END IF;

  UPDATE rmr_outbox.event
  SET available_at = clock_timestamp() - interval '1 second'
  WHERE event_id = outbox_ref;
  SELECT count(*) INTO claimed_count
  FROM rmr_outbox.claim_events('synthetic-worker-c', 1, interval '1 minute');
  IF claimed_count <> 1 THEN
    RAISE EXCEPTION 'Retry event was not reclaimable.';
  END IF;
  current_state := rmr_outbox.fail_event(
    outbox_ref,
    'synthetic-worker-c',
    'synthetic.terminal',
    'synthetic_exhausted'
  );
  IF current_state <> 'dead_letter' THEN
    RAISE EXCEPTION 'Exhausted event did not enter the dead letter state.';
  END IF;

  IF NOT rmr_outbox.replay_dead_letter(outbox_ref, 'synthetic-approved-replay') THEN
    RAISE EXCEPTION 'Dead letter could not be replayed.';
  END IF;
  SELECT count(*) INTO claimed_count
  FROM rmr_outbox.claim_events('synthetic-worker-d', 1, interval '1 minute');
  IF claimed_count <> 1 OR NOT rmr_outbox.complete_event(
    outbox_ref,
    'synthetic-worker-d',
    'synthetic-handler'
  ) THEN
    RAISE EXCEPTION 'Replayed event could not be delivered.';
  END IF;
  IF rmr_outbox.complete_event(outbox_ref, 'synthetic-worker-d', 'synthetic-handler')
    OR (SELECT count(*) FROM rmr_outbox.delivery_receipt WHERE event_id = outbox_ref) <> 1 THEN
    RAISE EXCEPTION 'Duplicate delivery was not harmless.';
  END IF;

  INSERT INTO rmr_outbox.event (
    event_id, event_type, event_schema, aggregate_type, aggregate_id,
    idempotency_key, correlation_id, privacy_class, payload, max_attempts
  ) VALUES (
    outbox_ref || '-crashed-final-attempt', 'search.index', 'outbox.synthetic.v1',
    'synthetic_fixture', aggregate_ref, command_ref || ':crashed-final-attempt',
    correlation_ref, 'internal', '{"fixture":true}'::jsonb, 1
  );
  SELECT count(*) INTO claimed_count
  FROM rmr_outbox.claim_events('synthetic-worker-crash', 1, interval '1 minute');
  IF claimed_count <> 1 THEN
    RAISE EXCEPTION 'Final-attempt crash fixture could not be claimed.';
  END IF;
  UPDATE rmr_outbox.event
  SET lease_until = clock_timestamp() - interval '1 second'
  WHERE event_id = outbox_ref || '-crashed-final-attempt';
  SELECT count(*) INTO claimed_count
  FROM rmr_outbox.claim_events('synthetic-worker-after-crash', 1, interval '1 minute');
  IF claimed_count <> 0 OR NOT EXISTS (
    SELECT 1 FROM rmr_outbox.event
    WHERE event_id = outbox_ref || '-crashed-final-attempt' AND state = 'dead_letter'
  ) THEN
    RAISE EXCEPTION 'Expired final-attempt lease was not safely dead-lettered.';
  END IF;

  SELECT sum(replay_count) INTO metric_replays
  FROM rmr_outbox.health_metrics
  WHERE event_type = 'public_manifest.materialize' AND state = 'delivered';
  IF metric_replays < 1 THEN
    RAISE EXCEPTION 'Privacy-safe health metrics did not expose replay state.';
  END IF;
END
$$;

ROLLBACK;
