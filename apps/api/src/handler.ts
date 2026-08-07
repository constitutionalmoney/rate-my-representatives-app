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
  type ApiError,
} from '@rmr/contracts';
import {
  queryPublicRoleRegistry,
  queryJurisdictionRegistry,
  listPublicProfiles,
  readPublicProfile,
  readPublicProfileTimeline,
  SYNTHETIC_JURISDICTION_REGISTRY,
  SYNTHETIC_PUBLIC_ROLE_REGISTRY,
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

export async function handleRequest(request: Request): Promise<Response> {
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
