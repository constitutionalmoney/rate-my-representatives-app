import createClient from 'openapi-fetch';

import type { components, paths } from './generated/openapi.js';

export type HealthStatus = components['schemas']['HealthStatus'];

export function createRmrClient(baseUrl: string, fetchImplementation?: typeof globalThis.fetch) {
  return createClient<paths>({
    baseUrl,
    ...(fetchImplementation ? { fetch: fetchImplementation } : {}),
  });
}
