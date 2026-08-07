import { describe, expect, it } from 'vitest';

import type { HumanActorContext, RoleGrant, ServiceActorContext } from '@rmr/auth';
import { DEFAULT_FEATURE_FLAGS, FeatureGateEvaluator, loadFeatureFlags } from '@rmr/config';

import { authorizeRoute } from './authorization.js';

const at = new Date('2026-01-01T00:00:00.000Z');
const anonymous = { actorType: 'anonymous' as const };
const human: HumanActorContext = {
  accountId: 'account-synthetic',
  actorId: 'actor-synthetic',
  actorType: 'human',
  assurance: 'phishing_resistant',
  privilegedSession: true,
  sessionId: 'session-synthetic',
};
const service: ServiceActorContext = {
  actorId: 'agent-synthetic',
  actorType: 'service',
  credentialType: 'service_token',
  tokenScopes: ['domain:agent_submit_review_draft'],
};

function gateEvaluator(enabled: Record<string, string> = {}): FeatureGateEvaluator {
  return new FeatureGateEvaluator(
    Object.keys(enabled).length > 0 ? loadFeatureFlags(enabled) : DEFAULT_FEATURE_FLAGS,
    { record: () => undefined },
    () => at,
  );
}

function roleGrant(role: RoleGrant['role']): RoleGrant {
  return {
    actorId: human.actorId,
    effectiveFrom: '2025-01-01T00:00:00.000Z',
    effectiveUntil: null,
    grantId: `grant-${role}`,
    revokedAt: null,
    role,
    scope: { kind: 'global' },
  };
}

describe('route and domain authorization contract', () => {
  it('keeps the public health read anonymous', () => {
    expect(
      authorizeRoute({
        actor: anonymous,
        at,
        featureGates: gateEvaluator(),
        grants: [],
        method: 'GET',
        path: '/api/v1/health',
      }),
    ).toEqual({ allowed: true, reason: 'authorized' });
  });

  it('denies unknown routes and disabled authentication flows by default', () => {
    expect(
      authorizeRoute({
        actor: anonymous,
        at,
        featureGates: gateEvaluator(),
        grants: [],
        method: 'POST',
        path: '/api/v1/auth/passkey/start',
      }),
    ).toEqual({ allowed: false, reason: 'feature-disabled' });
    expect(
      authorizeRoute({
        actor: anonymous,
        at,
        featureGates: gateEvaluator(),
        grants: [],
        method: 'POST',
        path: '/api/v1/uncontracted',
      }),
    ).toEqual({ allowed: false, reason: 'route-not-found' });
  });

  it('requires both an active role and an explicitly enabled gate', () => {
    expect(
      authorizeRoute({
        actor: human,
        at,
        featureGates: gateEvaluator({ EVIDENCE_SUBMISSION_ENABLED: 'true' }),
        grants: [roleGrant('evidence_contributor')],
        method: 'POST',
        path: '/api/v1/evidence',
      }),
    ).toEqual({ allowed: true, reason: 'authorized' });
  });

  it('rejects a service credential at human-intent routes even with a participant grant', () => {
    expect(
      authorizeRoute({
        actor: service,
        at,
        featureGates: gateEvaluator({ REPRESENTATIVE_SIGNALS_ENABLED: 'true' }),
        grants: [{ ...roleGrant('participant'), actorId: service.actorId }],
        method: 'POST',
        path: '/api/v1/representative-signals',
      }),
    ).toEqual({ allowed: false, reason: 'forbidden' });
  });
});
