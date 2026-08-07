/* Generated from mobile-compatibility-status.schema.json. Do not edit directly. */

/**
 * Synthetic foundation compatibility policy for installed native iOS and Android clients.
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
  releaseState: 'foundation';
  minimumAppVersion: '0.0.0-foundation';
  minimumBuildNumber: 1;
  /**
   * @minItems 1
   * @maxItems 1
   */
  supportedContractVersions: ['v1'];
}
