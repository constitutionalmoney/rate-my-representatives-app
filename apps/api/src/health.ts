import {
  parseHealthStatus,
  parseMobileCompatibilityStatus,
  type HealthStatus,
  type MobileCompatibilityStatus,
} from '@rmr/contracts';

export function foundationHealth(): HealthStatus {
  return parseHealthStatus(
    {
      contract: {
        currentVersion: 'v1',
        minimumSupportedVersion: 'v1',
        supportedVersions: ['v1'],
      },
      featureStates: {
        civicSignal: 'disabled',
        provenanceWrites: 'disabled',
        publicRegistry: 'proposed',
        representativeSignals: 'disabled',
        verus: 'disabled',
      },
      optionalDependencies: {
        verus: 'disabled',
      },
      service: 'api',
      status: 'ready',
      version: '1.0.0-contract',
    },
    'server',
  );
}

export function mobileCompatibility(): MobileCompatibilityStatus {
  const platformPolicy = {
    minimumAppVersion: '0.0.0-foundation' as const,
    minimumBuildNumber: 1 as const,
    releaseState: 'foundation' as const,
    supportedContractVersions: ['v1'] as const,
  };
  return parseMobileCompatibilityStatus(
    {
      contract: {
        currentVersion: 'v1',
        minimumSupportedVersion: 'v1',
        supportedVersions: ['v1'],
      },
      platforms: { android: platformPolicy, ios: platformPolicy },
      status: 'compatible',
    },
    'server',
  );
}
