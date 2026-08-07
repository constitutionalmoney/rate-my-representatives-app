import { describe, expect, it } from 'vitest';

import { AuthenticationFailedError } from './authentication.js';
import { GENERIC_EMAIL_START_MESSAGE } from './contracts.js';
import { SessionReplayDetectedError } from './sessions.js';
import { createAuthenticationFixture, SYNTHETIC_DEVICE } from './test-helpers.js';

describe('authentication abuse resistance', () => {
  it('uses the same public verified-email response for known and unknown accounts', async () => {
    const fixture = createAuthenticationFixture();
    const known = await fixture.authentication.beginVerifiedEmail('synthetic@example.invalid');
    const unknown = await fixture.authentication.beginVerifiedEmail('missing@example.invalid');

    expect(known.status).toBe(unknown.status);
    expect(known.message).toBe(GENERIC_EMAIL_START_MESSAGE);
    expect(unknown.message).toBe(GENERIC_EMAIL_START_MESSAGE);
    expect(Object.keys(known)).toEqual(Object.keys(unknown));
  });

  it('consumes a challenge after one completion attempt and rejects replay', async () => {
    const fixture = createAuthenticationFixture();
    const started = fixture.authentication.beginPasskey();

    await expect(
      fixture.authentication.completePasskey(started.requestId, 'invalid', SYNTHETIC_DEVICE),
    ).rejects.toBeInstanceOf(AuthenticationFailedError);
    await expect(
      fixture.authentication.completePasskey(
        started.requestId,
        'synthetic-passkey-assertion',
        SYNTHETIC_DEVICE,
      ),
    ).rejects.toBeInstanceOf(AuthenticationFailedError);
  });

  it('rejects expired challenges with the same generic authentication error', async () => {
    const fixture = createAuthenticationFixture();
    const started = fixture.authentication.beginPasskey();
    fixture.setNow('2026-01-01T00:11:00.000Z');

    await expect(
      fixture.authentication.completePasskey(
        started.requestId,
        'synthetic-passkey-assertion',
        SYNTHETIC_DEVICE,
      ),
    ).rejects.toMatchObject({ code: 'AUTHENTICATION_FAILED' });
  });

  it('revokes a session family when an already-rotated token is replayed', async () => {
    const fixture = createAuthenticationFixture();
    const started = fixture.authentication.beginPasskey();
    const session = await fixture.authentication.completePasskey(
      started.requestId,
      'synthetic-passkey-assertion',
      SYNTHETIC_DEVICE,
    );
    const rotated = fixture.sessions.rotate(session.sessionToken, SYNTHETIC_DEVICE.deviceId);

    expect(() => fixture.sessions.rotate(session.sessionToken, SYNTHETIC_DEVICE.deviceId)).toThrow(
      SessionReplayDetectedError,
    );
    expect(() =>
      fixture.sessions.rotate(rotated.sessionToken, SYNTHETIC_DEVICE.deviceId),
    ).toThrow();
  });
});
