import { describe, expect, it } from 'vitest';

import {
  createAnalyticsEvent,
  createStructuredEvent,
  redactSensitive,
  sanitizeForObservabilitySink,
} from './index.js';

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
        postalCode: 'A1A 1A1',
        coordinates: { latitude: 1, longitude: 2 },
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
      postalCode: '[REDACTED]',
      coordinates: '[REDACTED]',
      publicId: 'fixture-1',
      sessionToken: '[REDACTED]',
    });
  });

  it('permits only coarse operational location analytics', () => {
    expect(
      createAnalyticsEvent(
        'location.resolve',
        { countryCode: 'CA', providerId: 'synthetic-ca', status: 'resolved' },
        '2026-06-01T12:00:00.000Z',
      ),
    ).toMatchObject({ event: 'location.resolve' });
    expect(() => createAnalyticsEvent('location.resolve', { postalCode: 'A1A 1A1' })).toThrow(
      /not allowlisted/,
    );
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

  it.each(['audit', 'crash', 'log', 'queue', 'trace'] as const)(
    'redacts precise location and private civic activity from the %s sink',
    (sink) => {
      expect(
        sanitizeForObservabilitySink(sink, {
          nested: {
            preciseLocation: { address: 'synthetic private address' },
            representativeSignal: 'concern',
          },
          operation: 'synthetic.check',
        }),
      ).toEqual({
        nested: { preciseLocation: '[REDACTED]', representativeSignal: '[REDACTED]' },
        operation: 'synthetic.check',
      });
    },
  );

  it('permits only aggregate-free operational analytics fields', () => {
    expect(
      createAnalyticsEvent(
        'deck.load',
        { durationBucket: 'under_500ms', platform: 'android', status: 'ready' },
        '2026-08-09T12:00:00Z',
      ),
    ).toMatchObject({ event: 'deck.load', fields: { platform: 'android' } });
    expect(() =>
      createAnalyticsEvent('deck.complete', {
        platform: 'web',
        representativeSignal: 'support',
      }),
    ).toThrow(/not allowlisted/);
    expect(() =>
      createAnalyticsEvent('deck.complete', { platform: 'web', preciseLocation: 'synthetic' }),
    ).toThrow(/not allowlisted/);
  });
});
