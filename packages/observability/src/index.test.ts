import { describe, expect, it } from 'vitest';

import { createStructuredEvent, redactSensitive } from './index.js';

describe('privacy-safe observability', () => {
  it('redacts civic, identity, location, wallet, and authorization fields recursively', () => {
    expect(
      redactSensitive({
        accountId: 'account-synthetic',
        actorId: 'actor-synthetic',
        authorization: 'Bearer synthetic',
        email: 'synthetic@example.invalid',
        nested: { precise_location: 'synthetic address', signal: 'concern' },
        preciseAddress: 'synthetic precise address',
        publicId: 'fixture-1',
        sessionToken: 'synthetic-session-token',
      }),
    ).toEqual({
      accountId: '[REDACTED]',
      actorId: '[REDACTED]',
      authorization: '[REDACTED]',
      email: '[REDACTED]',
      nested: { precise_location: '[REDACTED]', signal: '[REDACTED]' },
      preciseAddress: '[REDACTED]',
      publicId: 'fixture-1',
      sessionToken: '[REDACTED]',
    });
  });

  it('creates deterministic structured events when a timestamp is supplied', () => {
    expect(
      createStructuredEvent('foundation.ready', { service: 'api' }, '2026-01-01T00:00:00Z'),
    ).toEqual({
      event: 'foundation.ready',
      fields: { service: 'api' },
      timestamp: '2026-01-01T00:00:00Z',
    });
  });
});
