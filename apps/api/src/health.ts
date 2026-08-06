import type { HealthStatus } from '@rmr/contracts';

export function foundationHealth(): HealthStatus {
  return {
    optionalDependencies: {
      verus: 'disabled',
    },
    service: 'api',
    status: 'ready',
    version: '0.0.0-foundation',
  };
}
