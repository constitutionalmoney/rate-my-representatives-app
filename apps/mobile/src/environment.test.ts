import { describe, expect, it } from 'vitest';

import {
  mobileEnvironmentNames,
  mobileEnvironments,
  resolveMobileEnvironment,
} from '../mobile-environments';
import { parseMobileRuntimeConfig } from './runtime-config';

describe('mobile environment isolation', () => {
  it('uses distinct app IDs, schemes, hosts, and release channels', () => {
    expect(
      new Set(mobileEnvironmentNames.map((name) => mobileEnvironments[name].iosBundleIdentifier))
        .size,
    ).toBe(4);
    expect(
      new Set(mobileEnvironmentNames.map((name) => mobileEnvironments[name].androidPackage)).size,
    ).toBe(4);
    expect(
      new Set(mobileEnvironmentNames.map((name) => mobileEnvironments[name].scheme)).size,
    ).toBe(4);
    expect(
      new Set(mobileEnvironmentNames.map((name) => mobileEnvironments[name].appLinkHost)).size,
    ).toBe(4);
    expect(mobileEnvironments.production.verusNetwork).toBe('disabled');
    expect(mobileEnvironments.staging.verusNetwork).toBe('VRSCTEST');
  });

  it('fails closed on unknown environments', () => {
    expect(() => resolveMobileEnvironment('production-copy')).toThrow('Unsupported RMR_MOBILE_ENV');
  });

  it('accepts only the false-by-default runtime safety envelope', () => {
    const environment = mobileEnvironments.staging;
    const parsed = parseMobileRuntimeConfig({
      apiContractVersion: 'v1',
      apiOrigin: environment.apiOrigin,
      appLinkHost: environment.appLinkHost,
      crashReporting: 'redacted-noop',
      mobileEnvironment: environment.name,
      productStatus: 'native-foundation-only',
      pushProjectId: null,
      releaseChannel: environment.releaseChannel,
      representativeActivityVdxfWritesEnabled: false,
      representativeVerusIdProvisioningEnabled: false,
      verusIdentityUpdateEnabled: false,
      verusNetwork: environment.verusNetwork,
      verusWallet: {
        enabled: false,
        pinnedAndroidPackage: 'com.verusmobile',
        pinnedAndroidVersion: '1.1.0-5',
        scheme: 'verus',
      },
    });
    expect(parsed).toMatchObject({
      mobileEnvironment: 'staging',
      verusIdentityUpdateEnabled: false,
    });
    expect(parseMobileRuntimeConfig({ ...parsed, pushProjectId: undefined }).pushProjectId).toBe(
      null,
    );
    expect(() => parseMobileRuntimeConfig({ ...parsed, verusIdentityUpdateEnabled: true })).toThrow(
      'safety configuration',
    );
    expect(() =>
      parseMobileRuntimeConfig({
        ...parsed,
        apiOrigin: mobileEnvironments.pilot.apiOrigin,
      }),
    ).toThrow('selected lane');
    expect(
      parseMobileRuntimeConfig({
        ...parsed,
        verusWallet: { ...parsed.verusWallet, enabled: true },
      }).verusWallet.enabled,
    ).toBe(true);
    const production = mobileEnvironments.production;
    expect(() =>
      parseMobileRuntimeConfig({
        ...parsed,
        apiOrigin: production.apiOrigin,
        appLinkHost: production.appLinkHost,
        mobileEnvironment: production.name,
        releaseChannel: production.releaseChannel,
        verusNetwork: production.verusNetwork,
        verusWallet: { ...parsed.verusWallet, enabled: true },
      }),
    ).toThrow('restricted');
  });
});
