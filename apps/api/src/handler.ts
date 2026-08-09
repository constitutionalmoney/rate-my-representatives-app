import {
  parseApiError,
  parseJurisdictionRegistry,
  parsePublicRoleProfile,
  parsePublicRoleProfileAppeals,
  parsePublicRoleProfileCorrections,
  parsePublicRoleProfileCoverage,
  parsePublicRoleProfileDisputes,
  parsePublicRoleProfileList,
  parsePublicRoleProfileResponses,
  parsePublicRoleProfileSources,
  parsePublicRoleProfileTimeline,
  parsePublicRoleRegistry,
  parseRepresentationAmbiguitySelection,
  parseRepresentationCapabilities,
  parseRepresentationResolution,
  parseRepresentationResolutionRequest,
  parseSavedBroadJurisdiction,
  type ApiError,
  type SavedBroadJurisdiction,
} from '@rmr/contracts';
import {
  EphemeralAmbiguityStore,
  LocationInputValidationError,
  PRIVACY_MINIMIZED_LOCATION_NORMALIZER,
  SYNTHETIC_LOCATION_PROVIDERS,
  createSavedBroadJurisdiction,
  queryPublicRoleRegistry,
  queryJurisdictionRegistry,
  listPublicProfiles,
  readPublicProfile,
  readPublicProfileTimeline,
  SYNTHETIC_JURISDICTION_REGISTRY,
  SYNTHETIC_PUBLIC_ROLE_REGISTRY,
  representationCapabilities,
  resolveRepresentation,
  selectRepresentationAmbiguity,
  updateSavedBroadJurisdiction,
  type BroadJurisdictionSelection,
  type CandidacyId,
  type CountryCode,
  type ElectionId,
  type JurisdictionId,
  type OfficeTermId,
  type PersonId,
  type PublicRoleRegistryQuery,
  type PublicProfileContextKind,
  type PublicProfileTimelineKind,
  type RegistryQuery,
} from '@rmr/domain';

import { foundationHealth, mobileCompatibility } from './health.js';

const CORRELATION_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const REGISTRY_PARAMETERS = new Set(['asOf', 'countryCode', 'jurisdictionId', 'includeHistorical']);
const PUBLIC_ROLE_ROUTES = Object.freeze({
  '/api/v1/people': { parameter: 'personId', selection: 'person' },
  '/api/v1/office-terms': { parameter: 'officeTermId', selection: 'office_term' },
  '/api/v1/elections': { parameter: 'electionId', selection: 'election' },
  '/api/v1/candidacies': { parameter: 'candidacyId', selection: 'candidacy' },
} as const);
const PUBLIC_PROFILE_LIST_PARAMETERS = new Set(['countryCode', 'contextKind']);
const PUBLIC_PROFILE_TIMELINE_PARAMETERS = new Set(['cursor', 'kind', 'limit']);
const PUBLIC_PROFILE_PATH =
  /^\/api\/v1\/profiles\/([^/]+)(?:\/(timeline|sources|coverage|responses|disputes|corrections|appeals))?$/;
const PUBLIC_PROFILE_CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=300';
const TIMELINE_KINDS = new Set<PublicProfileTimelineKind>([
  'office_term_transition',
  'candidacy_transition',
  'source_refresh',
  'correction',
  'response',
  'dispute',
  'appeal',
]);
const BROAD_PREFERENCE_PATH = /^\/api\/v1\/account\/broad-jurisdiction\/([^/]+)$/;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const MAX_LOCATION_BODY_BYTES = 1024;
const DEFAULT_AMBIGUITY_STORE = new EphemeralAmbiguityStore();

const BROAD_JURISDICTIONS: Readonly<Record<string, BroadJurisdictionSelection>> = Object.freeze({
  'jurisdiction:ca': {
    countryCode: 'CA',
    jurisdictionId: 'jurisdiction:ca',
    jurisdictionKind: 'country',
    label: 'Canada synthetic fixture',
  },
  'jurisdiction:ca:maple': {
    countryCode: 'CA',
    jurisdictionId: 'jurisdiction:ca:maple',
    jurisdictionKind: 'province',
    label: 'Maple Province',
  },
  'jurisdiction:us': {
    countryCode: 'US',
    jurisdictionId: 'jurisdiction:us',
    jurisdictionKind: 'country',
    label: 'United States synthetic fixture',
  },
  'jurisdiction:us:example-state': {
    countryCode: 'US',
    jurisdictionId: 'jurisdiction:us:example-state',
    jurisdictionKind: 'state',
    label: 'Example State',
  },
});

export interface BroadJurisdictionPreferencePort {
  delete(accountId: string, preferenceId: string, idempotencyKey: string): Promise<boolean>;
  put(
    accountId: string,
    preference: SavedBroadJurisdiction,
    idempotencyKey: string,
  ): Promise<SavedBroadJurisdiction>;
  read(accountId: string): Promise<SavedBroadJurisdiction | null>;
}

export interface HandlerContext {
  readonly accountDataAccessEnabled?: boolean;
  readonly accountId?: string | null;
  readonly ambiguityStore?: EphemeralAmbiguityStore;
  readonly createId?: () => string;
  readonly locationResolutionEnabled?: boolean;
  readonly now?: () => Date;
  readonly preferences?: BroadJurisdictionPreferencePort;
}

function handlerContext(
  context: HandlerContext,
): Required<
  Pick<
    HandlerContext,
    | 'accountDataAccessEnabled'
    | 'accountId'
    | 'ambiguityStore'
    | 'createId'
    | 'locationResolutionEnabled'
    | 'now'
  >
> &
  Pick<HandlerContext, 'preferences'> {
  return {
    accountDataAccessEnabled: context.accountDataAccessEnabled === true,
    accountId: context.accountId ?? null,
    ambiguityStore: context.ambiguityStore ?? DEFAULT_AMBIGUITY_STORE,
    createId: context.createId ?? (() => `resolution:${crypto.randomUUID()}`),
    locationResolutionEnabled: context.locationResolutionEnabled === true,
    now: context.now ?? (() => new Date()),
    ...(context.preferences ? { preferences: context.preferences } : {}),
  };
}

function correlationId(request: Request): string {
  const candidate = request.headers.get('x-correlation-id');
  return candidate && CORRELATION_ID_PATTERN.test(candidate) ? candidate : crypto.randomUUID();
}

function errorResponse(
  request: Request,
  status: number,
  error: Omit<ApiError, 'correlationId' | 'schemaVersion'>,
): Response {
  const body = parseApiError(
    { ...error, correlationId: correlationId(request), schemaVersion: 'api-error.v1' },
    'server',
  );
  return Response.json(body, {
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/problem+json',
      'x-correlation-id': body.correlationId,
    },
    status,
  });
}

export function requestBodyTooLarge(request: Request): Response {
  return errorResponse(request, 413, {
    code: 'VALIDATION_ERROR',
    dependencyState: null,
    featureState: null,
    fieldErrors: [{ code: 'BODY_TOO_LARGE', field: 'body' }],
    message: 'Request body exceeds the permitted size.',
    retryable: false,
    retryAfterSeconds: null,
  });
}

function featureDisabled(request: Request): Response {
  return errorResponse(request, 503, {
    code: 'FEATURE_DISABLED',
    dependencyState: 'disabled',
    featureState: 'disabled',
    fieldErrors: [],
    message: 'This capability is disabled by default.',
    retryAfterSeconds: null,
    retryable: false,
  });
}

async function readPrivacySensitiveJson(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_LOCATION_BODY_BYTES) {
    throw new Error('REQUEST_TOO_LARGE');
  }
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    throw new Error('INVALID_CONTENT_TYPE');
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_LOCATION_BODY_BYTES) {
    throw new Error('REQUEST_TOO_LARGE');
  }
  return JSON.parse(text) as unknown;
}

function requestValidationError(request: Request, field = 'body'): Response {
  return errorResponse(request, 400, {
    code: 'VALIDATION_ERROR',
    dependencyState: null,
    featureState: 'operational',
    fieldErrors: [{ code: 'INVALID_VALUE', field }],
    message: 'The request is invalid.',
    retryAfterSeconds: null,
    retryable: false,
  });
}

function unauthenticated(request: Request): Response {
  return errorResponse(request, 401, {
    code: 'UNAUTHENTICATED',
    dependencyState: null,
    featureState: 'disabled',
    fieldErrors: [],
    message: 'An authenticated human session is required.',
    retryAfterSeconds: null,
    retryable: false,
  });
}

function preferenceNotFound(request: Request): Response {
  return errorResponse(request, 404, {
    code: 'NOT_FOUND',
    dependencyState: null,
    featureState: 'operational',
    fieldErrors: [],
    message: 'The saved broad jurisdiction does not exist.',
    retryAfterSeconds: null,
    retryable: false,
  });
}

function parseBroadPreferenceCommand(value: unknown): BroadJurisdictionSelection | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const command = value as Record<string, unknown>;
  if (
    Object.keys(command).sort().join(',') !== 'countryCode,jurisdictionId,schemaVersion' ||
    command.schemaVersion !== 'broad-jurisdiction-preference-command.v1' ||
    (command.countryCode !== 'CA' && command.countryCode !== 'US') ||
    typeof command.jurisdictionId !== 'string'
  ) {
    return null;
  }
  const selection = BROAD_JURISDICTIONS[command.jurisdictionId];
  return selection?.countryCode === command.countryCode ? selection : null;
}

function registryQuery(
  url: URL,
):
  | { readonly ok: true; readonly query: RegistryQuery }
  | { readonly ok: false; readonly fields: readonly string[] } {
  const fields = new Set<string>();
  for (const key of url.searchParams.keys()) {
    if (!REGISTRY_PARAMETERS.has(key) || url.searchParams.getAll(key).length !== 1) fields.add(key);
  }

  const asOf = url.searchParams.get('asOf') ?? SYNTHETIC_JURISDICTION_REGISTRY.generatedAt;
  if (!ISO_TIMESTAMP_PATTERN.test(asOf) || !Number.isFinite(Date.parse(asOf))) fields.add('asOf');

  const countryCode = url.searchParams.get('countryCode');
  if (countryCode !== null && countryCode !== 'CA' && countryCode !== 'US') {
    fields.add('countryCode');
  }

  const jurisdictionId = url.searchParams.get('jurisdictionId');
  if (jurisdictionId !== null && !OPAQUE_ID_PATTERN.test(jurisdictionId)) {
    fields.add('jurisdictionId');
  }

  const historical = url.searchParams.get('includeHistorical');
  if (historical !== null && historical !== 'true' && historical !== 'false') {
    fields.add('includeHistorical');
  }
  if (fields.size > 0) return { fields: [...fields].sort(), ok: false };

  return {
    ok: true,
    query: {
      asOf,
      ...(countryCode === null ? {} : { countryCode: countryCode as CountryCode }),
      ...(jurisdictionId === null ? {} : { jurisdictionId: jurisdictionId as JurisdictionId }),
      ...(historical === null ? {} : { includeHistorical: historical === 'true' }),
    },
  };
}

function publicRoleQuery(
  url: URL,
  route: (typeof PUBLIC_ROLE_ROUTES)[keyof typeof PUBLIC_ROLE_ROUTES],
):
  | { readonly ok: true; readonly query: PublicRoleRegistryQuery }
  | { readonly ok: false; readonly fields: readonly string[] } {
  const allowed = new Set(['asOf', 'countryCode', 'includeHistorical', route.parameter]);
  const fields = new Set<string>();
  for (const key of url.searchParams.keys()) {
    if (!allowed.has(key) || url.searchParams.getAll(key).length !== 1) fields.add(key);
  }

  const asOf = url.searchParams.get('asOf') ?? SYNTHETIC_PUBLIC_ROLE_REGISTRY.generatedAt;
  if (!ISO_TIMESTAMP_PATTERN.test(asOf) || !Number.isFinite(Date.parse(asOf))) fields.add('asOf');
  const countryCode = url.searchParams.get('countryCode');
  if (countryCode !== null && countryCode !== 'CA' && countryCode !== 'US') {
    fields.add('countryCode');
  }
  const historical = url.searchParams.get('includeHistorical');
  if (historical !== null && historical !== 'true' && historical !== 'false') {
    fields.add('includeHistorical');
  }
  const id = url.searchParams.get(route.parameter);
  if (id !== null && !OPAQUE_ID_PATTERN.test(id)) fields.add(route.parameter);
  if (fields.size > 0) return { fields: [...fields].sort(), ok: false };

  const selection =
    id === null
      ? ({ kind: 'all', id: null } as const)
      : route.selection === 'person'
        ? ({ kind: 'person', id: id as PersonId } as const)
        : route.selection === 'office_term'
          ? ({ kind: 'office_term', id: id as OfficeTermId } as const)
          : route.selection === 'election'
            ? ({ kind: 'election', id: id as ElectionId } as const)
            : ({ kind: 'candidacy', id: id as CandidacyId } as const);
  return {
    ok: true,
    query: {
      asOf,
      ...(countryCode === null ? {} : { countryCode: countryCode as CountryCode }),
      ...(historical === null ? {} : { includeHistorical: historical === 'true' }),
      selection,
    },
  };
}

function publicProfileListQuery(url: URL):
  | {
      readonly ok: true;
      readonly query: {
        readonly countryCode?: 'CA' | 'US';
        readonly contextKind?: PublicProfileContextKind;
      };
    }
  | { readonly ok: false; readonly fields: readonly string[] } {
  const fields = new Set<string>();
  for (const key of url.searchParams.keys()) {
    if (!PUBLIC_PROFILE_LIST_PARAMETERS.has(key) || url.searchParams.getAll(key).length !== 1) {
      fields.add(key);
    }
  }
  const countryCode = url.searchParams.get('countryCode');
  if (countryCode !== null && countryCode !== 'CA' && countryCode !== 'US')
    fields.add('countryCode');
  const contextKind = url.searchParams.get('contextKind');
  if (contextKind !== null && contextKind !== 'office_term' && contextKind !== 'candidacy') {
    fields.add('contextKind');
  }
  if (fields.size > 0) return { fields: [...fields].sort(), ok: false };
  return {
    ok: true,
    query: {
      ...(countryCode === null ? {} : { countryCode: countryCode as 'CA' | 'US' }),
      ...(contextKind === null ? {} : { contextKind: contextKind as PublicProfileContextKind }),
    },
  };
}

function publicProfileTimelineQuery(url: URL):
  | {
      readonly ok: true;
      readonly query: {
        readonly cursor?: string;
        readonly kind?: PublicProfileTimelineKind;
        readonly limit?: number;
      };
    }
  | { readonly ok: false; readonly fields: readonly string[] } {
  const fields = new Set<string>();
  for (const key of url.searchParams.keys()) {
    if (!PUBLIC_PROFILE_TIMELINE_PARAMETERS.has(key) || url.searchParams.getAll(key).length !== 1) {
      fields.add(key);
    }
  }
  const cursor = url.searchParams.get('cursor');
  if (cursor !== null && !OPAQUE_ID_PATTERN.test(cursor)) fields.add('cursor');
  const kind = url.searchParams.get('kind');
  if (kind !== null && !TIMELINE_KINDS.has(kind as PublicProfileTimelineKind)) fields.add('kind');
  const rawLimit = url.searchParams.get('limit');
  const limit = rawLimit === null ? undefined : Number(rawLimit);
  if (rawLimit !== null && (!Number.isInteger(limit) || (limit ?? 0) < 1 || (limit ?? 0) > 50)) {
    fields.add('limit');
  }
  if (fields.size > 0) return { fields: [...fields].sort(), ok: false };
  return {
    ok: true,
    query: {
      ...(cursor === null ? {} : { cursor }),
      ...(kind === null ? {} : { kind: kind as PublicProfileTimelineKind }),
      ...(limit === undefined ? {} : { limit }),
    },
  };
}

function profileCacheHeaders(etag: string): HeadersInit {
  return { 'cache-control': PUBLIC_PROFILE_CACHE_CONTROL, etag };
}

function matchesIfNoneMatch(request: Request, etag: string): boolean {
  const value = request.headers.get('if-none-match');
  return (
    value !== null &&
    value
      .split(',')
      .map((candidate) => candidate.trim())
      .some((candidate) => candidate === '*' || candidate === etag)
  );
}

function profileNotFound(request: Request): Response {
  return errorResponse(request, 404, {
    code: 'NOT_FOUND',
    dependencyState: null,
    featureState: 'operational',
    fieldErrors: [],
    message: 'The requested public profile does not exist or is not published.',
    retryAfterSeconds: null,
    retryable: false,
  });
}

export async function handleRequest(
  request: Request,
  context: HandlerContext = {},
): Promise<Response> {
  const runtime = handlerContext(context);
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname === '/api/v1/health') {
    return Response.json(foundationHealth(), {
      headers: {
        'cache-control': 'no-store',
      },
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/health/mobile') {
    return Response.json(mobileCompatibility(), {
      headers: { 'cache-control': 'no-store' },
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/representation/capabilities') {
    return Response.json(
      parseRepresentationCapabilities(
        {
          dataMode: 'synthetic',
          items: representationCapabilities(runtime.locationResolutionEnabled),
          schemaVersion: 'representation-capabilities.v1',
        },
        'server',
      ),
      { headers: { 'cache-control': 'no-store' } },
    );
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/representation/resolve') {
    if (!runtime.locationResolutionEnabled) return featureDisabled(request);
    try {
      const command = parseRepresentationResolutionRequest(
        await readPrivacySensitiveJson(request),
        'server',
      );
      const resolution = await resolveRepresentation({
        ambiguityStore: runtime.ambiguityStore,
        asOf: command.asOf,
        countryCode: command.countryCode,
        createId: runtime.createId,
        input: command.input,
        normalizer: PRIVACY_MINIMIZED_LOCATION_NORMALIZER,
        now: runtime.now,
        provider: SYNTHETIC_LOCATION_PROVIDERS[command.countryCode],
      });
      return Response.json(parseRepresentationResolution(resolution, 'server'), {
        headers: { 'cache-control': 'no-store' },
      });
    } catch (error) {
      if (error instanceof LocationInputValidationError) return requestValidationError(request);
      return requestValidationError(request);
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/representation/resolve/ambiguity') {
    if (!runtime.locationResolutionEnabled) return featureDisabled(request);
    try {
      const command = parseRepresentationAmbiguitySelection(
        await readPrivacySensitiveJson(request),
        'server',
      );
      const resolution = selectRepresentationAmbiguity({
        ambiguityStore: runtime.ambiguityStore,
        asOf: command.asOf,
        command: {
          optionId: command.optionId,
          selectionToken: command.selectionToken,
        },
        createId: runtime.createId,
        now: runtime.now,
      });
      if (resolution === null) {
        return errorResponse(request, 410, {
          code: 'GONE',
          dependencyState: null,
          featureState: 'operational',
          fieldErrors: [],
          message: 'The ambiguity selection is unavailable. Start a new location lookup.',
          retryAfterSeconds: null,
          retryable: false,
        });
      }
      return Response.json(parseRepresentationResolution(resolution, 'server'), {
        headers: { 'cache-control': 'no-store' },
      });
    } catch {
      return requestValidationError(request);
    }
  }

  const isBroadPreferenceCollection = url.pathname === '/api/v1/account/broad-jurisdiction';
  const broadPreferenceMatch = BROAD_PREFERENCE_PATH.exec(url.pathname);
  if (isBroadPreferenceCollection || broadPreferenceMatch) {
    if (!runtime.accountDataAccessEnabled) return featureDisabled(request);
    if (runtime.accountId === null || runtime.preferences === undefined) {
      return unauthenticated(request);
    }
    if (request.method === 'GET' && isBroadPreferenceCollection) {
      const saved = await runtime.preferences.read(runtime.accountId);
      if (saved === null) return preferenceNotFound(request);
      return Response.json(parseSavedBroadJurisdiction(saved, 'server'), {
        headers: { 'cache-control': 'no-store' },
      });
    }
    const idempotencyKey = request.headers.get('idempotency-key');
    if (idempotencyKey === null || !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
      return requestValidationError(request, 'header.Idempotency-Key');
    }
    if (request.method === 'POST' && isBroadPreferenceCollection) {
      try {
        const selection = parseBroadPreferenceCommand(await readPrivacySensitiveJson(request));
        if (selection === null) return requestValidationError(request);
        const saved = createSavedBroadJurisdiction({
          createId: () => `preference:${runtime.createId()}`,
          now: runtime.now().toISOString(),
          selection,
        });
        const persisted = await runtime.preferences.put(runtime.accountId, saved, idempotencyKey);
        return Response.json(parseSavedBroadJurisdiction(persisted, 'server'), {
          headers: { 'cache-control': 'no-store' },
          status: 201,
        });
      } catch {
        return requestValidationError(request);
      }
    }
    let preferenceId: string;
    try {
      preferenceId = decodeURIComponent(broadPreferenceMatch?.[1] ?? '');
    } catch {
      preferenceId = '';
    }
    if (!OPAQUE_ID_PATTERN.test(preferenceId)) {
      return requestValidationError(request, 'path.preferenceId');
    }
    if (request.method === 'PUT') {
      try {
        const existing = await runtime.preferences.read(runtime.accountId);
        if (existing === null || existing.preferenceId !== preferenceId) {
          return preferenceNotFound(request);
        }
        const selection = parseBroadPreferenceCommand(await readPrivacySensitiveJson(request));
        if (selection === null) return requestValidationError(request);
        const updated = updateSavedBroadJurisdiction(
          existing,
          selection,
          runtime.now().toISOString(),
        );
        const persisted = await runtime.preferences.put(runtime.accountId, updated, idempotencyKey);
        return Response.json(parseSavedBroadJurisdiction(persisted, 'server'), {
          headers: { 'cache-control': 'no-store' },
        });
      } catch {
        return requestValidationError(request);
      }
    }
    if (request.method === 'DELETE') {
      return (await runtime.preferences.delete(runtime.accountId, preferenceId, idempotencyKey))
        ? new Response(null, { headers: { 'cache-control': 'no-store' }, status: 204 })
        : preferenceNotFound(request);
    }
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/jurisdictions') {
    const parsedQuery = registryQuery(url);
    if (!parsedQuery.ok) {
      return errorResponse(request, 400, {
        code: 'VALIDATION_ERROR',
        dependencyState: null,
        featureState: 'operational',
        fieldErrors: parsedQuery.fields.map((field) => ({
          code: 'INVALID_QUERY_PARAMETER',
          field: `query.${field}`,
        })),
        message: 'One or more registry query parameters are invalid.',
        retryAfterSeconds: null,
        retryable: false,
      });
    }
    const registry = queryJurisdictionRegistry(SYNTHETIC_JURISDICTION_REGISTRY, parsedQuery.query);
    return Response.json(parseJurisdictionRegistry(registry, 'server'), {
      headers: { 'cache-control': 'no-store' },
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/profiles') {
    const parsedQuery = publicProfileListQuery(url);
    if (!parsedQuery.ok) {
      return errorResponse(request, 400, {
        code: 'VALIDATION_ERROR',
        dependencyState: null,
        featureState: 'operational',
        fieldErrors: parsedQuery.fields.map((field) => ({
          code: 'INVALID_QUERY_PARAMETER',
          field: `query.${field}`,
        })),
        message: 'One or more public profile query parameters are invalid.',
        retryAfterSeconds: null,
        retryable: false,
      });
    }
    return Response.json(
      parsePublicRoleProfileList(listPublicProfiles(parsedQuery.query), 'server'),
      {
        headers: { 'cache-control': PUBLIC_PROFILE_CACHE_CONTROL },
      },
    );
  }

  const publicProfileMatch = PUBLIC_PROFILE_PATH.exec(url.pathname);
  if (request.method === 'GET' && publicProfileMatch) {
    let profileId: string;
    try {
      profileId = decodeURIComponent(publicProfileMatch[1] ?? '');
    } catch {
      profileId = '';
    }
    if (!OPAQUE_ID_PATTERN.test(profileId)) {
      return errorResponse(request, 400, {
        code: 'VALIDATION_ERROR',
        dependencyState: null,
        featureState: 'operational',
        fieldErrors: [{ code: 'INVALID_PATH_PARAMETER', field: 'path.profileId' }],
        message: 'The public profile identifier is invalid.',
        retryAfterSeconds: null,
        retryable: false,
      });
    }
    const profile = readPublicProfile(profileId);
    if (!profile) return profileNotFound(request);
    if (matchesIfNoneMatch(request, profile.etag)) {
      return new Response(null, { headers: profileCacheHeaders(profile.etag), status: 304 });
    }
    const section = publicProfileMatch[2];
    if (section === 'timeline') {
      const parsedQuery = publicProfileTimelineQuery(url);
      if (!parsedQuery.ok) {
        return errorResponse(request, 400, {
          code: 'VALIDATION_ERROR',
          dependencyState: null,
          featureState: 'operational',
          fieldErrors: parsedQuery.fields.map((field) => ({
            code: 'INVALID_QUERY_PARAMETER',
            field: `query.${field}`,
          })),
          message: 'One or more profile timeline query parameters are invalid.',
          retryAfterSeconds: null,
          retryable: false,
        });
      }
      try {
        const timeline = readPublicProfileTimeline(profileId, parsedQuery.query);
        return Response.json(parsePublicRoleProfileTimeline(timeline, 'server'), {
          headers: profileCacheHeaders(profile.etag),
        });
      } catch {
        return errorResponse(request, 400, {
          code: 'VALIDATION_ERROR',
          dependencyState: null,
          featureState: 'operational',
          fieldErrors: [{ code: 'INVALID_QUERY_PARAMETER', field: 'query.cursor' }],
          message: 'The profile timeline cursor is invalid.',
          retryAfterSeconds: null,
          retryable: false,
        });
      }
    }
    const serializedProfile = parsePublicRoleProfile(profile, 'server');
    const value =
      section === 'sources'
        ? parsePublicRoleProfileSources(serializedProfile.sources, 'server')
        : section === 'coverage'
          ? parsePublicRoleProfileCoverage(serializedProfile.coverage, 'server')
          : section === 'responses'
            ? parsePublicRoleProfileResponses(serializedProfile.responses, 'server')
            : section === 'disputes'
              ? parsePublicRoleProfileDisputes(serializedProfile.disputes, 'server')
              : section === 'corrections'
                ? parsePublicRoleProfileCorrections(serializedProfile.corrections, 'server')
                : section === 'appeals'
                  ? parsePublicRoleProfileAppeals(serializedProfile.appeals, 'server')
                  : serializedProfile;
    return Response.json(value, { headers: profileCacheHeaders(profile.etag) });
  }

  const publicRoleRoute = PUBLIC_ROLE_ROUTES[url.pathname as keyof typeof PUBLIC_ROLE_ROUTES];
  if (request.method === 'GET' && publicRoleRoute) {
    const parsedQuery = publicRoleQuery(url, publicRoleRoute);
    if (!parsedQuery.ok) {
      return errorResponse(request, 400, {
        code: 'VALIDATION_ERROR',
        dependencyState: null,
        featureState: 'operational',
        fieldErrors: parsedQuery.fields.map((field) => ({
          code: 'INVALID_QUERY_PARAMETER',
          field: `query.${field}`,
        })),
        message: 'One or more public-role query parameters are invalid.',
        retryAfterSeconds: null,
        retryable: false,
      });
    }
    const registry = queryPublicRoleRegistry(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY,
      SYNTHETIC_JURISDICTION_REGISTRY,
      parsedQuery.query,
    );
    return Response.json(parsePublicRoleRegistry(registry, 'server'), {
      headers: { 'cache-control': 'no-store' },
    });
  }

  return errorResponse(request, 404, {
    code: 'NOT_FOUND',
    dependencyState: null,
    featureState: null,
    fieldErrors: [],
    message: 'The requested API route does not exist.',
    retryAfterSeconds: null,
    retryable: false,
  });
}
