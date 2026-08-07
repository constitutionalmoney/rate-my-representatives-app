import type {
  CandidacyId,
  CandidacyState,
  ElectionId,
  LifecycleReview,
  LifecycleTransition,
  LifecycleTransitionId,
  OfficialIdentifierId,
  OfficeTermId,
  OfficeTermState,
  PersonId,
  PersonNameId,
  PersonResolutionDecisionId,
  PublicRoleRegistrySnapshot,
} from './public-role-registry.js';
import { assertionId } from './public-role-registry.js';
import type {
  DistrictId,
  JurisdictionId,
  OfficeId,
  PublicBodyId,
  RegistryAttribution,
} from './jurisdiction-registry.js';

const person = (value: string) => value as PersonId;
const personName = (value: string) => value as PersonNameId;
const officeTerm = (value: string) => value as OfficeTermId;
const election = (value: string) => value as ElectionId;
const candidacy = (value: string) => value as CandidacyId;
const transition = (value: string) => value as LifecycleTransitionId;
const officialIdentifier = (value: string) => value as OfficialIdentifierId;
const decision = (value: string) => value as PersonResolutionDecisionId;
const jurisdiction = (value: string) => value as JurisdictionId;
const district = (value: string) => value as DistrictId;
const body = (value: string) => value as PublicBodyId;
const office = (value: string) => value as OfficeId;

function attribution(
  key: string,
  supersedes: string | null = null,
  conflict: RegistryAttribution['conflict'] = 'clear',
): RegistryAttribution {
  return Object.freeze({
    assertionId: assertionId(`assertion:public-role:${key}`),
    conflict,
    coverage: conflict === 'conflicting' ? 'partial' : 'supported',
    freshness: 'current',
    observedAt: '2026-08-07T12:00:00.000Z',
    sourceReference: `synthetic://public-role/${key.replaceAll(':', '/')}`,
    supersedesAssertionId: supersedes === null ? null : assertionId(supersedes),
  });
}

function review(reasonCode: string, privateNotes: string | null = null): LifecycleReview {
  return Object.freeze({
    actorReference: 'reviewer:synthetic:public-role',
    actorType: 'reviewer',
    privateNotes,
    process: 'synthetic_seed',
    reasonCode,
    recordedAt: '2026-08-07T12:00:00.000Z',
  });
}

function termTransition(
  id: string,
  fromState: OfficeTermState | null,
  toState: OfficeTermState,
  effectiveAt: string,
  reasonCode: string,
): LifecycleTransition<OfficeTermState> {
  return Object.freeze({
    attribution: attribution(`term-transition:${id}`),
    effectiveAt,
    fromState,
    review: review(reasonCode, 'Synthetic reviewer note excluded from public serializers.'),
    toState,
    transitionId: transition(`transition:term:${id}`),
  });
}

function candidacyTransition(
  id: string,
  fromState: CandidacyState | null,
  toState: CandidacyState,
  effectiveAt: string,
  reasonCode: string,
): LifecycleTransition<CandidacyState> {
  return Object.freeze({
    attribution: attribution(`candidacy-transition:${id}`),
    effectiveAt,
    fromState,
    review: review(reasonCode, 'Synthetic reviewer note excluded from public serializers.'),
    toState,
    transitionId: transition(`transition:candidacy:${id}`),
  });
}

export const SYNTHETIC_PUBLIC_ROLE_REGISTRY = Object.freeze({
  candidacies: [
    {
      candidacyId: candidacy('candidacy:ca:avery:maple-2027'),
      countryCode: 'CA',
      districtId: district('district:ca:maple-provincial'),
      electionId: election('election:ca:maple-2027'),
      jurisdictionId: jurisdiction('jurisdiction:ca:maple'),
      officeId: office('office:ca:maple-member'),
      personId: person('person:ca:avery-quill'),
      transitions: [
        candidacyTransition(
          'ca:avery:declared',
          null,
          'declared',
          '2026-01-05T00:00:00Z',
          'PUBLIC_DECLARATION_REVIEWED',
        ),
        candidacyTransition(
          'ca:avery:registered',
          'declared',
          'registered',
          '2026-02-10T00:00:00Z',
          'OFFICIAL_REGISTRATION_REVIEWED',
        ),
        candidacyTransition(
          'ca:avery:qualified',
          'registered',
          'qualified',
          '2026-03-01T00:00:00Z',
          'QUALIFICATION_REVIEWED',
        ),
        candidacyTransition(
          'ca:avery:active',
          'qualified',
          'active',
          '2026-03-15T00:00:00Z',
          'ACTIVE_BALLOT_STATUS_REVIEWED',
        ),
      ],
    },
    {
      candidacyId: candidacy('candidacy:ca:rowan:north-2025'),
      countryCode: 'CA',
      districtId: null,
      electionId: election('election:ca:north-2025'),
      jurisdictionId: jurisdiction('jurisdiction:ca:north-region'),
      officeId: office('office:ca:harbour-mayor'),
      personId: person('person:ca:rowan-lake'),
      transitions: [
        candidacyTransition(
          'ca:rowan:declared',
          null,
          'declared',
          '2025-01-10T00:00:00Z',
          'PUBLIC_DECLARATION_REVIEWED',
        ),
        candidacyTransition(
          'ca:rowan:active',
          'declared',
          'active',
          '2025-02-15T00:00:00Z',
          'ACTIVE_BALLOT_STATUS_REVIEWED',
        ),
        candidacyTransition(
          'ca:rowan:won',
          'active',
          'won',
          '2025-06-01T00:00:00Z',
          'ELECTION_RESULT_REVIEWED',
        ),
      ],
    },
    {
      candidacyId: candidacy('candidacy:us:morgan-fields:state-2026'),
      countryCode: 'US',
      districtId: district('district:us:state-senate'),
      electionId: election('election:us:state-2026'),
      jurisdictionId: jurisdiction('jurisdiction:us:example-state'),
      officeId: office('office:us:state-senator'),
      personId: person('person:us:morgan-fields'),
      transitions: [
        candidacyTransition(
          'us:fields:registered',
          null,
          'registered',
          '2026-01-20T00:00:00Z',
          'OFFICIAL_REGISTRATION_REVIEWED',
        ),
        candidacyTransition(
          'us:fields:qualified',
          'registered',
          'qualified',
          '2026-02-20T00:00:00Z',
          'QUALIFICATION_REVIEWED',
        ),
        candidacyTransition(
          'us:fields:active',
          'qualified',
          'active',
          '2026-03-20T00:00:00Z',
          'ACTIVE_BALLOT_STATUS_REVIEWED',
        ),
        candidacyTransition(
          'us:fields:defeated',
          'active',
          'defeated',
          '2026-07-15T00:00:00Z',
          'ELECTION_RESULT_REVIEWED',
        ),
      ],
    },
    {
      candidacyId: candidacy('candidacy:us:morgan-field:state-2026'),
      countryCode: 'US',
      districtId: district('district:us:state-senate'),
      electionId: election('election:us:state-2026'),
      jurisdictionId: jurisdiction('jurisdiction:us:example-state'),
      officeId: office('office:us:state-senator'),
      personId: person('person:us:morgan-field'),
      transitions: [
        candidacyTransition(
          'us:field:declared',
          null,
          'declared',
          '2026-01-22T00:00:00Z',
          'PUBLIC_DECLARATION_REVIEWED',
        ),
        candidacyTransition(
          'us:field:disqualified',
          'declared',
          'disqualified',
          '2026-02-25T00:00:00Z',
          'DISQUALIFICATION_REVIEWED',
        ),
      ],
    },
    {
      candidacyId: candidacy('candidacy:ca:sam-a:maple-2027'),
      countryCode: 'CA',
      districtId: district('district:ca:maple-provincial'),
      electionId: election('election:ca:maple-2027'),
      jurisdictionId: jurisdiction('jurisdiction:ca:maple'),
      officeId: office('office:ca:maple-member'),
      personId: person('person:ca:sam-harbour-a'),
      transitions: [
        candidacyTransition(
          'ca:sam-a:declared',
          null,
          'declared',
          '2026-01-07T00:00:00Z',
          'PUBLIC_DECLARATION_REVIEWED',
        ),
        candidacyTransition(
          'ca:sam-a:withdrawn',
          'declared',
          'withdrawn',
          '2026-02-05T00:00:00Z',
          'WITHDRAWAL_REVIEWED',
        ),
      ],
    },
  ],
  dataMode: 'synthetic',
  elections: [
    {
      countryCode: 'CA',
      districtId: district('district:ca:maple-provincial'),
      electionId: election('election:ca:maple-2027'),
      jurisdictionId: jurisdiction('jurisdiction:ca:maple'),
      officeId: office('office:ca:maple-member'),
      publicBodyId: body('body:ca:maple-legislature'),
      versions: [
        {
          attribution: attribution('election:ca:maple-2027'),
          effectiveFrom: '2026-01-01T00:00:00Z',
          effectiveTo: null,
          kind: 'general',
          name: 'Synthetic Maple 2027 General Election',
          scheduledAt: '2027-05-01T00:00:00Z',
          state: 'scheduled',
          versionId: 'election-version:ca:maple-2027',
        },
      ],
    },
    {
      countryCode: 'CA',
      districtId: null,
      electionId: election('election:ca:north-2025'),
      jurisdictionId: jurisdiction('jurisdiction:ca:north-region'),
      officeId: office('office:ca:harbour-mayor'),
      publicBodyId: body('body:ca:harbour-council'),
      versions: [
        {
          attribution: attribution('election:ca:north-2025'),
          effectiveFrom: '2025-01-01T00:00:00Z',
          effectiveTo: null,
          kind: 'by_election',
          name: 'Synthetic North 2025 By-election',
          scheduledAt: '2025-05-31T00:00:00Z',
          state: 'completed',
          versionId: 'election-version:ca:north-2025',
        },
      ],
    },
    {
      countryCode: 'US',
      districtId: district('district:us:state-senate'),
      electionId: election('election:us:state-2026'),
      jurisdictionId: jurisdiction('jurisdiction:us:example-state'),
      officeId: office('office:us:state-senator'),
      publicBodyId: body('body:us:state-legislature'),
      versions: [
        {
          attribution: attribution('election:us:state-2026'),
          effectiveFrom: '2026-01-01T00:00:00Z',
          effectiveTo: null,
          kind: 'general',
          name: 'Synthetic Example State 2026 Election',
          scheduledAt: '2026-07-14T00:00:00Z',
          state: 'completed',
          versionId: 'election-version:us:state-2026',
        },
      ],
    },
  ],
  externalIdentityReferences: [],
  generatedAt: '2026-08-07T12:00:00.000Z',
  officeTermContacts: [
    {
      attribution: attribution('contact:ca:avery:url'),
      contactId: 'contact:term:ca:avery:office-url',
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveTo: null,
      kind: 'office_url',
      officeTermId: officeTerm('term:ca:avery:maple-member:2026'),
      value: 'https://synthetic.invalid/ca/avery-office',
    },
    {
      attribution: attribution('contact:us:morgan:url'),
      contactId: 'contact:term:us:morgan:office-url',
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveTo: null,
      kind: 'office_url',
      officeTermId: officeTerm('term:us:morgan:water-director:2026'),
      value: 'https://synthetic.invalid/us/morgan-office',
    },
  ],
  officeTermRelationships: [
    {
      attribution: attribution('term-relationship:ca:avery:successor'),
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveTo: null,
      kind: 'successor_of',
      officeTermId: officeTerm('term:ca:avery:maple-member:2026'),
      relatedOfficeTermId: officeTerm('term:ca:avery:maple-member:2020'),
      relationshipId: 'term-relationship:ca:avery:2026:successor',
    },
  ],
  officeTerms: [
    {
      countryCode: 'CA',
      districtId: district('district:ca:maple-provincial'),
      jurisdictionId: jurisdiction('jurisdiction:ca:maple'),
      officeId: office('office:ca:maple-member'),
      officeTermId: officeTerm('term:ca:avery:maple-member:2020'),
      origin: 'election_result',
      personId: person('person:ca:avery-quill'),
      plannedEnd: '2025-12-31T00:00:00Z',
      plannedStart: '2020-01-01T00:00:00Z',
      publicBodyId: body('body:ca:maple-legislature'),
      selectionMethod: 'elected',
      serviceCapacity: 'regular',
      transitions: [
        termTransition(
          'ca:avery:2020:pending',
          null,
          'pending',
          '2019-12-15T00:00:00Z',
          'ELECTION_RESULT_REVIEWED',
        ),
        termTransition(
          'ca:avery:2020:active',
          'pending',
          'active',
          '2020-01-01T00:00:00Z',
          'TERM_START_REVIEWED',
        ),
        termTransition(
          'ca:avery:2020:ended',
          'active',
          'ended',
          '2025-12-31T00:00:00Z',
          'TERM_END_REVIEWED',
        ),
      ],
    },
    {
      countryCode: 'CA',
      districtId: district('district:ca:maple-provincial'),
      jurisdictionId: jurisdiction('jurisdiction:ca:maple'),
      officeId: office('office:ca:maple-member'),
      officeTermId: officeTerm('term:ca:avery:maple-member:2026'),
      origin: 'election_result',
      personId: person('person:ca:avery-quill'),
      plannedEnd: null,
      plannedStart: '2026-01-01T00:00:00Z',
      publicBodyId: body('body:ca:maple-legislature'),
      selectionMethod: 'elected',
      serviceCapacity: 'regular',
      transitions: [
        termTransition(
          'ca:avery:2026:pending',
          null,
          'pending',
          '2025-12-15T00:00:00Z',
          'ELECTION_RESULT_REVIEWED',
        ),
        termTransition(
          'ca:avery:2026:active',
          'pending',
          'active',
          '2026-01-01T00:00:00Z',
          'TERM_START_REVIEWED',
        ),
      ],
    },
    {
      countryCode: 'CA',
      districtId: null,
      jurisdictionId: jurisdiction('jurisdiction:ca:north-region'),
      officeId: office('office:ca:north-director'),
      officeTermId: officeTerm('term:ca:rowan:north-director:2026'),
      origin: 'appointment',
      personId: person('person:ca:rowan-lake'),
      plannedEnd: null,
      plannedStart: '2026-02-01T00:00:00Z',
      publicBodyId: body('body:ca:north-board'),
      selectionMethod: 'appointed',
      serviceCapacity: 'acting',
      transitions: [
        termTransition(
          'ca:rowan:2026:pending',
          null,
          'pending',
          '2026-01-25T00:00:00Z',
          'APPOINTMENT_REVIEWED',
        ),
        termTransition(
          'ca:rowan:2026:active',
          'pending',
          'active',
          '2026-02-01T00:00:00Z',
          'TERM_START_REVIEWED',
        ),
      ],
    },
    {
      countryCode: 'US',
      districtId: district('district:us:water'),
      jurisdictionId: jurisdiction('jurisdiction:us:water'),
      officeId: office('office:us:water-director'),
      officeTermId: officeTerm('term:us:morgan:water-director:2026'),
      origin: 'appointment',
      personId: person('person:us:morgan-fields'),
      plannedEnd: null,
      plannedStart: '2026-01-15T00:00:00Z',
      publicBodyId: body('body:us:water-board'),
      selectionMethod: 'appointed',
      serviceCapacity: 'interim',
      transitions: [
        termTransition(
          'us:morgan:2026:pending',
          null,
          'pending',
          '2026-01-10T00:00:00Z',
          'APPOINTMENT_REVIEWED',
        ),
        termTransition(
          'us:morgan:2026:active',
          'pending',
          'active',
          '2026-01-15T00:00:00Z',
          'TERM_START_REVIEWED',
        ),
      ],
    },
  ],
  officialIdentifiers: [
    {
      attribution: attribution('identifier:person:ca:avery'),
      effectiveFrom: '2020-01-01T00:00:00Z',
      effectiveTo: null,
      entityId: person('person:ca:avery-quill'),
      entityKind: 'person',
      identifier: 'SYN-CA-PERSON-001',
      issuer: 'synthetic-ca-public-registry',
      officialIdentifierId: officialIdentifier('official-id:person:ca:avery'),
    },
    {
      attribution: attribution('identifier:term:ca:avery:2026'),
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveTo: null,
      entityId: officeTerm('term:ca:avery:maple-member:2026'),
      entityKind: 'office_term',
      identifier: 'SYN-CA-TERM-2026-001',
      issuer: 'synthetic-ca-public-registry',
      officialIdentifierId: officialIdentifier('official-id:term:ca:avery:2026'),
    },
    {
      attribution: attribution('identifier:election:us:2026'),
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveTo: null,
      entityId: election('election:us:state-2026'),
      entityKind: 'election',
      identifier: 'SYN-US-ELECTION-2026-001',
      issuer: 'synthetic-us-election-registry',
      officialIdentifierId: officialIdentifier('official-id:election:us:state-2026'),
    },
    {
      attribution: attribution('identifier:candidacy:us:fields'),
      effectiveFrom: '2026-01-20T00:00:00Z',
      effectiveTo: null,
      entityId: candidacy('candidacy:us:morgan-fields:state-2026'),
      entityKind: 'candidacy',
      identifier: 'SYN-US-CANDIDACY-001',
      issuer: 'synthetic-us-election-registry',
      officialIdentifierId: officialIdentifier('official-id:candidacy:us:morgan-fields'),
    },
  ],
  people: [
    {
      names: [
        {
          attribution: attribution('name:ca:avery:previous'),
          displayName: 'Avery Quille',
          effectiveFrom: '2020-01-01T00:00:00Z',
          effectiveTo: '2024-01-01T00:00:00Z',
          kind: 'previous',
          languageTag: 'en-CA',
          personNameId: personName('person-name:ca:avery:previous'),
        },
        {
          attribution: attribution('name:ca:avery:primary'),
          displayName: 'Avery Quill',
          effectiveFrom: '2024-01-01T00:00:00Z',
          effectiveTo: null,
          kind: 'primary',
          languageTag: 'en-CA',
          personNameId: personName('person-name:ca:avery:primary'),
        },
        {
          attribution: attribution('name:ca:avery:alias'),
          displayName: 'A. Quill',
          effectiveFrom: '2024-01-01T00:00:00Z',
          effectiveTo: null,
          kind: 'alias',
          languageTag: 'en-CA',
          personNameId: personName('person-name:ca:avery:alias'),
        },
      ],
      personId: person('person:ca:avery-quill'),
      recordState: 'active',
    },
    {
      names: [
        {
          attribution: attribution('name:ca:rowan:primary'),
          displayName: 'Rowan Lake',
          effectiveFrom: '2020-01-01T00:00:00Z',
          effectiveTo: null,
          kind: 'primary',
          languageTag: 'en-CA',
          personNameId: personName('person-name:ca:rowan:primary'),
        },
      ],
      personId: person('person:ca:rowan-lake'),
      recordState: 'active',
    },
    {
      names: [
        {
          attribution: attribution('name:us:morgan-fields:primary'),
          displayName: 'Morgan Fields',
          effectiveFrom: '2020-01-01T00:00:00Z',
          effectiveTo: null,
          kind: 'primary',
          languageTag: 'en-US',
          personNameId: personName('person-name:us:morgan-fields:primary'),
        },
      ],
      personId: person('person:us:morgan-fields'),
      recordState: 'active',
    },
    {
      names: [
        {
          attribution: attribution('name:us:morgan-field:primary'),
          displayName: 'Morgan Field',
          effectiveFrom: '2020-01-01T00:00:00Z',
          effectiveTo: null,
          kind: 'primary',
          languageTag: 'en-US',
          personNameId: personName('person-name:us:morgan-field:primary'),
        },
      ],
      personId: person('person:us:morgan-field'),
      recordState: 'active',
    },
    ...['a', 'b'].map((suffix) => ({
      names: [
        {
          attribution: attribution(`name:ca:sam-${suffix}:primary`),
          displayName: suffix === 'a' ? 'Sam Harbour' : 'Sam Harbor',
          effectiveFrom: '2020-01-01T00:00:00Z',
          effectiveTo: null,
          kind: 'primary' as const,
          languageTag: 'en-CA',
          personNameId: personName(`person-name:ca:sam-${suffix}:primary`),
        },
      ],
      personId: person(`person:ca:sam-harbour-${suffix}`),
      recordState: 'active' as const,
    })),
    {
      names: [
        {
          attribution: attribution('name:ca:sam-canonical:primary'),
          displayName: 'Sam Harbour',
          effectiveFrom: '2025-01-01T00:00:00Z',
          effectiveTo: '2026-06-01T00:00:00Z',
          kind: 'primary',
          languageTag: 'en-CA',
          personNameId: personName('person-name:ca:sam-canonical:primary'),
        },
      ],
      personId: person('person:ca:sam-harbour-merged'),
      recordState: 'superseded',
    },
  ],
  personResolutions: [
    {
      attribution: attribution('resolution:ca:sam:merge'),
      decisionId: decision('person-resolution:ca:sam:merge'),
      effectiveAt: '2025-01-01T00:00:00Z',
      evidence: [
        {
          attribution: attribution('resolution-evidence:ca:sam:merge:name'),
          evidenceId: 'resolution-evidence:ca:sam:merge:name',
          kind: 'name',
          reference: 'synthetic-name-comparison:ca:sam',
        },
        {
          attribution: attribution('resolution-evidence:ca:sam:merge:office'),
          evidenceId: 'resolution-evidence:ca:sam:merge:office',
          kind: 'office_context',
          reference: 'office:ca:maple-member',
        },
      ],
      inputPersonIds: [person('person:ca:sam-harbour-a'), person('person:ca:sam-harbour-b')],
      kind: 'merge',
      outputPersonIds: [person('person:ca:sam-harbour-merged')],
      review: review('PERSON_MERGE_REVIEWED', 'Synthetic internal merge rationale.'),
      supersedesDecisionId: null,
    },
    {
      attribution: attribution(
        'resolution:ca:sam:split',
        'assertion:public-role:resolution:ca:sam:merge',
        'conflicting',
      ),
      decisionId: decision('person-resolution:ca:sam:split'),
      effectiveAt: '2026-06-01T00:00:00Z',
      evidence: [
        {
          attribution: attribution('resolution-evidence:ca:sam:split:name'),
          evidenceId: 'resolution-evidence:ca:sam:split:name',
          kind: 'name',
          reference: 'synthetic-name-conflict:ca:sam',
        },
        {
          attribution: attribution('resolution-evidence:ca:sam:split:identifier'),
          evidenceId: 'resolution-evidence:ca:sam:split:identifier',
          kind: 'official_identifier',
          reference: 'synthetic-identifiers:ca:sam:a-and-b',
        },
      ],
      inputPersonIds: [person('person:ca:sam-harbour-merged')],
      kind: 'split',
      outputPersonIds: [person('person:ca:sam-harbour-a'), person('person:ca:sam-harbour-b')],
      review: review('PERSON_SPLIT_REVIEWED', 'Synthetic internal split rationale.'),
      supersedesDecisionId: decision('person-resolution:ca:sam:merge'),
    },
    {
      attribution: attribution('resolution:us:morgan:distinct'),
      decisionId: decision('person-resolution:us:morgan:distinct'),
      effectiveAt: '2026-03-01T00:00:00Z',
      evidence: [
        {
          attribution: attribution('resolution-evidence:us:morgan:name'),
          evidenceId: 'resolution-evidence:us:morgan:name',
          kind: 'name',
          reference: 'synthetic-name-comparison:us:morgan',
        },
        {
          attribution: attribution('resolution-evidence:us:morgan:identifier'),
          evidenceId: 'resolution-evidence:us:morgan:identifier',
          kind: 'official_identifier',
          reference: 'synthetic-identifiers:us:morgan:distinct',
        },
        {
          attribution: attribution('resolution-evidence:us:morgan:district'),
          evidenceId: 'resolution-evidence:us:morgan:district',
          kind: 'district_context',
          reference: 'district:us:state-senate',
        },
      ],
      inputPersonIds: [person('person:us:morgan-fields'), person('person:us:morgan-field')],
      kind: 'distinct',
      outputPersonIds: [person('person:us:morgan-fields'), person('person:us:morgan-field')],
      review: review('PEOPLE_CONFIRMED_DISTINCT', 'Synthetic internal same-name review.'),
      supersedesDecisionId: null,
    },
  ],
  schemaVersion: 'public-role-registry.v1',
} satisfies PublicRoleRegistrySnapshot);
