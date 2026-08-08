/* Generated from mobile-compatibility-status.schema.json. Do not edit directly. */

/**
 * Versioned compatibility policy for installed native iOS and Android clients.
 */
export interface MobileCompatibilityStatus {
  status: 'compatible';
  contract: {
    currentVersion: 'v1';
    minimumSupportedVersion: 'v1';
    /**
     * @minItems 1
     * @maxItems 1
     */
    supportedVersions: ['v1'];
  };
  platforms: {
    ios: PlatformPolicy;
    android: PlatformPolicy;
  };
}
export interface PlatformPolicy {
  releaseState: 'foundation' | 'development' | 'staging' | 'pilot' | 'production' | 'blocked';
  minimumAppVersion: string;
  minimumBuildNumber: number;
  /**
   * @minItems 1
   * @maxItems 1
   */
  supportedContractVersions: ['v1'];
}
