import { describe, expect, it } from 'vitest';

import {
  evaluateModerationTransition,
  MODERATION_POLICY_VERSION,
  MODERATION_WORKFLOW_TRANSITIONS,
  moderationPolicyFoundation,
  type ModerationWorkflowKind,
} from './moderation-policy.js';

describe('moderation and due-process transition policy', () => {
  it('keeps intake, execution, persistence, provenance, and automatic publication disabled', () => {
    expect(moderationPolicyFoundation).toEqual({
      automaticPublicationAllowed: false,
      evidenceIntakeImplemented: false,
      moderationWorkflowImplemented: false,
      persistenceImplemented: false,
      policyVersion: MODERATION_POLICY_VERSION,
      provenanceWritesEnabled: false,
      status: 'policy-defined-execution-not-implemented',
    });
  });

  it('allows every explicitly declared transition', () => {
    for (const [workflow, states] of Object.entries(MODERATION_WORKFLOW_TRANSITIONS)) {
      for (const [from, targets] of Object.entries(states)) {
        for (const to of targets) {
          expect(
            evaluateModerationTransition(workflow as ModerationWorkflowKind, from, to),
          ).toEqual({
            allowed: true,
            policyVersion: MODERATION_POLICY_VERSION,
            reason: 'explicit_policy_transition',
          });
        }
      }
    }
  });

  it('rejects timer shortcuts, self-transitions, and cross-workflow transitions', () => {
    for (const [workflow, states] of Object.entries(MODERATION_WORKFLOW_TRANSITIONS)) {
      for (const from of Object.keys(states)) {
        expect(
          evaluateModerationTransition(workflow as ModerationWorkflowKind, from, from).allowed,
        ).toBe(false);
      }
    }

    expect(evaluateModerationTransition('evidence_submission', 'submitted', 'published')).toEqual({
      allowed: false,
      policyVersion: MODERATION_POLICY_VERSION,
      reason: 'transition_not_permitted',
    });
    expect(
      evaluateModerationTransition('evidence_submission', 'validated', 'published').allowed,
    ).toBe(false);
    expect(
      evaluateModerationTransition('representative_response', 'submitted', 'published').allowed,
    ).toBe(false);
    expect(evaluateModerationTransition('appeal', 'under_review', 'published').allowed).toBe(false);
  });

  it('requires a human-review state before any workflow can publish', () => {
    for (const [workflow, states] of Object.entries(MODERATION_WORKFLOW_TRANSITIONS)) {
      for (const [from, targets] of Object.entries(states)) {
        if ((targets as readonly string[]).includes('published')) {
          expect(workflow).toMatch(/evidence_submission|representative_response|community_context/);
          expect(from).toBe('under_review');
        }
      }
    }
  });
});
