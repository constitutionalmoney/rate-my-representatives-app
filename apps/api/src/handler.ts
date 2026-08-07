import { parseApiError, type ApiError } from '@rmr/contracts';

import { foundationHealth, mobileCompatibility } from './health.js';

const CORRELATION_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

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
    return errorResponse(request, 503, {
      code: 'FEATURE_DISABLED',
      dependencyState: null,
      featureState: 'proposed',
      fieldErrors: [],
      message: 'This capability is not operational.',
      retryAfterSeconds: null,
      retryable: false,
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
