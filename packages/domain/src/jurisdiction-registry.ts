export type CountryCode = 'CA' | 'US';
export type RegistryCoverageState = 'supported' | 'partial' | 'gap' | 'unsupported';
export type RegistryFreshnessState = 'current' | 'stale' | 'unknown' | 'unavailable';
export type RegistryConflictState = 'clear' | 'conflicting' | 'unsupported';
export type JurisdictionKind =
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
export type JurisdictionStatus =
  'active' | 'future' | 'former' | 'amalgamated' | 'dissolved' | 'superseded';
export type JurisdictionRelationshipKind =
  'contained_by' | 'administered_by' | 'overlaps' | 'represented_by' | 'successor_of';
export type DistrictKind =
  | 'federal_electoral'
  | 'provincial_electoral'
  | 'state_legislative'
  | 'local_electoral'
  | 'special';
export type DistrictStatus = 'active' | 'future' | 'former' | 'superseded';
export type DistrictRelationshipKind = 'contained_by' | 'overlaps' | 'represents' | 'successor_of';
export type DistrictLineageKind = 'redistricted_from' | 'split_from' | 'merged_from';
export type PublicBodyKind = 'legislature' | 'council' | 'board' | 'agency' | 'commission';
export type PublicBodyStatus = 'active' | 'future' | 'former' | 'abolished';
export type OfficeSelectionMethod = 'elected' | 'appointed' | 'mixed' | 'ex_officio' | 'unknown';
export type OfficeOperationalState = 'active' | 'vacant' | 'acting' | 'future' | 'abolished';
export type RegistryEntityKind = 'jurisdiction' | 'district' | 'public_body' | 'office';

type OpaqueId<Kind extends string> = string & { readonly __kind: Kind };
export type AssertionId = OpaqueId<'AssertionId'>;
export type JurisdictionId = OpaqueId<'JurisdictionId'>;
export type DistrictId = OpaqueId<'DistrictId'>;
export type PublicBodyId = OpaqueId<'PublicBodyId'>;
export type OfficeId = OpaqueId<'OfficeId'>;

export interface EffectivePeriod {
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
}

export interface RegistryAttribution {
  readonly assertionId: AssertionId;
  readonly sourceReference: string;
  readonly observedAt: string;
  readonly freshness: RegistryFreshnessState;
  readonly coverage: RegistryCoverageState;
  readonly conflict: RegistryConflictState;
  readonly supersedesAssertionId: AssertionId | null;
}

export interface JurisdictionVersion extends EffectivePeriod {
  readonly versionId: string;
  readonly name: string;
  readonly slug: string;
  readonly kind: JurisdictionKind;
  readonly status: JurisdictionStatus;
  readonly attribution: RegistryAttribution;
}

export interface JurisdictionRecord {
  readonly jurisdictionId: JurisdictionId;
  readonly countryCode: CountryCode;
  readonly versions: readonly JurisdictionVersion[];
}

export interface JurisdictionRelationship extends EffectivePeriod {
  readonly relationshipId: string;
  readonly subjectJurisdictionId: JurisdictionId;
  readonly objectJurisdictionId: JurisdictionId;
  readonly kind: JurisdictionRelationshipKind;
  readonly attribution: RegistryAttribution;
}

export interface BoundaryVersion extends EffectivePeriod {
  readonly boundaryVersionId: string;
  readonly geometryReference: string;
  readonly geometrySha256: string;
  readonly attribution: RegistryAttribution;
}

export interface DistrictVersion extends EffectivePeriod {
  readonly versionId: string;
  readonly name: string;
  readonly slug: string;
  readonly kind: DistrictKind;
  readonly status: DistrictStatus;
  readonly attribution: RegistryAttribution;
}

export interface DistrictRecord {
  readonly districtId: DistrictId;
  readonly countryCode: CountryCode;
  readonly versions: readonly DistrictVersion[];
  readonly boundaries: readonly BoundaryVersion[];
}

export interface DistrictJurisdictionRelationship extends EffectivePeriod {
  readonly relationshipId: string;
  readonly districtId: DistrictId;
  readonly jurisdictionId: JurisdictionId;
  readonly kind: DistrictRelationshipKind;
  readonly attribution: RegistryAttribution;
}

export interface DistrictLineage extends EffectivePeriod {
  readonly lineageId: string;
  readonly districtId: DistrictId;
  readonly predecessorDistrictId: DistrictId;
  readonly kind: DistrictLineageKind;
  readonly attribution: RegistryAttribution;
}

export interface PublicBodyVersion extends EffectivePeriod {
  readonly versionId: string;
  readonly name: string;
  readonly slug: string;
  readonly kind: PublicBodyKind;
  readonly status: PublicBodyStatus;
  readonly attribution: RegistryAttribution;
}

export interface PublicBodyRecord {
  readonly publicBodyId: PublicBodyId;
  readonly countryCode: CountryCode;
  readonly versions: readonly PublicBodyVersion[];
}

export interface BodyJurisdictionRelationship extends EffectivePeriod {
  readonly relationshipId: string;
  readonly publicBodyId: PublicBodyId;
  readonly jurisdictionId: JurisdictionId;
  readonly kind: 'governs' | 'serves' | 'overlaps';
  readonly attribution: RegistryAttribution;
}

export interface OfficeVersion extends EffectivePeriod {
  readonly versionId: string;
  readonly publicBodyId: PublicBodyId;
  readonly districtId: DistrictId | null;
  readonly name: string;
  readonly slug: string;
  readonly selectionMethod: OfficeSelectionMethod;
  readonly operationalState: OfficeOperationalState;
  readonly attribution: RegistryAttribution;
}

export interface OfficeRecord {
  readonly officeId: OfficeId;
  readonly countryCode: CountryCode;
  readonly versions: readonly OfficeVersion[];
}

export interface ExternalIdentifier extends EffectivePeriod {
  readonly externalIdentifierId: string;
  readonly entityKind: RegistryEntityKind;
  readonly entityId: JurisdictionId | DistrictId | PublicBodyId | OfficeId;
  readonly issuer: string;
  readonly identifier: string;
  readonly attribution: RegistryAttribution;
}

export interface RegistryGap extends EffectivePeriod {
  readonly gapId: string;
  readonly entityKind: RegistryEntityKind;
  readonly entityId: string;
  readonly code: string;
  readonly message: string;
  readonly attribution: RegistryAttribution;
}

export interface JurisdictionRegistrySnapshot {
  readonly schemaVersion: 'jurisdiction-registry.v1';
  readonly dataMode: 'synthetic';
  readonly generatedAt: string;
  readonly jurisdictions: readonly JurisdictionRecord[];
  readonly jurisdictionRelationships: readonly JurisdictionRelationship[];
  readonly districts: readonly DistrictRecord[];
  readonly districtJurisdictionRelationships: readonly DistrictJurisdictionRelationship[];
  readonly districtLineage: readonly DistrictLineage[];
  readonly publicBodies: readonly PublicBodyRecord[];
  readonly bodyJurisdictionRelationships: readonly BodyJurisdictionRelationship[];
  readonly offices: readonly OfficeRecord[];
  readonly externalIdentifiers: readonly ExternalIdentifier[];
  readonly gaps: readonly RegistryGap[];
}

export interface RegistryQuery {
  readonly asOf: string;
  readonly countryCode?: CountryCode;
  readonly jurisdictionId?: JurisdictionId;
  readonly includeHistorical?: boolean;
}

export interface JurisdictionRegistryReadModel extends JurisdictionRegistrySnapshot {
  readonly asOf: string;
  readonly deferredFamilies: readonly [
    'people',
    'office_terms',
    'candidacies',
    'source_ingestion',
    'location_resolution',
  ];
  readonly page: { readonly nextCursor: null };
}

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function parseTime(value: string, field: string): number {
  const parsed = Date.parse(value);
  if (!ISO_TIMESTAMP_PATTERN.test(value) || !Number.isFinite(parsed)) {
    throw new Error(`${field} must be an ISO-8601 timestamp.`);
  }
  return parsed;
}

function assertId(value: string, field: string): void {
  if (!ID_PATTERN.test(value)) throw new Error(`${field} is not a stable opaque identifier.`);
}

function assertPeriod(period: EffectivePeriod, field: string): void {
  const start = parseTime(period.effectiveFrom, `${field}.effectiveFrom`);
  if (period.effectiveTo !== null) {
    const end = parseTime(period.effectiveTo, `${field}.effectiveTo`);
    if (end <= start) throw new Error(`${field} must use a non-empty half-open period.`);
  }
}

function periodsOverlap(left: EffectivePeriod, right: EffectivePeriod): boolean {
  const leftStart = parseTime(left.effectiveFrom, 'left.effectiveFrom');
  const rightStart = parseTime(right.effectiveFrom, 'right.effectiveFrom');
  const leftEnd =
    left.effectiveTo === null
      ? Number.POSITIVE_INFINITY
      : parseTime(left.effectiveTo, 'left.effectiveTo');
  const rightEnd =
    right.effectiveTo === null
      ? Number.POSITIVE_INFINITY
      : parseTime(right.effectiveTo, 'right.effectiveTo');
  return leftStart < rightEnd && rightStart < leftEnd;
}

export function isEffectiveAt(period: EffectivePeriod, asOf: string): boolean {
  const target = parseTime(asOf, 'asOf');
  return (
    parseTime(period.effectiveFrom, 'effectiveFrom') <= target &&
    (period.effectiveTo === null || target < parseTime(period.effectiveTo, 'effectiveTo'))
  );
}

function assertAttribution(attribution: RegistryAttribution, field: string): void {
  assertId(attribution.assertionId, `${field}.assertionId`);
  parseTime(attribution.observedAt, `${field}.observedAt`);
  if (!/^synthetic:\/\/[a-z0-9./_:-]+$/i.test(attribution.sourceReference)) {
    throw new Error(`${field}.sourceReference must identify a synthetic source.`);
  }
  if (attribution.supersedesAssertionId !== null) {
    assertId(attribution.supersedesAssertionId, `${field}.supersedesAssertionId`);
    if (attribution.supersedesAssertionId === attribution.assertionId) {
      throw new Error(`${field} cannot supersede itself.`);
    }
  }
}

function assertVersionSeries(
  entityId: string,
  versions: readonly (EffectivePeriod & {
    readonly versionId: string;
    readonly attribution: RegistryAttribution;
  })[],
): void {
  if (versions.length === 0) throw new Error(`${entityId} requires at least one version.`);
  versions.forEach((version, index) => {
    assertId(version.versionId, `${entityId}.versions[${index}].versionId`);
    assertPeriod(version, `${entityId}.versions[${index}]`);
    assertAttribution(version.attribution, `${entityId}.versions[${index}].attribution`);
    for (const earlier of versions.slice(0, index)) {
      if (periodsOverlap(earlier, version)) {
        throw new Error(`${entityId} has overlapping effective-dated versions.`);
      }
    }
  });
}

function assertContainmentAcyclic(snapshot: JurisdictionRegistrySnapshot): void {
  const boundaries = new Set(
    snapshot.jurisdictionRelationships.flatMap((relationship) =>
      relationship.effectiveTo === null
        ? [relationship.effectiveFrom]
        : [relationship.effectiveFrom, relationship.effectiveTo],
    ),
  );
  for (const asOf of boundaries) {
    const parents = new Map<string, string[]>();
    for (const relationship of snapshot.jurisdictionRelationships) {
      if (relationship.kind !== 'contained_by' || !isEffectiveAt(relationship, asOf)) continue;
      const current = parents.get(relationship.subjectJurisdictionId) ?? [];
      current.push(relationship.objectJurisdictionId);
      parents.set(relationship.subjectJurisdictionId, current);
    }
    const visit = (id: string, path: Set<string>): void => {
      if (path.has(id)) throw new Error(`Jurisdiction containment cycle detected at ${id}.`);
      const nextPath = new Set(path).add(id);
      for (const parent of parents.get(id) ?? []) visit(parent, nextPath);
    };
    for (const id of parents.keys()) visit(id, new Set());
  }
}

export function assertJurisdictionRegistry(snapshot: JurisdictionRegistrySnapshot): void {
  parseTime(snapshot.generatedAt, 'generatedAt');
  const jurisdictionIds = new Set(snapshot.jurisdictions.map((record) => record.jurisdictionId));
  const districtIds = new Set(snapshot.districts.map((record) => record.districtId));
  const bodyIds = new Set(snapshot.publicBodies.map((record) => record.publicBodyId));
  const officeIds = new Set(snapshot.offices.map((record) => record.officeId));
  const jurisdictionCountries = new Map(
    snapshot.jurisdictions.map((record) => [record.jurisdictionId, record.countryCode]),
  );
  const districtCountries = new Map(
    snapshot.districts.map((record) => [record.districtId, record.countryCode]),
  );
  const bodyCountries = new Map(
    snapshot.publicBodies.map((record) => [record.publicBodyId, record.countryCode]),
  );
  if (jurisdictionIds.size !== snapshot.jurisdictions.length)
    throw new Error('Duplicate jurisdiction ID.');
  if (districtIds.size !== snapshot.districts.length) throw new Error('Duplicate district ID.');
  if (bodyIds.size !== snapshot.publicBodies.length) throw new Error('Duplicate public body ID.');
  if (officeIds.size !== snapshot.offices.length) throw new Error('Duplicate office ID.');

  for (const record of snapshot.jurisdictions) {
    assertId(record.jurisdictionId, 'jurisdictionId');
    assertVersionSeries(record.jurisdictionId, record.versions);
  }
  for (const record of snapshot.districts) {
    assertId(record.districtId, 'districtId');
    assertVersionSeries(record.districtId, record.versions);
    record.boundaries.forEach((boundary, index) => {
      assertId(boundary.boundaryVersionId, 'boundaryVersionId');
      assertPeriod(boundary, boundary.boundaryVersionId);
      assertAttribution(boundary.attribution, `${boundary.boundaryVersionId}.attribution`);
      if (!SHA256_PATTERN.test(boundary.geometrySha256)) {
        throw new Error(`${boundary.boundaryVersionId} has an invalid geometry digest.`);
      }
      for (const earlier of record.boundaries.slice(0, index)) {
        if (periodsOverlap(earlier, boundary)) {
          throw new Error(`${record.districtId} has overlapping boundary versions.`);
        }
      }
    });
  }
  for (const record of snapshot.publicBodies) {
    assertId(record.publicBodyId, 'publicBodyId');
    assertVersionSeries(record.publicBodyId, record.versions);
  }
  for (const record of snapshot.offices) {
    assertId(record.officeId, 'officeId');
    assertVersionSeries(record.officeId, record.versions);
    for (const version of record.versions) {
      if (!bodyIds.has(version.publicBodyId)) throw new Error(`${version.versionId} has no body.`);
      if (version.districtId !== null && !districtIds.has(version.districtId)) {
        throw new Error(`${version.versionId} has no district.`);
      }
      if (
        bodyCountries.get(version.publicBodyId) !== record.countryCode ||
        (version.districtId !== null &&
          districtCountries.get(version.districtId) !== record.countryCode)
      ) {
        throw new Error(`${version.versionId} crosses a country boundary.`);
      }
    }
  }

  for (const relationship of snapshot.jurisdictionRelationships) {
    assertPeriod(relationship, relationship.relationshipId);
    assertAttribution(relationship.attribution, `${relationship.relationshipId}.attribution`);
    if (
      !jurisdictionIds.has(relationship.subjectJurisdictionId) ||
      !jurisdictionIds.has(relationship.objectJurisdictionId)
    )
      throw new Error(`${relationship.relationshipId} references an unknown jurisdiction.`);
    if (relationship.subjectJurisdictionId === relationship.objectJurisdictionId) {
      throw new Error(`${relationship.relationshipId} is a self relationship.`);
    }
    if (
      jurisdictionCountries.get(relationship.subjectJurisdictionId) !==
      jurisdictionCountries.get(relationship.objectJurisdictionId)
    ) {
      throw new Error(`${relationship.relationshipId} crosses a country boundary.`);
    }
  }
  for (const relationship of snapshot.districtJurisdictionRelationships) {
    assertPeriod(relationship, relationship.relationshipId);
    assertAttribution(relationship.attribution, `${relationship.relationshipId}.attribution`);
    if (
      !districtIds.has(relationship.districtId) ||
      !jurisdictionIds.has(relationship.jurisdictionId)
    ) {
      throw new Error(
        `${relationship.relationshipId} references an unknown district/jurisdiction.`,
      );
    }
    if (
      districtCountries.get(relationship.districtId) !==
      jurisdictionCountries.get(relationship.jurisdictionId)
    ) {
      throw new Error(`${relationship.relationshipId} crosses a country boundary.`);
    }
  }
  for (const lineage of snapshot.districtLineage) {
    assertPeriod(lineage, lineage.lineageId);
    assertAttribution(lineage.attribution, `${lineage.lineageId}.attribution`);
    if (!districtIds.has(lineage.districtId) || !districtIds.has(lineage.predecessorDistrictId)) {
      throw new Error(`${lineage.lineageId} references an unknown district.`);
    }
    if (lineage.districtId === lineage.predecessorDistrictId) {
      throw new Error(`${lineage.lineageId} cannot reference itself.`);
    }
    if (
      districtCountries.get(lineage.districtId) !==
      districtCountries.get(lineage.predecessorDistrictId)
    ) {
      throw new Error(`${lineage.lineageId} crosses a country boundary.`);
    }
  }
  for (const relationship of snapshot.bodyJurisdictionRelationships) {
    assertPeriod(relationship, relationship.relationshipId);
    assertAttribution(relationship.attribution, `${relationship.relationshipId}.attribution`);
    if (
      !bodyIds.has(relationship.publicBodyId) ||
      !jurisdictionIds.has(relationship.jurisdictionId)
    ) {
      throw new Error(`${relationship.relationshipId} references an unknown body/jurisdiction.`);
    }
    if (
      bodyCountries.get(relationship.publicBodyId) !==
      jurisdictionCountries.get(relationship.jurisdictionId)
    ) {
      throw new Error(`${relationship.relationshipId} crosses a country boundary.`);
    }
  }
  for (const externalId of snapshot.externalIdentifiers) {
    assertPeriod(externalId, externalId.externalIdentifierId);
    assertAttribution(externalId.attribution, `${externalId.externalIdentifierId}.attribution`);
    const known =
      (externalId.entityKind === 'jurisdiction' &&
        jurisdictionIds.has(externalId.entityId as JurisdictionId)) ||
      (externalId.entityKind === 'district' &&
        districtIds.has(externalId.entityId as DistrictId)) ||
      (externalId.entityKind === 'public_body' &&
        bodyIds.has(externalId.entityId as PublicBodyId)) ||
      (externalId.entityKind === 'office' && officeIds.has(externalId.entityId as OfficeId));
    if (!known) throw new Error(`${externalId.externalIdentifierId} references an unknown entity.`);
  }
  for (const gap of snapshot.gaps) {
    assertPeriod(gap, gap.gapId);
    assertAttribution(gap.attribution, `${gap.gapId}.attribution`);
    const known =
      (gap.entityKind === 'jurisdiction' && jurisdictionIds.has(gap.entityId as JurisdictionId)) ||
      (gap.entityKind === 'district' && districtIds.has(gap.entityId as DistrictId)) ||
      (gap.entityKind === 'public_body' && bodyIds.has(gap.entityId as PublicBodyId)) ||
      (gap.entityKind === 'office' && officeIds.has(gap.entityId as OfficeId));
    if (!known) throw new Error(`${gap.gapId} references an unknown entity.`);
  }
  assertContainmentAcyclic(snapshot);
}

function versionsForDate<T extends EffectivePeriod>(
  versions: readonly T[],
  asOf: string,
  includeHistorical: boolean,
): readonly T[] {
  return includeHistorical ? versions : versions.filter((version) => isEffectiveAt(version, asOf));
}

export function queryJurisdictionRegistry(
  snapshot: JurisdictionRegistrySnapshot,
  query: RegistryQuery,
): JurisdictionRegistryReadModel {
  assertJurisdictionRegistry(snapshot);
  parseTime(query.asOf, 'asOf');
  const includeHistorical = query.includeHistorical === true;
  let jurisdictions = snapshot.jurisdictions.filter(
    (record) =>
      (query.countryCode === undefined || record.countryCode === query.countryCode) &&
      (includeHistorical || record.versions.some((version) => isEffectiveAt(version, query.asOf))),
  );
  if (query.jurisdictionId !== undefined) {
    const connected = new Set<string>([query.jurisdictionId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const relationship of snapshot.jurisdictionRelationships) {
        if (!includeHistorical && !isEffectiveAt(relationship, query.asOf)) continue;
        if (
          connected.has(relationship.subjectJurisdictionId) ||
          connected.has(relationship.objectJurisdictionId)
        ) {
          const before = connected.size;
          connected.add(relationship.subjectJurisdictionId);
          connected.add(relationship.objectJurisdictionId);
          changed ||= connected.size !== before;
        }
      }
    }
    jurisdictions = jurisdictions.filter((record) => connected.has(record.jurisdictionId));
  }
  const selectedJurisdictionIds = new Set(jurisdictions.map((record) => record.jurisdictionId));
  const jurisdictionRelationships = snapshot.jurisdictionRelationships.filter(
    (relationship) =>
      selectedJurisdictionIds.has(relationship.subjectJurisdictionId) &&
      selectedJurisdictionIds.has(relationship.objectJurisdictionId) &&
      (includeHistorical || isEffectiveAt(relationship, query.asOf)),
  );
  const eligibleDistrictIds = new Set(
    snapshot.districts
      .filter(
        (record) =>
          includeHistorical ||
          record.versions.some((version) => isEffectiveAt(version, query.asOf)),
      )
      .map((record) => record.districtId),
  );
  const districtRelationships = snapshot.districtJurisdictionRelationships.filter(
    (relationship) =>
      eligibleDistrictIds.has(relationship.districtId) &&
      selectedJurisdictionIds.has(relationship.jurisdictionId) &&
      (includeHistorical || isEffectiveAt(relationship, query.asOf)),
  );
  const selectedDistrictIds = new Set(
    districtRelationships.map((relationship) => relationship.districtId),
  );
  const eligibleBodyIds = new Set(
    snapshot.publicBodies
      .filter(
        (record) =>
          includeHistorical ||
          record.versions.some((version) => isEffectiveAt(version, query.asOf)),
      )
      .map((record) => record.publicBodyId),
  );
  const bodyRelationships = snapshot.bodyJurisdictionRelationships.filter(
    (relationship) =>
      eligibleBodyIds.has(relationship.publicBodyId) &&
      selectedJurisdictionIds.has(relationship.jurisdictionId) &&
      (includeHistorical || isEffectiveAt(relationship, query.asOf)),
  );
  const selectedBodyIds = new Set(
    bodyRelationships.map((relationship) => relationship.publicBodyId),
  );
  const selectedOfficeIds = new Set(
    snapshot.offices
      .filter((record) =>
        record.versions.some(
          (version) =>
            selectedBodyIds.has(version.publicBodyId) &&
            (includeHistorical || isEffectiveAt(version, query.asOf)),
        ),
      )
      .map((record) => record.officeId),
  );

  return Object.freeze({
    ...snapshot,
    asOf: query.asOf,
    bodyJurisdictionRelationships: bodyRelationships,
    deferredFamilies: [
      'people',
      'office_terms',
      'candidacies',
      'source_ingestion',
      'location_resolution',
    ] as const,
    districtJurisdictionRelationships: districtRelationships,
    districtLineage: snapshot.districtLineage.filter(
      (lineage) =>
        selectedDistrictIds.has(lineage.districtId) &&
        selectedDistrictIds.has(lineage.predecessorDistrictId) &&
        (includeHistorical || isEffectiveAt(lineage, query.asOf)),
    ),
    districts: snapshot.districts
      .filter((record) => selectedDistrictIds.has(record.districtId))
      .map((record) => ({
        ...record,
        boundaries: versionsForDate(record.boundaries, query.asOf, includeHistorical),
        versions: versionsForDate(record.versions, query.asOf, includeHistorical),
      })),
    externalIdentifiers: snapshot.externalIdentifiers.filter(
      (identifier) =>
        (includeHistorical || isEffectiveAt(identifier, query.asOf)) &&
        ((identifier.entityKind === 'jurisdiction' &&
          selectedJurisdictionIds.has(identifier.entityId as JurisdictionId)) ||
          (identifier.entityKind === 'district' &&
            selectedDistrictIds.has(identifier.entityId as DistrictId)) ||
          (identifier.entityKind === 'public_body' &&
            selectedBodyIds.has(identifier.entityId as PublicBodyId)) ||
          (identifier.entityKind === 'office' &&
            selectedOfficeIds.has(identifier.entityId as OfficeId))),
    ),
    gaps: snapshot.gaps.filter(
      (gap) =>
        (includeHistorical || isEffectiveAt(gap, query.asOf)) &&
        ((gap.entityKind === 'jurisdiction' &&
          selectedJurisdictionIds.has(gap.entityId as JurisdictionId)) ||
          (gap.entityKind === 'district' && selectedDistrictIds.has(gap.entityId as DistrictId)) ||
          (gap.entityKind === 'public_body' && selectedBodyIds.has(gap.entityId as PublicBodyId)) ||
          (gap.entityKind === 'office' && selectedOfficeIds.has(gap.entityId as OfficeId))),
    ),
    jurisdictionRelationships,
    jurisdictions: jurisdictions.map((record) => ({
      ...record,
      versions: versionsForDate(record.versions, query.asOf, includeHistorical),
    })),
    offices: snapshot.offices
      .filter((record) => selectedOfficeIds.has(record.officeId))
      .map((record) => ({
        ...record,
        versions: versionsForDate(record.versions, query.asOf, includeHistorical).filter(
          (version) => selectedBodyIds.has(version.publicBodyId),
        ),
      })),
    page: { nextCursor: null },
    publicBodies: snapshot.publicBodies
      .filter((record) => selectedBodyIds.has(record.publicBodyId))
      .map((record) => ({
        ...record,
        versions: versionsForDate(record.versions, query.asOf, includeHistorical),
      })),
  });
}
