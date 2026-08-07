import type { JsonValue } from './audit-outbox.js';
import type { CountryCode, JurisdictionId, RegistryAttribution } from './jurisdiction-registry.js';
import type {
  CandidacyId,
  ElectionId,
  OfficeTermId,
  PersonId,
  PublicRoleRegistrySnapshot,
} from './public-role-registry.js';

export const SOURCE_RECORD_TYPES = [
  'jurisdiction',
  'person',
  'office',
  'office_term',
  'candidacy',
  'election',
  'vote',
  'attendance',
  'committee',
  'expense',
  'disclosure',
  'statement',
  'promise_position',
  'event',
  'outcome',
  'correction',
] as const;

export type SourceRecordType = (typeof SOURCE_RECORD_TYPES)[number];
export type SourceAvailability = 'available' | 'stale' | 'missing' | 'retracted' | 'unavailable';
export type CandidateReviewState =
  'pending_review' | 'quarantined' | 'approved' | 'rejected' | 'needs_correction' | 'superseded';
export type MatchOutcome = 'unmatched' | 'candidate_match' | 'ambiguous' | 'conflict';

export interface SourceConnectorCapabilityV1 {
  readonly schemaVersion: 'source-connector-capability.v1';
  readonly connectorId: string;
  readonly connectorVersion: string;
  readonly dataMode: 'synthetic' | 'production';
  readonly approval: {
    readonly state: 'synthetic_approved' | 'production_approved' | 'suspended';
    readonly reviewReference: string;
    readonly reviewedAt: string;
  };
  readonly source: {
    readonly sourceId: string;
    readonly publisher: string;
    readonly authoritativeScope: string;
    readonly countries: readonly CountryCode[];
    readonly jurisdictionIds: readonly JurisdictionId[];
    readonly recordTypes: readonly SourceRecordType[];
  };
  readonly access: {
    readonly method: 'https_json' | 'https_csv';
    readonly authentication: 'none' | 'api_key' | 'oauth_client' | 'client_certificate';
    readonly endpointOrigin: string;
    readonly rateLimitPerMinute: number;
    readonly obeyRobotsPolicy: boolean;
  };
  readonly rights: {
    readonly licenseName: string;
    readonly termsUrl: string;
    readonly attributionText: string;
    readonly retentionDays: number;
    readonly redistribution: 'metadata_only' | 'permitted_snapshots';
    readonly snapshotStorage: 'prohibited' | 'quarantine_only' | 'permitted';
  };
  readonly identity: {
    readonly externalIdentifierTypes: readonly string[];
    readonly effectiveDateSemantics: string;
  };
  readonly schedule: {
    readonly cadenceMinutes: number;
    readonly freshnessExpectedMinutes: number;
    readonly freshnessStaleMinutes: number;
  };
  readonly pagination: {
    readonly style: 'none' | 'cursor' | 'page';
    readonly checkpointVersion: string;
  };
  readonly parser: {
    readonly parserVersion: string;
    readonly schemaVersion: string;
  };
  readonly content: {
    readonly expectedContentTypes: readonly string[];
    readonly permittedContentEncodings: readonly ('identity' | 'gzip' | 'br')[];
    readonly maximumWireBytes: number;
    readonly maximumDecodedBytes: number;
    readonly maximumExpansionRatio: number;
    readonly timeoutMs: number;
    readonly maximumRedirects: number;
  };
  readonly behavior: {
    readonly conflicts: 'quarantine';
    readonly deletions: 'review';
    readonly retractions: 'review';
    readonly outages: 'retry_then_dead_letter';
  };
  readonly owner: {
    readonly team: string;
    readonly incidentRunbook: string;
  };
}

export type CandidateSubject =
  | { readonly kind: 'jurisdiction'; readonly jurisdictionId: JurisdictionId }
  | { readonly kind: 'person'; readonly personId: PersonId }
  | { readonly kind: 'office_term'; readonly officeTermId: OfficeTermId }
  | { readonly kind: 'candidacy'; readonly candidacyId: CandidacyId }
  | { readonly kind: 'election'; readonly electionId: ElectionId }
  | { readonly kind: 'unresolved'; readonly reference: string };

export type MatchingHintKind =
  | 'name'
  | 'official_identifier'
  | 'office_context'
  | 'district_context'
  | 'effective_date'
  | 'source_conflict';

export interface MatchingHint {
  readonly kind: MatchingHintKind;
  readonly value: string;
}

export interface TransformationStep {
  readonly stepId: string;
  readonly kind: 'parse' | 'normalize' | 'classify' | 'compare';
  readonly processVersion: string;
  readonly inputSha256: string;
  readonly outputSha256: string;
  readonly assistedByAi: boolean;
  readonly modelProcessVersion: string | null;
  readonly confidence: number | null;
  readonly requiresHumanReview: true;
}

export interface SourceCandidateRecord {
  readonly candidateId: string;
  readonly sourceId: string;
  readonly sourceRecordId: string;
  readonly retrievalId: string;
  readonly countryCode: CountryCode;
  readonly jurisdictionId: JurisdictionId;
  readonly recordType: SourceRecordType;
  readonly sourceEffectiveAt: string;
  readonly subject: CandidateSubject;
  readonly publicPayload: Readonly<Record<string, JsonValue>>;
  readonly normalizedSha256: string;
  readonly matchingHints: readonly MatchingHint[];
  readonly matchOutcome: MatchOutcome;
  readonly reviewState: 'pending_review' | 'quarantined';
  readonly material: boolean;
  readonly sourceAvailability: SourceAvailability;
  readonly transformations: readonly TransformationStep[];
  readonly attribution: RegistryAttribution;
}

export interface CandidateReviewDecision {
  readonly decisionId: string;
  readonly candidateId: string;
  readonly actorType: 'reviewer' | 'admin';
  readonly actorReference: string;
  readonly decision: 'approve' | 'reject' | 'request_correction';
  readonly reasonCode: string;
  readonly decidedAt: string;
  readonly policyVersion: string;
}

export interface ReviewedSourceRecord {
  readonly recordId: string;
  readonly versionId: string;
  readonly candidateId: string;
  readonly recordType: SourceRecordType;
  readonly subject: CandidateSubject;
  readonly publicPayload: Readonly<Record<string, JsonValue>>;
  readonly sourceId: string;
  readonly retrievalId: string;
  readonly sourceEffectiveAt: string;
  readonly approvedAt: string;
  readonly supersedesVersionId: string | null;
  readonly correctionState: 'active' | 'corrected' | 'superseded';
  readonly reviewDecisionId: string;
}

export interface CoverageItem {
  readonly countryCode: CountryCode;
  readonly jurisdictionId: JurisdictionId;
  readonly recordType: SourceRecordType;
  readonly sourceAvailability: SourceAvailability;
  readonly candidateCount: number;
  readonly pendingReviewCount: number;
  readonly conflictCount: number;
  readonly lastRetrievedAt: string | null;
}

export interface SourceCoverageSnapshot {
  readonly schemaVersion: 'source-coverage-snapshot.v1';
  readonly dataMode: 'synthetic';
  readonly snapshotId: string;
  readonly generatedAt: string;
  readonly methodVersion: string;
  readonly codeRevision: string;
  readonly items: readonly CoverageItem[];
  readonly missingDataMeaning: 'coverage_gap_not_misconduct';
  readonly provenanceState: 'not_anchored';
  readonly sha256: string;
}

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const PROHIBITED_CANDIDATE_KEYS = new Set([
  'accountid',
  'address',
  'credential',
  'email',
  'identityevidence',
  'moderatornotes',
  'preciseaddress',
  'preciselocation',
  'privateactivity',
  'privatekey',
  'representativesignal',
  'seedphrase',
  'sessiontoken',
  'walletpayload',
  'wif',
]);

function assertId(value: string, field: string): void {
  if (!ID_PATTERN.test(value)) throw new Error(`${field} must be a stable identifier.`);
}

function assertTimestamp(value: string, field: string): void {
  if (!ISO_TIMESTAMP_PATTERN.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${field} must be an ISO-8601 timestamp.`);
  }
}

function assertHttpsUrl(value: string, field: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${field} must be an absolute HTTPS URL.`);
  }
  if (url.protocol !== 'https:' || url.username !== '' || url.password !== '') {
    throw new Error(`${field} must be an absolute HTTPS URL without credentials.`);
  }
}

function normalizedKey(key: string): string {
  return key.toLowerCase().replaceAll(/[^a-z]/g, '');
}

function findProhibitedKey(value: JsonValue, path: readonly string[]): string | undefined {
  if (Array.isArray(value)) {
    for (const [index, child] of value.entries()) {
      const result = findProhibitedKey(child, [...path, String(index)]);
      if (result) return result;
    }
    return undefined;
  }
  if (value === null || typeof value !== 'object') return undefined;
  for (const [key, child] of Object.entries(value)) {
    const childPath = [...path, key];
    if (PROHIBITED_CANDIDATE_KEYS.has(normalizedKey(key))) return childPath.join('.');
    const result = findProhibitedKey(child, childPath);
    if (result) return result;
  }
  return undefined;
}

export function assertSourceConnectorCapability(capability: SourceConnectorCapabilityV1): void {
  assertId(capability.connectorId, 'connectorId');
  assertId(capability.connectorVersion, 'connectorVersion');
  assertId(capability.source.sourceId, 'sourceId');
  assertTimestamp(capability.approval.reviewedAt, 'approval.reviewedAt');
  assertHttpsUrl(capability.access.endpointOrigin, 'access.endpointOrigin');
  assertHttpsUrl(capability.rights.termsUrl, 'rights.termsUrl');
  const endpoint = new URL(capability.access.endpointOrigin);
  if (endpoint.pathname !== '/' || endpoint.search !== '' || endpoint.hash !== '') {
    throw new Error('access.endpointOrigin must contain an origin only.');
  }
  if (capability.dataMode === 'synthetic') {
    const hostname = endpoint.hostname;
    if (capability.approval.state === 'production_approved' || !hostname.endsWith('.invalid')) {
      throw new Error(
        'Synthetic connectors require synthetic approval and a reserved .invalid host.',
      );
    }
  } else if (
    capability.approval.state === 'synthetic_approved' ||
    endpoint.hostname.endsWith('.invalid')
  ) {
    throw new Error('Production connectors require a production approval class and host.');
  }
  if (
    capability.source.countries.length === 0 ||
    capability.source.recordTypes.length === 0 ||
    capability.content.expectedContentTypes.length === 0 ||
    capability.rights.licenseName.length === 0 ||
    capability.rights.attributionText.length === 0
  ) {
    throw new Error('Connector scope, content, licence, and attribution metadata are required.');
  }
  if (
    capability.content.maximumWireBytes < 1 ||
    capability.content.maximumDecodedBytes < capability.content.maximumWireBytes ||
    capability.content.maximumExpansionRatio < 1 ||
    capability.content.timeoutMs < 1 ||
    capability.content.maximumRedirects < 0 ||
    capability.access.rateLimitPerMinute < 1 ||
    capability.schedule.freshnessStaleMinutes < capability.schedule.freshnessExpectedMinutes
  ) {
    throw new Error('Connector size, timeout, rate, or freshness limits are invalid.');
  }
  if (
    capability.rights.redistribution === 'metadata_only' &&
    capability.rights.snapshotStorage !== 'prohibited'
  ) {
    throw new Error('Metadata-only rights cannot retain source snapshots.');
  }
}

export function assertSourceCandidate(candidate: SourceCandidateRecord): void {
  assertId(candidate.candidateId, 'candidateId');
  assertId(candidate.sourceId, 'sourceId');
  assertId(candidate.sourceRecordId, 'sourceRecordId');
  assertId(candidate.retrievalId, 'retrievalId');
  assertTimestamp(candidate.sourceEffectiveAt, 'sourceEffectiveAt');
  if (!SHA256_PATTERN.test(candidate.normalizedSha256)) {
    throw new Error('normalizedSha256 must be a lowercase SHA-256 digest.');
  }
  const prohibited = findProhibitedKey(candidate.publicPayload as JsonValue, []);
  if (prohibited) throw new Error(`Candidate payload contains prohibited field: ${prohibited}`);
  if (candidate.transformations.length < 2) {
    throw new Error('Candidate transformation history must include parsing and normalization.');
  }
  if (
    !candidate.transformations.some(({ kind }) => kind === 'parse') ||
    !candidate.transformations.some(({ kind }) => kind === 'normalize')
  ) {
    throw new Error('Candidate transformation history requires parse and normalize steps.');
  }
  for (const step of candidate.transformations) {
    assertId(step.stepId, 'transformation.stepId');
    if (!SHA256_PATTERN.test(step.inputSha256) || !SHA256_PATTERN.test(step.outputSha256)) {
      throw new Error('Transformation hashes must be lowercase SHA-256 digests.');
    }
    if (
      step.assistedByAi &&
      (step.modelProcessVersion === null || step.confidence === null || !step.requiresHumanReview)
    ) {
      throw new Error('AI assistance must remain versioned, confidence-labelled, and review-only.');
    }
    if (step.confidence !== null && (step.confidence < 0 || step.confidence > 1)) {
      throw new Error('Transformation confidence must be between zero and one.');
    }
  }
  if (candidate.reviewState === 'pending_review' && candidate.sourceAvailability !== 'available') {
    throw new Error(
      'Unavailable, stale, missing, or retracted source material must be quarantined.',
    );
  }
}

export function evaluatePersonMatch(
  hints: readonly MatchingHint[],
  registry: PublicRoleRegistrySnapshot,
): MatchOutcome {
  const nameHints = hints.filter(({ kind }) => kind === 'name');
  const contextualHints = hints.filter(({ kind }) => kind !== 'name');
  if (hints.some(({ kind }) => kind === 'source_conflict')) return 'conflict';
  if (nameHints.length > 0 && contextualHints.length === 0) return 'ambiguous';

  const officialIds = new Set(
    hints.filter(({ kind }) => kind === 'official_identifier').map(({ value }) => value),
  );
  const matchedPeople = new Set(
    registry.officialIdentifiers
      .filter(
        ({ entityKind, identifier }) => entityKind === 'person' && officialIds.has(identifier),
      )
      .map(({ entityId }) => entityId),
  );
  if (matchedPeople.size === 1 && contextualHints.length >= 1) return 'candidate_match';
  if (matchedPeople.size > 1) return 'conflict';
  return nameHints.length > 0 ? 'ambiguous' : 'unmatched';
}

export function approveCandidate(
  candidate: SourceCandidateRecord,
  decision: CandidateReviewDecision,
  options: {
    readonly recordId: string;
    readonly versionId: string;
    readonly supersedesVersionId?: string | null;
  },
): ReviewedSourceRecord {
  assertSourceCandidate(candidate);
  assertId(decision.decisionId, 'decisionId');
  assertId(decision.actorReference, 'actorReference');
  assertId(decision.policyVersion, 'policyVersion');
  assertId(decision.reasonCode, 'reasonCode');
  assertTimestamp(decision.decidedAt, 'decidedAt');
  if (decision.candidateId !== candidate.candidateId || decision.decision !== 'approve') {
    throw new Error('Only an explicit review approval for this candidate can create a record.');
  }
  if (candidate.reviewState !== 'pending_review' || candidate.matchOutcome === 'conflict') {
    throw new Error('Quarantined or conflicting candidates cannot be approved.');
  }
  assertId(options.recordId, 'recordId');
  assertId(options.versionId, 'versionId');
  return Object.freeze({
    approvedAt: decision.decidedAt,
    candidateId: candidate.candidateId,
    correctionState: 'active',
    publicPayload: candidate.publicPayload,
    recordId: options.recordId,
    recordType: candidate.recordType,
    retrievalId: candidate.retrievalId,
    reviewDecisionId: decision.decisionId,
    sourceEffectiveAt: candidate.sourceEffectiveAt,
    sourceId: candidate.sourceId,
    subject: candidate.subject,
    supersedesVersionId: options.supersedesVersionId ?? null,
    versionId: options.versionId,
  });
}

export function sourceIngestionDeferredFamilies(): readonly [
  'contributor_evidence',
  'runtime_ai_publication',
  'identity_updates',
  'provenance_writes',
  'representative_scoring',
] {
  return [
    'contributor_evidence',
    'runtime_ai_publication',
    'identity_updates',
    'provenance_writes',
    'representative_scoring',
  ];
}
