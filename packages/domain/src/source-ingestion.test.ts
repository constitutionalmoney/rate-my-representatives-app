import { describe, expect, it } from 'vitest';

import {
  approveCandidate,
  assertSourceCandidate,
  assertSourceConnectorCapability,
  evaluatePersonMatch,
  type SourceCandidateRecord,
  type SourceConnectorCapabilityV1,
} from './source-ingestion.js';
import { SYNTHETIC_PUBLIC_ROLE_REGISTRY } from './synthetic-public-role-registry.js';

const capability: SourceConnectorCapabilityV1 = {
  access: {
    authentication: 'none',
    endpointOrigin: 'https://ca-pilot.synthetic.invalid',
    method: 'https_json',
    obeyRobotsPolicy: true,
    rateLimitPerMinute: 10,
  },
  approval: {
    reviewReference: 'issue:55:synthetic-pilot',
    reviewedAt: '2026-08-07T12:00:00Z',
    state: 'synthetic_approved',
  },
  behavior: {
    conflicts: 'quarantine',
    deletions: 'review',
    outages: 'retry_then_dead_letter',
    retractions: 'review',
  },
  connectorId: 'connector:ca:synthetic-pilot',
  connectorVersion: '1.0.0',
  content: {
    expectedContentTypes: ['application/json'],
    maximumDecodedBytes: 200_000,
    maximumExpansionRatio: 10,
    maximumRedirects: 2,
    maximumWireBytes: 100_000,
    permittedContentEncodings: ['identity'],
    timeoutMs: 1_000,
  },
  dataMode: 'synthetic',
  identity: {
    effectiveDateSemantics: 'RFC3339 source event time',
    externalIdentifierTypes: ['synthetic-person-id'],
  },
  owner: { incidentRunbook: 'docs/runbooks/source-ingestion.md', team: 'data-stewardship' },
  pagination: { checkpointVersion: 'checkpoint.v1', style: 'cursor' },
  parser: { parserVersion: 'synthetic-ca-parser.v1', schemaVersion: 'pilot-feed.v1' },
  rights: {
    attributionText: 'Synthetic fixture for automated tests.',
    licenseName: 'CC0-1.0 synthetic fixture',
    redistribution: 'permitted_snapshots',
    retentionDays: 30,
    snapshotStorage: 'quarantine_only',
    termsUrl: 'https://ca-pilot.synthetic.invalid/terms',
  },
  schedule: { cadenceMinutes: 60, freshnessExpectedMinutes: 120, freshnessStaleMinutes: 240 },
  schemaVersion: 'source-connector-capability.v1',
  source: {
    authoritativeScope: 'Synthetic public-role pilot records only.',
    countries: ['CA'],
    jurisdictionIds: ['jurisdiction:ca:maple' as never],
    publisher: 'Synthetic Canada Pilot Authority',
    recordTypes: ['person', 'office_term', 'correction'],
    sourceId: 'source:ca:synthetic-pilot',
  },
};

const hash = 'a'.repeat(64);
const candidate: SourceCandidateRecord = {
  attribution: {
    assertionId: 'assertion:source:candidate:1' as never,
    conflict: 'clear',
    coverage: 'supported',
    freshness: 'current',
    observedAt: '2026-08-07T12:00:00Z',
    sourceReference: 'synthetic://source/candidate/1',
    supersedesAssertionId: null,
  },
  candidateId: 'candidate:source:1',
  countryCode: 'CA',
  jurisdictionId: 'jurisdiction:ca:maple' as never,
  matchOutcome: 'candidate_match',
  matchingHints: [
    { kind: 'name', value: 'Avery Quill' },
    { kind: 'official_identifier', value: 'SYN-CA-PERSON-001' },
  ],
  material: true,
  normalizedSha256: hash,
  publicPayload: { displayName: 'Avery Quill', synthetic: true },
  recordType: 'person',
  retrievalId: 'retrieval:source:1',
  reviewState: 'pending_review',
  sourceAvailability: 'available',
  sourceEffectiveAt: '2026-08-07T00:00:00Z',
  sourceId: 'source:ca:synthetic-pilot',
  sourceRecordId: 'ca-person-1',
  subject: { kind: 'person', personId: 'person:ca:avery-quill' as never },
  transformations: [
    {
      assistedByAi: false,
      confidence: null,
      inputSha256: hash,
      kind: 'parse',
      modelProcessVersion: null,
      outputSha256: hash,
      processVersion: 'parser.v1',
      requiresHumanReview: true,
      stepId: 'step:parse:1',
    },
    {
      assistedByAi: false,
      confidence: null,
      inputSha256: hash,
      kind: 'normalize',
      modelProcessVersion: null,
      outputSha256: hash,
      processVersion: 'normalizer.v1',
      requiresHumanReview: true,
      stepId: 'step:normalize:1',
    },
  ],
};

describe('official-source ingestion domain', () => {
  it('requires complete, explicitly approved synthetic connector metadata', () => {
    expect(() => assertSourceConnectorCapability(capability)).not.toThrow();
    expect(() =>
      assertSourceConnectorCapability({
        ...capability,
        approval: { ...capability.approval, state: 'production_approved' },
      }),
    ).toThrow(/synthetic approval/);
  });

  it('never matches a person solely by name', () => {
    expect(
      evaluatePersonMatch(
        [{ kind: 'name', value: 'Morgan Field' }],
        SYNTHETIC_PUBLIC_ROLE_REGISTRY,
      ),
    ).toBe('ambiguous');
    expect(evaluatePersonMatch(candidate.matchingHints, SYNTHETIC_PUBLIC_ROLE_REGISTRY)).toBe(
      'candidate_match',
    );
  });

  it('rejects private fields and unavailable source material outside quarantine', () => {
    expect(() => assertSourceCandidate(candidate)).not.toThrow();
    expect(() =>
      assertSourceCandidate({ ...candidate, publicPayload: { preciseLocation: 'forbidden' } }),
    ).toThrow(/preciseLocation/);
    expect(() => assertSourceCandidate({ ...candidate, sourceAvailability: 'retracted' })).toThrow(
      /quarantined/,
    );
  });

  it('requires an accountable approval before creating a reviewed source record', () => {
    expect(() =>
      approveCandidate(
        candidate,
        {
          actorReference: 'reviewer:synthetic',
          actorType: 'reviewer',
          candidateId: candidate.candidateId,
          decidedAt: '2026-08-07T13:00:00Z',
          decision: 'approve',
          decisionId: 'decision:candidate:1',
          policyVersion: 'source-review.v1',
          reasonCode: 'SOURCE_RECORD_CONFIRMED',
        },
        { recordId: 'source-record:1', versionId: 'source-record-version:1' },
      ),
    ).not.toThrow();
    expect(() =>
      approveCandidate(
        { ...candidate, reviewState: 'quarantined' },
        {
          actorReference: 'reviewer:synthetic',
          actorType: 'reviewer',
          candidateId: candidate.candidateId,
          decidedAt: '2026-08-07T13:00:00Z',
          decision: 'approve',
          decisionId: 'decision:candidate:2',
          policyVersion: 'source-review.v1',
          reasonCode: 'SOURCE_RECORD_CONFIRMED',
        },
        { recordId: 'source-record:2', versionId: 'source-record-version:2' },
      ),
    ).toThrow(/cannot be approved/);
  });
});
