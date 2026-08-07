import { describe, expect, it } from 'vitest';

import { createContractMockFetch } from '@rmr/contracts';

import { readAdminHealth, readAdminJurisdictionRegistry } from './api.js';

describe('admin generated-client wiring', () => {
  it('uses the versioned public contract with synthetic data', async () => {
    const mockFetch = createContractMockFetch();
    await expect(readAdminHealth('http://127.0.0.1:3000', mockFetch)).resolves.toMatchObject({
      status: 'ready',
    });
    await expect(
      readAdminJurisdictionRegistry('http://127.0.0.1:3000', mockFetch),
    ).resolves.toMatchObject({
      dataMode: 'synthetic',
      jurisdictions: expect.arrayContaining([expect.objectContaining({ countryCode: 'CA' })]),
    });
  });
});
