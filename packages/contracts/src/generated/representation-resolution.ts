/* Generated from representation-resolution.schema.json. Do not edit directly. */

export type OpaqueId = string;

export interface RepresentationResolution {
  schemaVersion: 'representation-resolution.v1';
  resolutionId: OpaqueId;
  dataMode: 'synthetic';
  countryCode: 'CA' | 'US';
  asOf: string;
  state: 'resolved' | 'ambiguous' | 'unsupported' | 'conflicting' | 'stale' | 'provider_unavailable';
  detailCode: string | null;
  matches: Match[];
  ambiguity: {
    selectionToken: OpaqueId;
    expiresAt: string;
    /**
     * @minItems 2
     */
    options: [
      {
        candidateId: OpaqueId;
        label: string;
      },
      {
        candidateId: OpaqueId;
        label: string;
      },
      ...{
        candidateId: OpaqueId;
        label: string;
      }[],
    ];
  } | null;
  provider: Metadata;
  inputDisposition: {
    disposedAt: string;
    logged: false;
    persisted: false;
    queued: false;
    sentToAi: false;
    sentToVerus: false;
  };
  legalDeterminations: {
    citizenship: 'not_determined';
    legalResidence: 'not_determined';
    voterEligibility: 'not_determined';
  };
}
export interface Match {
  scope: 'local' | 'regional' | 'province_state' | 'federal' | 'special';
  matchState: 'matched' | 'coverage_gap';
  jurisdiction: Entity;
  district: Entity | null;
  officeId: OpaqueId | null;
  officeTermId: OpaqueId | null;
  candidacyIds: OpaqueId[];
}
export interface Entity {
  applicationId: OpaqueId;
  /**
   * @minItems 1
   */
  authoritativeIdentifiers: [Identifier, ...Identifier[]];
  label: string;
}
export interface Identifier {
  issuer: string;
  identifier: string;
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
    providerId: OpaqueId;
    retention: 'none';
    termsUrl: string | null;
    version: string;
  };
}
