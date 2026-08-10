/* Generated from moderation-decision.schema.json. Do not edit directly. */

/**
 * Restricted decision metadata with a separately controlled public projection; never raw evidence or review notes.
 */
export type ModerationDecisionV1 = {
  [k: string]: unknown;
} & {
  schemaVersion: 'moderation-decision.v1';
  policyVersion: 'moderation-due-process-policy.v1';
  dataMode: 'synthetic' | 'production';
  decisionId: Id;
  workflow:
    | 'evidence_submission'
    | 'representative_response'
    | 'correction_request'
    | 'dispute'
    | 'appeal'
    | 'community_context'
    | 'source_status';
  targetReference: Id;
  previousState: State;
  outcomeState: State;
  review: Review;
  basis: Basis;
  ai: Ai;
  history: History;
  publication: Publication;
  decidedAt: string;
};
export type Id = string;
export type State = string;
export type Publication = {
  [k: string]: unknown;
} & {
  state: 'restricted_only' | 'public_projection_approved' | 'emergency_restricted';
  automaticPublication: false;
  allowedPublicFields: (
    | 'decisionId'
    | 'policyVersion'
    | 'workflow'
    | 'targetReference'
    | 'outcomeState'
    | 'reasonCode'
    | 'publicReason'
    | 'supersedesDecisionId'
    | 'appealedDecisionId'
    | 'decidedAt'
    | 'aiDisclosure'
  )[];
  rawPrivateMaterialIncluded: false;
  provenanceEligible: boolean;
};

export interface Review {
  reviewerRole: 'reviewer' | 'admin' | 'legal_reviewer' | 'appeal_reviewer';
  assignmentReference: Id;
  conflictDisclosure: string;
  recusalOutcome: 'no_recusal_required' | 'reassigned_after_recusal' | 'secondary_review_approved';
  independentOfOriginalDecision: boolean;
  humanDecider: true;
}
export interface Basis {
  methodVersion: Id | null;
  sourceRecordVersionIds: Id[];
  rightsReview: 'reviewed_permitted' | 'metadata_only' | 'not_applicable' | 'prohibited';
  reasonCode: Id;
  publicReason: string;
}
export interface Ai {
  assistanceUsed: boolean;
  disclosure: string;
  decidedOutcome: false;
}
export interface History {
  supersedesDecisionId: Id | null;
  appealedDecisionId: Id | null;
}
