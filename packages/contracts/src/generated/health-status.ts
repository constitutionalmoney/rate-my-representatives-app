/* Generated from health-status.schema.json. Do not edit directly. */

/**
 * Operational v1 contract-foundation health response; expanded dependency readiness belongs to issue #42.
 */
export interface HealthStatus {
  status: 'ready';
  service: 'api';
  version: '1.0.0-contract';
  contract: {
    currentVersion: 'v1';
    minimumSupportedVersion: 'v1';
    /**
     * @minItems 1
     * @maxItems 1
     */
    supportedVersions: ['v1'];
  };
  featureStates: {
    publicRegistry: 'proposed';
    civicSignal: 'disabled';
    representativeSignals: 'disabled';
    verus: 'disabled';
    provenanceWrites: 'disabled';
  };
  optionalDependencies: {
    verus: 'disabled';
  };
}
