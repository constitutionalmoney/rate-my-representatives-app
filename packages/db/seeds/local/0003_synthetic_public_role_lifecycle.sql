BEGIN;

INSERT INTO rmr_registry.assertion (
  assertion_id, source_reference, observed_at, freshness_state, coverage_state,
  conflict_state, supersedes_assertion_id
)
SELECT assertion_id, 'synthetic://seed/public-role/' || replace(assertion_id, ':', '/'),
  '2026-08-07T12:00:00Z'::timestamptz, 'current', 'supported', 'clear', NULL
FROM (VALUES
  ('assertion:role:name'), ('assertion:role:context'), ('assertion:role:lifecycle'),
  ('assertion:role:election'), ('assertion:role:candidacy'), ('assertion:role:contact'),
  ('assertion:role:identifier'), ('assertion:role:resolution'),
  ('assertion:role:resolution-context')
) AS fixture(assertion_id)
ON CONFLICT (assertion_id) DO NOTHING;

INSERT INTO rmr_registry.lifecycle_review (
  review_id, actor_type, actor_reference, process, reason_code, recorded_at, private_notes
) VALUES
  ('review:role:seed', 'source_process', 'process:synthetic-seed', 'synthetic_seed', 'SYNTHETIC_FIXTURE', '2026-08-07T12:00:00Z', 'Never exposed by public views.'),
  ('review:role:human', 'reviewer', 'reviewer:synthetic-one', 'manual_review', 'REVIEWED_PERSON_CONTEXT', '2026-08-07T12:00:00Z', 'Synthetic reviewer note; public serializers omit this field.')
ON CONFLICT (review_id) DO NOTHING;

INSERT INTO rmr_registry.person (person_id, record_state) VALUES
  ('person:ca:avery-quill', 'active'),
  ('person:ca:rowan-lake', 'active'),
  ('person:us:morgan-fields', 'active'),
  ('person:us:morgan-field', 'active'),
  ('person:ca:sam-a', 'historical'),
  ('person:ca:sam-b', 'historical'),
  ('person:ca:sam-merged', 'superseded')
ON CONFLICT (person_id) DO NOTHING;

INSERT INTO rmr_registry.person_name (
  person_name_id, person_id, display_name, kind, language_tag, effective_from,
  effective_to, assertion_id
) VALUES
  ('person-name:avery', 'person:ca:avery-quill', 'Avery Quill', 'primary', 'en-CA', '2020-01-01T00:00:00Z', NULL, 'assertion:role:name'),
  ('person-name:avery-alias', 'person:ca:avery-quill', 'A. Quill', 'alias', 'en-CA', '2020-01-01T00:00:00Z', NULL, 'assertion:role:name'),
  ('person-name:rowan', 'person:ca:rowan-lake', 'Rowan Lake', 'primary', 'en-CA', '2020-01-01T00:00:00Z', NULL, 'assertion:role:name'),
  ('person-name:morgan-fields', 'person:us:morgan-fields', 'Morgan Fields', 'primary', 'en-US', '2020-01-01T00:00:00Z', NULL, 'assertion:role:name'),
  ('person-name:morgan-field', 'person:us:morgan-field', 'Morgan Field', 'primary', 'en-US', '2020-01-01T00:00:00Z', NULL, 'assertion:role:name'),
  ('person-name:sam-a', 'person:ca:sam-a', 'Sam Harbour', 'primary', 'en-CA', '2020-01-01T00:00:00Z', NULL, 'assertion:role:name'),
  ('person-name:sam-b', 'person:ca:sam-b', 'Sam Harbour', 'primary', 'en-CA', '2020-01-01T00:00:00Z', NULL, 'assertion:role:name'),
  ('person-name:sam-merged', 'person:ca:sam-merged', 'Sam Harbour merged record', 'previous', 'en-CA', '2025-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:role:name')
ON CONFLICT (person_name_id) DO NOTHING;

INSERT INTO rmr_registry.election (
  election_id, country_code, jurisdiction_id, district_id, public_body_id, office_id
) VALUES
  ('election:ca:maple-2026', 'CA', 'jurisdiction:ca:maple', 'district:ca:maple-provincial', 'body:ca:maple-legislature', 'office:ca:maple-member'),
  ('election:us:senate-2026', 'US', 'jurisdiction:us:example-state', 'district:us:state-senate', 'body:us:state-legislature', 'office:us:state-senator')
ON CONFLICT (election_id) DO NOTHING;

INSERT INTO rmr_registry.election_version (
  version_id, election_id, name, kind, state, scheduled_at, effective_from,
  effective_to, assertion_id, supersedes_version_id
) VALUES
  ('election-version:ca:2026', 'election:ca:maple-2026', 'Maple 2026 synthetic general election', 'general', 'completed', '2026-04-01T16:00:00Z', '2026-01-01T00:00:00Z', NULL, 'assertion:role:election', NULL),
  ('election-version:us:2026', 'election:us:senate-2026', 'Example State 2026 synthetic election', 'general', 'active', '2026-11-03T16:00:00Z', '2026-01-01T00:00:00Z', NULL, 'assertion:role:election', NULL)
ON CONFLICT (version_id) DO NOTHING;

INSERT INTO rmr_registry.office_term (
  office_term_id, person_id, country_code, jurisdiction_id, district_id,
  public_body_id, office_id, origin, selection_method, service_capacity,
  planned_start, planned_end
) VALUES
  ('term:ca:avery:former', 'person:ca:avery-quill', 'CA', 'jurisdiction:ca:maple', 'district:ca:maple-provincial', 'body:ca:maple-legislature', 'office:ca:maple-member', 'election_result', 'elected', 'regular', '2022-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('term:ca:avery:current', 'person:ca:avery-quill', 'CA', 'jurisdiction:ca:maple', 'district:ca:maple-provincial', 'body:ca:maple-legislature', 'office:ca:maple-member', 'appointment', 'appointed', 'regular', '2026-01-01T00:00:00Z', NULL),
  ('term:ca:rowan:acting', 'person:ca:rowan-lake', 'CA', 'jurisdiction:ca:north-region', NULL, 'body:ca:north-board', 'office:ca:north-director', 'appointment', 'appointed', 'acting', '2026-02-01T00:00:00Z', NULL),
  ('term:us:morgan:interim', 'person:us:morgan-fields', 'US', 'jurisdiction:us:water', NULL, 'body:us:water-board', 'office:us:water-director', 'appointment', 'appointed', 'interim', '2026-03-01T00:00:00Z', NULL)
ON CONFLICT (office_term_id) DO NOTHING;

INSERT INTO rmr_registry.office_term_transition (
  transition_id, office_term_id, from_state, to_state, effective_at, assertion_id, review_id
) VALUES
  ('transition:term:former:pending', 'term:ca:avery:former', NULL, 'pending', '2021-12-01T00:00:00Z', 'assertion:role:lifecycle', 'review:role:seed'),
  ('transition:term:former:active', 'term:ca:avery:former', 'pending', 'active', '2022-01-01T00:00:00Z', 'assertion:role:lifecycle', 'review:role:seed'),
  ('transition:term:former:ended', 'term:ca:avery:former', 'active', 'ended', '2026-01-01T00:00:00Z', 'assertion:role:lifecycle', 'review:role:seed'),
  ('transition:term:current:pending', 'term:ca:avery:current', NULL, 'pending', '2025-12-15T00:00:00Z', 'assertion:role:lifecycle', 'review:role:seed'),
  ('transition:term:current:active', 'term:ca:avery:current', 'pending', 'active', '2026-01-01T00:00:00Z', 'assertion:role:lifecycle', 'review:role:seed'),
  ('transition:term:acting:pending', 'term:ca:rowan:acting', NULL, 'pending', '2026-01-15T00:00:00Z', 'assertion:role:lifecycle', 'review:role:seed'),
  ('transition:term:acting:active', 'term:ca:rowan:acting', 'pending', 'active', '2026-02-01T00:00:00Z', 'assertion:role:lifecycle', 'review:role:seed'),
  ('transition:term:interim:pending', 'term:us:morgan:interim', NULL, 'pending', '2026-02-15T00:00:00Z', 'assertion:role:lifecycle', 'review:role:seed'),
  ('transition:term:interim:active', 'term:us:morgan:interim', 'pending', 'active', '2026-03-01T00:00:00Z', 'assertion:role:lifecycle', 'review:role:seed')
ON CONFLICT (transition_id) DO NOTHING;

INSERT INTO rmr_registry.office_term_relationship (
  relationship_id, office_term_id, related_office_term_id, kind, effective_from,
  effective_to, assertion_id
) VALUES ('term-relationship:avery:successor', 'term:ca:avery:current', 'term:ca:avery:former', 'successor_of', '2026-01-01T00:00:00Z', NULL, 'assertion:role:context')
ON CONFLICT (relationship_id) DO NOTHING;

INSERT INTO rmr_registry.office_term_contact (
  contact_id, office_term_id, kind, value, effective_from, effective_to, assertion_id
) VALUES ('term-contact:avery:web', 'term:ca:avery:current', 'office_url', 'https://example.invalid/avery-office', '2026-01-01T00:00:00Z', NULL, 'assertion:role:contact')
ON CONFLICT (contact_id) DO NOTHING;

INSERT INTO rmr_registry.candidacy (
  candidacy_id, person_id, election_id, country_code, jurisdiction_id, district_id, office_id
) VALUES
  ('candidacy:ca:avery', 'person:ca:avery-quill', 'election:ca:maple-2026', 'CA', 'jurisdiction:ca:maple', 'district:ca:maple-provincial', 'office:ca:maple-member'),
  ('candidacy:ca:rowan', 'person:ca:rowan-lake', 'election:ca:maple-2026', 'CA', 'jurisdiction:ca:maple', 'district:ca:maple-provincial', 'office:ca:maple-member'),
  ('candidacy:us:morgan-fields', 'person:us:morgan-fields', 'election:us:senate-2026', 'US', 'jurisdiction:us:example-state', 'district:us:state-senate', 'office:us:state-senator'),
  ('candidacy:us:morgan-field', 'person:us:morgan-field', 'election:us:senate-2026', 'US', 'jurisdiction:us:example-state', 'district:us:state-senate', 'office:us:state-senator')
ON CONFLICT (candidacy_id) DO NOTHING;

INSERT INTO rmr_registry.candidacy_transition (
  transition_id, candidacy_id, from_state, to_state, effective_at, assertion_id, review_id
) VALUES
  ('transition:candidacy:avery:declared', 'candidacy:ca:avery', NULL, 'declared', '2025-09-01T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:avery:registered', 'candidacy:ca:avery', 'declared', 'registered', '2025-10-01T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:avery:active', 'candidacy:ca:avery', 'registered', 'active', '2026-01-01T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:avery:defeated', 'candidacy:ca:avery', 'active', 'defeated', '2026-04-02T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:rowan:qualified', 'candidacy:ca:rowan', NULL, 'qualified', '2026-01-01T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:rowan:active', 'candidacy:ca:rowan', 'qualified', 'active', '2026-02-01T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:rowan:won', 'candidacy:ca:rowan', 'active', 'won', '2026-04-02T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:morgan-fields:declared', 'candidacy:us:morgan-fields', NULL, 'declared', '2026-01-01T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:morgan-fields:withdrawn', 'candidacy:us:morgan-fields', 'declared', 'withdrawn', '2026-02-01T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:morgan-field:declared', 'candidacy:us:morgan-field', NULL, 'declared', '2026-01-01T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed'),
  ('transition:candidacy:morgan-field:disqualified', 'candidacy:us:morgan-field', 'declared', 'disqualified', '2026-02-01T00:00:00Z', 'assertion:role:candidacy', 'review:role:seed')
ON CONFLICT (transition_id) DO NOTHING;

INSERT INTO rmr_registry.public_role_official_identifier (
  official_identifier_id, person_id, issuer, identifier, effective_from, effective_to, assertion_id
) VALUES
  ('official-id:morgan-fields', 'person:us:morgan-fields', 'synthetic-election-authority', 'MORGAN-FIELDS-001', '2026-01-01T00:00:00Z', NULL, 'assertion:role:identifier'),
  ('official-id:morgan-field', 'person:us:morgan-field', 'synthetic-election-authority', 'MORGAN-FIELD-002', '2026-01-01T00:00:00Z', NULL, 'assertion:role:identifier')
ON CONFLICT (official_identifier_id) DO NOTHING;

INSERT INTO rmr_registry.person_resolution_decision (
  decision_id, kind, effective_at, assertion_id, review_id, supersedes_decision_id
) VALUES
  ('resolution:sam:merge', 'merge', '2025-01-01T00:00:00Z', 'assertion:role:resolution', 'review:role:human', NULL),
  ('resolution:sam:split', 'split', '2026-01-01T00:00:00Z', 'assertion:role:resolution', 'review:role:human', 'resolution:sam:merge'),
  ('resolution:morgan:distinct', 'distinct', '2026-01-01T00:00:00Z', 'assertion:role:resolution', 'review:role:human', NULL)
ON CONFLICT (decision_id) DO NOTHING;

INSERT INTO rmr_registry.person_resolution_party (decision_id, person_id, party_role) VALUES
  ('resolution:sam:merge', 'person:ca:sam-a', 'input'),
  ('resolution:sam:merge', 'person:ca:sam-b', 'input'),
  ('resolution:sam:merge', 'person:ca:sam-merged', 'output'),
  ('resolution:sam:split', 'person:ca:sam-merged', 'input'),
  ('resolution:sam:split', 'person:ca:sam-a', 'output'),
  ('resolution:sam:split', 'person:ca:sam-b', 'output'),
  ('resolution:morgan:distinct', 'person:us:morgan-fields', 'input'),
  ('resolution:morgan:distinct', 'person:us:morgan-field', 'input'),
  ('resolution:morgan:distinct', 'person:us:morgan-fields', 'output'),
  ('resolution:morgan:distinct', 'person:us:morgan-field', 'output')
ON CONFLICT (decision_id, person_id, party_role) DO NOTHING;

INSERT INTO rmr_registry.person_resolution_evidence (
  evidence_id, decision_id, kind, reference, assertion_id
) VALUES
  ('resolution-evidence:sam:merge:name', 'resolution:sam:merge', 'name', 'synthetic://context/sam/name', 'assertion:role:resolution'),
  ('resolution-evidence:sam:merge:office', 'resolution:sam:merge', 'office_context', 'synthetic://context/sam/office', 'assertion:role:resolution-context'),
  ('resolution-evidence:sam:split:conflict', 'resolution:sam:split', 'source_conflict', 'synthetic://context/sam/conflict', 'assertion:role:resolution'),
  ('resolution-evidence:sam:split:date', 'resolution:sam:split', 'effective_date', 'synthetic://context/sam/date', 'assertion:role:resolution-context'),
  ('resolution-evidence:morgan:name', 'resolution:morgan:distinct', 'name', 'synthetic://context/morgan/name', 'assertion:role:resolution'),
  ('resolution-evidence:morgan:identifier', 'resolution:morgan:distinct', 'official_identifier', 'synthetic://context/morgan/identifier', 'assertion:role:resolution-context')
ON CONFLICT (evidence_id) DO NOTHING;

INSERT INTO rmr.synthetic_seed_marker (fixture_key, description)
VALUES (
  'synthetic.public-role.registry.v1',
  'Synthetic people, office terms, elections, candidacies, and reviewed resolution history; no external identity authority.'
)
ON CONFLICT (fixture_key) DO NOTHING;

COMMIT;
