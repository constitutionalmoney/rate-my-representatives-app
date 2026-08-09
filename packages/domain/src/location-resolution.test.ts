import { describe, expect, it } from 'vitest';

import {
  EphemeralAmbiguityStore,
  LocationInputValidationError,
  PRIVACY_MINIMIZED_LOCATION_NORMALIZER,
  assertJurisdictionLookupProvider,
  assertNoPreciseLocationShape,
  createLocationOperationalEvent,
  createSavedBroadJurisdiction,
  resolveRepresentation,
  selectRepresentationAmbiguity,
} from './location-resolution.js';
import {
  SYNTHETIC_CA_LOCATION_PROVIDER,
  SYNTHETIC_US_LOCATION_PROVIDER,
  representationCapabilities,
} from './synthetic-location-providers.js';

const at = new Date('2026-06-01T12:00:00.000Z');

function ids() {
  let next = 0;
  return () => `resolution:synthetic:${++next}`;
}

async function resolveCa(value = 'A1A 1A1', asOf = at.toISOString()) {
  return resolveRepresentation({
    ambiguityStore: new EphemeralAmbiguityStore(),
    asOf,
    countryCode: 'CA',
    createId: ids(),
    input: { kind: 'postal_code', value },
    normalizer: PRIVACY_MINIMIZED_LOCATION_NORMALIZER,
    now: () => at,
    provider: SYNTHETIC_CA_LOCATION_PROVIDER,
  });
}

describe('privacy-minimized location providers', () => {
  it('publishes separate Canada and U.S. provider contracts with minimum input', () => {
    expect(() => assertJurisdictionLookupProvider(SYNTHETIC_CA_LOCATION_PROVIDER)).not.toThrow();
    expect(() => assertJurisdictionLookupProvider(SYNTHETIC_US_LOCATION_PROVIDER)).not.toThrow();
    expect(representationCapabilities(false)).toMatchObject([
      {
        countryCode: 'CA',
        featureState: 'disabled',
        input: { kind: 'postal_code', retention: 'request_only' },
        legalDeterminations: 'none',
      },
      {
        countryCode: 'US',
        featureState: 'disabled',
        input: { kind: 'address', retention: 'request_only' },
        legalDeterminations: 'none',
      },
    ]);
  });

  it('returns every supported scope and explicit office-term/candidacy coverage', async () => {
    const ca = await resolveCa();
    expect(ca.state).toBe('resolved');
    expect(ca.matches.map(({ scope }) => scope)).toEqual([
      'local',
      'regional',
      'province_state',
      'federal',
    ]);
    expect(ca.matches.find(({ scope }) => scope === 'regional')?.officeTermId).toBe(
      'term:ca:rowan:north-director:2026',
    );

    const us = await resolveRepresentation({
      ambiguityStore: new EphemeralAmbiguityStore(),
      asOf: at.toISOString(),
      countryCode: 'US',
      createId: ids(),
      input: { kind: 'address', value: '100 Civic Test Way, Example City, EX 00001' },
      normalizer: PRIVACY_MINIMIZED_LOCATION_NORMALIZER,
      now: () => at,
      provider: SYNTHETIC_US_LOCATION_PROVIDER,
    });
    expect(us.matches.map(({ scope }) => scope)).toEqual([
      'local',
      'regional',
      'province_state',
      'federal',
      'special',
    ]);
    expect(us.matches.find(({ scope }) => scope === 'province_state')?.candidacyIds).toEqual([
      'candidacy:us:morgan-fields:state-2026',
    ]);
  });

  it('reproduces effective-date and redistricting results with geometry versions', async () => {
    const historical = await resolveCa('A1A 1A1', '2025-06-01T00:00:00.000Z');
    const current = await resolveCa();
    expect(historical.matches.find(({ scope }) => scope === 'federal')?.district).toMatchObject({
      applicationId: 'district:ca:maple-federal-old',
      label: 'Maple Federal District 2015',
    });
    expect(current.matches.find(({ scope }) => scope === 'federal')?.district).toMatchObject({
      applicationId: 'district:ca:maple-federal-new',
      label: 'Maple Federal District 2026',
    });
    expect(historical.provider.geometry.version).not.toBe(current.provider.geometry.version);
    expect(historical.provider.geometry.sha256).not.toBe(current.provider.geometry.sha256);
  });

  it.each([
    ['A1A 3A3', 'conflicting', 'SOURCE_GEOMETRY_CONFLICT'],
    ['A1A 4A4', 'stale', 'GEOMETRY_VERSION_STALE'],
    ['A1A 5A5', 'provider_unavailable', 'PROVIDER_TEMPORARILY_UNAVAILABLE'],
    ['Z9Z 9Z9', 'unsupported', 'AREA_NOT_SUPPORTED'],
  ] as const)('returns explicit %s outcomes', async (value, state, detailCode) => {
    await expect(resolveCa(value)).resolves.toMatchObject({ detailCode, state });
  });

  it('continues ambiguity using a one-time token that contains no precise input', async () => {
    const store = new EphemeralAmbiguityStore();
    const createId = ids();
    const rawInput = 'A1A 2A2';
    const ambiguous = await resolveRepresentation({
      ambiguityStore: store,
      asOf: at.toISOString(),
      countryCode: 'CA',
      createId,
      input: { kind: 'postal_code', value: rawInput },
      normalizer: PRIVACY_MINIMIZED_LOCATION_NORMALIZER,
      now: () => at,
      provider: SYNTHETIC_CA_LOCATION_PROVIDER,
    });
    expect(ambiguous.state).toBe('ambiguous');
    expect(JSON.stringify(ambiguous)).not.toContain(rawInput);
    expect(JSON.stringify(store.snapshot())).not.toContain(rawInput);
    assertNoPreciseLocationShape(ambiguous);

    const selected = selectRepresentationAmbiguity({
      ambiguityStore: store,
      asOf: at.toISOString(),
      command: {
        optionId: ambiguous.ambiguity?.options[0]?.candidateId ?? '',
        selectionToken: ambiguous.ambiguity?.selectionToken ?? '',
      },
      createId,
      now: () => at,
    });
    expect(selected).toMatchObject({ state: 'resolved' });
    expect(
      selectRepresentationAmbiguity({
        ambiguityStore: store,
        asOf: at.toISOString(),
        command: {
          optionId: ambiguous.ambiguity?.options[0]?.candidateId ?? '',
          selectionToken: ambiguous.ambiguity?.selectionToken ?? '',
        },
        createId,
        now: () => at,
      }),
    ).toBeNull();
  });

  it('binds ambiguity to its effective date and bounds pending public options', async () => {
    const mismatchedStore = new EphemeralAmbiguityStore();
    const createId = ids();
    const ambiguous = await resolveRepresentation({
      ambiguityStore: mismatchedStore,
      asOf: at.toISOString(),
      countryCode: 'CA',
      createId,
      input: { kind: 'postal_code', value: 'A1A 2A2' },
      normalizer: PRIVACY_MINIMIZED_LOCATION_NORMALIZER,
      now: () => at,
      provider: SYNTHETIC_CA_LOCATION_PROVIDER,
    });
    expect(
      selectRepresentationAmbiguity({
        ambiguityStore: mismatchedStore,
        asOf: '2025-01-01T00:00:00.000Z',
        command: {
          optionId: ambiguous.ambiguity?.options[0]?.candidateId ?? '',
          selectionToken: ambiguous.ambiguity?.selectionToken ?? '',
        },
        createId,
        now: () => at,
      }),
    ).toBeNull();

    const boundedStore = new EphemeralAmbiguityStore(1);
    const record = {
      asOf: at.toISOString(),
      candidates: [{ candidateId: 'candidate:public', label: 'Public option', matches: [] }],
      countryCode: 'CA' as const,
      expiresAt: '2026-08-09T19:05:00.000Z',
      metadata: SYNTHETIC_CA_LOCATION_PROVIDER.metadata,
    };
    boundedStore.put('token:first', record);
    boundedStore.put('token:second', record);
    expect(boundedStore.snapshot()).toEqual([
      { optionIds: ['candidate:public'], selectionToken: 'token:second' },
    ]);
  });

  it('rejects malicious inputs without copying them into errors or operational events', async () => {
    const malicious = '<script>synthetic-location-probe</script>\n';
    let error: unknown;
    try {
      await resolveRepresentation({
        ambiguityStore: new EphemeralAmbiguityStore(),
        asOf: at.toISOString(),
        countryCode: 'US',
        createId: ids(),
        input: { kind: 'address', value: malicious },
        normalizer: PRIVACY_MINIMIZED_LOCATION_NORMALIZER,
        now: () => at,
        provider: SYNTHETIC_US_LOCATION_PROVIDER,
      });
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(LocationInputValidationError);
    expect(String(error)).not.toContain(malicious);
    const event = createLocationOperationalEvent({
      countryCode: 'US',
      event: 'resolved',
      outcome: 'provider_unavailable',
      providerId: SYNTHETIC_US_LOCATION_PROVIDER.metadata.source.providerId,
    });
    expect(JSON.stringify(event)).not.toContain(malicious);
    assertNoPreciseLocationShape(event);
  });
});

describe('saved broad jurisdiction', () => {
  it('stores only a broad region that cannot reconstruct a submission', () => {
    const saved = createSavedBroadJurisdiction({
      createId: () => 'preference:synthetic:1',
      now: at.toISOString(),
      selection: {
        countryCode: 'CA',
        jurisdictionId: 'jurisdiction:ca:maple',
        jurisdictionKind: 'province',
        label: 'Maple Province',
      },
    });
    expect(saved).not.toHaveProperty('address');
    expect(saved).not.toHaveProperty('districtId');
    expect(saved).not.toHaveProperty('resolutionId');
    assertNoPreciseLocationShape(saved);
  });

  it('rejects municipality-level preferences even at a malformed trust boundary', () => {
    expect(() =>
      createSavedBroadJurisdiction({
        createId: () => 'preference:synthetic:2',
        now: at.toISOString(),
        selection: {
          countryCode: 'CA',
          jurisdictionId: 'jurisdiction:ca:harbour',
          jurisdictionKind: 'municipality' as 'province',
          label: 'Harbour City',
        },
      }),
    ).toThrow(/broad enough/);
  });
});
