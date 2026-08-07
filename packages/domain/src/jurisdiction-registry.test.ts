import { describe, expect, it } from 'vitest';

import {
  assertJurisdictionRegistry,
  queryJurisdictionRegistry,
  type JurisdictionId,
  type JurisdictionRegistrySnapshot,
} from './jurisdiction-registry.js';
import { SYNTHETIC_JURISDICTION_REGISTRY } from './synthetic-jurisdiction-registry.js';

const CURRENT = '2026-08-06T12:00:00.000Z';

describe('nested jurisdiction registry', () => {
  it('validates materially different Canada and U.S. synthetic graphs with Verus absent', () => {
    expect(() => assertJurisdictionRegistry(SYNTHETIC_JURISDICTION_REGISTRY)).not.toThrow();
    const serialized = JSON.stringify(SYNTHETIC_JURISDICTION_REGISTRY);
    expect(serialized).not.toMatch(/verus|treasury|reserve|currency|sub-?id/i);

    const caKinds = SYNTHETIC_JURISDICTION_REGISTRY.jurisdictions
      .filter((record) => record.countryCode === 'CA')
      .flatMap((record) => record.versions.map((version) => version.kind));
    const usKinds = SYNTHETIC_JURISDICTION_REGISTRY.jurisdictions
      .filter((record) => record.countryCode === 'US')
      .flatMap((record) => record.versions.map((version) => version.kind));
    expect(caKinds).toContain('regional_district');
    expect(usKinds).toEqual(
      expect.arrayContaining(['county', 'special_district', 'unincorporated_area']),
    );
  });

  it('supports multiple effective parents and overlapping special districts', () => {
    const parents = SYNTHETIC_JURISDICTION_REGISTRY.jurisdictionRelationships.filter(
      (relationship) =>
        relationship.subjectJurisdictionId === 'jurisdiction:us:example-city' &&
        relationship.kind === 'contained_by',
    );
    expect(parents.map((relationship) => relationship.objectJurisdictionId).sort()).toEqual([
      'jurisdiction:us:example-county',
      'jurisdiction:us:example-state',
    ]);
    expect(
      SYNTHETIC_JURISDICTION_REGISTRY.jurisdictionRelationships.filter(
        (relationship) =>
          relationship.subjectJurisdictionId === 'jurisdiction:us:water' &&
          relationship.kind === 'overlaps',
      ),
    ).toHaveLength(2);
  });

  it('preserves stable IDs through rename and external-identifier changes', () => {
    const historical = queryJurisdictionRegistry(SYNTHETIC_JURISDICTION_REGISTRY, {
      asOf: '2025-06-01T00:00:00.000Z',
      countryCode: 'CA',
      includeHistorical: false,
    });
    const current = queryJurisdictionRegistry(SYNTHETIC_JURISDICTION_REGISTRY, {
      asOf: CURRENT,
      countryCode: 'CA',
      includeHistorical: false,
    });
    const historicalHarbour = historical.jurisdictions.find(
      (record) => record.jurisdictionId === 'jurisdiction:ca:harbour',
    );
    const currentHarbour = current.jurisdictions.find(
      (record) => record.jurisdictionId === 'jurisdiction:ca:harbour',
    );
    expect(historicalHarbour?.versions[0]?.name).toBe('Harbour Village');
    expect(currentHarbour?.versions[0]?.name).toBe('Harbour City');
    expect(currentHarbour?.jurisdictionId).toBe(historicalHarbour?.jurisdictionId);
    expect(
      current.externalIdentifiers.find(
        (identifier) => identifier.entityId === 'jurisdiction:ca:harbour',
      )?.identifier,
    ).toBe('HARBOUR-CITY-019');
  });

  it('models redistricting, amalgamation, appointment, vacancy, abolition, and historical dates explicitly', () => {
    const history = queryJurisdictionRegistry(SYNTHETIC_JURISDICTION_REGISTRY, {
      asOf: CURRENT,
      countryCode: 'CA',
      includeHistorical: true,
    });
    expect(history.districtLineage).toContainEqual(
      expect.objectContaining({
        districtId: 'district:ca:maple-federal-new',
        kind: 'redistricted_from',
        predecessorDistrictId: 'district:ca:maple-federal-old',
      }),
    );
    expect(history.jurisdictionRelationships).toContainEqual(
      expect.objectContaining({
        kind: 'successor_of',
        objectJurisdictionId: 'jurisdiction:ca:old-bay',
        subjectJurisdictionId: 'jurisdiction:ca:new-bay',
      }),
    );
    expect(
      history.offices.find((record) => record.officeId === 'office:ca:north-director')?.versions[0]
        ?.selectionMethod,
    ).toBe('appointed');

    const future = queryJurisdictionRegistry(SYNTHETIC_JURISDICTION_REGISTRY, {
      asOf: '2027-06-01T00:00:00.000Z',
      countryCode: 'CA',
    });
    expect(
      future.offices.find((record) => record.officeId === 'office:ca:harbour-mayor')?.versions[0]
        ?.operationalState,
    ).toBe('vacant');

    const currentUs = queryJurisdictionRegistry(SYNTHETIC_JURISDICTION_REGISTRY, {
      asOf: CURRENT,
      countryCode: 'US',
    });
    expect(
      currentUs.offices.find((record) => record.officeId === 'office:us:former-commissioner')
        ?.versions[0]?.operationalState,
    ).toBe('abolished');
  });

  it('publishes gaps/conflicts and defers location, person, term, and candidacy work', () => {
    const result = queryJurisdictionRegistry(SYNTHETIC_JURISDICTION_REGISTRY, {
      asOf: CURRENT,
      countryCode: 'US',
      jurisdictionId: 'jurisdiction:us:water' as JurisdictionId,
    });
    expect(result.gaps).toContainEqual(
      expect.objectContaining({ code: 'BOUNDARY_REVIEW_REQUIRED' }),
    );
    expect(result.jurisdictionRelationships).toContainEqual(
      expect.objectContaining({
        attribution: expect.objectContaining({ conflict: 'conflicting' }),
      }),
    );
    expect(result.deferredFamilies).toEqual([
      'people',
      'office_terms',
      'candidacies',
      'source_ingestion',
      'location_resolution',
    ]);
    expect(JSON.stringify(result)).not.toMatch(
      /personId|officeTermId|candidacyId|preciseLocation/i,
    );
  });

  it('rejects version overlap, unknown references, and containment cycles', () => {
    const overlap = structuredClone(
      SYNTHETIC_JURISDICTION_REGISTRY,
    ) as JurisdictionRegistrySnapshot;
    const first = overlap.jurisdictions[0];
    if (!first) throw new Error('Synthetic fixture is empty.');
    const firstVersion = first.versions[0];
    if (!firstVersion) throw new Error('Synthetic jurisdiction version is empty.');
    (first.versions as Array<(typeof first.versions)[number]>).push({
      ...firstVersion,
      versionId: 'jv:ca:overlap',
    });
    expect(() => assertJurisdictionRegistry(overlap)).toThrow('overlapping');

    const unknown = structuredClone(
      SYNTHETIC_JURISDICTION_REGISTRY,
    ) as JurisdictionRegistrySnapshot;
    const unknownRelationship = unknown.jurisdictionRelationships[0];
    if (!unknownRelationship) throw new Error('Synthetic relationship fixture is empty.');
    (
      unknown.jurisdictionRelationships as Array<(typeof unknown.jurisdictionRelationships)[number]>
    )[0] = {
      ...unknownRelationship,
      objectJurisdictionId: 'jurisdiction:unknown' as JurisdictionId,
    };
    expect(() => assertJurisdictionRegistry(unknown)).toThrow('unknown jurisdiction');

    const crossCountry = structuredClone(
      SYNTHETIC_JURISDICTION_REGISTRY,
    ) as JurisdictionRegistrySnapshot;
    const crossCountryRelationship = crossCountry.jurisdictionRelationships[0];
    if (!crossCountryRelationship) throw new Error('Synthetic relationship fixture is empty.');
    (
      crossCountry.jurisdictionRelationships as Array<
        (typeof crossCountry.jurisdictionRelationships)[number]
      >
    )[0] = {
      ...crossCountryRelationship,
      objectJurisdictionId: 'jurisdiction:us' as JurisdictionId,
    };
    expect(() => assertJurisdictionRegistry(crossCountry)).toThrow('country boundary');

    const cycle = structuredClone(SYNTHETIC_JURISDICTION_REGISTRY) as JurisdictionRegistrySnapshot;
    const firstRelationship = cycle.jurisdictionRelationships[0];
    if (!firstRelationship) throw new Error('Synthetic relationship fixture is empty.');
    (
      cycle.jurisdictionRelationships as Array<(typeof cycle.jurisdictionRelationships)[number]>
    ).push({
      ...firstRelationship,
      relationshipId: 'jr:ca:cycle',
      subjectJurisdictionId: 'jurisdiction:ca' as JurisdictionId,
      objectJurisdictionId: 'jurisdiction:ca:maple' as JurisdictionId,
    });
    expect(() => assertJurisdictionRegistry(cycle)).toThrow('cycle');
  });
});
