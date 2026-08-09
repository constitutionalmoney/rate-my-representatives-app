import {
  SYNTHETIC_HEALTH_READY,
  SYNTHETIC_JURISDICTIONS,
  SYNTHETIC_MOBILE_COMPATIBILITY_READY,
  SYNTHETIC_NOT_FOUND,
  SYNTHETIC_PUBLIC_ROLE_PROFILE,
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
    if (request.method === 'GET' && url.pathname === '/api/v1/profiles') {
      const requestedCountry = url.searchParams.get('countryCode');
      const countryCode =
        requestedCountry === 'CA' || requestedCountry === 'US' ? requestedCountry : null;
      const items =
        countryCode === null || SYNTHETIC_PUBLIC_ROLE_PROFILE.summary.countryCode === countryCode
          ? [SYNTHETIC_PUBLIC_ROLE_PROFILE.summary]
          : [];
      return jsonResponse(
        {
          schemaVersion: 'public-role-profile-list.v1',
          dataMode: 'synthetic',
          generatedAt: SYNTHETIC_PUBLIC_ROLE_PROFILE.updatedAt,
          filters: { countryCode, contextKind: null },
          items,
          page: { limit: 50, nextCursor: null },
        },
        200,
      );
    }
    const prefix = '/api/v1/profiles/';
    if (request.method === 'GET' && url.pathname.startsWith(prefix)) {
      const suffixes = [
        '/timeline',
        '/sources',
        '/coverage',
        '/responses',
        '/disputes',
        '/corrections',
        '/appeals',
      ];
      const suffix = suffixes.find((candidate) => url.pathname.endsWith(candidate));
      const encodedProfileId = url.pathname.slice(
        prefix.length,
        suffix === undefined ? undefined : -suffix.length,
      );
      if (decodeURIComponent(encodedProfileId) !== SYNTHETIC_PUBLIC_ROLE_PROFILE.profileId) {
        return jsonResponse(SYNTHETIC_NOT_FOUND, 404, SYNTHETIC_NOT_FOUND.correlationId);
      }
      if (suffix === '/timeline') {
        return jsonResponse(
          {
            schemaVersion: 'public-role-profile-timeline.v1',
            dataMode: 'synthetic',
            profileId: SYNTHETIC_PUBLIC_ROLE_PROFILE.profileId,
            recordVersion: SYNTHETIC_PUBLIC_ROLE_PROFILE.recordVersion,
            updatedAt: SYNTHETIC_PUBLIC_ROLE_PROFILE.updatedAt,
            filters: { kind: null },
            items: [],
            page: { limit: 20, nextCursor: null },
          },
          200,
        );
      }
      if (suffix === '/sources') return jsonResponse(SYNTHETIC_PUBLIC_ROLE_PROFILE.sources, 200);
      if (suffix === '/coverage') return jsonResponse(SYNTHETIC_PUBLIC_ROLE_PROFILE.coverage, 200);
      if (suffix === '/responses')
        return jsonResponse(SYNTHETIC_PUBLIC_ROLE_PROFILE.responses, 200);
      if (suffix === '/disputes') return jsonResponse(SYNTHETIC_PUBLIC_ROLE_PROFILE.disputes, 200);
      if (suffix === '/corrections')
        return jsonResponse(SYNTHETIC_PUBLIC_ROLE_PROFILE.corrections, 200);
      if (suffix === '/appeals') return jsonResponse(SYNTHETIC_PUBLIC_ROLE_PROFILE.appeals, 200);
      return jsonResponse(SYNTHETIC_PUBLIC_ROLE_PROFILE, 200);
    }
    return jsonResponse(SYNTHETIC_NOT_FOUND, 404, SYNTHETIC_NOT_FOUND.correlationId);
  };
}
