import { describe, expect, it } from 'vitest';

import { createContractMockFetch } from '@rmr/contracts';

import {
  readMobileCompatibilityPolicy,
  readMobileHealth,
  readMobileJurisdictionRegistry,
  readMobileRepresentationCapabilities,
  readMobilePublicProfile,
  readMobilePublicProfiles,
  resolveMobileRepresentation,
} from './api';

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
    const contractFetch = createContractMockFetch();
    const requests: Request[] = [];
    const mockFetch: typeof globalThis.fetch = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return contractFetch(request);
    };
    const list = await readMobilePublicProfiles(
      'http://127.0.0.1:3000',
      { countryCode: 'CA' },
      mockFetch,
    );
    expect(list.items[0]).toMatchObject({ countryCode: 'CA', availability: 'available' });
    await expect(
      readMobilePublicProfile('http://127.0.0.1:3000', list.items[0]?.profileId ?? '', mockFetch),
    ).resolves.toMatchObject({ provenance: null, externalIdentityReferences: [] });
    expect(requests.map(({ method }) => method)).toEqual(['GET', 'GET']);
    expect(requests[0]?.url).toContain('countryCode=CA');
  });

  it('wires privacy-minimized representation capability and resolution clients', async () => {
    const mockFetch = createContractMockFetch();
    await expect(
      readMobileRepresentationCapabilities('http://127.0.0.1:3000', mockFetch),
    ).resolves.toMatchObject({ items: [{ countryCode: 'CA' }, { countryCode: 'US' }] });
    await expect(
      resolveMobileRepresentation(
        'http://127.0.0.1:3000',
        {
          schemaVersion: 'representation-resolution-request.v1',
          asOf: '2026-06-01T12:00:00.000Z',
          countryCode: 'CA',
          input: { kind: 'postal_code', value: 'A1A 1A1' },
        },
        mockFetch,
      ),
    ).resolves.toMatchObject({ state: 'resolved', inputDisposition: { persisted: false } });
  });
});
