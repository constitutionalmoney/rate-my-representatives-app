import { describe, expect, it } from 'vitest';

import { AuthenticationFailedError } from './authentication.js';
import { GENERIC_RECOVERY_START_MESSAGE } from './contracts.js';
import { createAuthenticationFixture, SYNTHETIC_DEVICE } from './test-helpers.js';

describe('credential recovery', () => {
  it('uses a generic start response and revokes every existing session on completion', async () => {
    const fixture = createAuthenticationFixture();
    const passkeyStart = fixture.authentication.beginPasskey();
    const session = await fixture.authentication.completePasskey(
      passkeyStart.requestId,
      'synthetic-passkey-assertion',
      SYNTHETIC_DEVICE,
    );
    const recovery = await fixture.authentication.beginRecovery('synthetic@example.invalid');

    expect(recovery.message).toBe(GENERIC_RECOVERY_START_MESSAGE);
    await expect(
      fixture.authentication.completeRecovery(recovery.requestId, 'synthetic-recovery-token'),
    ).resolves.toEqual({ status: 'recovery_verified' });
    expect(() =>
      fixture.sessions.rotate(session.sessionToken, SYNTHETIC_DEVICE.deviceId),
    ).toThrow();
  });

  it('rejects invalid recovery tokens without exposing account existence', async () => {
    const fixture = createAuthenticationFixture();
    const recovery = await fixture.authentication.beginRecovery('missing@example.invalid');

    await expect(
      fixture.authentication.completeRecovery(recovery.requestId, 'invalid'),
    ).rejects.toBeInstanceOf(AuthenticationFailedError);
  });
});
