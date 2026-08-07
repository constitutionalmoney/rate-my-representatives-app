import { describe, expect, it } from 'vitest';

import { SessionAuthenticationError } from './sessions.js';
import { createAuthenticationFixture, SYNTHETIC_DEVICE } from './test-helpers.js';

describe('authentication and session integration', () => {
  it('lists, rotates, revokes one, and revokes all device sessions', async () => {
    const fixture = createAuthenticationFixture();
    const passkeyStart = fixture.authentication.beginPasskey();
    const passkeySession = await fixture.authentication.completePasskey(
      passkeyStart.requestId,
      'synthetic-passkey-assertion',
      SYNTHETIC_DEVICE,
    );
    const emailStart = await fixture.authentication.beginVerifiedEmail('synthetic@example.invalid');
    const emailSession = await fixture.authentication.completeVerifiedEmail(
      emailStart.requestId,
      'synthetic-email-token',
      { ...SYNTHETIC_DEVICE, deviceId: 'device-synthetic-2' },
    );

    expect(
      fixture.sessions.list('account-synthetic', passkeySession.session.sessionId),
    ).toHaveLength(2);
    const rotated = fixture.sessions.rotate(
      passkeySession.sessionToken,
      passkeySession.session.device.deviceId,
    );
    expect(rotated.sessionToken).not.toBe(passkeySession.sessionToken);

    fixture.sessions.revokeOne('account-synthetic', emailSession.session.sessionId, 'user-revoked');
    const revokedEmailSession = fixture.sessions
      .list('account-synthetic', rotated.session.sessionId)
      .find((candidate) => candidate.sessionId === emailSession.session.sessionId);
    expect(revokedEmailSession?.revokedAt).toEqual(expect.any(String));

    expect(fixture.sessions.revokeAll('account-synthetic', 'revoke-all')).toBe(1);
    expect(() =>
      fixture.sessions.rotate(rotated.sessionToken, rotated.session.device.deviceId),
    ).toThrow(SessionAuthenticationError);
  });
});
