import type {
  AssertionId,
  CountryCode,
  DistrictId,
  EffectivePeriod,
  JurisdictionId,
  JurisdictionRegistrySnapshot,
  OfficeId,
  OfficeSelectionMethod,
  PublicBodyId,
  RegistryAttribution,
} from './jurisdiction-registry.js';
import { isEffectiveAt } from './jurisdiction-registry.js';

type OpaqueId<Kind extends string> = string & { readonly __kind: Kind };

export type PersonId = OpaqueId<'PersonId'>;
export type PersonNameId = OpaqueId<'PersonNameId'>;
export type OfficeTermId = OpaqueId<'OfficeTermId'>;
export type ElectionId = OpaqueId<'ElectionId'>;
export type CandidacyId = OpaqueId<'CandidacyId'>;
export type LifecycleTransitionId = OpaqueId<'LifecycleTransitionId'>;
export type PersonResolutionDecisionId = OpaqueId<'PersonResolutionDecisionId'>;
export type OfficialIdentifierId = OpaqueId<'OfficialIdentifierId'>;
export type ExternalIdentityReferenceId = OpaqueId<'ExternalIdentityReferenceId'>;

export type PersonRecordState = 'active' | 'historical' | 'superseded';
export type PersonNameKind = 'primary' | 'alias' | 'previous' | 'transliteration';
export type LifecycleActorType = 'reviewer' | 'admin' | 'source_process';
export type LifecycleProcess = 'manual_review' | 'reviewed_import' | 'synthetic_seed';
export type OfficeTermOrigin = 'scheduled' | 'election_result' | 'appointment' | 'ex_officio';
export type OfficeTermState =
  | 'pending'
  | 'active'
  | 'cancelled'
  | 'ended'
  | 'resigned'
  | 'removed'
  | 'deceased'
  | 'disqualified'
  | 'superseded';
export type ServiceCapacity = 'regular' | 'acting' | 'interim';
export type TenureClassification = 'current' | 'former' | 'historical' | 'pending';
export type ElectionKind = 'general' | 'by_election' | 'primary' | 'special' | 'other';
export type ElectionState = 'scheduled' | 'active' | 'completed' | 'cancelled' | 'superseded';
export type CandidacyState =
  | 'declared'
  | 'registered'
  | 'qualified'
  | 'withdrawn'
  | 'suspended'
  | 'rejected'
  | 'disqualified'
  | 'active'
  | 'won'
  | 'defeated'
  | 'cancelled'
  | 'superseded';
export type PersonResolutionKind = 'merge' | 'split' | 'distinct';
export type PersonResolutionEvidenceKind =
  | 'name'
  | 'official_identifier'
  | 'office_context'
  | 'district_context'
  | 'effective_date'
  | 'source_conflict';
export type PublicRoleEntityKind = 'person' | 'office_term' | 'election' | 'candidacy';
export type PublicRoleSubject =
  | { readonly kind: 'office_term'; readonly officeTermId: OfficeTermId }
  | { readonly kind: 'candidacy'; readonly candidacyId: CandidacyId };

export interface LifecycleReview {
  readonly actorType: LifecycleActorType;
  readonly actorReference: string;
  readonly process: LifecycleProcess;
  readonly reasonCode: string;
  readonly recordedAt: string;
  readonly privateNotes: string | null;
}

export interface PublicLifecycleReview {
  readonly actorType: LifecycleActorType;
  readonly process: LifecycleProcess;
  readonly reasonCode: string;
  readonly recordedAt: string;
}

export interface LifecycleTransition<State extends string> {
  readonly transitionId: LifecycleTransitionId;
  readonly fromState: State | null;
  readonly toState: State;
  readonly effectiveAt: string;
  readonly attribution: RegistryAttribution;
  readonly review: LifecycleReview;
}

export interface PublicLifecycleTransition<State extends string> extends Omit<
  LifecycleTransition<State>,
  'review'
> {
  readonly review: PublicLifecycleReview;
}

export interface PersonName extends EffectivePeriod {
  readonly personNameId: PersonNameId;
  readonly displayName: string;
  readonly kind: PersonNameKind;
  readonly languageTag: string | null;
  readonly attribution: RegistryAttribution;
}

export interface PersonRecord {
  readonly personId: PersonId;
  readonly recordState: PersonRecordState;
  readonly names: readonly PersonName[];
}

export interface OfficeTermRecord {
  readonly officeTermId: OfficeTermId;
  readonly personId: PersonId;
  readonly countryCode: CountryCode;
  readonly jurisdictionId: JurisdictionId;
  readonly districtId: DistrictId | null;
  readonly publicBodyId: PublicBodyId;
  readonly officeId: OfficeId;
  readonly origin: OfficeTermOrigin;
  readonly selectionMethod: OfficeSelectionMethod;
  readonly serviceCapacity: ServiceCapacity;
  readonly plannedStart: string;
  readonly plannedEnd: string | null;
  readonly transitions: readonly LifecycleTransition<OfficeTermState>[];
}

export interface PublicOfficeTerm extends Omit<OfficeTermRecord, 'transitions'> {
  readonly currentState: OfficeTermState;
  readonly tenureClassification: TenureClassification;
  readonly transitions: readonly PublicLifecycleTransition<OfficeTermState>[];
}

export interface OfficeTermRelationship extends EffectivePeriod {
  readonly relationshipId: string;
  readonly officeTermId: OfficeTermId;
  readonly relatedOfficeTermId: OfficeTermId;
  readonly kind: 'predecessor_of' | 'successor_of' | 'supersedes';
  readonly attribution: RegistryAttribution;
}

export interface OfficeTermContact extends EffectivePeriod {
  readonly contactId: string;
  readonly officeTermId: OfficeTermId;
  readonly kind: 'office_email' | 'office_phone' | 'office_url';
  readonly value: string;
  readonly attribution: RegistryAttribution;
}

export interface ElectionVersion extends EffectivePeriod {
  readonly versionId: string;
  readonly name: string;
  readonly kind: ElectionKind;
  readonly state: ElectionState;
  readonly scheduledAt: string;
  readonly attribution: RegistryAttribution;
}

export interface ElectionRecord {
  readonly electionId: ElectionId;
  readonly countryCode: CountryCode;
  readonly jurisdictionId: JurisdictionId;
  readonly districtId: DistrictId | null;
  readonly publicBodyId: PublicBodyId;
  readonly officeId: OfficeId;
  readonly versions: readonly ElectionVersion[];
}

export interface CandidacyRecord {
  readonly candidacyId: CandidacyId;
  readonly personId: PersonId;
  readonly electionId: ElectionId;
  readonly countryCode: CountryCode;
  readonly jurisdictionId: JurisdictionId;
  readonly districtId: DistrictId | null;
  readonly officeId: OfficeId;
  readonly transitions: readonly LifecycleTransition<CandidacyState>[];
}

export interface PublicCandidacy extends Omit<CandidacyRecord, 'transitions'> {
  readonly currentState: CandidacyState;
  readonly transitions: readonly PublicLifecycleTransition<CandidacyState>[];
}

export interface PublicRoleOfficialIdentifier extends EffectivePeriod {
  readonly officialIdentifierId: OfficialIdentifierId;
  readonly entityKind: PublicRoleEntityKind;
  readonly entityId: PersonId | OfficeTermId | ElectionId | CandidacyId;
  readonly issuer: string;
  readonly identifier: string;
  readonly attribution: RegistryAttribution;
}

export interface PersonResolutionEvidence {
  readonly evidenceId: string;
  readonly kind: PersonResolutionEvidenceKind;
  readonly reference: string;
  readonly attribution: RegistryAttribution;
}

export interface PersonResolutionDecision {
  readonly decisionId: PersonResolutionDecisionId;
  readonly kind: PersonResolutionKind;
  readonly inputPersonIds: readonly PersonId[];
  readonly outputPersonIds: readonly PersonId[];
  readonly effectiveAt: string;
  readonly evidence: readonly PersonResolutionEvidence[];
  readonly attribution: RegistryAttribution;
  readonly review: LifecycleReview;
  readonly supersedesDecisionId: PersonResolutionDecisionId | null;
}

export interface PublicPersonResolutionDecision extends Omit<PersonResolutionDecision, 'review'> {
  readonly review: PublicLifecycleReview;
}

export interface ExternalIdentityReference extends EffectivePeriod {
  readonly externalIdentityReferenceId: ExternalIdentityReferenceId;
  readonly personId: PersonId;
  readonly kind: 'public_identifier' | 'verus_id';
  readonly immutableReference: string;
  readonly displayNameSnapshot: string | null;
  readonly canonicalAuthority: false;
  readonly grantsAuthorization: false;
  readonly attribution: RegistryAttribution;
}

export interface PublicRoleRegistrySnapshot {
  readonly schemaVersion: 'public-role-registry.v1';
  readonly dataMode: 'synthetic';
  readonly generatedAt: string;
  readonly people: readonly PersonRecord[];
  readonly officeTerms: readonly OfficeTermRecord[];
  readonly officeTermRelationships: readonly OfficeTermRelationship[];
  readonly officeTermContacts: readonly OfficeTermContact[];
  readonly elections: readonly ElectionRecord[];
  readonly candidacies: readonly CandidacyRecord[];
  readonly officialIdentifiers: readonly PublicRoleOfficialIdentifier[];
  readonly personResolutions: readonly PersonResolutionDecision[];
  readonly externalIdentityReferences: readonly ExternalIdentityReference[];
}

export type PublicRoleSelection =
  | { readonly kind: 'all'; readonly id: null }
  | { readonly kind: 'person'; readonly id: PersonId }
  | { readonly kind: 'office'; readonly id: OfficeId }
  | { readonly kind: 'office_term'; readonly id: OfficeTermId }
  | { readonly kind: 'election'; readonly id: ElectionId }
  | { readonly kind: 'candidacy'; readonly id: CandidacyId };

export interface PublicRoleRegistryQuery {
  readonly asOf: string;
  readonly countryCode?: CountryCode;
  readonly includeHistorical?: boolean;
  readonly selection?: PublicRoleSelection;
}

export interface PublicRoleRegistryReadModel extends Omit<
  PublicRoleRegistrySnapshot,
  'candidacies' | 'officeTerms' | 'personResolutions'
> {
  readonly asOf: string;
  readonly selection: PublicRoleSelection;
  readonly officeTerms: readonly PublicOfficeTerm[];
  readonly candidacies: readonly PublicCandidacy[];
  readonly personResolutions: readonly PublicPersonResolutionDecision[];
  readonly deferredFamilies: readonly [
    'source_ingestion',
    'public_conduct',
    'participation',
    'representative_authorization',
    'identity_proof',
    'provenance',
    'representative_scoring',
  ];
  readonly page: { readonly nextCursor: null };
}

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const REASON_PATTERN = /^[A-Z][A-Z0-9_]{0,63}$/;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function parseTime(value: string, field: string): number {
  const parsed = Date.parse(value);
  if (!ISO_TIMESTAMP_PATTERN.test(value) || !Number.isFinite(parsed)) {
    throw new Error(`${field} must be an ISO-8601 timestamp.`);
  }
  return parsed;
}

function assertId(value: string, field: string): void {
  if (!ID_PATTERN.test(value)) throw new Error(`${field} is not a stable opaque identifier.`);
}

function assertPeriod(period: EffectivePeriod, field: string): void {
  const start = parseTime(period.effectiveFrom, `${field}.effectiveFrom`);
  if (period.effectiveTo !== null) {
    const end = parseTime(period.effectiveTo, `${field}.effectiveTo`);
    if (end <= start) throw new Error(`${field} must use a non-empty half-open period.`);
  }
}

function periodsOverlap(left: EffectivePeriod, right: EffectivePeriod): boolean {
  const leftStart = parseTime(left.effectiveFrom, 'left.effectiveFrom');
  const rightStart = parseTime(right.effectiveFrom, 'right.effectiveFrom');
  const leftEnd =
    left.effectiveTo === null ? Infinity : parseTime(left.effectiveTo, 'left.effectiveTo');
  const rightEnd =
    right.effectiveTo === null ? Infinity : parseTime(right.effectiveTo, 'right.effectiveTo');
  return leftStart < rightEnd && rightStart < leftEnd;
}

function assertAttribution(attribution: RegistryAttribution, field: string): void {
  assertId(attribution.assertionId, `${field}.assertionId`);
  parseTime(attribution.observedAt, `${field}.observedAt`);
  if (!/^synthetic:\/\/[a-z0-9./_:-]+$/i.test(attribution.sourceReference)) {
    throw new Error(`${field}.sourceReference must identify a synthetic source.`);
  }
  if (attribution.supersedesAssertionId !== null) {
    assertId(attribution.supersedesAssertionId, `${field}.supersedesAssertionId`);
    if (attribution.supersedesAssertionId === attribution.assertionId) {
      throw new Error(`${field} cannot supersede itself.`);
    }
  }
}

function assertReview(review: LifecycleReview, field: string): void {
  assertId(review.actorReference, `${field}.actorReference`);
  if (!REASON_PATTERN.test(review.reasonCode)) {
    throw new Error(`${field}.reasonCode must be a stable public reason code.`);
  }
  parseTime(review.recordedAt, `${field}.recordedAt`);
  if (review.privateNotes !== null && review.privateNotes.length > 1000) {
    throw new Error(`${field}.privateNotes is too long.`);
  }
}

const officeTermTransitions: Readonly<Record<OfficeTermState, readonly OfficeTermState[]>> = {
  pending: ['active', 'cancelled'],
  active: ['ended', 'resigned', 'removed', 'deceased', 'disqualified', 'superseded'],
  cancelled: ['superseded'],
  ended: ['superseded'],
  resigned: ['superseded'],
  removed: ['superseded'],
  deceased: ['superseded'],
  disqualified: ['superseded'],
  superseded: [],
};

const candidacyTransitions: Readonly<Record<CandidacyState, readonly CandidacyState[]>> = {
  declared: [
    'registered',
    'qualified',
    'active',
    'withdrawn',
    'suspended',
    'rejected',
    'disqualified',
    'cancelled',
    'superseded',
  ],
  registered: [
    'qualified',
    'active',
    'withdrawn',
    'suspended',
    'rejected',
    'disqualified',
    'cancelled',
    'superseded',
  ],
  qualified: [
    'active',
    'withdrawn',
    'suspended',
    'rejected',
    'disqualified',
    'cancelled',
    'superseded',
  ],
  suspended: ['active', 'withdrawn', 'rejected', 'disqualified', 'cancelled', 'superseded'],
  active: ['won', 'defeated', 'withdrawn', 'suspended', 'disqualified', 'cancelled', 'superseded'],
  withdrawn: ['superseded'],
  rejected: ['superseded'],
  disqualified: ['superseded'],
  won: ['superseded'],
  defeated: ['superseded'],
  cancelled: ['superseded'],
  superseded: [],
};

function assertTransitions<State extends string>(
  entityId: string,
  transitions: readonly LifecycleTransition<State>[],
  allowedInitial: readonly State[],
  allowed: Readonly<Record<State, readonly State[]>>,
): void {
  if (transitions.length === 0) throw new Error(`${entityId} requires a lifecycle transition.`);
  let previous: LifecycleTransition<State> | undefined;
  const transitionIds = new Set<string>();
  for (const [index, transition] of transitions.entries()) {
    assertId(transition.transitionId, `${entityId}.transitions[${index}].transitionId`);
    if (transitionIds.has(transition.transitionId))
      throw new Error('Duplicate lifecycle transition ID.');
    transitionIds.add(transition.transitionId);
    parseTime(transition.effectiveAt, `${transition.transitionId}.effectiveAt`);
    assertAttribution(transition.attribution, `${transition.transitionId}.attribution`);
    assertReview(transition.review, `${transition.transitionId}.review`);
    if (previous === undefined) {
      if (transition.fromState !== null || !allowedInitial.includes(transition.toState)) {
        throw new Error(`${entityId} has an invalid initial lifecycle transition.`);
      }
    } else {
      if (transition.fromState !== previous.toState) {
        throw new Error(`${entityId} has a discontinuous lifecycle history.`);
      }
      if (!allowed[previous.toState].includes(transition.toState)) {
        throw new Error(`${entityId} has an illegal lifecycle transition.`);
      }
      if (
        parseTime(transition.effectiveAt, 'effectiveAt') <=
        parseTime(previous.effectiveAt, 'effectiveAt')
      ) {
        throw new Error(`${entityId} lifecycle transitions must be strictly ordered.`);
      }
    }
    previous = transition;
  }
}

function publicReview(review: LifecycleReview): PublicLifecycleReview {
  return Object.freeze({
    actorType: review.actorType,
    process: review.process,
    reasonCode: review.reasonCode,
    recordedAt: review.recordedAt,
  });
}

function publicTransitions<State extends string>(
  transitions: readonly LifecycleTransition<State>[],
  asOf: string,
): readonly PublicLifecycleTransition<State>[] {
  return transitions
    .filter(
      (transition) => parseTime(transition.effectiveAt, 'effectiveAt') <= parseTime(asOf, 'asOf'),
    )
    .map(({ review, ...transition }) =>
      Object.freeze({ ...transition, review: publicReview(review) }),
    );
}

function tenureClassification(state: OfficeTermState): TenureClassification {
  if (state === 'pending') return 'pending';
  if (state === 'active') return 'current';
  if (state === 'superseded') return 'historical';
  return 'former';
}

function currentState<State extends string>(
  entityId: string,
  transitions: readonly LifecycleTransition<State>[],
  asOf: string,
): State {
  const effective = transitions.filter(
    (transition) => parseTime(transition.effectiveAt, 'effectiveAt') <= parseTime(asOf, 'asOf'),
  );
  const latest = effective.at(-1);
  if (!latest) throw new Error(`${entityId} is not effective at the requested date.`);
  return latest.toState;
}

function assertRegistryReferences(
  snapshot: PublicRoleRegistrySnapshot,
  registry: JurisdictionRegistrySnapshot,
): void {
  const people = new Set(snapshot.people.map(({ personId }) => personId));
  const jurisdictions = new Map(
    registry.jurisdictions.map((record) => [record.jurisdictionId, record.countryCode]),
  );
  const districts = new Map(
    registry.districts.map((record) => [record.districtId, record.countryCode]),
  );
  const bodies = new Map(
    registry.publicBodies.map((record) => [record.publicBodyId, record.countryCode]),
  );
  const offices = new Map(registry.offices.map((record) => [record.officeId, record.countryCode]));
  const terms = new Set(snapshot.officeTerms.map(({ officeTermId }) => officeTermId));
  const elections = new Set(snapshot.elections.map(({ electionId }) => electionId));
  const candidacies = new Set(snapshot.candidacies.map(({ candidacyId }) => candidacyId));

  const assertStructuralContext = (
    countryCode: CountryCode,
    jurisdictionId: JurisdictionId,
    districtId: DistrictId | null,
    bodyId: PublicBodyId,
    officeId: OfficeId,
    field: string,
  ): void => {
    if (
      jurisdictions.get(jurisdictionId) !== countryCode ||
      bodies.get(bodyId) !== countryCode ||
      offices.get(officeId) !== countryCode ||
      (districtId !== null && districts.get(districtId) !== countryCode)
    ) {
      throw new Error(`${field} references an unknown or cross-country civic structure.`);
    }
  };

  for (const term of snapshot.officeTerms) {
    if (!people.has(term.personId)) throw new Error(`${term.officeTermId} has no person.`);
    assertStructuralContext(
      term.countryCode,
      term.jurisdictionId,
      term.districtId,
      term.publicBodyId,
      term.officeId,
      term.officeTermId,
    );
  }
  for (const election of snapshot.elections) {
    assertStructuralContext(
      election.countryCode,
      election.jurisdictionId,
      election.districtId,
      election.publicBodyId,
      election.officeId,
      election.electionId,
    );
  }
  for (const candidacy of snapshot.candidacies) {
    if (!people.has(candidacy.personId) || !elections.has(candidacy.electionId)) {
      throw new Error(`${candidacy.candidacyId} has no person/election.`);
    }
    const election = snapshot.elections.find(
      ({ electionId }) => electionId === candidacy.electionId,
    );
    if (
      election?.countryCode !== candidacy.countryCode ||
      election.officeId !== candidacy.officeId ||
      election.jurisdictionId !== candidacy.jurisdictionId ||
      election.districtId !== candidacy.districtId
    ) {
      throw new Error(`${candidacy.candidacyId} does not match its election context.`);
    }
  }
  for (const relationship of snapshot.officeTermRelationships) {
    if (
      !terms.has(relationship.officeTermId) ||
      !terms.has(relationship.relatedOfficeTermId) ||
      relationship.officeTermId === relationship.relatedOfficeTermId
    ) {
      throw new Error(`${relationship.relationshipId} has an invalid office-term relationship.`);
    }
  }
  for (const contact of snapshot.officeTermContacts) {
    if (!terms.has(contact.officeTermId))
      throw new Error(`${contact.contactId} has no office term.`);
  }
  for (const identifier of snapshot.officialIdentifiers) {
    const known =
      (identifier.entityKind === 'person' && people.has(identifier.entityId as PersonId)) ||
      (identifier.entityKind === 'office_term' && terms.has(identifier.entityId as OfficeTermId)) ||
      (identifier.entityKind === 'election' && elections.has(identifier.entityId as ElectionId)) ||
      (identifier.entityKind === 'candidacy' &&
        candidacies.has(identifier.entityId as CandidacyId));
    if (!known) throw new Error(`${identifier.officialIdentifierId} has no public-role entity.`);
  }
  for (const reference of snapshot.externalIdentityReferences) {
    if (!people.has(reference.personId))
      throw new Error(`${reference.externalIdentityReferenceId} has no person.`);
    if (reference.canonicalAuthority !== false || reference.grantsAuthorization !== false) {
      throw new Error(
        'External identity references cannot become canonical or grant authorization.',
      );
    }
  }
}

export function assertPublicRoleRegistry(
  snapshot: PublicRoleRegistrySnapshot,
  registry: JurisdictionRegistrySnapshot,
): void {
  parseTime(snapshot.generatedAt, 'generatedAt');
  const personIds = new Set<string>();
  const nameIds = new Set<string>();
  for (const person of snapshot.people) {
    assertId(person.personId, 'personId');
    if (personIds.has(person.personId)) throw new Error('Duplicate person ID.');
    personIds.add(person.personId);
    if (person.names.length === 0) throw new Error(`${person.personId} requires a public name.`);
    person.names.forEach((name, index) => {
      assertId(name.personNameId, `${person.personId}.names[${index}].personNameId`);
      if (nameIds.has(name.personNameId)) throw new Error('Duplicate person-name ID.');
      nameIds.add(name.personNameId);
      assertPeriod(name, name.personNameId);
      assertAttribution(name.attribution, `${name.personNameId}.attribution`);
      if (name.displayName.length < 1 || name.displayName.length > 200) {
        throw new Error(`${name.personNameId} has an invalid display name.`);
      }
      if (name.kind === 'primary') {
        for (const earlier of person.names
          .slice(0, index)
          .filter(({ kind }) => kind === 'primary')) {
          if (periodsOverlap(earlier, name))
            throw new Error(`${person.personId} has overlapping primary names.`);
        }
      }
    });
  }

  const termIds = new Set<string>();
  for (const term of snapshot.officeTerms) {
    assertId(term.officeTermId, 'officeTermId');
    if (termIds.has(term.officeTermId)) throw new Error('Duplicate office-term ID.');
    termIds.add(term.officeTermId);
    parseTime(term.plannedStart, `${term.officeTermId}.plannedStart`);
    if (
      term.plannedEnd !== null &&
      parseTime(term.plannedEnd, 'plannedEnd') <= parseTime(term.plannedStart, 'plannedStart')
    ) {
      throw new Error(`${term.officeTermId} has an invalid planned period.`);
    }
    assertTransitions(term.officeTermId, term.transitions, ['pending'], officeTermTransitions);
  }

  const electionIds = new Set<string>();
  for (const election of snapshot.elections) {
    assertId(election.electionId, 'electionId');
    if (electionIds.has(election.electionId)) throw new Error('Duplicate election ID.');
    electionIds.add(election.electionId);
    if (election.versions.length === 0)
      throw new Error(`${election.electionId} requires a version.`);
    election.versions.forEach((version, index) => {
      assertId(version.versionId, `${election.electionId}.versions[${index}].versionId`);
      assertPeriod(version, version.versionId);
      parseTime(version.scheduledAt, `${version.versionId}.scheduledAt`);
      assertAttribution(version.attribution, `${version.versionId}.attribution`);
      for (const earlier of election.versions.slice(0, index)) {
        if (periodsOverlap(earlier, version))
          throw new Error(`${election.electionId} has overlapping versions.`);
      }
    });
  }

  const candidacyIds = new Set<string>();
  for (const candidacy of snapshot.candidacies) {
    assertId(candidacy.candidacyId, 'candidacyId');
    if (candidacyIds.has(candidacy.candidacyId)) throw new Error('Duplicate candidacy ID.');
    candidacyIds.add(candidacy.candidacyId);
    assertTransitions(
      candidacy.candidacyId,
      candidacy.transitions,
      ['declared', 'registered', 'qualified', 'active'],
      candidacyTransitions,
    );
  }

  for (const relationship of snapshot.officeTermRelationships) {
    assertId(relationship.relationshipId, 'officeTermRelationshipId');
    assertPeriod(relationship, relationship.relationshipId);
    assertAttribution(relationship.attribution, `${relationship.relationshipId}.attribution`);
  }
  for (const contact of snapshot.officeTermContacts) {
    assertId(contact.contactId, 'officeTermContactId');
    assertPeriod(contact, contact.contactId);
    assertAttribution(contact.attribution, `${contact.contactId}.attribution`);
  }
  for (const identifier of snapshot.officialIdentifiers) {
    assertId(identifier.officialIdentifierId, 'officialIdentifierId');
    assertPeriod(identifier, identifier.officialIdentifierId);
    assertAttribution(identifier.attribution, `${identifier.officialIdentifierId}.attribution`);
  }

  const decisions = new Set(snapshot.personResolutions.map(({ decisionId }) => decisionId));
  if (decisions.size !== snapshot.personResolutions.length)
    throw new Error('Duplicate person-resolution decision ID.');
  for (const decision of snapshot.personResolutions) {
    assertId(decision.decisionId, 'personResolutionDecisionId');
    parseTime(decision.effectiveAt, `${decision.decisionId}.effectiveAt`);
    assertAttribution(decision.attribution, `${decision.decisionId}.attribution`);
    assertReview(decision.review, `${decision.decisionId}.review`);
    if (!['reviewer', 'admin'].includes(decision.review.actorType)) {
      throw new Error(`${decision.decisionId} requires accountable human review.`);
    }
    const allPeople = [...decision.inputPersonIds, ...decision.outputPersonIds];
    if (allPeople.some((personId) => !personIds.has(personId))) {
      throw new Error(`${decision.decisionId} references an unknown person.`);
    }
    if (
      (decision.kind === 'merge' &&
        (new Set(decision.inputPersonIds).size < 2 || decision.outputPersonIds.length !== 1)) ||
      (decision.kind === 'split' &&
        (decision.inputPersonIds.length !== 1 || new Set(decision.outputPersonIds).size < 2)) ||
      (decision.kind === 'distinct' && new Set(decision.inputPersonIds).size < 2)
    ) {
      throw new Error(`${decision.decisionId} has invalid merge/split parties.`);
    }
    if (
      decision.evidence.length < 2 ||
      !decision.evidence.some(({ kind }) => kind !== 'name') ||
      new Set(decision.evidence.map(({ attribution }) => attribution.assertionId)).size < 2
    ) {
      throw new Error(`${decision.decisionId} cannot resolve people from name-only context.`);
    }
    for (const evidence of decision.evidence) {
      assertId(evidence.evidenceId, `${decision.decisionId}.evidenceId`);
      assertAttribution(evidence.attribution, `${evidence.evidenceId}.attribution`);
    }
    if (
      decision.supersedesDecisionId !== null &&
      (!decisions.has(decision.supersedesDecisionId) ||
        decision.supersedesDecisionId === decision.decisionId)
    ) {
      throw new Error(`${decision.decisionId} has an invalid superseded decision.`);
    }
  }

  for (const reference of snapshot.externalIdentityReferences) {
    assertId(reference.externalIdentityReferenceId, 'externalIdentityReferenceId');
    assertPeriod(reference, reference.externalIdentityReferenceId);
    assertAttribution(
      reference.attribution,
      `${reference.externalIdentityReferenceId}.attribution`,
    );
  }
  assertRegistryReferences(snapshot, registry);
}

function isSelectedByCountry(countryCode: CountryCode | undefined, value: CountryCode): boolean {
  return countryCode === undefined || countryCode === value;
}

export function queryPublicRoleRegistry(
  snapshot: PublicRoleRegistrySnapshot,
  registry: JurisdictionRegistrySnapshot,
  query: PublicRoleRegistryQuery,
): PublicRoleRegistryReadModel {
  assertPublicRoleRegistry(snapshot, registry);
  parseTime(query.asOf, 'asOf');
  const selection = query.selection ?? ({ kind: 'all', id: null } as const);
  const includeHistorical = query.includeHistorical === true;

  let officeTerms = snapshot.officeTerms.filter(
    (term) =>
      isSelectedByCountry(query.countryCode, term.countryCode) &&
      term.transitions.some(
        (transition) =>
          parseTime(transition.effectiveAt, 'effectiveAt') <= parseTime(query.asOf, 'asOf'),
      ),
  );
  let elections = snapshot.elections.filter(
    (election) =>
      isSelectedByCountry(query.countryCode, election.countryCode) &&
      election.versions.some((version) => isEffectiveAt(version, query.asOf)),
  );
  let candidacies = snapshot.candidacies.filter(
    (candidacy) =>
      isSelectedByCountry(query.countryCode, candidacy.countryCode) &&
      candidacy.transitions.some(
        (transition) =>
          parseTime(transition.effectiveAt, 'effectiveAt') <= parseTime(query.asOf, 'asOf'),
      ),
  );

  if (selection.kind === 'person') {
    officeTerms = officeTerms.filter(({ personId }) => personId === selection.id);
    candidacies = candidacies.filter(({ personId }) => personId === selection.id);
    const electionIds = new Set(candidacies.map(({ electionId }) => electionId));
    elections = elections.filter(({ electionId }) => electionIds.has(electionId));
  } else if (selection.kind === 'office') {
    officeTerms = officeTerms.filter(({ officeId }) => officeId === selection.id);
    candidacies = candidacies.filter(({ officeId }) => officeId === selection.id);
    elections = elections.filter(({ officeId }) => officeId === selection.id);
  } else if (selection.kind === 'office_term') {
    officeTerms = officeTerms.filter(({ officeTermId }) => officeTermId === selection.id);
    candidacies = [];
    elections = [];
  } else if (selection.kind === 'election') {
    officeTerms = [];
    elections = elections.filter(({ electionId }) => electionId === selection.id);
    candidacies = candidacies.filter(({ electionId }) => electionId === selection.id);
  } else if (selection.kind === 'candidacy') {
    officeTerms = [];
    candidacies = candidacies.filter(({ candidacyId }) => candidacyId === selection.id);
    const electionIds = new Set(candidacies.map(({ electionId }) => electionId));
    elections = elections.filter(({ electionId }) => electionIds.has(electionId));
  }

  const personIds = new Set<PersonId>([
    ...officeTerms.map(({ personId }) => personId),
    ...candidacies.map(({ personId }) => personId),
  ]);
  if (selection.kind === 'person') personIds.add(selection.id);
  if (selection.kind === 'all' && query.countryCode === undefined) {
    snapshot.people.forEach(({ personId }) => personIds.add(personId));
  }
  const termIds = new Set(officeTerms.map(({ officeTermId }) => officeTermId));
  const electionIds = new Set(elections.map(({ electionId }) => electionId));
  const candidacyIds = new Set(candidacies.map(({ candidacyId }) => candidacyId));

  const publicTerms = officeTerms.map((term) => {
    const state = currentState(term.officeTermId, term.transitions, query.asOf);
    return Object.freeze({
      ...term,
      currentState: state,
      tenureClassification: tenureClassification(state),
      transitions: publicTransitions(term.transitions, query.asOf),
    });
  });
  const publicCandidacies = candidacies.map((candidacy) =>
    Object.freeze({
      ...candidacy,
      currentState: currentState(candidacy.candidacyId, candidacy.transitions, query.asOf),
      transitions: publicTransitions(candidacy.transitions, query.asOf),
    }),
  );

  return Object.freeze({
    ...snapshot,
    asOf: query.asOf,
    candidacies: publicCandidacies,
    deferredFamilies: [
      'source_ingestion',
      'public_conduct',
      'participation',
      'representative_authorization',
      'identity_proof',
      'provenance',
      'representative_scoring',
    ] as const,
    elections: elections.map((election) => ({
      ...election,
      versions: election.versions.filter(
        (version) => includeHistorical || isEffectiveAt(version, query.asOf),
      ),
    })),
    externalIdentityReferences: snapshot.externalIdentityReferences.filter(
      (reference) =>
        personIds.has(reference.personId) &&
        (includeHistorical || isEffectiveAt(reference, query.asOf)),
    ),
    officeTermContacts: snapshot.officeTermContacts.filter(
      (contact) =>
        termIds.has(contact.officeTermId) &&
        (includeHistorical || isEffectiveAt(contact, query.asOf)),
    ),
    officeTermRelationships: snapshot.officeTermRelationships.filter(
      (relationship) =>
        termIds.has(relationship.officeTermId) &&
        termIds.has(relationship.relatedOfficeTermId) &&
        (includeHistorical || isEffectiveAt(relationship, query.asOf)),
    ),
    officeTerms: publicTerms,
    officialIdentifiers: snapshot.officialIdentifiers.filter(
      (identifier) =>
        (includeHistorical || isEffectiveAt(identifier, query.asOf)) &&
        ((identifier.entityKind === 'person' && personIds.has(identifier.entityId as PersonId)) ||
          (identifier.entityKind === 'office_term' &&
            termIds.has(identifier.entityId as OfficeTermId)) ||
          (identifier.entityKind === 'election' &&
            electionIds.has(identifier.entityId as ElectionId)) ||
          (identifier.entityKind === 'candidacy' &&
            candidacyIds.has(identifier.entityId as CandidacyId))),
    ),
    page: { nextCursor: null },
    people: snapshot.people
      .filter(({ personId }) => personIds.has(personId))
      .map((person) => ({
        ...person,
        names: person.names.filter((name) => includeHistorical || isEffectiveAt(name, query.asOf)),
      }))
      .filter((person) => includeHistorical || person.names.length > 0),
    personResolutions: snapshot.personResolutions
      .filter(
        (decision) =>
          (includeHistorical ||
            !snapshot.personResolutions.some(
              ({ supersedesDecisionId }) => supersedesDecisionId === decision.decisionId,
            )) &&
          [...decision.inputPersonIds, ...decision.outputPersonIds].some((personId) =>
            personIds.has(personId),
          ),
      )
      .map(({ review, ...decision }) => ({ ...decision, review: publicReview(review) })),
    selection,
  });
}

export function assertPublicRoleSubject(subject: PublicRoleSubject): void {
  if (subject.kind === 'office_term') assertId(subject.officeTermId, 'officeTermId');
  else assertId(subject.candidacyId, 'candidacyId');
}

export function assertionId(value: string): AssertionId {
  assertId(value, 'assertionId');
  return value as AssertionId;
}
