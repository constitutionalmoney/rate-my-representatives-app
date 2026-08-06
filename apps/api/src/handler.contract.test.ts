import { describe, expect, it } from 'vitest';

import { handleRequest } from './handler.js';

describe('foundation API', () => {
  it('serves typed core readiness while optional Verus is stopped', async () => {
    const response = await handleRequest(new Request('http://127.0.0.1:3000/api/v1/health'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      optionalDependencies: { verus: 'disabled' },
      service: 'api',
      status: 'ready',
      version: '0.0.0-foundation',
    });
  });

  it('does not invent uncontracted civic routes', async () => {
    const response = await handleRequest(new Request('http://127.0.0.1:3000/api/v1/people'));
    expect(response.status).toBe(404);
  });
});
