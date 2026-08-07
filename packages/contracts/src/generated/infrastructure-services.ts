/* Generated from infrastructure-services.schema.json. Do not edit directly. */

export interface InfrastructureServicesContract {
  schemaVersion: '1.0.0';
  coreServices: ('postgres' | 'migrations' | 'rabbitmq' | 'object-storage' | 'mailpit' | 'api' | 'worker')[];
  optionalProfiles: {
    verus: {
      enabledByDefault: false;
      network: 'VRSCTEST';
      writesEnabled: false;
      services: ('verus-params' | 'verus-node' | 'wallet-request-signer-stub' | 'provenance-worker-signer-stub')[];
    };
  };
}
