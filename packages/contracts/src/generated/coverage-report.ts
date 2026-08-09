/* Generated from coverage-report.schema.json. Do not edit directly. */

export type CoverageReportV1 = {
  [k: string]: unknown;
} & {
  schemaVersion: 'coverage-report.v1';
  policyVersion: 'coverage-policy.v1';
  reportId: Id;
  dataMode: 'synthetic' | 'pilot' | 'production';
  generatedAt: string;
  asOf: string;
  methodVersion: Id;
  codeRevision: Id;
  scope: Scope;
  jurisdictions: JurisdictionCoverage[];
  authoritativeSources: Source[];
  inventory: Inventory;
  /**
   * @minItems 7
   * @maxItems 7
   */
  dimensions: {
    [k: string]: unknown;
  } & [Dimension, Dimension, Dimension, Dimension, Dimension, Dimension, Dimension];
  freshness: Freshness;
  connectors: Connector[];
  gaps: PublicCondition[];
  knownErrors: PublicCondition[];
  corrections: Corrections;
  changelog: Change[];
  missingDataMeaning: 'coverage_gap_not_misconduct';
  provenance: Provenance;
  releaseDecision: ReleaseDecision;
  sha256: string;
};
export type Id = string;
export type SupportState = 'supported' | 'partial' | 'gap' | 'unsupported' | 'not_applicable';
export type NonNegativeInteger = number;
export type Percentage = number | null;
export type Provenance = {
  [k: string]: unknown;
} & {
  state: 'not_anchored' | 'not_applicable' | 'verified_public_anchor';
  approvedPublicArtifactOnly: true;
  anchorReference: string | null;
};
export type ReleaseDecision = {
  [k: string]: unknown;
} & {
  status: 'not_ready' | 'eligible_for_review' | 'supported';
  publicApproval: boolean;
  blockingGapIds: Id[];
};

export interface Scope {
  /**
   * @minItems 1
   */
  countryCodes: ['CA' | 'US', ...('CA' | 'US')[]];
  /**
   * @minItems 1
   */
  jurisdictionIds: [Id, ...Id[]];
  /**
   * @minItems 1
   */
  levels: [Id, ...Id[]];
  /**
   * @minItems 1
   */
  recordFamilies: [
    (
      | 'jurisdiction'
      | 'district'
      | 'public_body'
      | 'office'
      | 'person'
      | 'office_term'
      | 'election'
      | 'candidacy'
      | 'profile'
      | 'material_claim'
    ),
    ...(
      | 'jurisdiction'
      | 'district'
      | 'public_body'
      | 'office'
      | 'person'
      | 'office_term'
      | 'election'
      | 'candidacy'
      | 'profile'
      | 'material_claim'
    )[],
  ];
  validFrom: string;
  validTo: string;
  /**
   * @minItems 1
   */
  inventorySourceIds: [Id, ...Id[]];
}
export interface JurisdictionCoverage {
  jurisdictionId: Id;
  countryCode: 'CA' | 'US';
  level: Id;
  supportState: SupportState;
  gapIds: Id[];
}
export interface Source {
  sourceId: Id;
  sourceClass: 'legal_authority' | 'official_roster' | 'official_page' | 'secondary_gap_only';
  publisherAuthority: string;
  connectorOwner: string;
  dataStewardOwner: string;
  termsUrl: string;
  licence: string;
  attribution: string;
  retentionAllowed: boolean;
  redistributionAllowed: boolean;
  approvedFreshnessHours: number;
  lastCheckedAt: string | null;
  availability: 'available' | 'stale' | 'missing' | 'retracted' | 'unavailable';
}
export interface Inventory {
  expected: EntityCounts;
  observed: EntityCounts;
  unexpectedDiscoveryCount: NonNegativeInteger;
}
export interface EntityCounts {
  jurisdiction: NonNegativeInteger;
  district: NonNegativeInteger;
  publicBody: NonNegativeInteger;
  office: NonNegativeInteger;
  person: NonNegativeInteger;
  officeTerm: NonNegativeInteger;
  election: NonNegativeInteger;
  candidacy: NonNegativeInteger;
  profile: NonNegativeInteger;
  materialClaim: NonNegativeInteger;
}
export interface Dimension {
  dimensionId:
    | 'structural_registry'
    | 'person_role_lifecycle'
    | 'profile_coverage'
    | 'material_claim_source_coverage'
    | 'public_gap_disclosure'
    | 'correction_supersession'
    | 'representative_match';
  numerator: NonNegativeInteger;
  denominator: NonNegativeInteger;
  percentage: Percentage;
  thresholdPercentage: number;
  supportState: SupportState;
  gapIds: Id[];
}
export interface Freshness {
  denominator: NonNegativeInteger;
  currentCount: NonNegativeInteger;
  staleCount: NonNegativeInteger;
  unknownCount: NonNegativeInteger;
  unavailableCount: NonNegativeInteger;
  currentPercentage: Percentage;
}
export interface Connector {
  sourceId: Id;
  health: 'healthy' | 'degraded' | 'stale' | 'failed' | 'unavailable';
  lastScheduledAt: string | null;
  lastCompletedAt: string | null;
  scheduledRunCount: NonNegativeInteger;
  successfulRunCount: NonNegativeInteger;
  successPercentage: Percentage;
  failureCount: NonNegativeInteger;
  gapIds: Id[];
}
export interface PublicCondition {
  conditionId: Id;
  kind: 'missing' | 'stale' | 'failed' | 'conflicting' | 'quarantined' | 'retracted' | 'unavailable' | 'method_error';
  severity: 'informational' | 'non_critical' | 'critical';
  status: 'open' | 'corrected' | 'superseded' | 'retracted';
  /**
   * @minItems 1
   */
  affectedIds: [Id, ...Id[]];
  firstObservedAt: string;
  lastObservedAt: string;
  publicExplanation: string;
}
export interface Corrections {
  acceptedCount: NonNegativeInteger;
  reflectedCount: NonNegativeInteger;
  pastTargetOutstandingCount: NonNegativeInteger;
  supersessionCoveragePercentage: Percentage;
  supersedesReportId: Id | null;
}
export interface Change {
  changeId: Id;
  changedAt: string;
  kind: 'initial' | 'scope' | 'denominator' | 'source' | 'method' | 'correction' | 'supersession' | 'retraction';
  summary: string;
}
