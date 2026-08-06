/* Generated from health-status.schema.json. Do not edit directly. */

/**
 * Synthetic foundation health response. This is not a production status claim.
 */
export interface HealthStatus {
  status: 'ready';
  service: 'api';
  version: string;
  optionalDependencies: {
    verus: 'disabled' | 'degraded' | 'ready';
  };
}
