import { describe, expect, it } from 'vitest';

import { createContractMockFetch } from '@rmr/contracts';

import { readPortalHealth, readPortalJurisdictionRegistry } from './api.js';

describe('portal generated-client wiring', () => {
  it('uses the versioned public contract with synthetic data', async () => {
    const mockFetch = createContractMockFetch();
    await expect(readPortalHealth('http://127.0.0.1:3000', mockFetch)).resolves.toMatchObject({
      status: 'ready',
    });
    await expect(
      readPortalJurisdictionRegistry('http://127.0.0.1:3000', mockFetch),
    ).resolves.toMatchObject({
      dataMode: 'synthetic',
      jurisdictions: expect.arrayContaining([expect.objectContaining({ countryCode: 'CA' })]),
    });
  });
});
