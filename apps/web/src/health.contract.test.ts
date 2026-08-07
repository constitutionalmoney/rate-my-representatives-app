import { describe, expect, it } from 'vitest';

import { createContractMockFetch } from '@rmr/contracts';

import { readFoundationHealth, readWebJurisdictionRegistry } from './health.js';

describe('web generated-client wiring', () => {
  it('reads a synthetic response using the generated contract', async () => {
    await expect(
      readFoundationHealth('http://127.0.0.1:3000', createContractMockFetch()),
    ).resolves.toMatchObject({
      optionalDependencies: { verus: 'disabled' },
      status: 'ready',
    });
  });

  it('reads the operational synthetic registry', async () => {
    await expect(
      readWebJurisdictionRegistry('http://127.0.0.1:3000', createContractMockFetch()),
    ).resolves.toMatchObject({
      dataMode: 'synthetic',
      jurisdictions: expect.arrayContaining([expect.objectContaining({ countryCode: 'CA' })]),
    });
  });
});
