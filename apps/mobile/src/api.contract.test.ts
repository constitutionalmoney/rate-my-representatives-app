import { describe, expect, it } from 'vitest';

import { createContractMockFetch } from '@rmr/contracts';

import {
  readMobileCompatibilityPolicy,
  readMobileHealth,
  readMobileJurisdictionRegistry,
  readMobilePublicProfile,
  readMobilePublicProfiles,
} from './api.js';

describe('mobile generated-client wiring', () => {
  it('validates health and proposed registry discovery with synthetic data', async () => {
    const mockFetch = createContractMockFetch();
    await expect(readMobileHealth('http://127.0.0.1:3000', mockFetch)).resolves.toMatchObject({
      status: 'ready',
    });
    await expect(
      readMobileJurisdictionRegistry('http://127.0.0.1:3000', mockFetch),
    ).resolves.toMatchObject({
      dataMode: 'synthetic',
      jurisdictions: expect.arrayContaining([expect.objectContaining({ countryCode: 'CA' })]),
    });
    await expect(
      readMobileCompatibilityPolicy('http://127.0.0.1:3000', mockFetch),
    ).resolves.toMatchObject({
      platforms: {
        android: { supportedContractVersions: ['v1'] },
        ios: { supportedContractVersions: ['v1'] },
      },
    });
  });

  it('reads the generated public profile list and detail with Verus absent', async () => {
    const mockFetch = createContractMockFetch();
    const list = await readMobilePublicProfiles('http://127.0.0.1:3000', mockFetch);
    expect(list.items[0]).toMatchObject({ countryCode: 'CA', availability: 'available' });
    await expect(
      readMobilePublicProfile('http://127.0.0.1:3000', list.items[0]?.profileId ?? '', mockFetch),
    ).resolves.toMatchObject({ provenance: null, externalIdentityReferences: [] });
  });
});
