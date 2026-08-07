/* Generated from public-role-registry.schema.json. Do not edit directly. */

export type Timestamp = string;
export type Selection =
  | {
      kind: 'all';
      id: null;
    }
  | {
      kind: 'person' | 'office' | 'office_term' | 'election' | 'candidacy';
      id: Id;
    };
export type Id = string;
export type NullableTimestamp = Timestamp | null;
export type NullableId = Id | null;
export type CountryCode = 'CA' | 'US';

/**
 * Synthetic public people, office-term, election, candidacy, and reviewed person-resolution read model. PostgreSQL remains canonical and external identity references are inert.
 */
export interface PublicRoleRegistry {
  schemaVersion: 'public-role-registry.v1';
  dataMode: 'synthetic';
  generatedAt: Timestamp;
  asOf: Timestamp;
  selection: Selection;
  people: Person[];
  officeTerms: OfficeTerm[];
  officeTermRelationships: TermRelationship[];
  officeTermContacts: TermContact[];
  elections: Election[];
  candidacies: Candidacy[];
  officialIdentifiers: OfficialIdentifier[];
  personResolutions: PersonResolution[];
  externalIdentityReferences: ExternalIdentityReference[];
  /**
   * @minItems 7
   * @maxItems 7
   */
  deferredFamilies: never[];
  page: {
    nextCursor: null;
  };
}
export interface Person {
  personId: Id;
  recordState: 'active' | 'historical' | 'superseded';
  /**
   * @minItems 1
   */
  names: [PersonName, ...PersonName[]];
}
export interface PersonName {
  personNameId: Id;
  displayName: string;
  kind: 'primary' | 'alias' | 'previous' | 'transliteration';
  languageTag: string | null;
  effectiveFrom: Timestamp;
  effectiveTo: NullableTimestamp;
  attribution: Attribution;
}
export interface Attribution {
  assertionId: Id;
  sourceReference: string;
  observedAt: Timestamp;
  freshness: 'current' | 'stale' | 'unknown' | 'unavailable';
  coverage: 'supported' | 'partial' | 'gap' | 'unsupported';
  conflict: 'clear' | 'conflicting' | 'unsupported';
  supersedesAssertionId: NullableId;
}
export interface OfficeTerm {
  officeTermId: Id;
  personId: Id;
  countryCode: CountryCode;
  jurisdictionId: Id;
  districtId: NullableId;
  publicBodyId: Id;
  officeId: Id;
  origin: 'scheduled' | 'election_result' | 'appointment' | 'ex_officio';
  selectionMethod: 'elected' | 'appointed' | 'mixed' | 'ex_officio' | 'unknown';
  serviceCapacity: 'regular' | 'acting' | 'interim';
  plannedStart: Timestamp;
  plannedEnd: NullableTimestamp;
  currentState:
    'pending' | 'active' | 'cancelled' | 'ended' | 'resigned' | 'removed' | 'deceased' | 'disqualified' | 'superseded';
  tenureClassification: 'current' | 'former' | 'historical' | 'pending';
  /**
   * @minItems 1
   */
  transitions: [TermTransition, ...TermTransition[]];
}
export interface TermTransition {
  transitionId: Id;
  fromState:
    | (
        | 'pending'
        | 'active'
        | 'cancelled'
        | 'ended'
        | 'resigned'
        | 'removed'
        | 'deceased'
        | 'disqualified'
        | 'superseded'
      )
    | null;
  toState:
    'pending' | 'active' | 'cancelled' | 'ended' | 'resigned' | 'removed' | 'deceased' | 'disqualified' | 'superseded';
  effectiveAt: Timestamp;
  attribution: Attribution;
  review: PublicReview;
}
export interface PublicReview {
  actorType: 'reviewer' | 'admin' | 'source_process';
  process: 'manual_review' | 'reviewed_import' | 'synthetic_seed';
  reasonCode: string;
  recordedAt: Timestamp;
}
export interface TermRelationship {
  relationshipId: Id;
  officeTermId: Id;
  relatedOfficeTermId: Id;
  kind: 'predecessor_of' | 'successor_of' | 'supersedes';
  effectiveFrom: Timestamp;
  effectiveTo: NullableTimestamp;
  attribution: Attribution;
}
export interface TermContact {
  contactId: Id;
  officeTermId: Id;
  kind: 'office_email' | 'office_phone' | 'office_url';
  value: string;
  effectiveFrom: Timestamp;
  effectiveTo: NullableTimestamp;
  attribution: Attribution;
}
export interface Election {
  electionId: Id;
  countryCode: CountryCode;
  jurisdictionId: Id;
  districtId: NullableId;
  publicBodyId: Id;
  officeId: Id;
  /**
   * @minItems 1
   */
  versions: [ElectionVersion, ...ElectionVersion[]];
}
export interface ElectionVersion {
  versionId: Id;
  name: string;
  kind: 'general' | 'by_election' | 'primary' | 'special' | 'other';
  state: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'superseded';
  scheduledAt: Timestamp;
  effectiveFrom: Timestamp;
  effectiveTo: NullableTimestamp;
  attribution: Attribution;
}
export interface Candidacy {
  candidacyId: Id;
  personId: Id;
  electionId: Id;
  countryCode: CountryCode;
  jurisdictionId: Id;
  districtId: NullableId;
  officeId: Id;
  currentState:
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
  /**
   * @minItems 1
   */
  transitions: [CandidacyTransition, ...CandidacyTransition[]];
}
export interface CandidacyTransition {
  transitionId: Id;
  fromState:
    | (
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
        | 'superseded'
      )
    | null;
  toState:
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
  effectiveAt: Timestamp;
  attribution: Attribution;
  review: PublicReview;
}
export interface OfficialIdentifier {
  officialIdentifierId: Id;
  entityKind: 'person' | 'office_term' | 'election' | 'candidacy';
  entityId: Id;
  issuer: Id;
  identifier: string;
  effectiveFrom: Timestamp;
  effectiveTo: NullableTimestamp;
  attribution: Attribution;
}
export interface PersonResolution {
  decisionId: Id;
  kind: 'merge' | 'split' | 'distinct';
  /**
   * @minItems 1
   */
  inputPersonIds: [Id, ...Id[]];
  /**
   * @minItems 1
   */
  outputPersonIds: [Id, ...Id[]];
  effectiveAt: Timestamp;
  /**
   * @minItems 2
   */
  evidence: [ResolutionEvidence, ResolutionEvidence, ...ResolutionEvidence[]];
  attribution: Attribution;
  review: PublicReview;
  supersedesDecisionId: NullableId;
}
export interface ResolutionEvidence {
  evidenceId: Id;
  kind: 'name' | 'official_identifier' | 'office_context' | 'district_context' | 'effective_date' | 'source_conflict';
  reference: string;
  attribution: Attribution;
}
export interface ExternalIdentityReference {
  externalIdentityReferenceId: Id;
  personId: Id;
  kind: 'public_identifier' | 'verus_id';
  immutableReference: string;
  displayNameSnapshot: string | null;
  canonicalAuthority: false;
  grantsAuthorization: false;
  effectiveFrom: Timestamp;
  effectiveTo: NullableTimestamp;
  attribution: Attribution;
}
