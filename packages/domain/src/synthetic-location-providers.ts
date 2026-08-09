import type { CountryCode } from './jurisdiction-registry.js';
import type {
  ApplicableRepresentation,
  JurisdictionLookupProvider,
  LocationLookupResult,
  NormalizedLocationQuery,
  ProviderVersionMetadata,
  RepresentationCapability,
  RepresentationScope,
} from './location-resolution.js';

const CA_SCOPES = ['local', 'regional', 'province_state', 'federal'] as const;
const US_SCOPES = ['local', 'regional', 'province_state', 'federal', 'special'] as const;

function entity(applicationId: string, label: string, issuer: string, identifier: string) {
  return Object.freeze({
    applicationId,
    authoritativeIdentifiers: [{ identifier, issuer }],
    label,
  });
}

const CA_MATCHES: readonly ApplicableRepresentation[] = Object.freeze([
  {
    candidacyIds: [],
    district: null,
    jurisdiction: entity(
      'jurisdiction:ca:harbour',
      'Harbour City',
      'synthetic-ca-municipal-registry',
      'HARBOUR-CITY-002',
    ),
    matchState: 'coverage_gap',
    officeId: 'office:ca:harbour-mayor',
    officeTermId: null,
    scope: 'local',
  },
  {
    candidacyIds: [],
    district: null,
    jurisdiction: entity(
      'jurisdiction:ca:north-region',
      'North Regional District',
      'synthetic-ca-regional-registry',
      'NORTH-REGION-001',
    ),
    matchState: 'matched',
    officeId: 'office:ca:north-director',
    officeTermId: 'term:ca:rowan:north-director:2026',
    scope: 'regional',
  },
  {
    candidacyIds: [],
    district: entity(
      'district:ca:maple-provincial',
      'Harbour Coast Provincial District',
      'synthetic-ca-election-boundaries',
      'CA-MAPLE-PROV-2026',
    ),
    jurisdiction: entity(
      'jurisdiction:ca:maple',
      'Maple Province',
      'synthetic-ca-provincial-registry',
      'CA-MAPLE',
    ),
    matchState: 'matched',
    officeId: 'office:ca:maple-member',
    officeTermId: 'term:ca:avery:maple-member:2026',
    scope: 'province_state',
  },
  {
    candidacyIds: [],
    district: entity(
      'district:ca:maple-federal-new',
      'Maple Federal District 2026',
      'synthetic-ca-federal-boundaries',
      'CA-FED-MAPLE-2026',
    ),
    jurisdiction: entity(
      'jurisdiction:ca',
      'Canada synthetic fixture',
      'synthetic-ca-country-registry',
      'CA',
    ),
    matchState: 'coverage_gap',
    officeId: null,
    officeTermId: null,
    scope: 'federal',
  },
]);

const US_MATCHES: readonly ApplicableRepresentation[] = Object.freeze([
  {
    candidacyIds: [],
    district: entity(
      'district:us:city-ward',
      'Example City Ward',
      'synthetic-us-local-boundaries',
      'US-EX-CITY-WARD',
    ),
    jurisdiction: entity(
      'jurisdiction:us:example-city',
      'Example City',
      'synthetic-us-local-registry',
      'US-EX-CITY',
    ),
    matchState: 'coverage_gap',
    officeId: null,
    officeTermId: null,
    scope: 'local',
  },
  {
    candidacyIds: [],
    district: null,
    jurisdiction: entity(
      'jurisdiction:us:example-county',
      'Example County',
      'synthetic-us-county-registry',
      'US-EX-COUNTY',
    ),
    matchState: 'coverage_gap',
    officeId: 'office:us:county-commissioner',
    officeTermId: null,
    scope: 'regional',
  },
  {
    candidacyIds: ['candidacy:us:morgan-fields:state-2026'],
    district: entity(
      'district:us:state-senate',
      'Example State Senate District',
      'synthetic-us-state-boundaries',
      'US-EX-SENATE',
    ),
    jurisdiction: entity(
      'jurisdiction:us:example-state',
      'Example State',
      'synthetic-us-state-registry',
      'US-EX',
    ),
    matchState: 'matched',
    officeId: 'office:us:state-senator',
    officeTermId: null,
    scope: 'province_state',
  },
  {
    candidacyIds: [],
    district: entity(
      'district:us:congressional',
      'Example Congressional District',
      'synthetic-us-federal-boundaries',
      'US-EX-CONGRESS',
    ),
    jurisdiction: entity(
      'jurisdiction:us',
      'United States synthetic fixture',
      'synthetic-us-country-registry',
      'US',
    ),
    matchState: 'coverage_gap',
    officeId: null,
    officeTermId: null,
    scope: 'federal',
  },
  {
    candidacyIds: [],
    district: entity(
      'district:us:water',
      'Example Water Service District',
      'synthetic-us-special-boundaries',
      'US-EX-WATER',
    ),
    jurisdiction: entity(
      'jurisdiction:us:water',
      'Example Water District',
      'synthetic-us-special-registry',
      'US-EX-WATER',
    ),
    matchState: 'matched',
    officeId: 'office:us:water-director',
    officeTermId: 'term:us:morgan:water-director:2026',
    scope: 'special',
  },
]);

function metadata(countryCode: CountryCode, historical = false): ProviderVersionMetadata {
  return Object.freeze({
    geometry: {
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      license: 'CC0-1.0 synthetic fixture',
      sha256:
        countryCode === 'CA' && historical
          ? 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
          : 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      version: `synthetic-${countryCode.toLowerCase()}-geometry-${historical ? '2020.1' : '2026.1'}`,
    },
    source: {
      license: 'CC0-1.0 synthetic fixture',
      observedAt: '2026-06-01T00:00:00.000Z',
      providerId: `provider:synthetic:${countryCode.toLowerCase()}`,
      retention: 'none' as const,
      termsUrl: null,
      version: `synthetic-${countryCode.toLowerCase()}-lookup-1.0.0`,
    },
  });
}

function matchesFor(countryCode: CountryCode, asOf: string): readonly ApplicableRepresentation[] {
  if (countryCode !== 'CA' || Date.parse(asOf) >= Date.parse('2026-01-01T00:00:00.000Z')) {
    return countryCode === 'CA' ? CA_MATCHES : US_MATCHES;
  }
  return CA_MATCHES.map((match) => {
    if (match.scope === 'province_state' && match.district !== null) {
      return {
        ...match,
        district: entity(
          'district:ca:maple-provincial',
          'Harbour Provincial District',
          'synthetic-ca-election-boundaries',
          'CA-MAPLE-PROV-2020',
        ),
        matchState: 'coverage_gap' as const,
        officeTermId: null,
      };
    }
    if (match.scope === 'federal') {
      return {
        ...match,
        district: entity(
          'district:ca:maple-federal-old',
          'Maple Federal District 2015',
          'synthetic-ca-federal-boundaries',
          'CA-FED-MAPLE-2015',
        ),
      };
    }
    return match;
  });
}

function outcomeFor(
  countryCode: CountryCode,
  query: NormalizedLocationQuery,
  asOf: string,
): LocationLookupResult {
  const matches = matchesFor(countryCode, asOf);
  const marker =
    countryCode === 'CA'
      ? query.providerQuery
      : (/\b(0000[1-5])\b/.exec(query.providerQuery)?.[1] ?? 'unsupported');
  if (marker === (countryCode === 'CA' ? 'A1A 1A1' : '00001')) {
    return { matches, state: 'resolved' };
  }
  if (marker === (countryCode === 'CA' ? 'A1A 2A2' : '00002')) {
    return {
      candidates: [
        {
          candidateId: `candidate:${countryCode.toLowerCase()}:primary`,
          label: 'Primary synthetic boundary match',
          matches,
        },
        {
          candidateId: `candidate:${countryCode.toLowerCase()}:alternate`,
          label: 'Alternate synthetic boundary match',
          matches: matches.map((match) =>
            match.scope === 'local' ? { ...match, matchState: 'coverage_gap' as const } : match,
          ),
        },
      ],
      state: 'ambiguous',
    };
  }
  if (marker === (countryCode === 'CA' ? 'A1A 3A3' : '00003')) {
    return { detailCode: 'SOURCE_GEOMETRY_CONFLICT', matches, state: 'conflicting' };
  }
  if (marker === (countryCode === 'CA' ? 'A1A 4A4' : '00004')) {
    return { detailCode: 'GEOMETRY_VERSION_STALE', matches, state: 'stale' };
  }
  if (marker === (countryCode === 'CA' ? 'A1A 5A5' : '00005')) {
    return {
      detailCode: 'PROVIDER_TEMPORARILY_UNAVAILABLE',
      matches,
      state: 'provider_unavailable',
    };
  }
  return { detailCode: 'AREA_NOT_SUPPORTED', matches, state: 'unsupported' };
}

function provider(
  countryCode: CountryCode,
  supportedScopes: readonly RepresentationScope[],
): JurisdictionLookupProvider {
  return Object.freeze({
    countryCode,
    metadata: metadata(countryCode),
    supportedScopes,
    async lookup(query: NormalizedLocationQuery, asOf: string): Promise<LocationLookupResult> {
      if (query.countryCode !== countryCode)
        throw new Error('Synthetic provider country mismatch.');
      return outcomeFor(countryCode, query, asOf);
    },
    metadataFor(asOf: string): ProviderVersionMetadata {
      return metadata(
        countryCode,
        countryCode === 'CA' && Date.parse(asOf) < Date.parse('2026-01-01T00:00:00.000Z'),
      );
    },
  });
}

export const SYNTHETIC_CA_LOCATION_PROVIDER = provider('CA', CA_SCOPES);
export const SYNTHETIC_US_LOCATION_PROVIDER = provider('US', US_SCOPES);

export const SYNTHETIC_LOCATION_PROVIDERS: Readonly<
  Record<CountryCode, JurisdictionLookupProvider>
> = Object.freeze({
  CA: SYNTHETIC_CA_LOCATION_PROVIDER,
  US: SYNTHETIC_US_LOCATION_PROVIDER,
});

export function representationCapabilities(
  featureEnabled: boolean,
): readonly RepresentationCapability[] {
  return (['CA', 'US'] as const).map((countryCode) => {
    const provider = SYNTHETIC_LOCATION_PROVIDERS[countryCode];
    return Object.freeze({
      coverage: {
        gapCodes:
          countryCode === 'CA'
            ? ['FEDERAL_OFFICE_TERM_GAP', 'LOCAL_OFFICE_TERM_GAP']
            : ['FEDERAL_OFFICE_TERM_GAP', 'LOCAL_OFFICE_TERM_GAP', 'REGIONAL_OFFICE_TERM_GAP'],
        state: 'partial' as const,
      },
      countryCode,
      dataMode: 'synthetic',
      featureState: featureEnabled ? 'operational' : 'disabled',
      input:
        countryCode === 'CA'
          ? {
              autocomplete: 'postal-code' as const,
              kind: 'postal_code' as const,
              label: 'Synthetic postal code',
              maxLength: 7,
              retention: 'request_only' as const,
            }
          : {
              autocomplete: 'street-address' as const,
              kind: 'address' as const,
              label: 'Synthetic street address',
              maxLength: 240,
              retention: 'request_only' as const,
            },
      legalDeterminations: 'none',
      provider: provider.metadata,
      schemaVersion: 'representation-capability.v1',
      supportedScopes: provider.supportedScopes,
    });
  });
}
