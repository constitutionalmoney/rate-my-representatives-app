import { describe, expect, it } from 'vitest';

import { createStructuredEvent, redactSensitive } from './index.js';

describe('privacy-safe observability', () => {
  it('redacts civic, identity, location, wallet, and authorization fields recursively', () => {
    expect(
      redactSensitive({
        authorization: 'Bearer synthetic',
        nested: { precise_location: 'synthetic address', signal: 'concern' },
        publicId: 'fixture-1',
      }),
    ).toEqual({
      authorization: '[REDACTED]',
      nested: { precise_location: '[REDACTED]', signal: '[REDACTED]' },
      publicId: 'fixture-1',
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
