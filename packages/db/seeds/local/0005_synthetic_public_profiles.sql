BEGIN;

INSERT INTO rmr_source.candidate_record (
  candidate_id, run_id, retrieval_id, source_id, source_record_id, country_code,
  jurisdiction_id, record_type, source_effective_at, subject_kind,
  subject_reference, public_payload, normalized_sha256, match_outcome,
  initial_review_state, material, source_availability, created_at
) VALUES (
  'candidate:us:synthetic:morgan-profile', 'run:us:synthetic:001',
  'retrieval:us:synthetic:001', 'source:us:synthetic-pilot', 'us-person-001',
  'US', 'jurisdiction:us:example-state', 'person', '2026-08-01T00:00:00Z',
  'person', 'person:us:morgan-fields',
  '{"displayName":"Morgan Fields","recordStatus":"candidate","synthetic":true}'::jsonb,
  repeat('6', 64), 'candidate_match', 'pending_review', true, 'available',
  '2026-08-07T15:04:00Z'
) ON CONFLICT (candidate_id) DO NOTHING;

INSERT INTO rmr_source.candidate_transformation (
  step_id, candidate_id, kind, process_version, input_sha256, output_sha256,
  assisted_by_ai, model_process_version, confidence, requires_human_review, created_at
) VALUES
  (
    'step:us:profile:parse', 'candidate:us:synthetic:morgan-profile', 'parse',
    'synthetic-us-parser.v1', repeat('d', 64), repeat('7', 64), false, NULL, NULL,
    true, '2026-08-07T15:04:00Z'
  ),
  (
    'step:us:profile:normalize', 'candidate:us:synthetic:morgan-profile', 'normalize',
    'source-normalizer.v1', repeat('7', 64), repeat('6', 64), false, NULL, NULL,
    true, '2026-08-07T15:04:00Z'
  )
ON CONFLICT (step_id) DO NOTHING;

INSERT INTO rmr_source.candidate_match_evidence (
  match_evidence_id, candidate_id, kind, evidence_value, created_at
) VALUES
  (
    'match:us:morgan:profile-id', 'candidate:us:synthetic:morgan-profile',
    'official_identifier', 'MORGAN-FIELDS-001', '2026-08-07T15:04:00Z'
  ),
  (
    'match:us:morgan:profile-district', 'candidate:us:synthetic:morgan-profile',
    'district_context', 'district:us:state-senate', '2026-08-07T15:04:00Z'
  )
ON CONFLICT (match_evidence_id) DO NOTHING;

INSERT INTO rmr_source.candidate_review_transition (
  transition_id, candidate_id, from_state, to_state, actor_type, actor_reference,
  reason_code, policy_version, decided_at
) VALUES
  (
    'review-transition:ca:avery:approved', 'candidate:ca:synthetic:avery',
    'pending_review', 'approved', 'reviewer', 'reviewer:synthetic:profiles',
    'SYNTHETIC_PROFILE_FIXTURE', 'source-review.v1', '2026-08-07T15:00:00Z'
  ),
  (
    'review-transition:us:morgan:profile-pending', 'candidate:us:synthetic:morgan-profile',
    NULL, 'pending_review', 'source_process', 'worker:synthetic-pilot',
    'SOURCE_CANDIDATE_STAGED', 'source-review.v1', '2026-08-07T15:04:00Z'
  ),
  (
    'review-transition:us:morgan:profile-approved', 'candidate:us:synthetic:morgan-profile',
    'pending_review', 'approved', 'reviewer', 'reviewer:synthetic:profiles',
    'SYNTHETIC_PROFILE_FIXTURE', 'source-review.v1', '2026-08-07T15:05:00Z'
  )
ON CONFLICT (transition_id) DO NOTHING;

INSERT INTO rmr_source.reviewed_record (
  record_id, record_type, subject_kind, subject_reference, created_at
) VALUES
  (
    'reviewed-record:ca:avery', 'person', 'person', 'person:ca:avery-quill',
    '2026-08-07T15:00:00Z'
  ),
  (
    'reviewed-record:us:morgan-profile', 'person', 'person', 'person:us:morgan-fields',
    '2026-08-07T15:05:00Z'
  )
ON CONFLICT (record_id) DO NOTHING;

INSERT INTO rmr_source.reviewed_record_version (
  version_id, record_id, candidate_id, review_transition_id, public_payload,
  source_id, retrieval_id, source_effective_at, approved_at,
  supersedes_version_id, correction_state
) VALUES
  (
    'reviewed-version:ca:avery:1', 'reviewed-record:ca:avery',
    'candidate:ca:synthetic:avery', 'review-transition:ca:avery:approved',
    '{"displayName":"Avery Quill","recordStatus":"current","synthetic":true}'::jsonb,
    'source:ca:synthetic-pilot', 'retrieval:ca:synthetic:001',
    '2026-08-01T00:00:00Z', '2026-08-07T15:00:00Z', NULL, 'active'
  ),
  (
    'reviewed-version:us:morgan:1', 'reviewed-record:us:morgan-profile',
    'candidate:us:synthetic:morgan-profile', 'review-transition:us:morgan:profile-approved',
    '{"displayName":"Morgan Fields","recordStatus":"candidate","synthetic":true}'::jsonb,
    'source:us:synthetic-pilot', 'retrieval:us:synthetic:001',
    '2026-08-01T00:00:00Z', '2026-08-07T15:05:00Z', NULL, 'active'
  )
ON CONFLICT (version_id) DO NOTHING;

INSERT INTO rmr_public.profile_publication_decision (
  decision_id, actor_type, actor_reference, decision, reason_code, policy_version, decided_at
) VALUES
  (
    'publication-decision:ca:profile:1', 'reviewer', 'reviewer:synthetic:profiles',
    'publish', 'SYNTHETIC_PROFILE_FIXTURE', 'public-profile.v1', '2026-08-07T15:00:00Z'
  ),
  (
    'publication-decision:us:profile:1', 'admin', 'admin:synthetic:profiles',
    'publish', 'SYNTHETIC_PROFILE_FIXTURE', 'public-profile.v1', '2026-08-07T15:05:00Z'
  )
ON CONFLICT (decision_id) DO NOTHING;

INSERT INTO rmr_public.profile (
  profile_id, person_id, office_term_id, candidacy_id, created_at
) VALUES
  (
    'profile:ca:avery-quill:maple-member:2024', 'person:ca:avery-quill',
    'term:ca:avery:current', NULL, '2026-08-07T15:00:00Z'
  ),
  (
    'profile:us:morgan-fields:state-senate:2026', 'person:us:morgan-fields',
    NULL, 'candidacy:us:morgan-fields', '2026-08-07T15:05:00Z'
  )
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO rmr_public.profile_version (
  profile_version_id, profile_id, record_version, update_kind,
  publication_decision_id, public_payload, updated_at,
  supersedes_profile_version_id, payload_sha256
) VALUES
  (
    'profile-version:ca:avery:3', 'profile:ca:avery-quill:maple-member:2024', 3,
    'correction', 'publication-decision:ca:profile:1',
    '{"schemaVersion":"public-role-profile.v1","dataMode":"synthetic","profileId":"profile:ca:avery-quill:maple-member:2024","recordVersion":3}'::jsonb,
    '2026-08-07T15:00:00Z', NULL, repeat('a', 64)
  ),
  (
    'profile-version:us:morgan:2', 'profile:us:morgan-fields:state-senate:2026', 2,
    'source_refresh', 'publication-decision:us:profile:1',
    '{"schemaVersion":"public-role-profile.v1","dataMode":"synthetic","profileId":"profile:us:morgan-fields:state-senate:2026","recordVersion":2}'::jsonb,
    '2026-08-07T15:05:00Z', NULL, repeat('b', 64)
  )
ON CONFLICT (profile_version_id) DO NOTHING;

INSERT INTO rmr_public.profile_version_source (
  profile_version_id, reviewed_record_version_id
) VALUES
  ('profile-version:ca:avery:3', 'reviewed-version:ca:avery:1'),
  ('profile-version:us:morgan:2', 'reviewed-version:us:morgan:1')
ON CONFLICT DO NOTHING;

INSERT INTO rmr_public.profile_timeline_item (
  timeline_item_id, profile_id, kind, occurred_at, public_summary, freshness, record_version
) VALUES
  (
    'timeline:ca:avery:correction', 'profile:ca:avery-quill:maple-member:2024',
    'correction', '2026-08-07T15:00:00Z',
    'A reviewed synthetic profile claim was corrected.', 'current', 3
  ),
  (
    'timeline:us:morgan:withdrawn', 'profile:us:morgan-fields:state-senate:2026',
    'candidacy_transition', '2026-08-01T17:00:00Z',
    'The synthetic candidacy was marked withdrawn.', 'current', 2
  )
ON CONFLICT (timeline_item_id) DO NOTHING;

INSERT INTO rmr_public.profile_timeline_source (
  timeline_item_id, reviewed_record_version_id
) VALUES
  ('timeline:ca:avery:correction', 'reviewed-version:ca:avery:1'),
  ('timeline:us:morgan:withdrawn', 'reviewed-version:us:morgan:1')
ON CONFLICT DO NOTHING;

INSERT INTO rmr.synthetic_seed_marker (fixture_key, description)
VALUES (
  'synthetic.public-profiles.v1',
  'Human-reviewed synthetic Canada office-term and United States candidacy profile projections.'
)
ON CONFLICT (fixture_key) DO NOTHING;

COMMIT;
