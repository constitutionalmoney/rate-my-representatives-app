\set ON_ERROR_STOP on

BEGIN;

DO $$
BEGIN
  IF (SELECT count(*) FROM rmr_source.source WHERE data_mode = 'synthetic') <> 2 THEN
    RAISE EXCEPTION 'Synthetic CA/US source pilots are missing.';
  END IF;
  IF (SELECT count(*) FROM rmr_source.retrieval) < 2
    OR (SELECT count(*) FROM rmr_source.candidate_record) < 2 THEN
    RAISE EXCEPTION 'Synthetic retrieval or candidate history is missing.';
  END IF;
  IF EXISTS (SELECT 1 FROM rmr_source.reviewed_record_version) THEN
    RAISE EXCEPTION 'Synthetic ingestion seed automatically published material records.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM rmr_source.candidate_record
    WHERE match_outcome = 'ambiguous' AND initial_review_state = 'pending_review'
  ) THEN
    RAISE EXCEPTION 'Name-only ambiguity was not preserved for review.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM rmr_source.coverage_snapshot_read
    WHERE source_availability = 'missing'
      AND missing_data_meaning = 'coverage_gap_not_misconduct'
      AND provenance_state = 'not_anchored'
  ) THEN
    RAISE EXCEPTION 'Explicit coverage-gap semantics are missing.';
  END IF;

  BEGIN
    INSERT INTO rmr_source.candidate_review_transition (
      transition_id, candidate_id, from_state, to_state, actor_type,
      actor_reference, reason_code, policy_version, decided_at
    ) VALUES (
      'smoke:invalid:auto-approval', 'candidate:ca:synthetic:avery',
      'pending_review', 'approved', 'source_process', 'worker:smoke',
      'INVALID_AUTO_APPROVAL', 'source-review.v1', '2026-08-07T15:00:00Z'
    );
    RAISE EXCEPTION 'Source process unexpectedly approved a candidate.';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO rmr_source.candidate_record (
      candidate_id, run_id, retrieval_id, source_id, source_record_id, country_code,
      jurisdiction_id, record_type, source_effective_at, subject_kind,
      subject_reference, public_payload, normalized_sha256, match_outcome,
      initial_review_state, material, source_availability, created_at
    ) VALUES (
      'candidate:smoke:unsafe', 'run:ca:synthetic:001', 'retrieval:ca:synthetic:001',
      'source:ca:synthetic-pilot', 'smoke-unsafe', 'CA', 'jurisdiction:ca:maple',
      'person', '2026-08-01T00:00:00Z', 'unresolved', 'smoke:unsafe',
      '{"privateKey":"blocked"}'::jsonb, repeat('6', 64), 'unmatched',
      'pending_review', true, 'available', '2026-08-07T15:00:00Z'
    );
    RAISE EXCEPTION 'Restricted source payload unexpectedly passed validation.';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END
$$;

INSERT INTO rmr_source.candidate_review_transition (
  transition_id, candidate_id, from_state, to_state, actor_type,
  actor_reference, reason_code, policy_version, decided_at
) VALUES (
  'decision:smoke:source:v1', 'candidate:ca:synthetic:avery', 'pending_review',
  'approved', 'reviewer', 'reviewer:smoke', 'SOURCE_RECORD_CONFIRMED',
  'source-review.v1', '2026-08-07T15:00:00Z'
);

INSERT INTO rmr_source.reviewed_record (
  record_id, record_type, subject_kind, subject_reference, created_at
) VALUES (
  'source-record:smoke:avery', 'person', 'person', 'person:ca:avery-quill',
  '2026-08-07T15:00:00Z'
);

INSERT INTO rmr_source.reviewed_record_version (
  version_id, record_id, candidate_id, review_transition_id, public_payload,
  source_id, retrieval_id, source_effective_at, approved_at,
  supersedes_version_id, correction_state
) SELECT
  'source-record-version:smoke:v1', 'source-record:smoke:avery', candidate_id,
  'decision:smoke:source:v1', public_payload, source_id, retrieval_id,
  source_effective_at, '2026-08-07T15:00:00Z', NULL, 'active'
FROM rmr_source.candidate_record
WHERE candidate_id = 'candidate:ca:synthetic:avery';

INSERT INTO rmr_source.candidate_record (
  candidate_id, run_id, retrieval_id, source_id, source_record_id, country_code,
  jurisdiction_id, record_type, source_effective_at, subject_kind,
  subject_reference, public_payload, normalized_sha256, match_outcome,
  initial_review_state, material, source_availability, created_at
) VALUES (
  'candidate:smoke:avery:correction', 'run:ca:synthetic:001',
  'retrieval:ca:synthetic:001', 'source:ca:synthetic-pilot', 'ca-person-001-correction',
  'CA', 'jurisdiction:ca:maple', 'correction', '2026-08-02T00:00:00Z', 'person',
  'person:ca:avery-quill',
  '{"displayName":"Avery Quill","recordStatus":"corrected","synthetic":true}'::jsonb,
  repeat('7', 64), 'candidate_match', 'pending_review', true, 'available',
  '2026-08-07T16:00:00Z'
);

INSERT INTO rmr_source.candidate_review_transition (
  transition_id, candidate_id, from_state, to_state, actor_type,
  actor_reference, reason_code, policy_version, decided_at
) VALUES
  (
    'review-transition:smoke:correction:pending', 'candidate:smoke:avery:correction',
    NULL, 'pending_review', 'source_process', 'worker:smoke',
    'SOURCE_CORRECTION_STAGED', 'source-review.v1', '2026-08-07T16:00:00Z'
  ),
  (
    'decision:smoke:source:v2', 'candidate:smoke:avery:correction',
    'pending_review', 'approved', 'reviewer', 'reviewer:smoke',
    'SOURCE_CORRECTION_CONFIRMED', 'source-review.v1', '2026-08-07T17:00:00Z'
  );

INSERT INTO rmr_source.reviewed_record_version (
  version_id, record_id, candidate_id, review_transition_id, public_payload,
  source_id, retrieval_id, source_effective_at, approved_at,
  supersedes_version_id, correction_state
) SELECT
  'source-record-version:smoke:v2', 'source-record:smoke:avery', candidate_id,
  'decision:smoke:source:v2', public_payload, source_id, retrieval_id,
  source_effective_at, '2026-08-07T17:00:00Z',
  'source-record-version:smoke:v1', 'active'
FROM rmr_source.candidate_record
WHERE candidate_id = 'candidate:smoke:avery:correction';

INSERT INTO rmr_audit.event (
  event_id, event_schema, aggregate_type, aggregate_id, actor_type, actor_ref,
  action, prior_state_ref, new_state_ref, policy_version, method_version,
  consent_version, request_id, idempotency_key, correlation_id, occurred_at,
  reason_code, reason_ref, privacy_class, redaction_version, code_revision,
  environment, safe_detail
) VALUES (
  'audit:smoke:source:v2', 'audit-event.v1', 'source_record',
  'source-record:smoke:avery', 'reviewer', 'reviewer:smoke',
  'source.candidate.approved', 'source-record-version:smoke:v1',
  'source-record-version:smoke:v2', 'source-review.v1', 'source-review.v1',
  NULL, 'request:smoke:source:v2', 'approval:smoke:source:v2',
  'correlation:smoke:source:v2', '2026-08-07T17:00:00Z',
  'source_correction_confirmed', 'decision:smoke:source:v2', 'internal',
  'audit-redaction.v1', 'issue-55-smoke', 'test',
  '{"countryCode":"CA","recordType":"correction","synthetic":true}'::jsonb
);

INSERT INTO rmr_outbox.event (
  event_id, event_type, event_schema, aggregate_type, aggregate_id,
  idempotency_key, correlation_id, privacy_class, payload, available_at, max_attempts
) VALUES (
  'outbox:smoke:source:v2', 'search.index', 'source-record-reviewed.v1',
  'source_record', 'source-record:smoke:avery', 'approval:smoke:source:v2',
  'correlation:smoke:source:v2', 'internal',
  '{"recordId":"source-record:smoke:avery","versionId":"source-record-version:smoke:v2"}'::jsonb,
  '2026-08-07T17:00:00Z', 5
);

DO $$
BEGIN
  IF (SELECT count(*) FROM rmr_source.reviewed_record_version WHERE record_id = 'source-record:smoke:avery') <> 2 THEN
    RAISE EXCEPTION 'Correction did not preserve reviewed-record history.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM rmr_audit.event audit
    JOIN rmr_outbox.event queued USING (correlation_id)
    WHERE audit.aggregate_id = 'source-record:smoke:avery'
      AND queued.aggregate_id = audit.aggregate_id
  ) THEN
    RAISE EXCEPTION 'Human approval was not paired with audit and outbox records.';
  END IF;

  BEGIN
    UPDATE rmr_source.reviewed_record_version
    SET correction_state = 'superseded'
    WHERE version_id = 'source-record-version:smoke:v1';
    RAISE EXCEPTION 'Reviewed history update unexpectedly succeeded.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'official-source ingestion history is append-only' THEN
      RAISE;
    END IF;
  END;
END
$$;

ROLLBACK;
