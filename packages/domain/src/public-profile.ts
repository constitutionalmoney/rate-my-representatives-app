export type PublicProfileAvailability =
  'available' | 'not_available' | 'unsupported' | 'stale' | 'coverage_gap';
export type PublicProfileContextKind = 'office_term' | 'candidacy';
export type PublicProfileTimelineKind =
  | 'office_term_transition'
  | 'candidacy_transition'
  | 'source_refresh'
  | 'correction'
  | 'response'
  | 'dispute'
  | 'appeal';

export interface PublicProfileSummary {
  readonly profileId: string;
  readonly personId: string;
  readonly displayName: string;
  readonly countryCode: 'CA' | 'US';
  readonly governmentLevel:
    'federal' | 'provincial' | 'territorial' | 'state' | 'municipal' | 'local' | 'special';
  readonly officeTitle: string;
  readonly districtLabel: string | null;
  readonly roleStatus:
    | 'current'
    | 'former'
    | 'acting'
    | 'appointed'
    | 'elected'
    | 'declared'
    | 'withdrawn'
    | 'disqualified'
    | 'historical';
  readonly context: {
    readonly kind: PublicProfileContextKind;
    readonly officeTermId: string | null;
    readonly candidacyId: string | null;
  };
  readonly availability: PublicProfileAvailability;
  readonly recordVersion: number;
  readonly updatedAt: string;
}

export interface PublicProfileTimelineItem {
  readonly timelineItemId: string;
  readonly kind: PublicProfileTimelineKind;
  readonly occurredAt: string;
  readonly summary: string;
  readonly sourceIds: readonly string[];
  readonly freshness: PublicProfileAvailability | 'current';
  readonly recordVersion: number;
}

export interface PublicRoleProfile {
  readonly schemaVersion: 'public-role-profile.v1';
  readonly dataMode: 'synthetic';
  readonly profileId: string;
  readonly recordVersion: number;
  readonly updatedAt: string;
  readonly etag: string;
  readonly publication: {
    readonly state: 'published';
    readonly method: 'human_review';
    readonly decisionId: string;
    readonly decidedAt: string;
  };
  readonly summary: PublicProfileSummary;
  readonly person: Readonly<Record<string, unknown>>;
  readonly office: Readonly<Record<string, unknown>>;
  readonly district: Readonly<Record<string, unknown>> | null;
  readonly officeTerm: Readonly<Record<string, unknown>> | null;
  readonly election: Readonly<Record<string, unknown>> | null;
  readonly candidacy: Readonly<Record<string, unknown>> | null;
  readonly officialContactRoutes: readonly Readonly<Record<string, unknown>>[];
  readonly claims: readonly Readonly<Record<string, unknown>>[];
  readonly sources: Readonly<Record<string, unknown>>;
  readonly coverage: Readonly<Record<string, unknown>>;
  readonly responses: Readonly<Record<string, unknown>>;
  readonly disputes: Readonly<Record<string, unknown>>;
  readonly corrections: Readonly<Record<string, unknown>>;
  readonly appeals: Readonly<Record<string, unknown>>;
  readonly method: {
    readonly profileMethodVersion: 'public-profile.v1';
    readonly coverageMethodVersion: 'source-coverage.v1';
    readonly compositeScoreIncluded: false;
    readonly signalAggregateIncluded: false;
  };
  readonly provenance: null | Readonly<Record<string, unknown>>;
  readonly externalIdentityReferences: readonly Readonly<Record<string, unknown>>[];
  readonly timelinePath: string;
}

interface InternalPublicProfileRecord {
  readonly publicationState: 'candidate' | 'published' | 'withdrawn';
  readonly publicationDecision: {
    readonly actorType: 'reviewer' | 'admin' | 'source_process';
    readonly decisionId: string;
    readonly decidedAt: string;
  } | null;
  readonly publicProfile: PublicRoleProfile;
  readonly timeline: readonly PublicProfileTimelineItem[];
  readonly privateState: {
    readonly accountId: string;
    readonly moderatorNotes: string;
    readonly preciseLocation: string;
    readonly representativeSignal: 'support' | 'concern';
    readonly walletPayload: string;
  };
}

export interface PublicProfileListQuery {
  readonly countryCode?: 'CA' | 'US';
  readonly contextKind?: PublicProfileContextKind;
}

export interface PublicProfileTimelineQuery {
  readonly cursor?: string;
  readonly kind?: PublicProfileTimelineKind;
  readonly limit?: number;
}

export interface PublicProfileSummaryCollection {
  readonly schemaVersion: 'public-role-profile-list.v1';
  readonly dataMode: 'synthetic';
  readonly generatedAt: string;
  readonly filters: {
    readonly countryCode: 'CA' | 'US' | null;
    readonly contextKind: PublicProfileContextKind | null;
  };
  readonly items: readonly PublicProfileSummary[];
  readonly page: { readonly limit: 50; readonly nextCursor: null };
}

export interface PublicProfileTimeline {
  readonly schemaVersion: 'public-role-profile-timeline.v1';
  readonly dataMode: 'synthetic';
  readonly profileId: string;
  readonly recordVersion: number;
  readonly updatedAt: string;
  readonly filters: { readonly kind: PublicProfileTimelineKind | null };
  readonly items: readonly PublicProfileTimelineItem[];
  readonly page: { readonly limit: number; readonly nextCursor: string | null };
}

const CA_REGISTRY_SOURCE = Object.freeze({
  sourceId: 'source:ca:synthetic-registry',
  publisher: 'Synthetic Canada Registry Publisher',
  sourceType: 'official_registry',
  originalUrl: 'synthetic://ca/registry/avery-quill',
  normalizedUrl: 'synthetic://ca/registry/avery-quill',
  retrievedAt: '2026-08-07T15:00:00Z',
  contentSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  licenceNote: 'Synthetic fixture; no real public record is represented.',
  termsUrl: 'synthetic://ca/terms',
  freshness: 'current',
  fetchOutcome: 'succeeded',
  reviewedRecordVersionId: 'reviewed-version:ca:registry:1',
});

const CA_LEGISLATURE_SOURCE = Object.freeze({
  sourceId: 'source:ca:synthetic-legislature',
  publisher: 'Synthetic Maple Legislature',
  sourceType: 'official_legislative_record',
  originalUrl: 'synthetic://ca/legislature/vote-101',
  normalizedUrl: 'synthetic://ca/legislature/vote-101',
  retrievedAt: '2026-08-07T15:00:00Z',
  contentSha256: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  licenceNote: 'Synthetic fixture; no real vote is represented.',
  termsUrl: 'synthetic://ca/terms',
  freshness: 'current',
  fetchOutcome: 'succeeded',
  reviewedRecordVersionId: 'reviewed-version:ca:legislature:1',
});

const US_ELECTION_SOURCE = Object.freeze({
  sourceId: 'source:us:synthetic-election',
  publisher: 'Synthetic Example State Elections Office',
  sourceType: 'official_election_record',
  originalUrl: 'synthetic://us/elections/morgan-fields',
  normalizedUrl: 'synthetic://us/elections/morgan-fields',
  retrievedAt: '2026-08-07T15:05:00Z',
  contentSha256: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  licenceNote: 'Synthetic fixture; no real candidacy is represented.',
  termsUrl: 'synthetic://us/terms',
  freshness: 'current',
  fetchOutcome: 'succeeded',
  reviewedRecordVersionId: 'reviewed-version:us:election:1',
});

const US_STATEMENT_SOURCE = Object.freeze({
  sourceId: 'source:us:synthetic-statement',
  publisher: 'Synthetic Morgan Fields Campaign',
  sourceType: 'official_statement',
  originalUrl: 'synthetic://us/statements/withdrawal',
  normalizedUrl: 'synthetic://us/statements/withdrawal',
  retrievedAt: '2026-08-07T15:05:00Z',
  contentSha256: 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  licenceNote: 'Synthetic fixture; no real statement is represented.',
  termsUrl: 'synthetic://us/terms',
  freshness: 'current',
  fetchOutcome: 'succeeded',
  reviewedRecordVersionId: 'reviewed-version:us:statement:1',
});

const CA_PROFILE = Object.freeze({
  schemaVersion: 'public-role-profile.v1',
  dataMode: 'synthetic',
  profileId: 'profile:ca:avery-quill:maple-member:2024',
  recordVersion: 3,
  updatedAt: '2026-08-07T15:00:00Z',
  etag: 'W/"profile:ca:avery-quill:maple-member:2024.v3"',
  publication: {
    state: 'published',
    method: 'human_review',
    decisionId: 'publication-decision:ca:profile:1',
    decidedAt: '2026-08-07T15:00:00Z',
  },
  summary: {
    profileId: 'profile:ca:avery-quill:maple-member:2024',
    personId: 'person:ca:avery-quill',
    displayName: 'Avery Quill',
    countryCode: 'CA',
    governmentLevel: 'provincial',
    officeTitle: 'Member of the Synthetic Maple Assembly',
    districtLabel: 'Maple North',
    roleStatus: 'appointed',
    context: {
      kind: 'office_term',
      officeTermId: 'office-term:ca:avery-quill:2024',
      candidacyId: null,
    },
    availability: 'available',
    recordVersion: 3,
    updatedAt: '2026-08-07T15:00:00Z',
  },
  person: {
    personId: 'person:ca:avery-quill',
    displayName: 'Avery Quill',
    officialIdentifiers: [
      {
        identifierId: 'official-id:ca:avery-quill',
        issuer: 'synthetic-maple-registry',
        value: 'SYN-CA-PERSON-001',
        sourceIds: ['source:ca:synthetic-registry'],
        freshness: 'current',
      },
    ],
  },
  office: {
    officeId: 'office:ca:maple-member',
    title: 'Member of the Synthetic Maple Assembly',
    governmentLevel: 'provincial',
    selectionMethod: 'appointed',
    sourceIds: ['source:ca:synthetic-registry'],
    freshness: 'current',
  },
  district: {
    districtId: 'district:ca:maple-north',
    label: 'Maple North',
    sourceIds: ['source:ca:synthetic-registry'],
    freshness: 'current',
  },
  officeTerm: {
    officeTermId: 'office-term:ca:avery-quill:2024',
    state: 'active',
    origin: 'appointment',
    serviceCapacity: 'regular',
    plannedStart: '2024-01-01T00:00:00Z',
    plannedEnd: null,
    sourceIds: ['source:ca:synthetic-registry'],
    freshness: 'current',
  },
  election: null,
  candidacy: null,
  officialContactRoutes: [
    {
      contactRouteId: 'contact:ca:avery:office-url',
      kind: 'office_url',
      value: 'https://avery-quill.synthetic.invalid/',
      sourceIds: ['source:ca:synthetic-registry'],
      freshness: 'current',
    },
  ],
  claims: [
    {
      claimId: 'claim:ca:avery:vote-101:v2',
      category: 'vote',
      label: 'Synthetic Bill 101 vote',
      value: 'Recorded as present and voting yes in the synthetic fixture.',
      status: 'corrected',
      sourceIds: ['source:ca:synthetic-legislature'],
      freshness: 'current',
      observedAt: '2026-07-15T17:00:00Z',
      conflictState: 'clear',
      evidence: {
        supportingSourceIds: ['source:ca:synthetic-legislature'],
        challengingSourceIds: [],
        note: 'A prior synthetic fixture value was corrected after human review.',
      },
      updatedAt: '2026-08-07T15:00:00Z',
    },
  ],
  sources: {
    schemaVersion: 'public-role-profile-sources.v1',
    profileId: 'profile:ca:avery-quill:maple-member:2024',
    recordVersion: 3,
    updatedAt: '2026-08-07T15:00:00Z',
    items: [CA_REGISTRY_SOURCE, CA_LEGISLATURE_SOURCE],
  },
  coverage: {
    schemaVersion: 'public-role-profile-coverage.v1',
    profileId: 'profile:ca:avery-quill:maple-member:2024',
    recordVersion: 3,
    updatedAt: '2026-08-07T15:00:00Z',
    methodVersion: 'source-coverage.v1',
    missingDataMeaning: 'coverage_gap_not_misconduct',
    items: [
      {
        category: 'identity',
        state: 'available',
        explanation: 'Reviewed synthetic registry fixture is available.',
        lastReviewedAt: '2026-08-07T15:00:00Z',
        sourceIds: ['source:ca:synthetic-registry'],
      },
      {
        category: 'votes',
        state: 'available',
        explanation: 'One reviewed synthetic vote fixture is available.',
        lastReviewedAt: '2026-08-07T15:00:00Z',
        sourceIds: ['source:ca:synthetic-legislature'],
      },
      {
        category: 'expenses',
        state: 'coverage_gap',
        explanation: 'No approved synthetic expense source is configured.',
        lastReviewedAt: null,
        sourceIds: [],
      },
      {
        category: 'disclosures',
        state: 'unsupported',
        explanation: 'This synthetic jurisdiction does not define a disclosure connector.',
        lastReviewedAt: null,
        sourceIds: [],
      },
      {
        category: 'attendance',
        state: 'not_available',
        explanation: 'No reviewed attendance record is available for this synthetic term.',
        lastReviewedAt: null,
        sourceIds: [],
      },
    ],
    conflicts: [],
  },
  responses: {
    schemaVersion: 'public-role-profile-responses.v1',
    profileId: 'profile:ca:avery-quill:maple-member:2024',
    recordVersion: 3,
    updatedAt: '2026-08-07T15:00:00Z',
    availability: 'not_available',
    items: [],
  },
  disputes: {
    schemaVersion: 'public-role-profile-disputes.v1',
    profileId: 'profile:ca:avery-quill:maple-member:2024',
    recordVersion: 3,
    updatedAt: '2026-08-07T15:00:00Z',
    availability: 'not_available',
    items: [],
  },
  corrections: {
    schemaVersion: 'public-role-profile-corrections.v1',
    profileId: 'profile:ca:avery-quill:maple-member:2024',
    recordVersion: 3,
    updatedAt: '2026-08-07T15:00:00Z',
    availability: 'available',
    items: [
      {
        correctionId: 'correction:ca:avery:vote-101',
        correctedAt: '2026-08-07T15:00:00Z',
        summary: 'Corrected the synthetic vote value after review of the source fixture.',
        supersedesClaimId: 'claim:ca:avery:vote-101:v1',
        replacementClaimId: 'claim:ca:avery:vote-101:v2',
        sourceIds: ['source:ca:synthetic-legislature'],
      },
    ],
  },
  appeals: {
    schemaVersion: 'public-role-profile-appeals.v1',
    profileId: 'profile:ca:avery-quill:maple-member:2024',
    recordVersion: 3,
    updatedAt: '2026-08-07T15:00:00Z',
    availability: 'not_available',
    items: [],
  },
  method: {
    profileMethodVersion: 'public-profile.v1',
    coverageMethodVersion: 'source-coverage.v1',
    compositeScoreIncluded: false,
    signalAggregateIncluded: false,
  },
  provenance: null,
  externalIdentityReferences: [],
  timelinePath: '/api/v1/profiles/profile:ca:avery-quill:maple-member:2024/timeline',
} satisfies PublicRoleProfile);

const US_PROFILE = Object.freeze({
  schemaVersion: 'public-role-profile.v1',
  dataMode: 'synthetic',
  profileId: 'profile:us:morgan-fields:state-senate:2026',
  recordVersion: 2,
  updatedAt: '2026-08-07T15:05:00Z',
  etag: 'W/"profile:us:morgan-fields:state-senate:2026.v2"',
  publication: {
    state: 'published',
    method: 'human_review',
    decisionId: 'publication-decision:us:profile:1',
    decidedAt: '2026-08-07T15:05:00Z',
  },
  summary: {
    profileId: 'profile:us:morgan-fields:state-senate:2026',
    personId: 'person:us:morgan-fields',
    displayName: 'Morgan Fields',
    countryCode: 'US',
    governmentLevel: 'state',
    officeTitle: 'Synthetic State Senator',
    districtLabel: 'Example District 12',
    roleStatus: 'withdrawn',
    context: {
      kind: 'candidacy',
      officeTermId: null,
      candidacyId: 'candidacy:us:morgan-fields:2026',
    },
    availability: 'available',
    recordVersion: 2,
    updatedAt: '2026-08-07T15:05:00Z',
  },
  person: {
    personId: 'person:us:morgan-fields',
    displayName: 'Morgan Fields',
    officialIdentifiers: [
      {
        identifierId: 'official-id:us:morgan-fields',
        issuer: 'synthetic-example-elections',
        value: 'MORGAN-FIELDS-001',
        sourceIds: ['source:us:synthetic-election'],
        freshness: 'current',
      },
    ],
  },
  office: {
    officeId: 'office:us:example-state-senator',
    title: 'Synthetic State Senator',
    governmentLevel: 'state',
    selectionMethod: 'elected',
    sourceIds: ['source:us:synthetic-election'],
    freshness: 'current',
  },
  district: {
    districtId: 'district:us:example-12',
    label: 'Example District 12',
    sourceIds: ['source:us:synthetic-election'],
    freshness: 'current',
  },
  officeTerm: null,
  election: {
    electionId: 'election:us:example-state:2026',
    name: '2026 Synthetic Example State Election',
    kind: 'general',
    state: 'scheduled',
    scheduledAt: '2026-11-03T15:00:00Z',
    sourceIds: ['source:us:synthetic-election'],
    freshness: 'current',
  },
  candidacy: {
    candidacyId: 'candidacy:us:morgan-fields:2026',
    state: 'withdrawn',
    sourceIds: ['source:us:synthetic-election', 'source:us:synthetic-statement'],
    freshness: 'current',
  },
  officialContactRoutes: [],
  claims: [
    {
      claimId: 'claim:us:morgan:withdrawal',
      category: 'documented_event',
      label: 'Synthetic candidacy withdrawal',
      value: 'The synthetic candidacy is recorded as withdrawn.',
      status: 'reviewed',
      sourceIds: ['source:us:synthetic-election', 'source:us:synthetic-statement'],
      freshness: 'current',
      observedAt: '2026-08-01T17:00:00Z',
      conflictState: 'conflicting',
      evidence: {
        supportingSourceIds: ['source:us:synthetic-election'],
        challengingSourceIds: ['source:us:synthetic-statement'],
        note: 'Synthetic sources use different effective timestamps; the conflict remains visible.',
      },
      updatedAt: '2026-08-07T15:05:00Z',
    },
  ],
  sources: {
    schemaVersion: 'public-role-profile-sources.v1',
    profileId: 'profile:us:morgan-fields:state-senate:2026',
    recordVersion: 2,
    updatedAt: '2026-08-07T15:05:00Z',
    items: [US_ELECTION_SOURCE, US_STATEMENT_SOURCE],
  },
  coverage: {
    schemaVersion: 'public-role-profile-coverage.v1',
    profileId: 'profile:us:morgan-fields:state-senate:2026',
    recordVersion: 2,
    updatedAt: '2026-08-07T15:05:00Z',
    methodVersion: 'source-coverage.v1',
    missingDataMeaning: 'coverage_gap_not_misconduct',
    items: [
      {
        category: 'identity',
        state: 'available',
        explanation: 'Reviewed synthetic election fixture is available.',
        lastReviewedAt: '2026-08-07T15:05:00Z',
        sourceIds: ['source:us:synthetic-election'],
      },
      {
        category: 'events_outcomes',
        state: 'available',
        explanation: 'The synthetic candidacy transition is available with a visible conflict.',
        lastReviewedAt: '2026-08-07T15:05:00Z',
        sourceIds: ['source:us:synthetic-election', 'source:us:synthetic-statement'],
      },
      {
        category: 'votes',
        state: 'unsupported',
        explanation: 'A candidacy without an office term has no legislative vote coverage.',
        lastReviewedAt: null,
        sourceIds: [],
      },
      {
        category: 'expenses',
        state: 'stale',
        explanation: 'The synthetic expense feed has exceeded its freshness policy.',
        lastReviewedAt: '2026-06-01T00:00:00Z',
        sourceIds: [],
      },
    ],
    conflicts: [
      {
        conflictId: 'conflict:us:morgan:withdrawal-time',
        field: 'candidacy.withdrawnAt',
        state: 'open',
        sourceIds: ['source:us:synthetic-election', 'source:us:synthetic-statement'],
        explanation: 'The two synthetic sources report different effective timestamps.',
      },
    ],
  },
  responses: {
    schemaVersion: 'public-role-profile-responses.v1',
    profileId: 'profile:us:morgan-fields:state-senate:2026',
    recordVersion: 2,
    updatedAt: '2026-08-07T15:05:00Z',
    availability: 'unsupported',
    items: [],
  },
  disputes: {
    schemaVersion: 'public-role-profile-disputes.v1',
    profileId: 'profile:us:morgan-fields:state-senate:2026',
    recordVersion: 2,
    updatedAt: '2026-08-07T15:05:00Z',
    availability: 'not_available',
    items: [],
  },
  corrections: {
    schemaVersion: 'public-role-profile-corrections.v1',
    profileId: 'profile:us:morgan-fields:state-senate:2026',
    recordVersion: 2,
    updatedAt: '2026-08-07T15:05:00Z',
    availability: 'not_available',
    items: [],
  },
  appeals: {
    schemaVersion: 'public-role-profile-appeals.v1',
    profileId: 'profile:us:morgan-fields:state-senate:2026',
    recordVersion: 2,
    updatedAt: '2026-08-07T15:05:00Z',
    availability: 'not_available',
    items: [],
  },
  method: {
    profileMethodVersion: 'public-profile.v1',
    coverageMethodVersion: 'source-coverage.v1',
    compositeScoreIncluded: false,
    signalAggregateIncluded: false,
  },
  provenance: null,
  externalIdentityReferences: [],
  timelinePath: '/api/v1/profiles/profile:us:morgan-fields:state-senate:2026/timeline',
} satisfies PublicRoleProfile);

export const SYNTHETIC_PUBLIC_PROFILE_GENERATED_AT = '2026-08-07T15:05:00Z';

export const SYNTHETIC_PUBLIC_PROFILE_RECORDS: readonly InternalPublicProfileRecord[] =
  Object.freeze([
    Object.freeze({
      publicationState: 'published',
      publicationDecision: {
        actorType: 'reviewer',
        decisionId: 'publication-decision:ca:profile:1',
        decidedAt: '2026-08-07T15:00:00Z',
      },
      publicProfile: CA_PROFILE,
      timeline: [
        {
          timelineItemId: 'timeline:ca:avery:term-active',
          kind: 'office_term_transition',
          occurredAt: '2024-01-01T00:00:00Z',
          summary: 'Synthetic appointed office term became active.',
          sourceIds: ['source:ca:synthetic-registry'],
          freshness: 'current',
          recordVersion: 1,
        },
        {
          timelineItemId: 'timeline:ca:avery:source-refresh',
          kind: 'source_refresh',
          occurredAt: '2026-08-07T14:55:00Z',
          summary: 'Synthetic registry and legislative source records were refreshed.',
          sourceIds: ['source:ca:synthetic-registry', 'source:ca:synthetic-legislature'],
          freshness: 'current',
          recordVersion: 2,
        },
        {
          timelineItemId: 'timeline:ca:avery:correction',
          kind: 'correction',
          occurredAt: '2026-08-07T15:00:00Z',
          summary: 'A reviewed synthetic vote claim was corrected.',
          sourceIds: ['source:ca:synthetic-legislature'],
          freshness: 'current',
          recordVersion: 3,
        },
      ],
      privateState: {
        accountId: 'account:private:ca:1',
        moderatorNotes: 'Never public.',
        preciseLocation: 'Private synthetic location.',
        representativeSignal: 'support',
        walletPayload: 'Never public.',
      },
    } satisfies InternalPublicProfileRecord),
    Object.freeze({
      publicationState: 'published',
      publicationDecision: {
        actorType: 'admin',
        decisionId: 'publication-decision:us:profile:1',
        decidedAt: '2026-08-07T15:05:00Z',
      },
      publicProfile: US_PROFILE,
      timeline: [
        {
          timelineItemId: 'timeline:us:morgan:declared',
          kind: 'candidacy_transition',
          occurredAt: '2026-02-01T17:00:00Z',
          summary: 'Synthetic candidacy was declared.',
          sourceIds: ['source:us:synthetic-election'],
          freshness: 'current',
          recordVersion: 1,
        },
        {
          timelineItemId: 'timeline:us:morgan:withdrawn',
          kind: 'candidacy_transition',
          occurredAt: '2026-08-01T17:00:00Z',
          summary: 'Synthetic candidacy was marked withdrawn with a visible source conflict.',
          sourceIds: ['source:us:synthetic-election', 'source:us:synthetic-statement'],
          freshness: 'current',
          recordVersion: 2,
        },
      ],
      privateState: {
        accountId: 'account:private:us:1',
        moderatorNotes: 'Never public.',
        preciseLocation: 'Private synthetic location.',
        representativeSignal: 'concern',
        walletPayload: 'Never public.',
      },
    } satisfies InternalPublicProfileRecord),
  ]);

function clonePublicProfile(profile: PublicRoleProfile): PublicRoleProfile {
  return structuredClone(profile);
}

function readableRecord(record: InternalPublicProfileRecord): boolean {
  return (
    record.publicationState === 'published' &&
    record.publicationDecision !== null &&
    (record.publicationDecision.actorType === 'reviewer' ||
      record.publicationDecision.actorType === 'admin')
  );
}

export function readPublicProfile(profileId: string): PublicRoleProfile | undefined {
  const record = SYNTHETIC_PUBLIC_PROFILE_RECORDS.find(
    ({ publicProfile }) => publicProfile.profileId === profileId,
  );
  return record && readableRecord(record) ? clonePublicProfile(record.publicProfile) : undefined;
}

export function listPublicProfiles(
  query: PublicProfileListQuery = {},
): PublicProfileSummaryCollection {
  const items = SYNTHETIC_PUBLIC_PROFILE_RECORDS.filter(readableRecord)
    .map(({ publicProfile }) => publicProfile.summary)
    .filter(
      (summary) =>
        (query.countryCode === undefined || summary.countryCode === query.countryCode) &&
        (query.contextKind === undefined || summary.context.kind === query.contextKind),
    )
    .sort((left, right) => left.profileId.localeCompare(right.profileId))
    .map((summary) => structuredClone(summary));
  return {
    schemaVersion: 'public-role-profile-list.v1',
    dataMode: 'synthetic',
    generatedAt: SYNTHETIC_PUBLIC_PROFILE_GENERATED_AT,
    filters: {
      countryCode: query.countryCode ?? null,
      contextKind: query.contextKind ?? null,
    },
    items,
    page: { limit: 50, nextCursor: null },
  };
}

export function readPublicProfileTimeline(
  profileId: string,
  query: PublicProfileTimelineQuery = {},
): PublicProfileTimeline | undefined {
  const record = SYNTHETIC_PUBLIC_PROFILE_RECORDS.find(
    ({ publicProfile }) => publicProfile.profileId === profileId,
  );
  if (!record || !readableRecord(record)) return undefined;
  const limit = query.limit ?? 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error('Timeline limit must be an integer from 1 through 50.');
  }
  const filtered = record.timeline
    .filter(({ kind }) => query.kind === undefined || kind === query.kind)
    .sort((left, right) => {
      const timestampOrder = right.occurredAt.localeCompare(left.occurredAt);
      return timestampOrder === 0
        ? left.timelineItemId.localeCompare(right.timelineItemId)
        : timestampOrder;
    });
  const start =
    query.cursor === undefined
      ? 0
      : filtered.findIndex(({ timelineItemId }) => timelineItemId === query.cursor) + 1;
  if (query.cursor !== undefined && start === 0) throw new Error('Timeline cursor is invalid.');
  const items = filtered.slice(start, start + limit).map((item) => structuredClone(item));
  const nextCursor =
    start + limit < filtered.length ? (items.at(-1)?.timelineItemId ?? null) : null;
  return {
    schemaVersion: 'public-role-profile-timeline.v1',
    dataMode: 'synthetic',
    profileId,
    recordVersion: record.publicProfile.recordVersion,
    updatedAt: record.publicProfile.updatedAt,
    filters: { kind: query.kind ?? null },
    items,
    page: { limit, nextCursor },
  };
}

export function profileEtag(profileId: string): string | undefined {
  return readPublicProfile(profileId)?.etag;
}

export function advancePublicProfileVersion(
  profile: PublicRoleProfile,
  update: { readonly kind: 'correction' | 'source_refresh'; readonly updatedAt: string },
): PublicRoleProfile {
  if (!Number.isFinite(Date.parse(update.updatedAt)))
    throw new Error('updatedAt must be a timestamp.');
  if (Date.parse(update.updatedAt) <= Date.parse(profile.updatedAt)) {
    throw new Error('A profile update must advance updatedAt.');
  }
  const recordVersion = profile.recordVersion + 1;
  const etag = `W/"${profile.profileId}.v${recordVersion}"`;
  return {
    ...structuredClone(profile),
    recordVersion,
    updatedAt: update.updatedAt,
    etag,
    summary: { ...structuredClone(profile.summary), recordVersion, updatedAt: update.updatedAt },
    sources: { ...structuredClone(profile.sources), recordVersion, updatedAt: update.updatedAt },
    coverage: { ...structuredClone(profile.coverage), recordVersion, updatedAt: update.updatedAt },
    responses: {
      ...structuredClone(profile.responses),
      recordVersion,
      updatedAt: update.updatedAt,
    },
    disputes: { ...structuredClone(profile.disputes), recordVersion, updatedAt: update.updatedAt },
    corrections: {
      ...structuredClone(profile.corrections),
      recordVersion,
      updatedAt: update.updatedAt,
    },
    appeals: {
      ...structuredClone(profile.appeals),
      recordVersion,
      updatedAt: update.updatedAt,
    },
  };
}

export function publicProfileDeferredWrites(): readonly [
  'automatic_publication',
  'representative_signals',
  'composite_scoring',
  'identity_updates',
  'provenance_writes',
  'mainnet',
] {
  return [
    'automatic_publication',
    'representative_signals',
    'composite_scoring',
    'identity_updates',
    'provenance_writes',
    'mainnet',
  ];
}
