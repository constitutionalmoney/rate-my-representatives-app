import type { CountryCode, JurisdictionKind } from './jurisdiction-registry.js';

export type PreciseLocationInputKind = 'address' | 'postal_code';
export type RepresentationScope = 'federal' | 'local' | 'province_state' | 'regional' | 'special';
export type ResolutionState =
  'ambiguous' | 'conflicting' | 'provider_unavailable' | 'resolved' | 'stale' | 'unsupported';

export interface PreciseLocationInput {
  readonly kind: PreciseLocationInputKind;
  readonly value: string;
}

export interface NormalizedLocationQuery {
  readonly countryCode: CountryCode;
  readonly kind: PreciseLocationInputKind;
  readonly providerQuery: string;
}

export interface LocationNormalizer {
  normalize(countryCode: CountryCode, input: PreciseLocationInput): NormalizedLocationQuery;
}

export interface ProviderVersionMetadata {
  readonly geometry: {
    readonly effectiveFrom: string;
    readonly license: string;
    readonly sha256: string;
    readonly version: string;
  };
  readonly source: {
    readonly license: string;
    readonly observedAt: string;
    readonly providerId: string;
    readonly retention: 'none';
    readonly termsUrl: string | null;
    readonly version: string;
  };
}

export interface AuthoritativeIdentifier {
  readonly identifier: string;
  readonly issuer: string;
}

export interface ResolvedEntityReference {
  readonly applicationId: string;
  readonly authoritativeIdentifiers: readonly AuthoritativeIdentifier[];
  readonly label: string;
}

export interface ApplicableRepresentation {
  readonly candidacyIds: readonly string[];
  readonly district: ResolvedEntityReference | null;
  readonly jurisdiction: ResolvedEntityReference;
  readonly matchState: 'coverage_gap' | 'matched';
  readonly officeId: string | null;
  readonly officeTermId: string | null;
  readonly scope: RepresentationScope;
}

export interface ResolutionCandidate {
  readonly candidateId: string;
  readonly label: string;
}

export interface LocationLookupResolved {
  readonly matches: readonly ApplicableRepresentation[];
  readonly state: 'resolved';
}

export interface LocationLookupAmbiguous {
  readonly candidates: readonly Readonly<{
    candidateId: string;
    label: string;
    matches: readonly ApplicableRepresentation[];
  }>[];
  readonly state: 'ambiguous';
}

export interface LocationLookupNonResolved {
  readonly detailCode: string;
  readonly matches: readonly ApplicableRepresentation[];
  readonly state: Exclude<ResolutionState, 'ambiguous' | 'resolved'>;
}

export type LocationLookupResult =
  LocationLookupAmbiguous | LocationLookupNonResolved | LocationLookupResolved;

export interface JurisdictionLookupProvider {
  readonly countryCode: CountryCode;
  readonly metadata: ProviderVersionMetadata;
  readonly supportedScopes: readonly RepresentationScope[];
  lookup(query: NormalizedLocationQuery, asOf: string): Promise<LocationLookupResult>;
  metadataFor(asOf: string): ProviderVersionMetadata;
}

export interface RepresentationCapability {
  readonly coverage: {
    readonly gapCodes: readonly string[];
    readonly state: 'partial';
  };
  readonly countryCode: CountryCode;
  readonly dataMode: 'synthetic';
  readonly featureState: 'disabled' | 'operational';
  readonly input: {
    readonly autocomplete: 'postal-code' | 'street-address';
    readonly kind: PreciseLocationInputKind;
    readonly label: string;
    readonly maxLength: number;
    readonly retention: 'request_only';
  };
  readonly legalDeterminations: 'none';
  readonly provider: ProviderVersionMetadata;
  readonly schemaVersion: 'representation-capability.v1';
  readonly supportedScopes: readonly RepresentationScope[];
}

export interface RepresentationResolution {
  readonly ambiguity: {
    readonly expiresAt: string;
    readonly options: readonly ResolutionCandidate[];
    readonly selectionToken: string;
  } | null;
  readonly asOf: string;
  readonly countryCode: CountryCode;
  readonly dataMode: 'synthetic';
  readonly detailCode: string | null;
  readonly inputDisposition: {
    readonly disposedAt: string;
    readonly logged: false;
    readonly persisted: false;
    readonly queued: false;
    readonly sentToAi: false;
    readonly sentToVerus: false;
  };
  readonly legalDeterminations: {
    readonly citizenship: 'not_determined';
    readonly legalResidence: 'not_determined';
    readonly voterEligibility: 'not_determined';
  };
  readonly matches: readonly ApplicableRepresentation[];
  readonly provider: ProviderVersionMetadata;
  readonly resolutionId: string;
  readonly schemaVersion: 'representation-resolution.v1';
  readonly state: ResolutionState;
}

export interface AmbiguitySelectionCommand {
  readonly optionId: string;
  readonly selectionToken: string;
}

interface AmbiguityRecord {
  readonly asOf: string;
  readonly candidates: readonly Readonly<{
    candidateId: string;
    label: string;
    matches: readonly ApplicableRepresentation[];
  }>[];
  readonly countryCode: CountryCode;
  readonly expiresAt: string;
  readonly metadata: ProviderVersionMetadata;
}

const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const PRECISE_KEY_PATTERN =
  /address|coordinate|latitude|longitude|postal.?code|provider.?query|precise.?location/i;

function parseTimestamp(value: string, field: string): number {
  const parsed = Date.parse(value);
  if (!ISO_TIMESTAMP_PATTERN.test(value) || !Number.isFinite(parsed)) {
    throw new Error(`${field} must be an ISO-8601 timestamp.`);
  }
  return parsed;
}

function assertOpaqueId(value: string, field: string): void {
  if (!OPAQUE_ID_PATTERN.test(value)) throw new Error(`${field} must be an opaque identifier.`);
}

function assertMetadata(metadata: ProviderVersionMetadata): void {
  parseTimestamp(metadata.geometry.effectiveFrom, 'geometry.effectiveFrom');
  parseTimestamp(metadata.source.observedAt, 'source.observedAt');
  assertOpaqueId(metadata.source.providerId, 'source.providerId');
  if (!SHA256_PATTERN.test(metadata.geometry.sha256)) {
    throw new Error('geometry.sha256 must be a lowercase SHA-256 digest.');
  }
  if (metadata.source.retention !== 'none') {
    throw new Error('A location provider must not retain precise input.');
  }
}

export function assertApplicableRepresentation(
  matches: readonly ApplicableRepresentation[],
  supportedScopes: readonly RepresentationScope[],
): void {
  const seen = new Set<RepresentationScope>();
  for (const match of matches) {
    if (seen.has(match.scope)) throw new Error(`Duplicate representation scope: ${match.scope}.`);
    seen.add(match.scope);
    assertOpaqueId(match.jurisdiction.applicationId, 'jurisdiction.applicationId');
    if (match.district !== null) {
      assertOpaqueId(match.district.applicationId, 'district.applicationId');
    }
    if (match.officeId !== null) assertOpaqueId(match.officeId, 'officeId');
    if (match.officeTermId !== null) assertOpaqueId(match.officeTermId, 'officeTermId');
    match.candidacyIds.forEach((id) => assertOpaqueId(id, 'candidacyId'));
    if (
      match.matchState === 'matched' &&
      match.officeTermId === null &&
      match.candidacyIds.length === 0
    ) {
      throw new Error(`${match.scope} must identify an office term or candidacy when matched.`);
    }
  }
  for (const scope of supportedScopes) {
    if (!seen.has(scope)) throw new Error(`Missing applicable representation scope: ${scope}.`);
  }
}

export function assertJurisdictionLookupProvider(provider: JurisdictionLookupProvider): void {
  assertMetadata(provider.metadata);
  if (provider.supportedScopes.length === 0) throw new Error('A provider requires scopes.');
  if (new Set(provider.supportedScopes).size !== provider.supportedScopes.length) {
    throw new Error('Provider scopes must be unique.');
  }
}

export class LocationInputValidationError extends Error {
  readonly code = 'INVALID_PRECISE_LOCATION_INPUT';

  constructor() {
    super('The location input is invalid for the selected country and method.');
    this.name = 'LocationInputValidationError';
  }
}

export const PRIVACY_MINIMIZED_LOCATION_NORMALIZER: LocationNormalizer = Object.freeze({
  normalize(countryCode: CountryCode, input: PreciseLocationInput) {
    if (typeof input.value !== 'string' || input.value.length === 0 || input.value.length > 240) {
      throw new LocationInputValidationError();
    }
    if (/[\p{Cc}<>\u202a-\u202e\u2066-\u2069]/u.test(input.value)) {
      throw new LocationInputValidationError();
    }
    if (countryCode === 'CA') {
      if (input.kind !== 'postal_code') throw new LocationInputValidationError();
      const providerQuery = input.value.toUpperCase().trim().replace(/\s+/g, ' ');
      if (!/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(providerQuery)) {
        throw new LocationInputValidationError();
      }
      return Object.freeze({ countryCode, kind: input.kind, providerQuery });
    }
    if (input.kind !== 'address') throw new LocationInputValidationError();
    const providerQuery = input.value.trim().replace(/\s+/g, ' ');
    if (providerQuery.length < 8) throw new LocationInputValidationError();
    return Object.freeze({ countryCode, kind: input.kind, providerQuery });
  },
});

export class EphemeralAmbiguityStore {
  readonly #records = new Map<string, AmbiguityRecord>();

  constructor(private readonly maxRecords = 1_000) {
    if (!Number.isSafeInteger(maxRecords) || maxRecords < 1) {
      throw new Error('Ambiguity store capacity must be a positive safe integer.');
    }
  }

  put(token: string, record: AmbiguityRecord): void {
    assertOpaqueId(token, 'selectionToken');
    parseTimestamp(record.asOf, 'asOf');
    parseTimestamp(record.expiresAt, 'expiresAt');
    this.#records.delete(token);
    while (this.#records.size >= this.maxRecords) {
      const oldestToken = this.#records.keys().next().value as string | undefined;
      if (oldestToken === undefined) break;
      this.#records.delete(oldestToken);
    }
    this.#records.set(token, structuredClone(record));
  }

  take(token: string, now: string): AmbiguityRecord | null {
    parseTimestamp(now, 'now');
    const record = this.#records.get(token);
    this.#records.delete(token);
    if (!record || Date.parse(record.expiresAt) <= Date.parse(now)) return null;
    return structuredClone(record);
  }

  snapshot(): readonly Readonly<{
    optionIds: readonly string[];
    selectionToken: string;
  }>[] {
    return [...this.#records.entries()].map(([selectionToken, record]) => ({
      optionIds: record.candidates.map(({ candidateId }) => candidateId),
      selectionToken,
    }));
  }
}

function inputDisposition(disposedAt: string): RepresentationResolution['inputDisposition'] {
  return Object.freeze({
    disposedAt,
    logged: false,
    persisted: false,
    queued: false,
    sentToAi: false,
    sentToVerus: false,
  });
}

function resolutionBase(input: {
  asOf: string;
  countryCode: CountryCode;
  disposedAt: string;
  metadata: ProviderVersionMetadata;
  resolutionId: string;
}): Omit<RepresentationResolution, 'ambiguity' | 'detailCode' | 'matches' | 'state'> {
  return {
    asOf: input.asOf,
    countryCode: input.countryCode,
    dataMode: 'synthetic',
    inputDisposition: inputDisposition(input.disposedAt),
    legalDeterminations: {
      citizenship: 'not_determined',
      legalResidence: 'not_determined',
      voterEligibility: 'not_determined',
    },
    provider: input.metadata,
    resolutionId: input.resolutionId,
    schemaVersion: 'representation-resolution.v1',
  };
}

export async function resolveRepresentation(input: {
  readonly ambiguityStore: EphemeralAmbiguityStore;
  readonly asOf: string;
  readonly countryCode: CountryCode;
  readonly createId: () => string;
  readonly input: PreciseLocationInput;
  readonly normalizer: LocationNormalizer;
  readonly now: () => Date;
  readonly provider: JurisdictionLookupProvider;
}): Promise<RepresentationResolution> {
  parseTimestamp(input.asOf, 'asOf');
  assertJurisdictionLookupProvider(input.provider);
  if (input.provider.countryCode !== input.countryCode)
    throw new Error('Provider country mismatch.');
  const normalized = input.normalizer.normalize(input.countryCode, input.input);
  const lookup = await input.provider.lookup(normalized, input.asOf);
  const providerMetadata = input.provider.metadataFor(input.asOf);
  assertMetadata(providerMetadata);
  const disposedAt = input.now().toISOString();
  const resolutionId = input.createId();
  assertOpaqueId(resolutionId, 'resolutionId');
  const base = resolutionBase({
    asOf: input.asOf,
    countryCode: input.countryCode,
    disposedAt,
    metadata: providerMetadata,
    resolutionId,
  });
  if (lookup.state === 'ambiguous') {
    if (lookup.candidates.length < 2) throw new Error('Ambiguity requires at least two options.');
    const selectionToken = input.createId();
    const expiresAt = new Date(input.now().getTime() + 5 * 60_000).toISOString();
    input.ambiguityStore.put(selectionToken, {
      asOf: input.asOf,
      candidates: lookup.candidates,
      countryCode: input.countryCode,
      expiresAt,
      metadata: providerMetadata,
    });
    return Object.freeze({
      ...base,
      ambiguity: {
        expiresAt,
        options: lookup.candidates.map(({ candidateId, label }) => ({ candidateId, label })),
        selectionToken,
      },
      detailCode: 'MULTIPLE_BOUNDARY_MATCHES',
      matches: [],
      state: 'ambiguous',
    });
  }
  assertApplicableRepresentation(lookup.matches, input.provider.supportedScopes);
  return Object.freeze({
    ...base,
    ambiguity: null,
    detailCode: lookup.state === 'resolved' ? null : lookup.detailCode,
    matches: lookup.matches,
    state: lookup.state,
  });
}

export function selectRepresentationAmbiguity(input: {
  readonly ambiguityStore: EphemeralAmbiguityStore;
  readonly asOf: string;
  readonly command: AmbiguitySelectionCommand;
  readonly createId: () => string;
  readonly now: () => Date;
}): RepresentationResolution | null {
  parseTimestamp(input.asOf, 'asOf');
  assertOpaqueId(input.command.optionId, 'optionId');
  assertOpaqueId(input.command.selectionToken, 'selectionToken');
  const now = input.now().toISOString();
  const record = input.ambiguityStore.take(input.command.selectionToken, now);
  if (record?.asOf !== input.asOf) return null;
  const candidate = record?.candidates.find(
    ({ candidateId }) => candidateId === input.command.optionId,
  );
  if (!record || !candidate) return null;
  const resolutionId = input.createId();
  assertOpaqueId(resolutionId, 'resolutionId');
  return Object.freeze({
    ...resolutionBase({
      asOf: record.asOf,
      countryCode: record.countryCode,
      disposedAt: now,
      metadata: record.metadata,
      resolutionId,
    }),
    ambiguity: null,
    detailCode: null,
    matches: candidate.matches,
    state: 'resolved',
  });
}

export function assertNoPreciseLocationShape(value: unknown): void {
  const visit = (candidate: unknown): void => {
    if (Array.isArray(candidate)) {
      candidate.forEach(visit);
      return;
    }
    if (candidate === null || typeof candidate !== 'object') return;
    for (const [key, nested] of Object.entries(candidate)) {
      if (PRECISE_KEY_PATTERN.test(key)) {
        throw new Error(
          `Precise location field is forbidden outside the request boundary: ${key}.`,
        );
      }
      visit(nested);
    }
  };
  visit(value);
}

export type BroadJurisdictionKind = Extract<
  JurisdictionKind,
  'country' | 'province' | 'state' | 'territory'
>;

export interface SavedBroadJurisdiction {
  readonly countryCode: CountryCode;
  readonly createdAt: string;
  readonly jurisdictionId: string;
  readonly jurisdictionKind: BroadJurisdictionKind;
  readonly label: string;
  readonly preferenceId: string;
  readonly schemaVersion: 'saved-broad-jurisdiction.v1';
  readonly updatedAt: string;
}

export interface BroadJurisdictionSelection {
  readonly countryCode: CountryCode;
  readonly jurisdictionId: string;
  readonly jurisdictionKind: BroadJurisdictionKind;
  readonly label: string;
}

export function createSavedBroadJurisdiction(input: {
  readonly createId: () => string;
  readonly now: string;
  readonly selection: BroadJurisdictionSelection;
}): SavedBroadJurisdiction {
  parseTimestamp(input.now, 'now');
  assertOpaqueId(input.selection.jurisdictionId, 'jurisdictionId');
  const preferenceId = input.createId();
  assertOpaqueId(preferenceId, 'preferenceId');
  if (!['country', 'province', 'state', 'territory'].includes(input.selection.jurisdictionKind)) {
    throw new Error('Saved jurisdiction must be broad enough to prevent precise reconstruction.');
  }
  return Object.freeze({
    ...input.selection,
    createdAt: input.now,
    preferenceId,
    schemaVersion: 'saved-broad-jurisdiction.v1',
    updatedAt: input.now,
  });
}

export function updateSavedBroadJurisdiction(
  existing: SavedBroadJurisdiction,
  selection: BroadJurisdictionSelection,
  now: string,
): SavedBroadJurisdiction {
  const updated = createSavedBroadJurisdiction({
    createId: () => existing.preferenceId,
    now,
    selection,
  });
  return Object.freeze({ ...updated, createdAt: existing.createdAt });
}

export function createLocationOperationalEvent(input: {
  readonly countryCode: CountryCode;
  readonly event: 'ambiguity_selected' | 'capability_read' | 'preference_changed' | 'resolved';
  readonly outcome: ResolutionState | 'deleted' | 'saved' | 'updated';
  readonly providerId: string;
}): Readonly<Record<string, string>> {
  const event = Object.freeze({
    countryCode: input.countryCode,
    event: `location.${input.event}`,
    outcome: input.outcome,
    providerId: input.providerId,
  });
  assertNoPreciseLocationShape(event);
  return event;
}
