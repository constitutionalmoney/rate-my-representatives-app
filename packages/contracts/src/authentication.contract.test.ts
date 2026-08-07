import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { DEFAULT_FEATURE_FLAGS, FEATURE_FLAG_NAMES } from '@rmr/config';

import type {
  AuthenticatedSessionSchema,
  FeatureGatesContract,
  GenericAuthenticationStartSchema,
  PasskeyAuthenticationStartSchema,
  RoleGrantSchema,
} from './index.js';

describe('generated authentication contracts', () => {
  it('types passkey, verified-email, session, and scoped-role payloads', () => {
    const passkey: PasskeyAuthenticationStartSchema = {
      challenge: 'a'.repeat(43),
      expiresAt: '2026-01-01T00:10:00.000Z',
      requestId: 'request-synthetic',
      status: 'pending',
    };
    const generic: GenericAuthenticationStartSchema = {
      expiresAt: '2026-01-01T00:10:00.000Z',
      message: 'Generic synthetic response.',
      requestId: 'request-synthetic',
      status: 'pending',
    };
    const role: RoleGrantSchema = {
      actorId: 'actor-synthetic',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      effectiveUntil: null,
      grantId: 'grant-synthetic',
      revokedAt: null,
      role: 'participant',
      scope: { kind: 'global' },
    };
    const session: AuthenticatedSessionSchema = {
      accountId: 'account-synthetic',
      session: {
        assurance: 'phishing_resistant',
        authenticationMethod: 'passkey',
        createdAt: '2026-01-01T00:00:00.000Z',
        current: true,
        device: {
          deviceId: 'device-synthetic',
          label: 'Synthetic device',
          platform: 'web',
        },
        expiresAt: '2026-01-01T00:15:00.000Z',
        lastRotatedAt: '2026-01-01T00:00:00.000Z',
        privileged: true,
        revokedAt: null,
        sessionId: 'session-synthetic',
      },
      sessionToken: `session-synthetic.${'a'.repeat(43)}`,
    };

    expect({ passkey, generic, role, session }).toMatchObject({
      passkey: { status: 'pending' },
      role: { role: 'participant' },
      session: { accountId: 'account-synthetic' },
    });
  });

  it('keeps the generated feature-gate contract synchronized with typed configuration', async () => {
    const schema = JSON.parse(
      await readFile(
        path.join(process.cwd(), 'packages/contracts/schemas/feature-gates.schema.json'),
        'utf8',
      ),
    ) as { properties: Record<string, { default: boolean }>; required: string[] };
    const generatedShape: FeatureGatesContract = DEFAULT_FEATURE_FLAGS;

    expect(Object.keys(schema.properties).sort()).toEqual([...FEATURE_FLAG_NAMES].sort());
    expect(schema.required.sort()).toEqual([...FEATURE_FLAG_NAMES].sort());
    expect(
      Object.values(schema.properties).every((definition) => definition.default === false),
    ).toBe(true);
    expect(Object.values(generatedShape).every((value) => value === false)).toBe(true);
  });
});
