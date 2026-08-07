BEGIN;

INSERT INTO rmr_source.source (
  source_id, publisher, authoritative_scope, data_mode, countries,
  jurisdiction_ids, record_types, created_at
) VALUES
  (
    'source:ca:synthetic-pilot',
    'Synthetic Canada Pilot Authority',
    'Synthetic Canada public-role pilot records only.',
    'synthetic',
    ARRAY['CA'],
    ARRAY['jurisdiction:ca:maple'],
    ARRAY['person', 'office_term', 'correction'],
    '2026-08-07T12:00:00Z'
  ),
  (
    'source:us:synthetic-pilot',
    'Synthetic United States Pilot Authority',
    'Synthetic United States public-role pilot records only.',
    'synthetic',
    ARRAY['US'],
    ARRAY['jurisdiction:us:example-state'],
    ARRAY['person', 'candidacy', 'election', 'correction'],
    '2026-08-07T12:00:00Z'
  )
ON CONFLICT (source_id) DO NOTHING;

INSERT INTO rmr_source.connector_version (
  connector_id, connector_version, source_id, capability_schema, capability,
  capability_sha256, approval_state, approval_reference, reviewed_at,
  parser_version, schema_version, license_name, terms_url, attribution_text,
  retention_days, redistribution, snapshot_storage, owner_team, incident_runbook
) VALUES
  (
    'connector:ca:synthetic-pilot', '1.0.0', 'source:ca:synthetic-pilot',
    'source-connector-capability.v1',
    '{"schemaVersion":"source-connector-capability.v1","dataMode":"synthetic","source":{"countries":["CA"]}}'::jsonb,
    repeat('a', 64), 'synthetic_approved', 'issue:55:synthetic-pilot-approval',
    '2026-08-07T12:00:00Z', 'synthetic-ca-parser.v1', 'pilot-feed.v1',
    'CC0-1.0 synthetic fixture', 'https://ca-pilot.synthetic.invalid/terms',
    'Synthetic Canada Pilot Authority; synthetic fixture for automated tests.',
    30, 'permitted_snapshots', 'quarantine_only', 'data-stewardship',
    'docs/runbooks/SOURCE_INGESTION.md'
  ),
  (
    'connector:us:synthetic-pilot', '1.0.0', 'source:us:synthetic-pilot',
    'source-connector-capability.v1',
    '{"schemaVersion":"source-connector-capability.v1","dataMode":"synthetic","source":{"countries":["US"]}}'::jsonb,
    repeat('b', 64), 'synthetic_approved', 'issue:55:synthetic-pilot-approval',
    '2026-08-07T12:00:00Z', 'synthetic-us-parser.v1', 'pilot-feed.v1',
    'CC0-1.0 synthetic fixture', 'https://us-pilot.synthetic.invalid/terms',
    'Synthetic United States Pilot Authority; synthetic fixture for automated tests.',
    30, 'permitted_snapshots', 'quarantine_only', 'data-stewardship',
    'docs/runbooks/SOURCE_INGESTION.md'
  )
ON CONFLICT (connector_id, connector_version) DO NOTHING;

INSERT INTO rmr_source.retrieval (
  retrieval_id, connector_id, connector_version, source_id, retrieved_url,
  retrieved_at, http_status, content_type, content_encoding, wire_bytes,
  decoded_bytes, content_sha256, etag, last_modified, parser_version,
  schema_version, license_name, terms_url, attribution_text, raw_snapshot_state,
  object_reference, availability, freshness_state
) VALUES
  (
    'retrieval:ca:synthetic:001', 'connector:ca:synthetic-pilot', '1.0.0',
    'source:ca:synthetic-pilot',
    'https://ca-pilot.synthetic.invalid/v1/public-role-records',
    '2026-08-07T14:00:00Z', 200, 'application/json', 'identity', 640, 640,
    repeat('c', 64), '"synthetic-ca-v1"', 'Thu, 06 Aug 2026 00:00:00 GMT',
    'synthetic-ca-parser.v1', 'pilot-feed.v1', 'CC0-1.0 synthetic fixture',
    'https://ca-pilot.synthetic.invalid/terms',
    'Synthetic Canada Pilot Authority; synthetic fixture for automated tests.',
    'not_stored', NULL, 'available', 'current'
  ),
  (
    'retrieval:us:synthetic:001', 'connector:us:synthetic-pilot', '1.0.0',
    'source:us:synthetic-pilot',
    'https://us-pilot.synthetic.invalid/v1/public-role-records',
    '2026-08-07T14:00:00Z', 200, 'application/json', 'identity', 990, 990,
    repeat('d', 64), '"synthetic-us-v1"', 'Thu, 06 Aug 2026 00:00:00 GMT',
    'synthetic-us-parser.v1', 'pilot-feed.v1', 'CC0-1.0 synthetic fixture',
    'https://us-pilot.synthetic.invalid/terms',
    'Synthetic United States Pilot Authority; synthetic fixture for automated tests.',
    'not_stored', NULL, 'available', 'current'
  )
ON CONFLICT (retrieval_id) DO NOTHING;

INSERT INTO rmr_source.ingestion_run (
  run_id, connector_id, connector_version, trigger_kind, started_at, completed_at,
  state, retrieval_id, idempotency_key, candidate_count, quarantine_count,
  safe_summary_code, code_revision
) VALUES
  (
    'run:ca:synthetic:001', 'connector:ca:synthetic-pilot', '1.0.0', 'scheduled',
    '2026-08-07T13:59:59Z', '2026-08-07T14:00:01Z', 'completed',
    'retrieval:ca:synthetic:001', repeat('e', 64), 1, 0,
    'SYNTHETIC_CANDIDATES_STAGED', 'issue-55-synthetic'
  ),
  (
    'run:us:synthetic:001', 'connector:us:synthetic-pilot', '1.0.0', 'manual',
    '2026-08-07T13:59:59Z', '2026-08-07T14:00:01Z', 'completed',
    'retrieval:us:synthetic:001', repeat('f', 64), 1, 0,
    'SYNTHETIC_CANDIDATES_STAGED', 'issue-55-synthetic'
  )
ON CONFLICT (run_id) DO NOTHING;

INSERT INTO rmr_source.checkpoint_history (
  checkpoint_history_id, connector_id, connector_version, run_id,
  checkpoint_version, cursor_value, etag, last_modified, recorded_at
) VALUES
  (
    'checkpoint:ca:synthetic:001', 'connector:ca:synthetic-pilot', '1.0.0',
    'run:ca:synthetic:001', 'checkpoint.v1', 'ca-page-2', '"synthetic-ca-v1"',
    'Thu, 06 Aug 2026 00:00:00 GMT', '2026-08-07T14:00:01Z'
  ),
  (
    'checkpoint:us:synthetic:001', 'connector:us:synthetic-pilot', '1.0.0',
    'run:us:synthetic:001', 'checkpoint.v1', 'us-page-2', '"synthetic-us-v1"',
    'Thu, 06 Aug 2026 00:00:00 GMT', '2026-08-07T14:00:01Z'
  )
ON CONFLICT (checkpoint_history_id) DO NOTHING;

INSERT INTO rmr_source.checkpoint_current (
  connector_id, connector_version, checkpoint_history_id, lock_version, updated_at
) VALUES
  (
    'connector:ca:synthetic-pilot', '1.0.0', 'checkpoint:ca:synthetic:001', 1,
    '2026-08-07T14:00:01Z'
  ),
  (
    'connector:us:synthetic-pilot', '1.0.0', 'checkpoint:us:synthetic:001', 1,
    '2026-08-07T14:00:01Z'
  )
ON CONFLICT (connector_id) DO NOTHING;

INSERT INTO rmr_source.candidate_record (
  candidate_id, run_id, retrieval_id, source_id, source_record_id, country_code,
  jurisdiction_id, record_type, source_effective_at, subject_kind,
  subject_reference, public_payload, normalized_sha256, match_outcome,
  initial_review_state, material, source_availability, created_at
) VALUES
  (
    'candidate:ca:synthetic:avery', 'run:ca:synthetic:001',
    'retrieval:ca:synthetic:001', 'source:ca:synthetic-pilot', 'ca-person-001',
    'CA', 'jurisdiction:ca:maple', 'person', '2026-08-01T00:00:00Z', 'person',
    'person:ca:avery-quill',
    '{"displayName":"Avery Quill","recordStatus":"current","synthetic":true}'::jsonb,
    repeat('1', 64), 'candidate_match', 'pending_review', true, 'available',
    '2026-08-07T14:00:01Z'
  ),
  (
    'candidate:us:synthetic:morgan-name', 'run:us:synthetic:001',
    'retrieval:us:synthetic:001', 'source:us:synthetic-pilot', 'us-person-name-only',
    'US', 'jurisdiction:us:example-state', 'person', '2026-08-01T00:00:00Z',
    'unresolved', 'publisher-record:name-only',
    '{"displayName":"Morgan Field","recordStatus":"candidate","synthetic":true}'::jsonb,
    repeat('2', 64), 'ambiguous', 'pending_review', true, 'available',
    '2026-08-07T14:00:01Z'
  )
ON CONFLICT (candidate_id) DO NOTHING;

INSERT INTO rmr_source.candidate_transformation (
  step_id, candidate_id, kind, process_version, input_sha256, output_sha256,
  assisted_by_ai, model_process_version, confidence, requires_human_review, created_at
) VALUES
  ('step:ca:parse:001', 'candidate:ca:synthetic:avery', 'parse', 'synthetic-ca-parser.v1', repeat('c', 64), repeat('3', 64), false, NULL, NULL, true, '2026-08-07T14:00:01Z'),
  ('step:ca:normalize:001', 'candidate:ca:synthetic:avery', 'normalize', 'source-normalizer.v1', repeat('3', 64), repeat('1', 64), false, NULL, NULL, true, '2026-08-07T14:00:01Z'),
  ('step:us:parse:001', 'candidate:us:synthetic:morgan-name', 'parse', 'synthetic-us-parser.v1', repeat('d', 64), repeat('4', 64), false, NULL, NULL, true, '2026-08-07T14:00:01Z'),
  ('step:us:normalize:001', 'candidate:us:synthetic:morgan-name', 'normalize', 'source-normalizer.v1', repeat('4', 64), repeat('2', 64), false, NULL, NULL, true, '2026-08-07T14:00:01Z')
ON CONFLICT (step_id) DO NOTHING;

INSERT INTO rmr_source.candidate_match_evidence (
  match_evidence_id, candidate_id, kind, evidence_value, created_at
) VALUES
  ('match:ca:avery:name', 'candidate:ca:synthetic:avery', 'name', 'Avery Quill', '2026-08-07T14:00:01Z'),
  ('match:ca:avery:id', 'candidate:ca:synthetic:avery', 'official_identifier', 'SYN-CA-PERSON-001', '2026-08-07T14:00:01Z'),
  ('match:us:morgan:name-only', 'candidate:us:synthetic:morgan-name', 'name', 'Morgan Field', '2026-08-07T14:00:01Z')
ON CONFLICT (match_evidence_id) DO NOTHING;

INSERT INTO rmr_source.candidate_review_transition (
  transition_id, candidate_id, from_state, to_state, actor_type, actor_reference,
  reason_code, policy_version, decided_at
) VALUES
  (
    'review-transition:ca:avery:pending', 'candidate:ca:synthetic:avery', NULL,
    'pending_review', 'source_process', 'worker:synthetic-pilot',
    'SOURCE_CANDIDATE_STAGED', 'source-review.v1', '2026-08-07T14:00:01Z'
  ),
  (
    'review-transition:us:morgan:pending', 'candidate:us:synthetic:morgan-name', NULL,
    'pending_review', 'source_process', 'worker:synthetic-pilot',
    'AMBIGUOUS_NAME_REVIEW', 'source-review.v1', '2026-08-07T14:00:01Z'
  )
ON CONFLICT (transition_id) DO NOTHING;

INSERT INTO rmr_source.coverage_snapshot (
  snapshot_id, schema_version, data_mode, generated_at, method_version,
  code_revision, missing_data_meaning, provenance_state, snapshot_sha256
) VALUES
  (
    'coverage:synthetic:issue55', 'source-coverage-snapshot.v1', 'synthetic',
    '2026-08-07T14:00:01Z', 'source-coverage.v1', 'issue-55-synthetic',
    'coverage_gap_not_misconduct', 'not_anchored', repeat('5', 64)
  )
ON CONFLICT (snapshot_id) DO NOTHING;

INSERT INTO rmr_source.coverage_item (
  snapshot_id, country_code, jurisdiction_id, record_type, source_availability,
  candidate_count, pending_review_count, conflict_count, last_retrieved_at
) VALUES
  ('coverage:synthetic:issue55', 'CA', 'jurisdiction:ca:maple', 'person', 'available', 1, 1, 0, '2026-08-07T14:00:00Z'),
  ('coverage:synthetic:issue55', 'US', 'jurisdiction:us:example-state', 'person', 'available', 1, 1, 0, '2026-08-07T14:00:00Z'),
  ('coverage:synthetic:issue55', 'US', 'jurisdiction:us:example-state', 'candidacy', 'missing', 0, 0, 0, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO rmr.synthetic_seed_marker (fixture_key, description)
VALUES (
  'synthetic.source-ingestion.v1',
  'Synthetic Canada and United States source pilots staged as review candidates; no automatic publication.'
)
ON CONFLICT (fixture_key) DO NOTHING;

COMMIT;
