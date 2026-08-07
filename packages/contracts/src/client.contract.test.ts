import { describe, expect, it } from 'vitest';

import {
  createAdminClient,
  createMobileClient,
  createPortalClient,
  createPublicSdkClient,
  createWebClient,
  createWorkerClient,
  OFFICIAL_CLIENT_SURFACES,
  readApiHealth,
  readJurisdictionRegistry,
  readMobileCompatibility,
  readPeople,
} from './client.js';
import { createContractMockFetch } from './mock.js';

describe('generated v1 clients', () => {
  it('publishes one typed client for every official consumer surface', () => {
    expect(OFFICIAL_CLIENT_SURFACES).toEqual([
      'mobile',
      'web',
      'portal',
      'admin',
      'worker',
      'public-sdk',
    ]);
  });

  it.each([
    ['mobile', createMobileClient],
    ['web', createWebClient],
    ['portal', createPortalClient],
    ['admin', createAdminClient],
    ['worker', createWorkerClient],
    ['public-sdk', createPublicSdkClient],
  ] as const)('consumes the health contract from the %s client', async (surface, factory) => {
    let observedSurface: string | null = null;
    const mockFetch: typeof globalThis.fetch = async (input, init) => {
      const request = new Request(input, init);
      observedSurface = request.headers.get('x-rmr-client-surface');
      return createContractMockFetch()(request);
    };
    const client = factory('http://127.0.0.1:3000', mockFetch);

    const result = await readApiHealth(client);

    expect(observedSurface).toBe(surface);
    expect(result.contract.supportedVersions).toEqual(['v1']);
    expect(result.optionalDependencies.verus).toBe('disabled');
  });

  it('returns typed synthetic Canada and U.S. registry data', async () => {
    const client = createPublicSdkClient('http://127.0.0.1:3000', createContractMockFetch());

    await expect(readJurisdictionRegistry(client)).resolves.toMatchObject({
      dataMode: 'synthetic',
      deferredFamilies: [
        'people',
        'office_terms',
        'candidacies',
        'source_ingestion',
        'location_resolution',
      ],
      jurisdictions: [{ countryCode: 'CA' }, { countryCode: 'US' }],
    });
  });

  it('publishes installed native-client compatibility through the generated client', async () => {
    const client = createMobileClient('http://127.0.0.1:3000', createContractMockFetch());

    await expect(readMobileCompatibility(client)).resolves.toMatchObject({
      contract: { minimumSupportedVersion: 'v1' },
      platforms: {
        android: { releaseState: 'foundation', supportedContractVersions: ['v1'] },
        ios: { releaseState: 'foundation', supportedContractVersions: ['v1'] },
      },
    });
  });

  it.each([
    ['mobile', createMobileClient],
    ['web', createWebClient],
    ['portal', createPortalClient],
    ['admin', createAdminClient],
    ['worker', createWorkerClient],
    ['public-sdk', createPublicSdkClient],
  ] as const)('makes the public-role contract available to the %s client', async (_, factory) => {
    const client = factory('http://127.0.0.1:3000', createContractMockFetch());
    await expect(readPeople(client)).resolves.toMatchObject({
      schemaVersion: 'public-role-registry.v1',
      dataMode: 'synthetic',
      externalIdentityReferences: [],
    });
  });
});
