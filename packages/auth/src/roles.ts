import type { AuthenticationAssurance } from './contracts.js';

export const ACTOR_ROLES = [
  'participant',
  'evidence_contributor',
  'representative_candidate',
  'authorized_staff',
  'moderator_reviewer',
  'administrator',
  'civic_agent',
] as const;

export type ActorRole = (typeof ACTOR_ROLES)[number];

export type RoleScope =
  | Readonly<{ kind: 'global' }>
  | Readonly<{ jurisdictionId: string; kind: 'jurisdiction' }>
  | Readonly<{ kind: 'office_term'; officeTermId: string }>;

export interface RoleGrant {
  readonly actorId: string;
  readonly effectiveFrom: string;
  readonly effectiveUntil: string | null;
  readonly grantId: string;
  readonly revokedAt: string | null;
  readonly role: ActorRole;
  readonly scope: RoleScope;
}

export interface AnonymousActorContext {
  readonly actorType: 'anonymous';
}

export interface HumanActorContext {
  readonly accountId: string;
  readonly actorId: string;
  readonly actorType: 'human';
  readonly assurance: AuthenticationAssurance;
  readonly privilegedSession: boolean;
  readonly sessionId: string;
}

export interface ServiceActorContext {
  readonly actorId: string;
  readonly actorType: 'service';
  readonly credentialType: 'service_token';
  readonly tokenScopes: readonly string[];
}

export type ActorContext = AnonymousActorContext | HumanActorContext | ServiceActorContext;

export const DOMAIN_ACTIONS = [
  'public_read',
  'manage_own_sessions',
  'manage_own_account',
  'resolve_location',
  'submit_representative_signal',
  'submit_category_rating',
  'submit_human_comment',
  'submit_evidence',
  'submit_official_response',
  'approve_wallet_request',
  'review_moderation',
  'administer_configuration',
  'agent_submit_review_draft',
] as const;

export type DomainAction = (typeof DOMAIN_ACTIONS)[number];
export type HumanIntentAction =
  | 'approve_wallet_request'
  | 'submit_category_rating'
  | 'submit_human_comment'
  | 'submit_official_response'
  | 'submit_representative_signal';

const HUMAN_INTENT_ACTIONS = new Set<DomainAction>([
  'approve_wallet_request',
  'submit_category_rating',
  'submit_human_comment',
  'submit_official_response',
  'submit_representative_signal',
]);

const PRIVILEGED_ACTIONS = new Set<DomainAction>(['administer_configuration', 'review_moderation']);

const REQUIRED_ROLES: Readonly<Partial<Record<DomainAction, readonly ActorRole[]>>> = Object.freeze(
  {
    administer_configuration: ['administrator'],
    agent_submit_review_draft: ['civic_agent'],
    approve_wallet_request: ['representative_candidate'],
    review_moderation: ['moderator_reviewer'],
    submit_category_rating: ['participant'],
    submit_evidence: ['evidence_contributor'],
    submit_human_comment: ['participant'],
    submit_official_response: ['representative_candidate', 'authorized_staff'],
    submit_representative_signal: ['participant'],
  },
);

export interface AuthorizationRequest {
  readonly action: DomainAction;
  readonly actor: ActorContext;
  readonly at: Date;
  readonly grants: readonly RoleGrant[];
  readonly scope?: RoleScope;
}

export interface AuthorizationDecision {
  readonly allowed: boolean;
  readonly reason:
    | 'active-role'
    | 'agent-human-intent-forbidden'
    | 'anonymous-public-read'
    | 'authenticated-self-service'
    | 'deny-by-default'
    | 'insufficient-authentication'
    | 'missing-active-role'
    | 'service-scope';
}

export class AuthorizationDeniedError extends Error {
  readonly code = 'FORBIDDEN';

  constructor() {
    super('The requested operation is not permitted.');
    this.name = 'AuthorizationDeniedError';
  }
}

function activeAt(grant: RoleGrant, at: Date): boolean {
  const evaluatedAt = at.getTime();
  const begins = Date.parse(grant.effectiveFrom);
  const ends =
    grant.effectiveUntil === null ? Number.POSITIVE_INFINITY : Date.parse(grant.effectiveUntil);
  const revoked = grant.revokedAt === null ? Number.POSITIVE_INFINITY : Date.parse(grant.revokedAt);
  return (
    Number.isFinite(begins) && evaluatedAt >= begins && evaluatedAt < ends && evaluatedAt < revoked
  );
}

function scopeMatches(grant: RoleScope, requested: RoleScope | undefined): boolean {
  if (!requested || grant.kind === 'global') return true;
  if (grant.kind !== requested.kind) return false;
  if (grant.kind === 'jurisdiction' && requested.kind === 'jurisdiction') {
    return grant.jurisdictionId === requested.jurisdictionId;
  }
  if (grant.kind === 'office_term' && requested.kind === 'office_term') {
    return grant.officeTermId === requested.officeTermId;
  }
  return false;
}

export function authorizeDomainAction(request: AuthorizationRequest): AuthorizationDecision {
  const actor = request.actor;
  if (request.action === 'public_read') {
    return Object.freeze({
      allowed: true,
      reason:
        actor.actorType === 'anonymous' ? 'anonymous-public-read' : 'authenticated-self-service',
    });
  }

  if (request.action === 'resolve_location') {
    return Object.freeze({
      allowed: actor.actorType !== 'service',
      reason:
        actor.actorType === 'anonymous'
          ? 'anonymous-public-read'
          : actor.actorType === 'human'
            ? 'authenticated-self-service'
            : 'insufficient-authentication',
    });
  }

  if (actor.actorType === 'anonymous') {
    return Object.freeze({ allowed: false, reason: 'insufficient-authentication' });
  }

  if (actor.actorType === 'service' && HUMAN_INTENT_ACTIONS.has(request.action)) {
    return Object.freeze({ allowed: false, reason: 'agent-human-intent-forbidden' });
  }

  if (request.action === 'manage_own_account' || request.action === 'manage_own_sessions') {
    return Object.freeze({
      allowed: actor.actorType === 'human',
      reason:
        actor.actorType === 'human' ? 'authenticated-self-service' : 'insufficient-authentication',
    });
  }

  if (PRIVILEGED_ACTIONS.has(request.action)) {
    if (
      actor.actorType !== 'human' ||
      actor.assurance !== 'phishing_resistant' ||
      !actor.privilegedSession
    ) {
      return Object.freeze({ allowed: false, reason: 'insufficient-authentication' });
    }
  }

  const requiredRoles = REQUIRED_ROLES[request.action];
  if (!requiredRoles) return Object.freeze({ allowed: false, reason: 'deny-by-default' });

  const hasRole = request.grants.some(
    (grant) =>
      grant.actorId === actor.actorId &&
      requiredRoles.includes(grant.role) &&
      activeAt(grant, request.at) &&
      scopeMatches(grant.scope, request.scope),
  );
  if (!hasRole) return Object.freeze({ allowed: false, reason: 'missing-active-role' });

  if (actor.actorType === 'service') {
    const requiredTokenScope = `domain:${request.action}`;
    return Object.freeze({
      allowed: actor.tokenScopes.includes(requiredTokenScope),
      reason: actor.tokenScopes.includes(requiredTokenScope)
        ? 'service-scope'
        : 'missing-active-role',
    });
  }

  return Object.freeze({ allowed: true, reason: 'active-role' });
}

export function assertDomainAuthorized(request: AuthorizationRequest): void {
  if (!authorizeDomainAction(request).allowed) throw new AuthorizationDeniedError();
}

export interface HumanIntentCommand {
  readonly action: HumanIntentAction;
  readonly actor: HumanActorContext;
}

export function createHumanIntentCommand(
  actor: HumanActorContext,
  action: HumanIntentAction,
): HumanIntentCommand {
  return Object.freeze({ action, actor });
}
