/* Generated from source-connector-capability.schema.json. Do not edit directly. */

export type SourceConnectorCapabilityV1 = {
  [k: string]: unknown;
} & {
  schemaVersion: 'source-connector-capability.v1';
  connectorId: Id;
  connectorVersion: Id;
  dataMode: 'synthetic' | 'production';
  approval: {
    state: 'synthetic_approved' | 'production_approved' | 'suspended';
    reviewReference: string;
    reviewedAt: string;
  };
  source: {
    sourceId: Id;
    publisher: string;
    authoritativeScope: string;
    /**
     * @minItems 1
     */
    countries: ['CA' | 'US', ...('CA' | 'US')[]];
    /**
     * @minItems 1
     */
    jurisdictionIds: [Id, ...Id[]];
    /**
     * @minItems 1
     */
    recordTypes: [RecordType, ...RecordType[]];
  };
  access: {
    method: 'https_json' | 'https_csv';
    authentication: 'none' | 'api_key' | 'oauth_client' | 'client_certificate';
    endpointOrigin: string;
    rateLimitPerMinute: number;
    obeyRobotsPolicy: boolean;
  };
  rights: {
    licenseName: string;
    termsUrl: string;
    attributionText: string;
    retentionDays: number;
    redistribution: 'metadata_only' | 'permitted_snapshots';
    snapshotStorage: 'prohibited' | 'quarantine_only' | 'permitted';
  };
  identity: {
    /**
     * @minItems 1
     */
    externalIdentifierTypes: [string, ...string[]];
    effectiveDateSemantics: string;
  };
  schedule: {
    cadenceMinutes: number;
    freshnessExpectedMinutes: number;
    freshnessStaleMinutes: number;
  };
  pagination: {
    style: 'none' | 'cursor' | 'page';
    checkpointVersion: Id;
  };
  parser: {
    parserVersion: Id;
    schemaVersion: Id;
  };
  content: {
    /**
     * @minItems 1
     */
    expectedContentTypes: [string, ...string[]];
    /**
     * @minItems 1
     */
    permittedContentEncodings: ['identity' | 'gzip' | 'br', ...('identity' | 'gzip' | 'br')[]];
    maximumWireBytes: number;
    maximumDecodedBytes: number;
    maximumExpansionRatio: number;
    timeoutMs: number;
    maximumRedirects: number;
  };
  behavior: {
    conflicts: 'quarantine';
    deletions: 'review';
    retractions: 'review';
    outages: 'retry_then_dead_letter';
  };
  owner: {
    team: string;
    incidentRunbook: string;
  };
};
export type Id = string;
export type RecordType =
  | 'jurisdiction'
  | 'person'
  | 'office'
  | 'office_term'
  | 'candidacy'
  | 'election'
  | 'vote'
  | 'attendance'
  | 'committee'
  | 'expense'
  | 'disclosure'
  | 'statement'
  | 'promise_position'
  | 'event'
  | 'outcome'
  | 'correction';
