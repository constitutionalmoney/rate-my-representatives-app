export const NO_SOCIAL_CREDIT_POLICY_VERSION = 'no-social-credit-policy.v1' as const;

export const CITIZEN_DATA_CLASSES = [
  'account_security',
  'identity_attestation',
  'jurisdiction_location',
  'private_civic_activity',
  'moderation_abuse',
  'notification_subscription',
  'browsing_behavior',
  'cross_product_activity',
  'ai_inferred_trait',
] as const;

export type CitizenDataClass = (typeof CITIZEN_DATA_CLASSES)[number];

export const POLICY_DATA_CLASSES = [
  ...CITIZEN_DATA_CLASSES,
  'public_role_record',
  'public_source_record',
] as const;

export type PolicyDataClass = (typeof POLICY_DATA_CLASSES)[number];

export const NARROW_STATE_KINDS = [
  'authentication_status',
  'attestation_status',
  'action_eligibility',
  'rate_limit',
  'evidence_submission',
  'moderation_decision',
  'representative_authorization',
  'security_incident',
  'account_compromise',
] as const;

export type NarrowStateKind = (typeof NARROW_STATE_KINDS)[number];

export type NarrowStatePrincipal =
  | 'account_service'
  | 'identity_service'
  | 'moderation_service'
  | 'participation_service'
  | 'security_auditor';

export interface PurposeLimitedStateRule {
  readonly stateKind: NarrowStateKind;
  readonly purpose: string;
  readonly dataClasses: readonly CitizenDataClass[];
  readonly allowedPrincipals: readonly NarrowStatePrincipal[];
  readonly retentionClass: string;
  readonly retentionStatus: 'follow_on_policy_required';
  readonly reasonRule: 'generic_external_reason' | 'purpose_specific_reason';
  readonly reviewRight: 'access_and_correction' | 'access_correction_and_appeal';
  readonly publicDisclosureAllowed: false;
  readonly portable: false;
  readonly combinable: false;
  readonly unrelatedAccessAllowed: false;
}

export const PURPOSE_LIMITED_STATE_RULES: readonly PurposeLimitedStateRule[] = Object.freeze([
  {
    stateKind: 'authentication_status',
    purpose: 'establish_or_end_one_application_session',
    dataClasses: ['account_security'],
    allowedPrincipals: ['account_service', 'security_auditor'],
    retentionClass: 'credential_lifecycle_pending_issues_23_45',
    retentionStatus: 'follow_on_policy_required',
    reasonRule: 'generic_external_reason',
    reviewRight: 'access_and_correction',
    publicDisclosureAllowed: false,
    portable: false,
    combinable: false,
    unrelatedAccessAllowed: false,
  },
  {
    stateKind: 'attestation_status',
    purpose: 'evaluate_one_separately_approved_attestation_requirement',
    dataClasses: ['identity_attestation'],
    allowedPrincipals: ['identity_service', 'security_auditor'],
    retentionClass: 'attestation_lifecycle_pending_issues_23_45',
    retentionStatus: 'follow_on_policy_required',
    reasonRule: 'purpose_specific_reason',
    reviewRight: 'access_correction_and_appeal',
    publicDisclosureAllowed: false,
    portable: false,
    combinable: false,
    unrelatedAccessAllowed: false,
  },
  {
    stateKind: 'action_eligibility',
    purpose: 'authorize_one_defined_action_under_one_versioned_method',
    dataClasses: ['identity_attestation', 'jurisdiction_location'],
    allowedPrincipals: ['identity_service', 'participation_service', 'security_auditor'],
    retentionClass: 'eligibility_snapshot_pending_issues_23_45',
    retentionStatus: 'follow_on_policy_required',
    reasonRule: 'purpose_specific_reason',
    reviewRight: 'access_correction_and_appeal',
    publicDisclosureAllowed: false,
    portable: false,
    combinable: false,
    unrelatedAccessAllowed: false,
  },
  {
    stateKind: 'rate_limit',
    purpose: 'limit_one_route_family_for_abuse_and_availability',
    dataClasses: ['account_security', 'moderation_abuse'],
    allowedPrincipals: ['account_service', 'moderation_service', 'security_auditor'],
    retentionClass: 'bounded_abuse_window_pending_issues_23_45',
    retentionStatus: 'follow_on_policy_required',
    reasonRule: 'generic_external_reason',
    reviewRight: 'access_correction_and_appeal',
    publicDisclosureAllowed: false,
    portable: false,
    combinable: false,
    unrelatedAccessAllowed: false,
  },
  {
    stateKind: 'evidence_submission',
    purpose: 'track_one_evidence_submission_through_due_process',
    dataClasses: ['private_civic_activity', 'moderation_abuse'],
    allowedPrincipals: ['moderation_service', 'security_auditor'],
    retentionClass: 'evidence_case_pending_issues_23_45',
    retentionStatus: 'follow_on_policy_required',
    reasonRule: 'purpose_specific_reason',
    reviewRight: 'access_correction_and_appeal',
    publicDisclosureAllowed: false,
    portable: false,
    combinable: false,
    unrelatedAccessAllowed: false,
  },
  {
    stateKind: 'moderation_decision',
    purpose: 'decide_one_moderation_case_under_one_policy_version',
    dataClasses: ['moderation_abuse'],
    allowedPrincipals: ['moderation_service', 'security_auditor'],
    retentionClass: 'moderation_case_pending_issues_23_45',
    retentionStatus: 'follow_on_policy_required',
    reasonRule: 'purpose_specific_reason',
    reviewRight: 'access_correction_and_appeal',
    publicDisclosureAllowed: false,
    portable: false,
    combinable: false,
    unrelatedAccessAllowed: false,
  },
  {
    stateKind: 'representative_authorization',
    purpose: 'authorize_one_scoped_representative_or_staff_action',
    dataClasses: ['account_security'],
    allowedPrincipals: ['account_service', 'moderation_service', 'security_auditor'],
    retentionClass: 'authority_lifecycle_pending_issues_23_45',
    retentionStatus: 'follow_on_policy_required',
    reasonRule: 'purpose_specific_reason',
    reviewRight: 'access_correction_and_appeal',
    publicDisclosureAllowed: false,
    portable: false,
    combinable: false,
    unrelatedAccessAllowed: false,
  },
  {
    stateKind: 'security_incident',
    purpose: 'contain_and_review_one_security_incident',
    dataClasses: ['account_security', 'moderation_abuse'],
    allowedPrincipals: ['account_service', 'security_auditor'],
    retentionClass: 'security_incident_pending_issues_23_45',
    retentionStatus: 'follow_on_policy_required',
    reasonRule: 'generic_external_reason',
    reviewRight: 'access_correction_and_appeal',
    publicDisclosureAllowed: false,
    portable: false,
    combinable: false,
    unrelatedAccessAllowed: false,
  },
  {
    stateKind: 'account_compromise',
    purpose: 'recover_and_protect_one_compromised_application_account',
    dataClasses: ['account_security'],
    allowedPrincipals: ['account_service', 'security_auditor'],
    retentionClass: 'account_recovery_pending_issues_23_45',
    retentionStatus: 'follow_on_policy_required',
    reasonRule: 'generic_external_reason',
    reviewRight: 'access_correction_and_appeal',
    publicDisclosureAllowed: false,
    portable: false,
    combinable: false,
    unrelatedAccessAllowed: false,
  },
]);

export type PolicyOutputKind =
  | 'purpose_limited_state'
  | 'coarse_operational_metric'
  | 'public_role_method_result'
  | 'generalized_citizen_value'
  | 'citizen_trait_prediction'
  | 'commercial_targeting_profile';

export interface CitizenDataUseRequest {
  readonly purpose: string;
  readonly actorType: 'human' | 'service' | 'agent';
  readonly narrowStatePrincipal: NarrowStatePrincipal | null;
  readonly inputClasses: readonly PolicyDataClass[];
  readonly narrowStateKinds: readonly NarrowStateKind[];
  readonly outputKind: PolicyOutputKind;
  readonly outputSubject: 'account_private' | 'anonymous_aggregate' | 'public_role';
  readonly stableCitizenIdentifierIncluded: boolean;
  readonly ranksOrPredictsPerson: boolean;
  readonly affectsUnrelatedAccess: boolean;
  readonly portableAcrossContexts: boolean;
  readonly crossProductLinkage: boolean;
  readonly publicIndividualDisclosure: boolean;
  readonly commercialTargeting: boolean;
  readonly exercisesHumanIntent: boolean;
}

export type NoSocialCreditDecisionReason =
  | 'explicit_narrow_state_allow'
  | 'explicit_operational_metric_allow'
  | 'explicit_public_role_method_allow'
  | 'prohibited_output'
  | 'person_ranking_or_prediction'
  | 'unrelated_access'
  | 'portable_state'
  | 'cross_product_linkage'
  | 'public_individual_disclosure'
  | 'commercial_targeting'
  | 'agent_human_intent'
  | 'citizen_data_in_public_role_method'
  | 'combined_narrow_states'
  | 'invalid_narrow_state_policy'
  | 'identifiable_operational_metric';

export interface NoSocialCreditDecision {
  readonly allowed: boolean;
  readonly reason: NoSocialCreditDecisionReason;
}

const citizenClasses = new Set<PolicyDataClass>(CITIZEN_DATA_CLASSES);
const ruleByKind = new Map(PURPOSE_LIMITED_STATE_RULES.map((rule) => [rule.stateKind, rule]));

function denied(reason: Exclude<NoSocialCreditDecisionReason, `explicit_${string}`>) {
  return Object.freeze({ allowed: false, reason } as const);
}

export function evaluateNoSocialCreditDataUse(
  request: CitizenDataUseRequest,
): NoSocialCreditDecision {
  if (
    request.outputKind === 'generalized_citizen_value' ||
    request.outputKind === 'citizen_trait_prediction' ||
    request.outputKind === 'commercial_targeting_profile'
  ) {
    return denied('prohibited_output');
  }
  if (request.ranksOrPredictsPerson) return denied('person_ranking_or_prediction');
  if (request.affectsUnrelatedAccess) return denied('unrelated_access');
  if (request.portableAcrossContexts) return denied('portable_state');
  if (request.crossProductLinkage) return denied('cross_product_linkage');
  if (request.publicIndividualDisclosure) return denied('public_individual_disclosure');
  if (request.commercialTargeting) return denied('commercial_targeting');
  if (request.actorType !== 'human' && request.exercisesHumanIntent) {
    return denied('agent_human_intent');
  }

  if (request.outputKind === 'purpose_limited_state') {
    if (request.narrowStateKinds.length !== 1) return denied('combined_narrow_states');
    const stateKind = request.narrowStateKinds[0];
    const rule = stateKind === undefined ? undefined : ruleByKind.get(stateKind);
    if (
      rule === undefined ||
      request.actorType !== 'service' ||
      request.narrowStatePrincipal === null ||
      !rule.allowedPrincipals.includes(request.narrowStatePrincipal) ||
      request.purpose !== rule.purpose ||
      request.outputSubject !== 'account_private' ||
      request.stableCitizenIdentifierIncluded !== true ||
      request.inputClasses.some(
        (dataClass) => !rule.dataClasses.includes(dataClass as CitizenDataClass),
      )
    ) {
      return denied('invalid_narrow_state_policy');
    }
    return Object.freeze({ allowed: true, reason: 'explicit_narrow_state_allow' });
  }

  if (request.outputKind === 'coarse_operational_metric') {
    if (
      request.outputSubject !== 'anonymous_aggregate' ||
      request.stableCitizenIdentifierIncluded ||
      request.narrowStateKinds.length > 0
    ) {
      return denied('identifiable_operational_metric');
    }
    return Object.freeze({ allowed: true, reason: 'explicit_operational_metric_allow' });
  }

  if (
    request.outputSubject !== 'public_role' ||
    request.stableCitizenIdentifierIncluded ||
    request.narrowStateKinds.length > 0 ||
    request.inputClasses.some((dataClass) => citizenClasses.has(dataClass))
  ) {
    return denied('citizen_data_in_public_role_method');
  }
  return Object.freeze({ allowed: true, reason: 'explicit_public_role_method_allow' });
}

export class NoSocialCreditPolicyViolationError extends Error {
  readonly reason: NoSocialCreditDecisionReason;

  constructor(reason: NoSocialCreditDecisionReason) {
    super(`No Social Credit policy denied the data use: ${reason}.`);
    this.name = 'NoSocialCreditPolicyViolationError';
    this.reason = reason;
  }
}

export function assertNoSocialCreditDataUse(request: CitizenDataUseRequest): void {
  const decision = evaluateNoSocialCreditDataUse(request);
  if (!decision.allowed) throw new NoSocialCreditPolicyViolationError(decision.reason);
}
