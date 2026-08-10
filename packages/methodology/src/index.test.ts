import { describe, expect, it } from 'vitest';

import {
  COMPOSITE_RELEASE_GATE_KEYS,
  evaluateCompositeReleaseGate,
  methodologyFoundation,
  type CompositeReleaseGateInput,
} from './index.js';

const gateStatuses = (status: 'pending' | 'approved' | 'rejected') =>
  Object.fromEntries(COMPOSITE_RELEASE_GATE_KEYS.map((gate) => [gate, status])) as Record<
    (typeof COMPOSITE_RELEASE_GATE_KEYS)[number],
    'pending' | 'approved' | 'rejected'
  >;

const evaluate = (overrides: Partial<CompositeReleaseGateInput> = {}) =>
  evaluateCompositeReleaseGate({
    runtimeFlagEnabled: false,
    approvedMethodologyVersion: null,
    gates: gateStatuses('pending'),
    ...overrides,
  });

describe('Light Mathematics composite release gate', () => {
  it('keeps methodology execution and the composite feature disabled in the foundation', () => {
    expect(methodologyFoundation).toMatchObject({
      compositeScoreEnabled: false,
      methodologyImplemented: false,
      policyVersion: 'light-mathematics-policy.v1',
    });
  });

  it('does not allow approvals to override the false runtime flag', () => {
    expect(
      evaluate({
        approvedMethodologyVersion: 'light-mathematics.v1',
        gates: gateStatuses('approved'),
      }),
    ).toMatchObject({
      eligible: false,
      decision: 'disabled',
      blockers: ['runtime_flag_disabled'],
    });
  });

  it('fails closed when a method or any required gate is absent', () => {
    const gates = gateStatuses('approved');
    gates.publicConsultation = 'pending';

    expect(evaluate({ runtimeFlagEnabled: true, gates })).toMatchObject({
      eligible: false,
      decision: 'disabled',
      blockers: ['approved_methodology_missing', 'pending:publicConsultation'],
    });
  });

  it('records a rejected gate as a decision not to publish', () => {
    const gates = gateStatuses('approved');
    gates.privacyAndNoSocialCreditReview = 'rejected';

    expect(
      evaluate({
        runtimeFlagEnabled: true,
        approvedMethodologyVersion: 'light-mathematics.v1',
        gates,
      }),
    ).toEqual({
      eligible: false,
      decision: 'rejected',
      blockers: ['rejected:privacyAndNoSocialCreditReview'],
    });
  });

  it('returns eligibility only when the flag, method, and all eleven gates are present', () => {
    expect(
      evaluate({
        runtimeFlagEnabled: true,
        approvedMethodologyVersion: 'light-mathematics.v1',
        gates: gateStatuses('approved'),
      }),
    ).toEqual({
      eligible: true,
      decision: 'eligible_for_separate_enablement',
      blockers: [],
    });
  });
});
