import type { InfrastructureServicesContract } from './generated/infrastructure-services.js';

export const LOCAL_INFRASTRUCTURE_CONTRACT = Object.freeze({
  coreServices: [
    'postgres',
    'migrations',
    'rabbitmq',
    'object-storage',
    'mailpit',
    'api',
    'worker',
  ],
  optionalProfiles: {
    verus: {
      enabledByDefault: false,
      network: 'VRSCTEST',
      services: [
        'verus-params',
        'verus-node',
        'wallet-request-signer-stub',
        'provenance-worker-signer-stub',
      ],
      writesEnabled: false,
    },
  },
  schemaVersion: '1.0.0',
} as const satisfies InfrastructureServicesContract);
