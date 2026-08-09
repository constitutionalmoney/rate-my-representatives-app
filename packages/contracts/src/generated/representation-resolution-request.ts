/* Generated from representation-resolution-request.schema.json. Do not edit directly. */

export type RepresentationResolutionRequest = {
  [k: string]: unknown;
} & {
  schemaVersion: 'representation-resolution-request.v1';
  asOf: string;
  countryCode: 'CA' | 'US';
  input: {
    kind: 'postal_code' | 'address';
    value: string;
  };
};
