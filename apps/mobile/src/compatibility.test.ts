import { describe, expect, it } from 'vitest';

import type { MobileCompatibilityStatus } from '@rmr/contracts';

import { evaluateMobileCompatibility } from './compatibility';

const SYNTHETIC_MOBILE_COMPATIBILITY_READY: MobileCompatibilityStatus = {
  status: 'compatible',
  contract: {
    currentVersion: 'v1',
    minimumSupportedVersion: 'v1',
    supportedVersions: ['v1'],
  },
  platforms: {
    android: {
      minimumAppVersion: '0.1.0',
      minimumBuildNumber: 1,
      releaseState: 'foundation',
      supportedContractVersions: ['v1'],
    },
    ios: {
      minimumAppVersion: '0.1.0',
      minimumBuildNumber: 1,
      releaseState: 'foundation',
      supportedContractVersions: ['v1'],
    },
  },
};

describe('installed app/API compatibility', () => {
  it('allows a supported contract at or above the minimum build', () => {
    expect(
      evaluateMobileCompatibility({
        appVersion: '0.1.0',
        buildNumber: 1,
        contractVersion: 'v1',
        platform: 'android',
        policy: SYNTHETIC_MOBILE_COMPATIBILITY_READY,
      }),
    ).toEqual({ allowed: true, reason: 'compatible' });
  });

  it('fails closed for unsupported contracts and emergency minimum builds', () => {
    expect(
      evaluateMobileCompatibility({
        appVersion: '0.1.0',
        buildNumber: 1,
        contractVersion: 'v2',
        platform: 'ios',
        policy: SYNTHETIC_MOBILE_COMPATIBILITY_READY,
      }),
    ).toEqual({ allowed: false, reason: 'contract_unsupported' });
    const raisedMinimum = {
      ...SYNTHETIC_MOBILE_COMPATIBILITY_READY,
      platforms: {
        ...SYNTHETIC_MOBILE_COMPATIBILITY_READY.platforms,
        android: {
          ...SYNTHETIC_MOBILE_COMPATIBILITY_READY.platforms.android,
          minimumBuildNumber: 2,
        },
      },
    };
    expect(
      evaluateMobileCompatibility({
        appVersion: '0.1.0',
        buildNumber: 1,
        contractVersion: 'v1',
        platform: 'android',
        policy: raisedMinimum,
      }),
    ).toEqual({ allowed: false, reason: 'minimum_build_required' });
  });

  it('enforces semantic app versions and fails closed on malformed versions', () => {
    const raisedMinimum = {
      ...SYNTHETIC_MOBILE_COMPATIBILITY_READY,
      platforms: {
        ...SYNTHETIC_MOBILE_COMPATIBILITY_READY.platforms,
        ios: {
          ...SYNTHETIC_MOBILE_COMPATIBILITY_READY.platforms.ios,
          minimumAppVersion: '0.2.0',
        },
      },
    };
    for (const appVersion of ['0.1.9', 'invalid']) {
      expect(
        evaluateMobileCompatibility({
          appVersion,
          buildNumber: 1,
          contractVersion: 'v1',
          platform: 'ios',
          policy: raisedMinimum,
        }),
      ).toEqual({ allowed: false, reason: 'minimum_app_version_required' });
    }
    expect(
      evaluateMobileCompatibility({
        appVersion: '0.1.0',
        buildNumber: Number.POSITIVE_INFINITY,
        contractVersion: 'v1',
        platform: 'ios',
        policy: SYNTHETIC_MOBILE_COMPATIBILITY_READY,
      }),
    ).toEqual({ allowed: false, reason: 'minimum_build_required' });
  });
});
