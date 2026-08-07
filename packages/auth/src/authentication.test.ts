import { describe, expect, it } from 'vitest';

import { GENERIC_EMAIL_START_MESSAGE } from './contracts.js';
import { createAuthenticationFixture, SYNTHETIC_DEVICE } from './test-helpers.js';

describe('passkey and verified-email authentication units', () => {
  it('creates a phishing-resistant session only after a verified passkey assertion', async () => {
    const fixture = createAuthenticationFixture();
    const started = fixture.authentication.beginPasskey();
    const authenticated = await fixture.authentication.completePasskey(
      started.requestId,
      'synthetic-passkey-assertion',
      SYNTHETIC_DEVICE,
    );

    expect(started.challenge).toHaveLength(43);
    expect(authenticated.accountId).toBe('account-synthetic');
    expect(authenticated.session.authenticationMethod).toBe('passkey');
    expect(authenticated.session.assurance).toBe('phishing_resistant');
  });

  it('creates a basic session only after a verified email token', async () => {
    const fixture = createAuthenticationFixture();
    const started = await fixture.authentication.beginVerifiedEmail('synthetic@example.invalid');
    const authenticated = await fixture.authentication.completeVerifiedEmail(
      started.requestId,
      'synthetic-email-token',
      SYNTHETIC_DEVICE,
    );

    expect(started.message).toBe(GENERIC_EMAIL_START_MESSAGE);
    expect(authenticated.session.authenticationMethod).toBe('verified_email');
    expect(authenticated.session.assurance).toBe('basic');
  });
});
