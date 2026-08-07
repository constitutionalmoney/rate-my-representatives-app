import { FeatureGateEvaluator, loadFeatureFlags, type FeatureGateAuditRecord } from '@rmr/config';

import {
  AuthenticationService,
  InMemoryAuthenticationChallengeStore,
  type AuthenticationServiceDependencies,
} from './authentication.js';
import { InMemorySessionStore, SessionService } from './sessions.js';

export const SYNTHETIC_DEVICE = Object.freeze({
  deviceId: 'device-synthetic-1',
  label: 'Synthetic test device',
  platform: 'web' as const,
});

export interface AuthenticationFixture {
  readonly auditRecords: FeatureGateAuditRecord[];
  readonly authentication: AuthenticationService;
  readonly sessions: SessionService;
  setNow(value: string): void;
}

export function createAuthenticationFixture(): AuthenticationFixture {
  let now = new Date('2026-01-01T00:00:00.000Z');
  let identifier = 0;
  const auditRecords: FeatureGateAuditRecord[] = [];
  const featureGates = new FeatureGateEvaluator(
    loadFeatureFlags({
      ACCOUNT_RECOVERY_ENABLED: 'true',
      PASSKEY_AUTH_ENABLED: 'true',
      VERIFIED_EMAIL_AUTH_ENABLED: 'true',
    }),
    { record: (entry) => auditRecords.push(entry) },
    () => now,
  );
  const sessions = new SessionService(
    new InMemorySessionStore(),
    () => now,
    () => `session-${++identifier}`,
  );
  const dependencies: AuthenticationServiceDependencies = {
    challenges: new InMemoryAuthenticationChallengeStore(),
    emailDelivery: {
      requestSignIn: async ({ email }) => {
        if (email === 'missing@example.invalid') throw new Error('synthetic delivery suppression');
      },
    },
    emailVerifier: {
      verify: async ({ token }) =>
        token === 'synthetic-email-token' ? { accountId: 'account-synthetic' } : undefined,
    },
    featureGates,
    passkeyPolicy: {
      audience: 'rate-my-representatives-synthetic',
      origin: 'https://app.example.invalid',
      userVerification: 'required',
    },
    passkeyVerifier: {
      verify: async ({ assertion, expectedAudience, expectedOrigin, userVerification }) =>
        assertion === 'synthetic-passkey-assertion' &&
        expectedAudience === 'rate-my-representatives-synthetic' &&
        expectedOrigin === 'https://app.example.invalid' &&
        userVerification === 'required'
          ? { accountId: 'account-synthetic' }
          : undefined,
    },
    recoveryDelivery: {
      requestRecovery: async ({ identifier: recoveryIdentifier }) => {
        if (recoveryIdentifier === 'missing@example.invalid') {
          throw new Error('synthetic recovery suppression');
        }
      },
    },
    recoveryVerifier: {
      verify: async ({ token }) =>
        token === 'synthetic-recovery-token' ? { accountId: 'account-synthetic' } : undefined,
    },
    sessions,
  };
  const authentication = new AuthenticationService(
    dependencies,
    () => now,
    () => `request-${++identifier}`,
    () => 'a'.repeat(43),
  );

  return {
    auditRecords,
    authentication,
    sessions,
    setNow: (value) => {
      now = new Date(value);
    },
  };
}
