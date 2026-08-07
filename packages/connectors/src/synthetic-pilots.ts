import { createHash } from 'node:crypto';

import {
  SYNTHETIC_PUBLIC_ROLE_REGISTRY,
  evaluatePersonMatch,
  type CountryCode,
  type JurisdictionId,
  type MatchingHint,
  type SourceAvailability,
  type SourceCandidateRecord,
  type SourceConnectorCapabilityV1,
  type SourceRecordType,
} from '@rmr/domain';

import type { ConnectorCheckpoint, ParsedSourceEnvelope, SourceConnector } from './pipeline.js';

interface SyntheticFeedRecord {
  readonly availability: SourceAvailability;
  readonly countryCode: CountryCode;
  readonly effectiveAt: string;
  readonly jurisdictionId: JurisdictionId;
  readonly matchingHints: readonly MatchingHint[];
  readonly publicPayload: Readonly<Record<string, string | boolean | null>>;
  readonly recordType: SourceRecordType;
  readonly sourceRecordId: string;
  readonly subject: {
    readonly id: string;
    readonly kind: 'candidacy' | 'election' | 'office_term' | 'person' | 'unresolved';
  };
}

interface SyntheticFeed {
  readonly nextCursor: string | null;
  readonly records: readonly SyntheticFeedRecord[];
  readonly schemaVersion: 'pilot-feed.v1';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertSyntheticFeed(value: unknown): asserts value is SyntheticFeed {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 'pilot-feed.v1' ||
    !Array.isArray(value.records)
  ) {
    throw new Error('Synthetic source feed did not satisfy pilot-feed.v1.');
  }
  for (const record of value.records) {
    if (
      !isRecord(record) ||
      typeof record.sourceRecordId !== 'string' ||
      (record.countryCode !== 'CA' && record.countryCode !== 'US') ||
      typeof record.jurisdictionId !== 'string' ||
      typeof record.recordType !== 'string' ||
      typeof record.effectiveAt !== 'string' ||
      !isRecord(record.subject) ||
      typeof record.subject.kind !== 'string' ||
      typeof record.subject.id !== 'string' ||
      !isRecord(record.publicPayload) ||
      !Array.isArray(record.matchingHints)
    ) {
      throw new Error('Synthetic source feed contains an invalid record.');
    }
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`)
    .join(',')}}`;
}

function digest(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function capability(input: {
  readonly connectorId: string;
  readonly country: CountryCode;
  readonly host: string;
  readonly jurisdictionId: JurisdictionId;
  readonly parserVersion: string;
  readonly publisher: string;
  readonly recordTypes: readonly SourceRecordType[];
  readonly sourceId: string;
}): SourceConnectorCapabilityV1 {
  const result: SourceConnectorCapabilityV1 = {
    access: {
      authentication: 'none',
      endpointOrigin: `https://${input.host}`,
      method: 'https_json',
      obeyRobotsPolicy: true,
      rateLimitPerMinute: 10,
    },
    approval: {
      reviewReference: 'issue:55:synthetic-pilot-approval',
      reviewedAt: '2026-08-07T12:00:00Z',
      state: 'synthetic_approved',
    },
    behavior: {
      conflicts: 'quarantine',
      deletions: 'review',
      outages: 'retry_then_dead_letter',
      retractions: 'review',
    },
    connectorId: input.connectorId,
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
      effectiveDateSemantics: 'RFC3339 effective time declared by the synthetic publisher',
      externalIdentifierTypes: ['synthetic-official-record-id'],
    },
    owner: {
      incidentRunbook: 'docs/runbooks/SOURCE_INGESTION.md',
      team: 'data-stewardship',
    },
    pagination: { checkpointVersion: 'checkpoint.v1', style: 'cursor' },
    parser: { parserVersion: input.parserVersion, schemaVersion: 'pilot-feed.v1' },
    rights: {
      attributionText: `${input.publisher}; synthetic fixture for automated tests.`,
      licenseName: 'CC0-1.0 synthetic fixture',
      redistribution: 'permitted_snapshots',
      retentionDays: 30,
      snapshotStorage: 'quarantine_only',
      termsUrl: `https://${input.host}/terms`,
    },
    schedule: {
      cadenceMinutes: 60,
      freshnessExpectedMinutes: 120,
      freshnessStaleMinutes: 240,
    },
    schemaVersion: 'source-connector-capability.v1',
    source: {
      authoritativeScope: `Synthetic ${input.country} public-role pilot records only.`,
      countries: [input.country],
      jurisdictionIds: [input.jurisdictionId],
      publisher: input.publisher,
      recordTypes: input.recordTypes,
      sourceId: input.sourceId,
    },
  };
  return Object.freeze(result);
}

export const SYNTHETIC_CA_PILOT_CAPABILITY = capability({
  connectorId: 'connector:ca:synthetic-pilot',
  country: 'CA',
  host: 'ca-pilot.synthetic.invalid',
  jurisdictionId: 'jurisdiction:ca:maple' as JurisdictionId,
  parserVersion: 'synthetic-ca-parser.v1',
  publisher: 'Synthetic Canada Pilot Authority',
  recordTypes: ['person', 'office_term', 'correction'],
  sourceId: 'source:ca:synthetic-pilot',
});

export const SYNTHETIC_US_PILOT_CAPABILITY = capability({
  connectorId: 'connector:us:synthetic-pilot',
  country: 'US',
  host: 'us-pilot.synthetic.invalid',
  jurisdictionId: 'jurisdiction:us:example-state' as JurisdictionId,
  parserVersion: 'synthetic-us-parser.v1',
  publisher: 'Synthetic United States Pilot Authority',
  recordTypes: ['person', 'candidacy', 'election', 'correction'],
  sourceId: 'source:us:synthetic-pilot',
});

function subject(record: SyntheticFeedRecord): SourceCandidateRecord['subject'] {
  switch (record.subject.kind) {
    case 'person':
      return { kind: 'person', personId: record.subject.id as never };
    case 'office_term':
      return { kind: 'office_term', officeTermId: record.subject.id as never };
    case 'candidacy':
      return { candidacyId: record.subject.id as never, kind: 'candidacy' };
    case 'election':
      return { electionId: record.subject.id as never, kind: 'election' };
    case 'unresolved':
      return { kind: 'unresolved', reference: record.subject.id };
  }
}

function createPilotConnector(
  connectorCapability: SourceConnectorCapabilityV1,
): SourceConnector<SyntheticFeedRecord> {
  const connector: SourceConnector<SyntheticFeedRecord> = {
    buildUrl(checkpoint: ConnectorCheckpoint | null): string {
      const url = new URL('/v1/public-role-records', connectorCapability.access.endpointOrigin);
      if (checkpoint?.cursor) url.searchParams.set('cursor', checkpoint.cursor);
      return url.toString();
    },
    capability: connectorCapability,
    normalize(record, context): SourceCandidateRecord {
      const parsedHash = digest(record);
      const normalizedPayload = { ...record.publicPayload, synthetic: true };
      const normalizedHash = digest(normalizedPayload);
      const matchOutcome =
        record.recordType === 'person'
          ? evaluatePersonMatch(record.matchingHints, SYNTHETIC_PUBLIC_ROLE_REGISTRY)
          : record.matchingHints.some(({ kind }) => kind === 'source_conflict')
            ? 'conflict'
            : 'unmatched';
      const reviewState =
        record.availability === 'available' && matchOutcome !== 'conflict'
          ? 'pending_review'
          : 'quarantined';
      const token = digest(
        `${connectorCapability.connectorId}|${record.sourceRecordId}|${normalizedHash}`,
      ).slice(0, 24);
      const candidate: SourceCandidateRecord = {
        attribution: {
          assertionId: `assertion:source:${token}` as never,
          conflict: matchOutcome === 'conflict' ? 'conflicting' : 'clear',
          coverage: record.availability === 'missing' ? 'gap' : 'supported',
          freshness:
            record.availability === 'stale' || record.availability === 'unavailable'
              ? 'stale'
              : 'current',
          observedAt: context.retrievedAt,
          sourceReference: `synthetic://${connectorCapability.source.sourceId}/${record.sourceRecordId}`,
          supersedesAssertionId: null,
        },
        candidateId: `candidate:${token}`,
        countryCode: record.countryCode,
        jurisdictionId: record.jurisdictionId,
        matchOutcome,
        matchingHints: record.matchingHints,
        material: true,
        normalizedSha256: normalizedHash,
        publicPayload: normalizedPayload,
        recordType: record.recordType,
        retrievalId: context.retrievalId,
        reviewState,
        sourceAvailability: record.availability,
        sourceEffectiveAt: record.effectiveAt,
        sourceId: connectorCapability.source.sourceId,
        sourceRecordId: record.sourceRecordId,
        subject: subject(record),
        transformations: [
          {
            assistedByAi: false,
            confidence: null,
            inputSha256: context.retrievalSha256,
            kind: 'parse',
            modelProcessVersion: null,
            outputSha256: parsedHash,
            processVersion: connectorCapability.parser.parserVersion,
            requiresHumanReview: true,
            stepId: `step:parse:${token}`,
          },
          {
            assistedByAi: false,
            confidence: null,
            inputSha256: parsedHash,
            kind: 'normalize',
            modelProcessVersion: null,
            outputSha256: normalizedHash,
            processVersion: 'source-normalizer.v1',
            requiresHumanReview: true,
            stepId: `step:normalize:${token}`,
          },
        ],
      };
      return Object.freeze(candidate);
    },
    parse(body: Uint8Array): ParsedSourceEnvelope<SyntheticFeedRecord> {
      let parsed: unknown;
      try {
        parsed = JSON.parse(new TextDecoder().decode(body)) as unknown;
      } catch {
        throw new Error('Synthetic source returned malformed JSON.');
      }
      assertSyntheticFeed(parsed);
      return Object.freeze({ nextCursor: parsed.nextCursor, records: parsed.records });
    },
  };
  return Object.freeze(connector);
}

export const SYNTHETIC_CA_PILOT_CONNECTOR = createPilotConnector(SYNTHETIC_CA_PILOT_CAPABILITY);
export const SYNTHETIC_US_PILOT_CONNECTOR = createPilotConnector(SYNTHETIC_US_PILOT_CAPABILITY);
