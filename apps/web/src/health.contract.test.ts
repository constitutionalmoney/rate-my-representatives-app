import { describe, expect, it } from 'vitest';

import { createContractMockFetch } from '@rmr/contracts';

import { readFoundationHealth, readWebJurisdictionAvailability } from './health.js';

describe('web generated-client wiring', () => {
  it('reads a synthetic response using the generated contract', async () => {
    await expect(
      readFoundationHealth('http://127.0.0.1:3000', createContractMockFetch()),
    ).resolves.toMatchObject({
      optionalDependencies: { verus: 'disabled' },
      status: 'ready',
    });
  });

  it('keeps proposed registry discovery non-operational', async () => {
    await expect(
      readWebJurisdictionAvailability('http://127.0.0.1:3000', createContractMockFetch()),
    ).resolves.toMatchObject({ code: 'FEATURE_DISABLED', featureState: 'proposed' });
  });
});
