import {
  authorizeDomainAction,
  type ActorContext,
  type DomainAction,
  type RoleGrant,
  type RoleScope,
} from '@rmr/auth';
import type { FeatureFlagName, FeatureGateEvaluator } from '@rmr/config';

export interface RoutePolicy {
  readonly action: DomainAction;
  readonly feature?: FeatureFlagName;
  readonly method: string;
  readonly path: string;
}

export const ROUTE_POLICIES: readonly RoutePolicy[] = Object.freeze([
  { action: 'public_read', method: 'GET', path: '/api/v1/health' },
  { action: 'public_read', method: 'GET', path: '/api/v1/health/mobile' },
  { action: 'public_read', method: 'GET', path: '/api/v1/jurisdictions' },
  {
    action: 'public_read',
    feature: 'PASSKEY_AUTH_ENABLED',
    method: 'POST',
    path: '/api/v1/auth/passkey/start',
  },
  {
    action: 'public_read',
    feature: 'PASSKEY_AUTH_ENABLED',
    method: 'POST',
    path: '/api/v1/auth/passkey/complete',
  },
  {
    action: 'public_read',
    feature: 'VERIFIED_EMAIL_AUTH_ENABLED',
    method: 'POST',
    path: '/api/v1/auth/email/start',
  },
  {
    action: 'public_read',
    feature: 'VERIFIED_EMAIL_AUTH_ENABLED',
    method: 'POST',
    path: '/api/v1/auth/email/complete',
  },
  {
    action: 'public_read',
    feature: 'ACCOUNT_RECOVERY_ENABLED',
    method: 'POST',
    path: '/api/v1/auth/recovery/start',
  },
  {
    action: 'public_read',
    feature: 'ACCOUNT_RECOVERY_ENABLED',
    method: 'POST',
    path: '/api/v1/auth/recovery/complete',
  },
  { action: 'manage_own_sessions', method: 'GET', path: '/api/v1/account/sessions' },
  {
    action: 'manage_own_sessions',
    method: 'DELETE',
    path: '/api/v1/account/sessions/:sessionId',
  },
  {
    action: 'manage_own_sessions',
    method: 'POST',
    path: '/api/v1/account/sessions/revoke-all',
  },
  { action: 'manage_own_sessions', method: 'POST', path: '/api/v1/auth/sign-out' },
  {
    action: 'submit_evidence',
    feature: 'EVIDENCE_SUBMISSION_ENABLED',
    method: 'POST',
    path: '/api/v1/evidence',
  },
  {
    action: 'submit_representative_signal',
    feature: 'REPRESENTATIVE_SIGNALS_ENABLED',
    method: 'POST',
    path: '/api/v1/representative-signals',
  },
  {
    action: 'review_moderation',
    feature: 'PRIVILEGED_ACCESS_ENABLED',
    method: 'POST',
    path: '/api/v1/moderation/decisions',
  },
]);

export interface RouteAuthorizationRequest {
  readonly actor: ActorContext;
  readonly at: Date;
  readonly featureGates: FeatureGateEvaluator;
  readonly grants: readonly RoleGrant[];
  readonly method: string;
  readonly path: string;
  readonly scope?: RoleScope;
}

export interface RouteAuthorizationDecision {
  readonly allowed: boolean;
  readonly reason: 'authorized' | 'feature-disabled' | 'forbidden' | 'route-not-found';
}

export function authorizeRoute(request: RouteAuthorizationRequest): RouteAuthorizationDecision {
  const policy = ROUTE_POLICIES.find(
    (candidate) => candidate.method === request.method && candidate.path === request.path,
  );
  if (!policy) return Object.freeze({ allowed: false, reason: 'route-not-found' });

  const domainDecision = authorizeDomainAction({
    action: policy.action,
    actor: request.actor,
    at: request.at,
    grants: request.grants,
    ...(request.scope ? { scope: request.scope } : {}),
  });
  if (!domainDecision.allowed) return Object.freeze({ allowed: false, reason: 'forbidden' });

  if (
    policy.feature &&
    !request.featureGates.evaluate(policy.feature, {
      boundary: 'route',
      operation: `${request.method} ${request.path}`,
    })
  ) {
    return Object.freeze({ allowed: false, reason: 'feature-disabled' });
  }

  return Object.freeze({ allowed: true, reason: 'authorized' });
}
