import { describe, expect, it } from 'vitest';

import { createContractMockFetch } from '@rmr/contracts';

import {
  readFoundationHealth,
  readWebJurisdictionRegistry,
  readWebRepresentationCapabilities,
  readWebPublicProfile,
  readWebPublicProfiles,
  resolveWebRepresentation,
} from './health.js';

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

  it('reads source-backed profile contracts through the web client', async () => {
    const contractFetch = createContractMockFetch();
    const requests: Request[] = [];
    const mockFetch: typeof globalThis.fetch = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return contractFetch(request);
    };
    const list = await readWebPublicProfiles(
      'http://127.0.0.1:3000',
      { countryCode: 'CA' },
      mockFetch,
    );
    const profile = await readWebPublicProfile(
      'http://127.0.0.1:3000',
      list.items[0]?.profileId ?? '',
      mockFetch,
    );
    expect(profile).toMatchObject({
      dataMode: 'synthetic',
      method: { compositeScoreIncluded: false, signalAggregateIncluded: false },
    });
    expect(requests.map(({ method }) => method)).toEqual(['GET', 'GET']);
    expect(requests[0]?.url).toContain('countryCode=CA');
  });

  it('wires the minimum-input capability and one-time resolution clients', async () => {
    const mockFetch = createContractMockFetch();
    await expect(
      readWebRepresentationCapabilities('http://127.0.0.1:3000', mockFetch),
    ).resolves.toMatchObject({ items: [{ countryCode: 'CA' }, { countryCode: 'US' }] });
    await expect(
      resolveWebRepresentation(
        'http://127.0.0.1:3000',
        {
          schemaVersion: 'representation-resolution-request.v1',
          asOf: '2026-06-01T12:00:00.000Z',
          countryCode: 'CA',
          input: { kind: 'postal_code', value: 'A1A 1A1' },
        },
        mockFetch,
      ),
    ).resolves.toMatchObject({ state: 'resolved', inputDisposition: { logged: false } });
  });
});
