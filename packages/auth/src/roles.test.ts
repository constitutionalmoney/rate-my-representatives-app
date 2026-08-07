import { describe, expect, it } from 'vitest';

import { authorizeDomainAction } from './roles.js';
import type {
  createHumanIntentCommand,
  HumanActorContext,
  RoleGrant,
  ServiceActorContext,
} from './roles.js';

const at = new Date('2026-01-01T00:00:00.000Z');
const human: HumanActorContext = Object.freeze({
  accountId: 'account-synthetic',
  actorId: 'actor-human-synthetic',
  actorType: 'human',
  assurance: 'phishing_resistant',
  privilegedSession: true,
  sessionId: 'session-synthetic',
});
const service: ServiceActorContext = Object.freeze({
  actorId: 'actor-agent-synthetic',
  actorType: 'service',
  credentialType: 'service_token',
  tokenScopes: ['domain:agent_submit_review_draft'],
});

function grant(overrides: Partial<RoleGrant> = {}): RoleGrant {
  return {
    actorId: human.actorId,
    effectiveFrom: '2025-01-01T00:00:00.000Z',
    effectiveUntil: null,
    grantId: 'grant-synthetic',
    revokedAt: null,
    role: 'participant',
    scope: { kind: 'global' },
    ...overrides,
  };
}

describe('scoped actor roles', () => {
  it('keeps authentication assurance separate from effective scoped role grants', () => {
    expect(
      authorizeDomainAction({
        action: 'submit_representative_signal',
        actor: human,
        at,
        grants: [
          grant({
            scope: { kind: 'office_term', officeTermId: 'term-synthetic-1' },
          }),
        ],
        scope: { kind: 'office_term', officeTermId: 'term-synthetic-2' },
      }),
    ).toMatchObject({ allowed: false, reason: 'missing-active-role' });
  });

  it('honors effective dates and revocation independently from authentication', () => {
    expect(
      authorizeDomainAction({
        action: 'submit_representative_signal',
        actor: human,
        at,
        grants: [grant({ revokedAt: '2025-12-31T00:00:00.000Z' })],
      }).allowed,
    ).toBe(false);
    expect(
      authorizeDomainAction({
        action: 'submit_representative_signal',
        actor: human,
        at,
        grants: [grant()],
      }).allowed,
    ).toBe(true);
  });

  it('requires phishing-resistant MFA in a separate privileged session', () => {
    const moderatorGrant = grant({ role: 'moderator_reviewer' });
    expect(
      authorizeDomainAction({
        action: 'review_moderation',
        actor: { ...human, privilegedSession: false },
        at,
        grants: [moderatorGrant],
      }).allowed,
    ).toBe(false);
    expect(
      authorizeDomainAction({
        action: 'review_moderation',
        actor: human,
        at,
        grants: [moderatorGrant],
      }).allowed,
    ).toBe(true);
  });

  it('structurally and dynamically rejects service agents from human civic intent', () => {
    type HumanIntentActor = Parameters<typeof createHumanIntentCommand>[0];
    type ServiceCanConstructHumanIntent = ServiceActorContext extends HumanIntentActor
      ? true
      : false;
    const serviceCanConstructHumanIntent: ServiceCanConstructHumanIntent = false;
    expect(serviceCanConstructHumanIntent).toBe(false);
    expect(
      authorizeDomainAction({
        action: 'submit_representative_signal',
        actor: service,
        at,
        grants: [grant({ actorId: service.actorId, role: 'participant' })],
      }),
    ).toMatchObject({ allowed: false, reason: 'agent-human-intent-forbidden' });
  });

  it('allows a Civic Agent only its declared review-draft scope', () => {
    expect(
      authorizeDomainAction({
        action: 'agent_submit_review_draft',
        actor: service,
        at,
        grants: [grant({ actorId: service.actorId, role: 'civic_agent' })],
      }),
    ).toMatchObject({ allowed: true, reason: 'service-scope' });
    expect(
      authorizeDomainAction({
        action: 'submit_official_response',
        actor: service,
        at,
        grants: [grant({ actorId: service.actorId, role: 'authorized_staff' })],
      }).allowed,
    ).toBe(false);
  });
});
