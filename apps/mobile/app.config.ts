import type { ConfigContext, ExpoConfig } from 'expo/config';

import environmentDocument from './mobile-environments.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const environmentName = process.env.RMR_MOBILE_ENV ?? 'development';
  if (!(environmentName in environmentDocument)) {
    throw new Error(`Unsupported RMR_MOBILE_ENV: ${environmentName}`);
  }
  const environment = environmentDocument[environmentName as keyof typeof environmentDocument];
  const walletHarnessRequested = process.env.RMR_VERUS_WALLET_HARNESS_ENABLED === 'true';
  if (walletHarnessRequested && environment.name === 'production') {
    throw new Error('The Verus Mobile harness cannot be enabled in production.');
  }
  const walletHarnessEnabled = walletHarnessRequested;
  const pushProjectId =
    process.env[`RMR_EXPO_PROJECT_ID_${environment.name.toUpperCase()}`] ?? null;

  return {
    ...config,
    name: environment.appName,
    slug: 'rate-my-representatives',
    version: '0.1.0',
    orientation: 'portrait',
    platforms: ['ios', 'android', 'web'],
    runtimeVersion: { policy: 'fingerprint' },
    scheme: environment.scheme,
    updates: {
      checkAutomatically: 'NEVER',
      enabled: false,
    },
    ios: {
      associatedDomains: [`applinks:${environment.appLinkHost}`],
      buildNumber: '1',
      bundleIdentifier: environment.iosBundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSFaceIDUsageDescription:
          'Rate My Representatives may use Face ID only to unlock protected local session material.',
      },
      supportsTablet: true,
    },
    android: {
      allowBackup: false,
      blockedPermissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          category: ['BROWSABLE', 'DEFAULT'],
          data: [
            {
              host: environment.appLinkHost,
              pathPrefix: '/app/',
              scheme: 'https',
            },
          ],
        },
      ],
      package: environment.androidPackage,
      predictiveBackGestureEnabled: true,
      versionCode: 1,
    },
    web: {
      bundler: 'metro',
      output: 'single',
    },
    plugins: ['expo-dev-client', 'expo-notifications', 'expo-secure-store'],
    extra: {
      apiContractVersion: 'v1',
      apiOrigin: environment.apiOrigin,
      appLinkHost: environment.appLinkHost,
      crashReporting: 'redacted-noop',
      mobileEnvironment: environment.name,
      productStatus: 'native-foundation-only',
      ...(pushProjectId === null ? {} : { pushProjectId }),
      releaseChannel: environment.releaseChannel,
      representativeActivityVdxfWritesEnabled: false,
      representativeVerusIdProvisioningEnabled: false,
      verusIdentityUpdateEnabled: false,
      verusNetwork: environment.verusNetwork,
      verusWallet: {
        enabled: walletHarnessEnabled,
        pinnedAndroidPackage: 'com.verusmobile',
        pinnedAndroidVersion: '1.1.0-5',
        scheme: 'verus',
      },
    },
  };
};
