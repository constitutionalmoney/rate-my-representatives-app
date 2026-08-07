import { describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_FEATURE_FLAGS,
  FeatureGateDeniedError,
  FeatureGateEvaluator,
  loadFeatureFlags,
} from '@rmr/config';

import { AccountLifecycleService } from './lifecycle.js';
import { InMemorySessionStore, SessionService } from './sessions.js';
import { SYNTHETIC_DEVICE } from './test-helpers.js';

describe('account lifecycle gates', () => {
  it.each(['access', 'export', 'correction', 'deletion'] as const)(
    'denies %s by default and records the decision',
    async (operation) => {
      const records: unknown[] = [];
      const service = new AccountLifecycleService(
        new FeatureGateEvaluator(DEFAULT_FEATURE_FLAGS, {
          record: (entry) => records.push(entry),
        }),
        { execute: vi.fn(async () => ({ status: 'accepted' as const })) },
        new SessionService(new InMemorySessionStore()),
      );

      await expect(service.request('account-synthetic', operation)).rejects.toBeInstanceOf(
        FeatureGateDeniedError,
      );
      expect(records).toHaveLength(1);
    },
  );

  it('revokes active sessions when an enabled synthetic deletion adapter accepts deletion', async () => {
    let sequence = 0;
    const sessions = new SessionService(
      new InMemorySessionStore(),
      () => new Date('2026-01-01T00:00:00.000Z'),
      () => `session-${++sequence}`,
    );
    const session = sessions.create({
      accountId: 'account-synthetic',
      assurance: 'phishing_resistant',
      authenticationMethod: 'passkey',
      device: SYNTHETIC_DEVICE,
    });
    const service = new AccountLifecycleService(
      new FeatureGateEvaluator(loadFeatureFlags({ ACCOUNT_DELETION_ENABLED: 'true' }), {
        record: () => undefined,
      }),
      { execute: async () => ({ status: 'accepted' }) },
      sessions,
    );

    await expect(service.request('account-synthetic', 'deletion')).resolves.toEqual({
      status: 'accepted',
    });
    expect(() => sessions.rotate(session.sessionToken, SYNTHETIC_DEVICE.deviceId)).toThrow();
  });
});
