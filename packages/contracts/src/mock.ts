import {
  SYNTHETIC_HEALTH_READY,
  SYNTHETIC_JURISDICTIONS,
  SYNTHETIC_MOBILE_COMPATIBILITY_READY,
  SYNTHETIC_NOT_FOUND,
  SYNTHETIC_PUBLIC_ROLE_REGISTRY,
} from './generated/contract-fixtures.js';

function jsonResponse(value: unknown, status: number, correlationId?: string): Response {
  return new Response(JSON.stringify(value), {
    headers: {
      'cache-control': 'no-store',
      'content-type': status >= 400 ? 'application/problem+json' : 'application/json',
      ...(correlationId ? { 'x-correlation-id': correlationId } : {}),
    },
    status,
  });
}

export function createContractMockFetch(): typeof globalThis.fetch {
  return async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/api/v1/health') {
      return jsonResponse(SYNTHETIC_HEALTH_READY, 200);
    }
    if (request.method === 'GET' && url.pathname === '/api/v1/health/mobile') {
      return jsonResponse(SYNTHETIC_MOBILE_COMPATIBILITY_READY, 200);
    }
    if (request.method === 'GET' && url.pathname === '/api/v1/jurisdictions') {
      return jsonResponse(SYNTHETIC_JURISDICTIONS, 200);
    }
    if (
      request.method === 'GET' &&
      [
        '/api/v1/people',
        '/api/v1/office-terms',
        '/api/v1/elections',
        '/api/v1/candidacies',
      ].includes(url.pathname)
    ) {
      return jsonResponse(SYNTHETIC_PUBLIC_ROLE_REGISTRY, 200);
    }
    return jsonResponse(SYNTHETIC_NOT_FOUND, 404, SYNTHETIC_NOT_FOUND.correlationId);
  };
}
