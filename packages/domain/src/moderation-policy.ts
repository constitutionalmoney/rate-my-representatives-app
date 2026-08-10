export const MODERATION_POLICY_VERSION = 'moderation-due-process-policy.v1' as const;

export const MODERATION_WORKFLOW_TRANSITIONS = Object.freeze({
  appeal: Object.freeze({
    draft: Object.freeze(['submitted']),
    submitted: Object.freeze(['validated']),
    validated: Object.freeze(['under_review']),
    under_review: Object.freeze(['appeal_upheld', 'appeal_denied', 'needs_more_information']),
    needs_more_information: Object.freeze(['submitted', 'withdrawn']),
  }),
  community_context: Object.freeze({
    draft: Object.freeze(['submitted']),
    submitted: Object.freeze(['validated']),
    validated: Object.freeze(['under_review']),
    under_review: Object.freeze(['published', 'rejected', 'needs_more_information']),
    needs_more_information: Object.freeze(['submitted', 'withdrawn']),
    published: Object.freeze(['corrected', 'withdrawn', 'archived']),
    rejected: Object.freeze(['appealed']),
    appealed: Object.freeze(['appeal_upheld', 'appeal_denied']),
  }),
  correction_request: Object.freeze({
    draft: Object.freeze(['submitted']),
    submitted: Object.freeze(['validated']),
    validated: Object.freeze(['under_review']),
    under_review: Object.freeze(['approved', 'rejected', 'needs_more_information']),
    needs_more_information: Object.freeze(['submitted', 'withdrawn']),
    approved: Object.freeze(['corrected']),
    rejected: Object.freeze(['appealed']),
    appealed: Object.freeze(['appeal_upheld', 'appeal_denied']),
  }),
  dispute: Object.freeze({
    draft: Object.freeze(['submitted']),
    submitted: Object.freeze(['validated']),
    validated: Object.freeze(['under_review']),
    under_review: Object.freeze(['dispute_upheld', 'dispute_denied', 'needs_more_information']),
    needs_more_information: Object.freeze(['submitted', 'withdrawn']),
    dispute_upheld: Object.freeze(['corrected', 'withdrawn', 'archived']),
    dispute_denied: Object.freeze(['archived']),
  }),
  evidence_submission: Object.freeze({
    draft: Object.freeze(['submitted']),
    submitted: Object.freeze(['validated', 'rejected']),
    validated: Object.freeze(['under_review']),
    under_review: Object.freeze(['published', 'disputed', 'rejected', 'needs_more_information']),
    needs_more_information: Object.freeze(['submitted', 'withdrawn']),
    published: Object.freeze(['disputed', 'corrected', 'withdrawn', 'archived']),
    disputed: Object.freeze(['corrected', 'withdrawn', 'archived']),
    rejected: Object.freeze(['appealed']),
    appealed: Object.freeze(['appeal_upheld', 'appeal_denied']),
  }),
  representative_response: Object.freeze({
    draft: Object.freeze(['submitted']),
    submitted: Object.freeze(['authority_validated']),
    authority_validated: Object.freeze(['under_review']),
    under_review: Object.freeze(['published', 'rejected', 'needs_more_information']),
    needs_more_information: Object.freeze(['submitted', 'withdrawn']),
    published: Object.freeze(['corrected', 'withdrawn', 'archived']),
    rejected: Object.freeze(['appealed']),
    appealed: Object.freeze(['appeal_upheld', 'appeal_denied']),
  }),
  source_status: Object.freeze({
    available: Object.freeze(['stale', 'missing', 'unavailable', 'retracted']),
    stale: Object.freeze(['available', 'missing', 'unavailable', 'retracted']),
    missing: Object.freeze(['available', 'unavailable', 'retracted']),
    unavailable: Object.freeze(['available', 'missing', 'retracted']),
    retracted: Object.freeze(['superseded']),
  }),
} as const);

export type ModerationWorkflowKind = keyof typeof MODERATION_WORKFLOW_TRANSITIONS;

export type ModerationTransitionDecision = Readonly<{
  allowed: boolean;
  policyVersion: typeof MODERATION_POLICY_VERSION;
  reason: 'explicit_policy_transition' | 'transition_not_permitted';
}>;

export function evaluateModerationTransition(
  workflow: ModerationWorkflowKind,
  from: string,
  to: string,
): ModerationTransitionDecision {
  const transitions = MODERATION_WORKFLOW_TRANSITIONS[workflow] as Readonly<
    Record<string, readonly string[]>
  >;
  const allowed = transitions[from]?.includes(to) === true;

  return Object.freeze({
    allowed,
    policyVersion: MODERATION_POLICY_VERSION,
    reason: allowed ? 'explicit_policy_transition' : 'transition_not_permitted',
  });
}

export const moderationPolicyFoundation = Object.freeze({
  automaticPublicationAllowed: false,
  evidenceIntakeImplemented: false,
  moderationWorkflowImplemented: false,
  persistenceImplemented: false,
  policyVersion: MODERATION_POLICY_VERSION,
  provenanceWritesEnabled: false,
  status: 'policy-defined-execution-not-implemented',
});
