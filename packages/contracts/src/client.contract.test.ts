import { describe, expect, it } from 'vitest';

import { createRmrClient } from './client.js';
import type { HealthStatusSchema } from './index.js';

describe('generated foundation client', () => {
  it('consumes the generated health contract through openapi-fetch', async () => {
    const response: HealthStatusSchema = {
      optionalDependencies: { verus: 'disabled' },
      service: 'api',
      status: 'ready',
      version: '0.0.0-foundation',
    };
    const mockFetch: typeof globalThis.fetch = async () =>
      new Response(JSON.stringify(response), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      });
    const client = createRmrClient('http://127.0.0.1:3000', mockFetch);

    const result = await client.GET('/api/v1/health');

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual(response);
  });
});
