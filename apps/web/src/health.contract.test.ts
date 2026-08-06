import { describe, expect, it } from 'vitest';

import { readFoundationHealth } from './health.js';

describe('web generated-client wiring', () => {
  it('reads a synthetic response using the generated contract', async () => {
    const fetchImplementation: typeof globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          optionalDependencies: { verus: 'disabled' },
          service: 'api',
          status: 'ready',
          version: '0.0.0-foundation',
        }),
        { headers: { 'content-type': 'application/json' } },
      );

    await expect(
      readFoundationHealth('http://127.0.0.1:3000', fetchImplementation),
    ).resolves.toMatchObject({
      optionalDependencies: { verus: 'disabled' },
      status: 'ready',
    });
  });
});
