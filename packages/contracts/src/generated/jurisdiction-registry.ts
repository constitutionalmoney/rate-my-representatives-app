/* Generated from jurisdiction-registry.schema.json. Do not edit directly. */

export type Timestamp = string;
export type Id = string;
export type CountryCode = 'CA' | 'US';

/**
 * Synthetic, effective-dated public registry read model. It contains jurisdictions, districts, public bodies, and offices only; person, term, candidacy, source-ingestion, and location-resolution families are deferred.
 */
export interface JurisdictionRegistry {
  schemaVersion: 'jurisdiction-registry.v1';
  dataMode: 'synthetic';
  generatedAt: Timestamp;
  asOf: Timestamp;
  jurisdictions: Jurisdiction[];
  jurisdictionRelationships: JurisdictionRelationship[];
  districts: District[];
  districtJurisdictionRelationships: DistrictJurisdictionRelationship[];
  districtLineage: DistrictLineage[];
  publicBodies: PublicBody[];
  bodyJurisdictionRelationships: BodyJurisdictionRelationship[];
  offices: Office[];
  externalIdentifiers: ExternalIdentifier[];
  gaps: Gap[];
  /**
   * @minItems 5
   * @maxItems 5
   */
  deferredFamilies: [
    'people' | 'office_terms' | 'candidacies' | 'source_ingestion' | 'location_resolution',
    'people' | 'office_terms' | 'candidacies' | 'source_ingestion' | 'location_resolution',
    'people' | 'office_terms' | 'candidacies' | 'source_ingestion' | 'location_resolution',
    'people' | 'office_terms' | 'candidacies' | 'source_ingestion' | 'location_resolution',
    'people' | 'office_terms' | 'candidacies' | 'source_ingestion' | 'location_resolution',
  ];
  page: {
    nextCursor: null;
  };
}
export interface Jurisdiction {
  jurisdictionId: Id;
  countryCode: CountryCode;
  /**
   * @minItems 1
   */
  versions: [JurisdictionVersion, ...JurisdictionVersion[]];
}
export interface JurisdictionVersion {
  versionId: Id;
  name: string;
  slug: string;
  kind:
    | 'country'
    | 'province'
    | 'state'
    | 'territory'
    | 'municipality'
    | 'locality'
    | 'unincorporated_area'
    | 'county'
    | 'regional_district'
    | 'region'
    | 'special_district';
  status: 'active' | 'future' | 'former' | 'amalgamated' | 'dissolved' | 'superseded';
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface Attribution {
  assertionId: Id;
  sourceReference: string;
  observedAt: Timestamp;
  freshness: 'current' | 'stale' | 'unknown' | 'unavailable';
  coverage: 'supported' | 'partial' | 'gap' | 'unsupported';
  conflict: 'clear' | 'conflicting' | 'unsupported';
  supersedesAssertionId: Id | null;
}
export interface JurisdictionRelationship {
  relationshipId: Id;
  subjectJurisdictionId: Id;
  objectJurisdictionId: Id;
  kind: 'contained_by' | 'administered_by' | 'overlaps' | 'represented_by' | 'successor_of';
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface District {
  districtId: Id;
  countryCode: CountryCode;
  /**
   * @minItems 1
   */
  versions: [DistrictVersion, ...DistrictVersion[]];
  boundaries: Boundary[];
}
export interface DistrictVersion {
  versionId: Id;
  name: string;
  slug: string;
  kind: 'federal_electoral' | 'provincial_electoral' | 'state_legislative' | 'local_electoral' | 'special';
  status: 'active' | 'future' | 'former' | 'superseded';
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface Boundary {
  boundaryVersionId: Id;
  geometryReference: string;
  geometrySha256: string;
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface DistrictJurisdictionRelationship {
  relationshipId: Id;
  districtId: Id;
  jurisdictionId: Id;
  kind: 'contained_by' | 'overlaps' | 'represents' | 'successor_of';
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface DistrictLineage {
  lineageId: Id;
  districtId: Id;
  predecessorDistrictId: Id;
  kind: 'redistricted_from' | 'split_from' | 'merged_from';
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface PublicBody {
  publicBodyId: Id;
  countryCode: CountryCode;
  /**
   * @minItems 1
   */
  versions: [PublicBodyVersion, ...PublicBodyVersion[]];
}
export interface PublicBodyVersion {
  versionId: Id;
  name: string;
  slug: string;
  kind: 'legislature' | 'council' | 'board' | 'agency' | 'commission';
  status: 'active' | 'future' | 'former' | 'abolished';
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface BodyJurisdictionRelationship {
  relationshipId: Id;
  publicBodyId: Id;
  jurisdictionId: Id;
  kind: 'governs' | 'serves' | 'overlaps';
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface Office {
  officeId: Id;
  countryCode: CountryCode;
  /**
   * @minItems 1
   */
  versions: [OfficeVersion, ...OfficeVersion[]];
}
export interface OfficeVersion {
  versionId: Id;
  publicBodyId: Id;
  districtId: Id | null;
  name: string;
  slug: string;
  selectionMethod: 'elected' | 'appointed' | 'mixed' | 'ex_officio' | 'unknown';
  operationalState: 'active' | 'vacant' | 'acting' | 'future' | 'abolished';
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface ExternalIdentifier {
  externalIdentifierId: Id;
  entityKind: 'jurisdiction' | 'district' | 'public_body' | 'office';
  entityId: Id;
  issuer: string;
  identifier: string;
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
export interface Gap {
  gapId: Id;
  entityKind: 'jurisdiction' | 'district' | 'public_body' | 'office';
  entityId: Id;
  code: string;
  message: string;
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
  attribution: Attribution;
}
