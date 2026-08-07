import { describe, expect, it } from 'vitest';

import { createContractMockFetch } from '@rmr/contracts';

import {
  readMobileCompatibilityPolicy,
  readMobileHealth,
  readMobileJurisdictionAvailability,
} from './api.js';

describe('mobile generated-client wiring', () => {
  it('validates health and proposed registry discovery with synthetic data', async () => {
    const mockFetch = createContractMockFetch();
    await expect(readMobileHealth('http://127.0.0.1:3000', mockFetch)).resolves.toMatchObject({
      status: 'ready',
    });
    await expect(
      readMobileJurisdictionAvailability('http://127.0.0.1:3000', mockFetch),
    ).resolves.toMatchObject({ code: 'FEATURE_DISABLED' });
    await expect(
      readMobileCompatibilityPolicy('http://127.0.0.1:3000', mockFetch),
    ).resolves.toMatchObject({
      platforms: {
        android: { supportedContractVersions: ['v1'] },
        ios: { supportedContractVersions: ['v1'] },
      },
    });
  });
});
