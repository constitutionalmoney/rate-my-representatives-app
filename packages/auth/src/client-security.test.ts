import { describe, expect, it, vi } from 'vitest';

import {
  AUTH_SCREEN_ANALYTICS_POLICY,
  InsecureSessionStorageError,
  clearSensitiveClientState,
  createWebSessionCookie,
  hashCsrfToken,
  isCsrfRequestValid,
  storeNativeSessionMaterial,
} from './client-security.js';
import { createAuthenticationFixture, SYNTHETIC_DEVICE } from './test-helpers.js';

describe('native and web session policy', () => {
  it('rejects native session material in plain application storage', async () => {
    const fixture = createAuthenticationFixture();
    const started = fixture.authentication.beginPasskey();
    const session = await fixture.authentication.completePasskey(
      started.requestId,
      'synthetic-passkey-assertion',
      SYNTHETIC_DEVICE,
    );

    await expect(
      storeNativeSessionMaterial(
        { protection: 'plain-storage', clear: vi.fn(), set: vi.fn() },
        session,
      ),
    ).rejects.toBeInstanceOf(InsecureSessionStorageError);
  });

  it('clears secure session material and private caches on sign-out or deletion', async () => {
    const clearVault = vi.fn(async () => undefined);
    const clearCache = vi.fn(async () => undefined);
    await clearSensitiveClientState(
      { protection: 'ios-keychain', clear: clearVault, set: vi.fn() },
      [{ clearSensitiveState: clearCache }],
      'account-deletion',
    );

    expect(clearVault).toHaveBeenCalledOnce();
    expect(clearCache).toHaveBeenCalledWith('account-deletion');
  });

  it('uses a host-only secure HttpOnly web cookie and synchronizer CSRF protection', () => {
    const cookie = createWebSessionCookie(`session-synthetic.${'a'.repeat(43)}`, 900);
    expect(cookie).toContain('__Host-rmr_session=');
    expect(cookie).toContain('Secure; HttpOnly; SameSite=Lax');
    expect(cookie).not.toContain('Domain=');

    const csrfToken = 'synthetic-csrf-token';
    expect(
      isCsrfRequestValid({
        expectedOrigin: 'https://app.example.invalid',
        expectedTokenHash: hashCsrfToken(csrfToken),
        method: 'POST',
        origin: 'https://app.example.invalid',
        presentedToken: csrfToken,
      }),
    ).toBe(true);
    expect(
      isCsrfRequestValid({
        expectedOrigin: 'https://app.example.invalid',
        expectedTokenHash: hashCsrfToken(csrfToken),
        method: 'POST',
        origin: 'https://attacker.example.invalid',
        presentedToken: csrfToken,
      }),
    ).toBe(false);
  });

  it('forbids session replay and third-party analytics on sensitive screens', () => {
    expect(AUTH_SCREEN_ANALYTICS_POLICY).toEqual({
      sessionReplayAllowed: false,
      thirdPartyAnalyticsAllowed: false,
    });
  });
});
