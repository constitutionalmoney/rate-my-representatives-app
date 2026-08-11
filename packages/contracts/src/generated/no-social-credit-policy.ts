/* Generated from no-social-credit-policy.schema.json. Do not edit directly. */

export type CitizenDataClass =
  | 'account_security'
  | 'identity_attestation'
  | 'jurisdiction_location'
  | 'private_civic_activity'
  | 'moderation_abuse'
  | 'notification_subscription'
  | 'browsing_behavior'
  | 'cross_product_activity'
  | 'ai_inferred_trait';
export type ProhibitedOutcome =
  | 'generalized_reputation'
  | 'loyalty_or_conformity'
  | 'ideology_or_political_profile'
  | 'generalized_trustworthiness'
  | 'generalized_civic_worth'
  | 'generalized_eligibility_or_risk'
  | 'public_individual_civic_activity'
  | 'commercial_or_advertising_targeting'
  | 'unrelated_access_decision'
  | 'portable_narrow_state'
  | 'combined_narrow_state_rank'
  | 'cross_product_citizen_profile'
  | 'ai_inferred_citizen_trait'
  | 'citizen_attributes_in_public_role_method';
export type NarrowStateKind =
  | 'authentication_status'
  | 'attestation_status'
  | 'action_eligibility'
  | 'rate_limit'
  | 'evidence_submission'
  | 'moderation_decision'
  | 'representative_authorization'
  | 'security_incident'
  | 'account_compromise';
export type Id = string;
export type Principal =
  'account_service' | 'identity_service' | 'moderation_service' | 'participation_service' | 'security_auditor';
export type ReleaseGate = {
  [k: string]: unknown;
} & {
  decision: 'blocked' | 'eligible_for_review' | 'approved_for_pilot';
  participatoryPilotAllowed: boolean;
  productionLegalReviewApproved: boolean;
  namedOwnerAssigned: boolean;
  evidence: ReleaseEvidence;
  openBlockers: Id[];
  decisionReason: string;
};
export type EvidenceStatus = {
  [k: string]: unknown;
} & {
  status: 'implemented_foundation' | 'follow_on_required' | 'approved';
  references: string[];
};

/**
 * Machine-readable No Social Credit enforcement baseline; never a citizen record, score, profile, or production approval.
 */
export interface NoSocialCreditPolicyV1 {
  schemaVersion: 'no-social-credit-policy.v1';
  policyVersion: 'no-social-credit-policy.v1';
  dataMode: 'synthetic';
  covenant: 'No social credit scores shall be created with this technology by Civic Ledger AI Ltd. or Checks and Balances Committee Ltd., or in any implementation that either company develops, operates, governs, or licenses.';
  hardRules: HardRules;
  /**
   * @minItems 9
   * @maxItems 9
   */
  citizenDataClasses: [
    CitizenDataClass,
    CitizenDataClass,
    CitizenDataClass,
    CitizenDataClass,
    CitizenDataClass,
    CitizenDataClass,
    CitizenDataClass,
    CitizenDataClass,
    CitizenDataClass,
  ];
  /**
   * @minItems 12
   */
  prohibitedOutcomes: [
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ProhibitedOutcome,
    ...ProhibitedOutcome[],
  ];
  /**
   * @minItems 9
   * @maxItems 9
   */
  narrowStates: [
    NarrowState,
    NarrowState,
    NarrowState,
    NarrowState,
    NarrowState,
    NarrowState,
    NarrowState,
    NarrowState,
    NarrowState,
  ];
  enforcement: Enforcement;
  rightsAndReporting: RightsAndReporting;
  impactAssessment: ImpactAssessment;
  releaseGate: ReleaseGate;
}
export interface HardRules {
  generalizedCitizenValueAllowed: false;
  citizenTraitInferenceAllowed: false;
  individualCivicActivityPublicAllowed: false;
  citizenDataInPublicRoleMethodAllowed: false;
  narrowStatesPortableAllowed: false;
  narrowStatesCombinableAllowed: false;
  unrelatedAccessUseAllowed: false;
  crossProductCitizenLinkageAllowed: false;
  civicAdvertisingTargetingAllowed: false;
  agentHumanIntentAllowed: false;
  featureFlagOverrideAllowed: false;
  productionApprovalClaimed: false;
}
export interface NarrowState {
  stateKind: NarrowStateKind;
  purpose: Id;
  /**
   * @minItems 1
   */
  dataClasses: [CitizenDataClass, ...CitizenDataClass[]];
  /**
   * @minItems 1
   */
  allowedPrincipals: [Principal, ...Principal[]];
  retentionClass: Id;
  retentionStatus: 'follow_on_policy_required';
  reasonRule: 'generic_external_reason' | 'purpose_specific_reason';
  reviewRight: 'access_and_correction' | 'access_correction_and_appeal';
  publicDisclosureAllowed: false;
  portable: false;
  combinable: false;
  unrelatedAccessAllowed: false;
}
export interface Enforcement {
  databaseForbiddenJoinGuard: true;
  publicSerializerGuard: true;
  eventAndExportGuard: true;
  analyticsAllowlistGuard: true;
  agentAndAiGuard: true;
  mobileTelemetryGuard: true;
  crossProductGuard: true;
  publicRoleMethodGuard: true;
  featureFlagsCannotOverride: true;
  /**
   * @minItems 1
   */
  evidenceReferences: [string, ...string[]];
}
export interface RightsAndReporting {
  publicPolicyPath: 'docs/NO_SOCIAL_CREDIT.md';
  suspectedViolationRoute: 'SECURITY.md#report-privately';
  accessCorrectionObjectionDeletionStatus: 'follow_on_policy_required';
  productionContactApproved: false;
}
export interface ImpactAssessment {
  pullRequestTemplateRequired: true;
  rfcTemplateRequired: true;
  featureRequestTemplateRequired: true;
  /**
   * @minItems 8
   */
  requiredFields: [
    (
      | 'citizen_data'
      | 'purpose'
      | 'ranking_or_prediction'
      | 'access'
      | 'retention'
      | 'reason_and_appeal'
      | 'cross_product_use'
      | 'unrelated_access_effect'
      | 'proving_tests'
    ),
    (
      | 'citizen_data'
      | 'purpose'
      | 'ranking_or_prediction'
      | 'access'
      | 'retention'
      | 'reason_and_appeal'
      | 'cross_product_use'
      | 'unrelated_access_effect'
      | 'proving_tests'
    ),
    (
      | 'citizen_data'
      | 'purpose'
      | 'ranking_or_prediction'
      | 'access'
      | 'retention'
      | 'reason_and_appeal'
      | 'cross_product_use'
      | 'unrelated_access_effect'
      | 'proving_tests'
    ),
    (
      | 'citizen_data'
      | 'purpose'
      | 'ranking_or_prediction'
      | 'access'
      | 'retention'
      | 'reason_and_appeal'
      | 'cross_product_use'
      | 'unrelated_access_effect'
      | 'proving_tests'
    ),
    (
      | 'citizen_data'
      | 'purpose'
      | 'ranking_or_prediction'
      | 'access'
      | 'retention'
      | 'reason_and_appeal'
      | 'cross_product_use'
      | 'unrelated_access_effect'
      | 'proving_tests'
    ),
    (
      | 'citizen_data'
      | 'purpose'
      | 'ranking_or_prediction'
      | 'access'
      | 'retention'
      | 'reason_and_appeal'
      | 'cross_product_use'
      | 'unrelated_access_effect'
      | 'proving_tests'
    ),
    (
      | 'citizen_data'
      | 'purpose'
      | 'ranking_or_prediction'
      | 'access'
      | 'retention'
      | 'reason_and_appeal'
      | 'cross_product_use'
      | 'unrelated_access_effect'
      | 'proving_tests'
    ),
    (
      | 'citizen_data'
      | 'purpose'
      | 'ranking_or_prediction'
      | 'access'
      | 'retention'
      | 'reason_and_appeal'
      | 'cross_product_use'
      | 'unrelated_access_effect'
      | 'proving_tests'
    ),
    ...(
      | 'citizen_data'
      | 'purpose'
      | 'ranking_or_prediction'
      | 'access'
      | 'retention'
      | 'reason_and_appeal'
      | 'cross_product_use'
      | 'unrelated_access_effect'
      | 'proving_tests'
    )[],
  ];
}
export interface ReleaseEvidence {
  database: EvidenceStatus;
  publicSerializers: EvidenceStatus;
  authorization: EvidenceStatus;
  eventsAndExports: EvidenceStatus;
  analytics: EvidenceStatus;
  ai: EvidenceStatus;
  mobileTelemetry: EvidenceStatus;
  crossProduct: EvidenceStatus;
  aggregateDifferencing: EvidenceStatus;
  publicRoleMethodology: EvidenceStatus;
  rightsAndReporting: EvidenceStatus;
  independentReview: EvidenceStatus;
}
