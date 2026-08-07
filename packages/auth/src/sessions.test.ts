import { describe, expect, it } from 'vitest';

import { InMemorySessionStore, SessionAuthenticationError, SessionService } from './sessions.js';
import { SYNTHETIC_DEVICE } from './test-helpers.js';

describe('session security', () => {
  it('never accepts caller-controlled session identifiers and rotates fresh token material', () => {
    let sequence = 0;
    const sessions = new SessionService(
      new InMemorySessionStore(),
      () => new Date('2026-01-01T00:00:00.000Z'),
      () => `server-session-${++sequence}`,
    );
    const created = sessions.create({
      accountId: 'account-synthetic',
      assurance: 'basic',
      authenticationMethod: 'verified_email',
      device: SYNTHETIC_DEVICE,
    });
    const rotated = sessions.rotate(created.sessionToken, SYNTHETIC_DEVICE.deviceId);

    expect(created.session.sessionId).toBe('server-session-1');
    expect(rotated.sessionToken).not.toBe(created.sessionToken);
  });

  it('requires a phishing-resistant passkey and short separate session for privilege', () => {
    let sequence = 0;
    const sessions = new SessionService(
      new InMemorySessionStore(),
      () => new Date('2026-01-01T00:00:00.000Z'),
      () => `privileged-session-${++sequence}`,
    );

    type BasicSessionInput = Parameters<SessionService['create']>[0];
    type BasicSessionAcceptsPrivilege = 'privileged' extends keyof BasicSessionInput ? true : false;
    const basicSessionAcceptsPrivilege: BasicSessionAcceptsPrivilege = false;
    expect(basicSessionAcceptsPrivilege).toBe(false);
    expect(() =>
      sessions.createPrivileged({
        accountId: 'account-synthetic',
        assurance: 'phishing_resistant',
        authenticationMethod: 'passkey',
        device: SYNTHETIC_DEVICE,
        ttlSeconds: 901,
      }),
    ).toThrow(SessionAuthenticationError);
    expect(
      sessions.createPrivileged({
        accountId: 'account-synthetic',
        assurance: 'phishing_resistant',
        authenticationMethod: 'passkey',
        device: SYNTHETIC_DEVICE,
        ttlSeconds: 900,
      }).session.privileged,
    ).toBe(true);
  });
});
