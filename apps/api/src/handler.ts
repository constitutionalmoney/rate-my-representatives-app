import { parseApiError, parseJurisdictionRegistry, type ApiError } from '@rmr/contracts';
import {
  queryJurisdictionRegistry,
  SYNTHETIC_JURISDICTION_REGISTRY,
  type CountryCode,
  type JurisdictionId,
  type RegistryQuery,
} from '@rmr/domain';

import { foundationHealth, mobileCompatibility } from './health.js';

const CORRELATION_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const REGISTRY_PARAMETERS = new Set(['asOf', 'countryCode', 'jurisdictionId', 'includeHistorical']);

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
