/* Generated from representation-capabilities.schema.json. Do not edit directly. */

export type CountryCode = 'CA' | 'US';
export type Scope = 'local' | 'regional' | 'province_state' | 'federal' | 'special';

export interface RepresentationCapabilities {
  schemaVersion: 'representation-capabilities.v1';
  dataMode: 'synthetic';
  /**
   * @minItems 2
   * @maxItems 2
   */
  items: [Capability, Capability];
}
export interface Capability {
  schemaVersion: 'representation-capability.v1';
  coverage: {
    state: 'partial';
    gapCodes: string[];
  };
  countryCode: CountryCode;
  dataMode: 'synthetic';
  featureState: 'disabled' | 'operational';
  input: {
    autocomplete: 'postal-code' | 'street-address';
    kind: 'postal_code' | 'address';
    label: string;
    maxLength: number;
    retention: 'request_only';
  };
  legalDeterminations: 'none';
  provider: Metadata;
  /**
   * @minItems 1
   */
  supportedScopes: [Scope, ...Scope[]];
}
export interface Metadata {
  geometry: {
    effectiveFrom: string;
    license: string;
    sha256: string;
    version: string;
  };
  source: {
    license: string;
    observedAt: string;
    providerId: string;
    retention: 'none';
    termsUrl: string | null;
    version: string;
  };
}
