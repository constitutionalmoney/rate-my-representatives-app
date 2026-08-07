/* Generated from public-role-profile.schema.json. Do not edit directly. */

export type Id = string;
export type Timestamp = string;
export type CountryCode = 'CA' | 'US';
export type AvailabilityState = 'available' | 'not_available' | 'unsupported' | 'stale' | 'coverage_gap';
/**
 * @minItems 1
 */
export type SourceIds = [Id, ...Id[]];
export type FreshnessState = 'current' | 'stale' | 'not_available' | 'unsupported' | 'coverage_gap';

/**
 * Allowlisted, source-backed public profile for one person in one office-term or candidacy context.
 */
export interface PublicRoleProfile {
  schemaVersion: 'public-role-profile.v1';
  dataMode: 'synthetic';
  profileId: Id;
  recordVersion: number;
  updatedAt: Timestamp;
  etag: string;
  publication: Publication;
  summary: ProfileSummary;
  person: Person;
  office: Office;
  district: District | null;
  officeTerm: OfficeTerm | null;
  election: Election | null;
  candidacy: Candidacy | null;
  officialContactRoutes: ContactRoute[];
  claims: MaterialClaim[];
  sources: SourceSection;
  coverage: CoverageSection;
  responses: ResponseSection;
  disputes: DisputeSection;
  corrections: CorrectionSection;
  appeals: AppealSection;
  method: MethodMetadata;
  provenance: ProvenanceMetadata | null;
  externalIdentityReferences: ExternalIdentityReference[];
  timelinePath: string;
}
export interface Publication {
  state: 'published';
  method: 'human_review';
  decisionId: Id;
  decidedAt: Timestamp;
}
export interface ProfileSummary {
  profileId: Id;
  personId: Id;
  displayName: string;
  countryCode: CountryCode;
  governmentLevel: 'federal' | 'provincial' | 'territorial' | 'state' | 'municipal' | 'local' | 'special';
  officeTitle: string;
  districtLabel: string | null;
  roleStatus:
    | 'current'
    | 'former'
    | 'acting'
    | 'appointed'
    | 'elected'
    | 'declared'
    | 'withdrawn'
    | 'disqualified'
    | 'historical';
  context: ProfileContext;
  availability: AvailabilityState;
  recordVersion: number;
  updatedAt: Timestamp;
}
export interface ProfileContext {
  kind: 'office_term' | 'candidacy';
  officeTermId: Id | null;
  candidacyId: Id | null;
}
export interface Person {
  personId: Id;
  displayName: string;
  officialIdentifiers: {
    identifierId: Id;
    issuer: string;
    value: string;
    sourceIds: SourceIds;
    freshness: FreshnessState;
  }[];
}
export interface Office {
  officeId: Id;
  title: string;
  governmentLevel: 'federal' | 'provincial' | 'territorial' | 'state' | 'municipal' | 'local' | 'special';
  selectionMethod: 'elected' | 'appointed' | 'mixed' | 'ex_officio' | 'unknown';
  sourceIds: SourceIds;
  freshness: FreshnessState;
}
export interface District {
  districtId: Id;
  label: string;
  sourceIds: SourceIds;
  freshness: FreshnessState;
}
export interface OfficeTerm {
  officeTermId: Id;
  state:
    'pending' | 'active' | 'cancelled' | 'ended' | 'resigned' | 'removed' | 'deceased' | 'disqualified' | 'superseded';
  origin: 'scheduled' | 'election_result' | 'appointment' | 'ex_officio';
  serviceCapacity: 'regular' | 'acting' | 'interim';
  plannedStart: Timestamp;
  plannedEnd: Timestamp | null;
  sourceIds: SourceIds;
  freshness: FreshnessState;
}
export interface Election {
  electionId: Id;
  name: string;
  kind: 'general' | 'by_election' | 'primary' | 'special' | 'other';
  state: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'superseded';
  scheduledAt: Timestamp;
  sourceIds: SourceIds;
  freshness: FreshnessState;
}
export interface Candidacy {
  candidacyId: Id;
  state:
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
  sourceIds: SourceIds;
  freshness: FreshnessState;
}
export interface ContactRoute {
  contactRouteId: Id;
  kind: 'office_email' | 'office_phone' | 'office_url';
  value: string;
  sourceIds: SourceIds;
  freshness: FreshnessState;
}
export interface MaterialClaim {
  claimId: Id;
  category:
    | 'vote'
    | 'attendance'
    | 'committee_work'
    | 'expense'
    | 'disclosure'
    | 'public_statement'
    | 'promise_position'
    | 'documented_event'
    | 'outcome';
  label: string;
  value: string;
  status: 'reviewed' | 'corrected' | 'disputed';
  sourceIds: SourceIds;
  freshness: FreshnessState;
  observedAt: Timestamp | null;
  conflictState: 'clear' | 'conflicting';
  evidence: {
    supportingSourceIds: SourceIds;
    challengingSourceIds: Id[];
    note: string | null;
  };
  updatedAt: Timestamp;
}
export interface SourceSection {
  schemaVersion: 'public-role-profile-sources.v1';
  profileId: Id;
  recordVersion: number;
  updatedAt: Timestamp;
  /**
   * @minItems 1
   */
  items: [Source, ...Source[]];
}
export interface Source {
  sourceId: Id;
  publisher: string;
  sourceType:
    | 'official_registry'
    | 'official_legislative_record'
    | 'official_election_record'
    | 'official_disclosure'
    | 'official_statement';
  originalUrl: string;
  normalizedUrl: string;
  retrievedAt: Timestamp;
  contentSha256: string;
  licenceNote: string;
  termsUrl: string;
  freshness: FreshnessState;
  fetchOutcome:
    'succeeded' | 'not_modified' | 'failed' | 'blocked' | 'too_large' | 'invalid_content' | 'redirect_rejected';
  reviewedRecordVersionId: Id;
}
export interface CoverageSection {
  schemaVersion: 'public-role-profile-coverage.v1';
  profileId: Id;
  recordVersion: number;
  updatedAt: Timestamp;
  methodVersion: Id;
  missingDataMeaning: 'coverage_gap_not_misconduct';
  /**
   * @minItems 1
   */
  items: [CoverageItem, ...CoverageItem[]];
  conflicts: SourceConflict[];
}
export interface CoverageItem {
  category:
    | 'identity'
    | 'office_context'
    | 'contact'
    | 'votes'
    | 'attendance'
    | 'committee_work'
    | 'expenses'
    | 'disclosures'
    | 'public_statements'
    | 'promises_positions'
    | 'events_outcomes';
  state: AvailabilityState;
  explanation: string;
  lastReviewedAt: Timestamp | null;
  sourceIds: Id[];
}
export interface SourceConflict {
  conflictId: Id;
  field: string;
  state: 'open' | 'resolved' | 'quarantined';
  /**
   * @minItems 2
   */
  sourceIds: [Id, Id, ...Id[]];
  explanation: string;
}
export interface ResponseSection {
  schemaVersion: 'public-role-profile-responses.v1';
  profileId: Id;
  recordVersion: number;
  updatedAt: Timestamp;
  availability: AvailabilityState;
  items: ResponseItem[];
}
export interface ResponseItem {
  responseId: Id;
  publishedAt: Timestamp;
  summary: string;
  sourceIds: SourceIds;
}
export interface DisputeSection {
  schemaVersion: 'public-role-profile-disputes.v1';
  profileId: Id;
  recordVersion: number;
  updatedAt: Timestamp;
  availability: AvailabilityState;
  items: DisputeItem[];
}
export interface DisputeItem {
  disputeId: Id;
  state: 'open' | 'resolved' | 'withdrawn';
  openedAt: Timestamp;
  summary: string;
  /**
   * @minItems 1
   */
  claimIds: [Id, ...Id[]];
  sourceIds: SourceIds;
}
export interface CorrectionSection {
  schemaVersion: 'public-role-profile-corrections.v1';
  profileId: Id;
  recordVersion: number;
  updatedAt: Timestamp;
  availability: AvailabilityState;
  items: CorrectionItem[];
}
export interface CorrectionItem {
  correctionId: Id;
  correctedAt: Timestamp;
  summary: string;
  supersedesClaimId: Id;
  replacementClaimId: Id;
  sourceIds: SourceIds;
}
export interface AppealSection {
  schemaVersion: 'public-role-profile-appeals.v1';
  profileId: Id;
  recordVersion: number;
  updatedAt: Timestamp;
  availability: AvailabilityState;
  items: AppealItem[];
}
export interface AppealItem {
  appealId: Id;
  state: 'open' | 'upheld' | 'denied' | 'withdrawn';
  openedAt: Timestamp;
  summary: string;
  disputeId: Id;
  sourceIds: SourceIds;
}
export interface MethodMetadata {
  profileMethodVersion: Id;
  coverageMethodVersion: Id;
  compositeScoreIncluded: false;
  signalAggregateIncluded: false;
}
export interface ProvenanceMetadata {
  state:
    | 'not_anchored'
    | 'pending'
    | 'confirmed_unverified'
    | 'verified'
    | 'verification_failed'
    | 'orphaned'
    | 'superseded';
  network: 'VRSCTEST' | 'VRSC';
  anchorId: Id | null;
  truthDisclaimer: 'provenance_commits_to_bytes_not_truth';
}
export interface ExternalIdentityReference {
  referenceId: Id;
  kind: 'public_identifier' | 'verus_id';
  immutableReference: string;
  canonicalAuthority: false;
  grantsAuthorization: false;
  sourceIds: SourceIds;
  freshness: FreshnessState;
}
