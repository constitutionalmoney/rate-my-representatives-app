/* Generated from methodology-release-gate.schema.json. Do not edit directly. */

export type MethodologyReleaseGateV1 = {
  [k: string]: unknown;
} & {
  schemaVersion: 'methodology-release-gate.v1';
  policyVersion: 'light-mathematics-policy.v1';
  reportId: Id;
  generatedAt: string;
  runtimeFlagEnabled: boolean;
  approvedMethodologyVersion: Id | null;
  gates: Gates;
  decision: 'disabled' | 'eligible_for_separate_enablement' | 'rejected';
  decisionReason: string;
};
export type Id = string;
export type Gate = {
  [k: string]: unknown;
} & {
  status: 'pending' | 'approved' | 'rejected';
  evidenceReferences: string[];
  decidedAt: string | null;
  publicReason: string;
};

export interface Gates {
  publicMethodologyReview: Gate;
  sourceAndFactorAudit: Gate;
  biasAndDisparateImpactReview: Gate;
  adversarialAndManipulationTesting: Gate;
  stabilityAndSmallDataTesting: Gate;
  correctionAndSupersessionTesting: Gate;
  privacyAndNoSocialCreditReview: Gate;
  legalReview: Gate;
  representativeResponseAndAppealBehavior: Gate;
  publicConsultation: Gate;
  reservedGovernanceApproval: Gate;
}
