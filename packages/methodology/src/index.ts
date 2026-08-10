export const COMPOSITE_RELEASE_GATE_KEYS = [
  'publicMethodologyReview',
  'sourceAndFactorAudit',
  'biasAndDisparateImpactReview',
  'adversarialAndManipulationTesting',
  'stabilityAndSmallDataTesting',
  'correctionAndSupersessionTesting',
  'privacyAndNoSocialCreditReview',
  'legalReview',
  'representativeResponseAndAppealBehavior',
  'publicConsultation',
  'reservedGovernanceApproval',
] as const;

export type CompositeReleaseGateKey = (typeof COMPOSITE_RELEASE_GATE_KEYS)[number];
export type CompositeReleaseGateStatus = 'pending' | 'approved' | 'rejected';

export type CompositeReleaseGateInput = Readonly<{
  runtimeFlagEnabled: boolean;
  approvedMethodologyVersion: string | null;
  gates: Readonly<Record<CompositeReleaseGateKey, CompositeReleaseGateStatus>>;
}>;

export type CompositeReleaseGateDecision = Readonly<{
  eligible: boolean;
  decision: 'disabled' | 'eligible_for_separate_enablement' | 'rejected';
  blockers: readonly string[];
}>;

export function evaluateCompositeReleaseGate(
  input: CompositeReleaseGateInput,
): CompositeReleaseGateDecision {
  const rejected = COMPOSITE_RELEASE_GATE_KEYS.filter((gate) => input.gates[gate] === 'rejected');
  if (rejected.length > 0) {
    return Object.freeze({
      eligible: false,
      decision: 'rejected',
      blockers: Object.freeze(rejected.map((gate) => `rejected:${gate}`)),
    });
  }

  const blockers: string[] = [];
  if (!input.runtimeFlagEnabled) blockers.push('runtime_flag_disabled');
  if (input.approvedMethodologyVersion === null) blockers.push('approved_methodology_missing');

  for (const gate of COMPOSITE_RELEASE_GATE_KEYS) {
    if (input.gates[gate] !== 'approved') blockers.push(`pending:${gate}`);
  }

  if (blockers.length > 0) {
    return Object.freeze({
      eligible: false,
      decision: 'disabled',
      blockers: Object.freeze(blockers),
    });
  }

  return Object.freeze({
    eligible: true,
    decision: 'eligible_for_separate_enablement',
    blockers: Object.freeze([]),
  });
}

export const methodologyFoundation = Object.freeze({
  compositeScoreEnabled: false,
  methodologyImplemented: false,
  policyVersion: 'light-mathematics-policy.v1',
  status: 'policy-defined-execution-not-implemented',
});
