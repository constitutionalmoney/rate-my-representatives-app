import { describe, expect, it } from 'vitest';

import { mobileEnvironments } from '../mobile-environments';
import { authorizeWalletLaunch, parseNativeLink } from './links';

describe('native app and wallet links', () => {
  const environment = mobileEnvironments.staging;

  it('accepts allowlisted HTTPS and environment-specific custom routes', () => {
    expect(
      parseNativeLink(
        'https://staging-connect.ratemyrepresentatives.com/app/profiles/profile%3Aca%3Asynthetic',
        environment,
      ),
    ).toEqual({ accepted: true, route: { kind: 'profile', profileId: 'profile:ca:synthetic' } });
    expect(parseNativeLink('rmr-staging://app/settings/notifications', environment)).toEqual({
      accepted: true,
      route: { kind: 'notifications' },
    });
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,unsafe',
    'file:///private/path',
    'https://connect.ratemyrepresentatives.com/app/profiles/profile:ca:synthetic',
    'https://staging-connect.ratemyrepresentatives.com.evil.example/app/profiles/x',
    'https://user:pass@staging-connect.ratemyrepresentatives.com/app/profiles/x',
    'https://staging-connect.ratemyrepresentatives.com/app/profiles/x?token=secret',
    'https://staging-connect.ratemyrepresentatives.com/app/profiles/x#fragment',
    'rmr://app/profiles/x',
  ])('rejects malicious or environment-mismatched link %s', (url) => {
    expect(parseNativeLink(url, environment).accepted).toBe(false);
  });

  it('requires a user gesture, visible origin, VRSCTEST, expiry, feature gate, and verus scheme', () => {
    const baseline = {
      displayedRmrOrigin: 'https://staging-connect.ratemyrepresentatives.com',
      expectedRmrOrigin: 'https://staging-connect.ratemyrepresentatives.com',
      explicitUserGesture: true,
      expiresAt: '2026-08-07T15:05:00Z',
      featureEnabled: true,
      network: 'VRSCTEST' as const,
      now: '2026-08-07T15:00:00Z',
      url: 'verus://request/synthetic-signed-envelope',
    };
    expect(authorizeWalletLaunch(baseline)).toMatchObject({ allowed: true });
    expect(authorizeWalletLaunch({ ...baseline, explicitUserGesture: false })).toEqual({
      allowed: false,
      reason: 'user_gesture_required',
    });
    expect(authorizeWalletLaunch({ ...baseline, network: 'VRSC' })).toEqual({
      allowed: false,
      reason: 'environment_mismatch',
    });
    expect(authorizeWalletLaunch({ ...baseline, url: 'verus0://legacy/request' })).toEqual({
      allowed: false,
      reason: 'unsafe_url',
    });
    for (const url of [
      'verus://request/too-short',
      'verus://request/synthetic-signed-envelope?account=private',
      'verus://other/synthetic-signed-envelope',
    ]) {
      expect(authorizeWalletLaunch({ ...baseline, url })).toEqual({
        allowed: false,
        reason: 'unsafe_url',
      });
    }
    expect(authorizeWalletLaunch({ ...baseline, featureEnabled: false })).toEqual({
      allowed: false,
      reason: 'disabled',
    });
  });
});
