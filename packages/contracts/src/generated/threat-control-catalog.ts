/* Generated from threat-control-catalog.schema.json. Do not edit directly. */

export type Id = string;
export type ActorClass =
  | 'external_attacker'
  | 'compromised_user'
  | 'representative_or_staff'
  | 'coordinated_group'
  | 'malicious_submitter'
  | 'colluding_moderators'
  | 'insider'
  | 'data_broker'
  | 'scraper'
  | 'source_publisher'
  | 'compromised_dependency'
  | 'ai_provider'
  | 'wallet_link_attacker'
  | 'compromised_signer_or_node'
  | 'operator_error';
export type Domain =
  | 'authentication_authority'
  | 'privacy_location'
  | 'no_social_credit'
  | 'sources_documents'
  | 'ai'
  | 'moderation_safety'
  | 'mobile_supply_chain'
  | 'mobile_links_storage_push'
  | 'verus_account_proof'
  | 'verus_identity_update'
  | 'verus_managed_identities'
  | 'provenance'
  | 'operations_resilience'
  | 'public_registry_memory';
export type ReleaseReadiness = {
  [k: string]: unknown;
} & {
  decision: 'blocked' | 'eligible_for_independent_review' | 'approved_for_pilot';
  namedOwnersAssigned: boolean;
  publicReadDegradationTested: boolean;
  independentReviews: Reviews;
  unresolvedDecisionIds: Id[];
  pilotBlockerThreatIds: string[];
  decisionReason: string;
};
export type Review = {
  [k: string]: unknown;
} & {
  status: 'pending' | 'approved' | 'rejected';
  evidenceReferences: string[];
};

/**
 * Status-aware threat/control review catalog; never a production telemetry or citizen-risk record.
 */
export interface ThreatControlCatalogV1 {
  schemaVersion: 'threat-control-catalog.v1';
  policyVersion: 'application-threat-model.v1';
  catalogId: Id;
  dataMode: 'synthetic' | 'production';
  generatedAt: string;
  /**
   * @minItems 1
   */
  assumptions: [string, ...string[]];
  hardRules: HardRules;
  /**
   * @minItems 1
   */
  actorClasses: [ActorClass, ...ActorClass[]];
  /**
   * @minItems 1
   */
  boundaryIds: [string, ...string[]];
  /**
   * @minItems 1
   */
  domainCoverage: [Domain, ...Domain[]];
  /**
   * @minItems 1
   */
  threats: [Threat, ...Threat[]];
  releaseReadiness: ReleaseReadiness;
}
export interface HardRules {
  coreBuildRequiresVerus: false;
  mainnetWritesAllowed: false;
  privateMaterialAllowedInPublicProvenance: false;
  aiMayExerciseHumanIntent: false;
  automaticAllegationPublicationAllowed: false;
  provenanceProvesTruth: false;
  highRiskFeaturesDefaultEnabled: false;
  optionalDependencyFailureBlocksSafePublicReads: false;
  productionAssuranceClaimed: false;
}
export interface Threat {
  threatId: string;
  domain: Domain;
  title: string;
  scenario: string;
  /**
   * @minItems 1
   */
  assetClasses: [Id, ...Id[]];
  /**
   * @minItems 1
   */
  actorClasses: [ActorClass, ...ActorClass[]];
  /**
   * @minItems 1
   */
  boundaryIds: [string, ...string[]];
  /**
   * @minItems 1
   */
  impacts: [
    (
      | 'safety'
      | 'privacy'
      | 'integrity'
      | 'availability'
      | 'authorization'
      | 'legal'
      | 'democratic_process'
      | 'supply_chain'
    ),
    ...(
      | 'safety'
      | 'privacy'
      | 'integrity'
      | 'availability'
      | 'authorization'
      | 'legal'
      | 'democratic_process'
      | 'supply_chain'
    )[],
  ];
  /**
   * @minItems 1
   */
  controls: [Control, ...Control[]];
  /**
   * @minItems 1
   */
  tests: [TestEvidence, ...TestEvidence[]];
  residualRisk: ResidualRisk;
  incidentOwnerRole:
    | 'security_lead'
    | 'privacy_lead'
    | 'platform_owner'
    | 'data_stewardship'
    | 'identity_authority_owner'
    | 'moderation_safety_owner'
    | 'ai_governance_owner'
    | 'mobile_release_owner'
    | 'verus_operations_owner'
    | 'provenance_owner'
    | 'governance_legal';
  safeDegradation: string;
  pilotBlocker: boolean;
  unresolvedDecisions: Id[];
}
export interface Control {
  controlId: Id;
  status: 'implemented_foundation' | 'accepted_policy' | 'future_required' | 'unresolved';
  description: string;
  evidenceReferences: string[];
}
export interface TestEvidence {
  testId: Id;
  kind: 'automated' | 'manual' | 'independent_review';
  status: 'implemented' | 'planned' | 'manual_required' | 'independent_review_required';
  evidenceReference: string | null;
  redactionRequired: true;
}
export interface ResidualRisk {
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'accepted_for_foundation' | 'requires_mitigation' | 'pilot_blocker' | 'unresolved';
  explanation: string;
}
export interface Reviews {
  applicationSecurity: Review;
  privacyAndNoSocialCredit: Review;
  sourceAndHostileContent: Review;
  moderationAndSafety: Review;
  nativeMobileSupplyChain: Review;
  aiSafety: Review;
  verusAndSignerOperations: Review;
  backupRestoreAndIncidentResponse: Review;
}
