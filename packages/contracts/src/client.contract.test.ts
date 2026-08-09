import { describe, expect, it } from 'vitest';

import {
  createAdminClient,
  createMobileClient,
  createPortalClient,
  createPublicSdkClient,
  createWebClient,
  createWorkerClient,
  deleteBroadJurisdiction,
  OFFICIAL_CLIENT_SURFACES,
  readApiHealth,
  readJurisdictionRegistry,
  readRepresentationCapabilities,
  readSavedBroadJurisdiction,
  readMobileCompatibility,
  readPeople,
  readPublicProfile,
  readPublicProfileAppeals,
  readPublicProfileCorrections,
  readPublicProfileCoverage,
  readPublicProfiles,
  readPublicProfileSources,
  readPublicProfileTimeline,
  resolveRepresentationOnce,
  saveBroadJurisdiction,
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

  it('publishes privacy-minimized resolution and broad-preference clients', async () => {
    const client = createMobileClient('http://127.0.0.1:3000', createContractMockFetch());
    await expect(readRepresentationCapabilities(client)).resolves.toMatchObject({
      dataMode: 'synthetic',
      items: [{ countryCode: 'CA' }, { countryCode: 'US' }],
    });
    await expect(
      resolveRepresentationOnce(client, {
        schemaVersion: 'representation-resolution-request.v1',
        asOf: '2026-06-01T12:00:00.000Z',
        countryCode: 'CA',
        input: { kind: 'postal_code', value: 'A1A 1A1' },
      }),
    ).resolves.toMatchObject({ state: 'resolved', countryCode: 'CA' });
    await expect(readSavedBroadJurisdiction(client)).resolves.toMatchObject({
      jurisdictionKind: 'province',
    });
    await expect(
      saveBroadJurisdiction(
        client,
        {
          schemaVersion: 'broad-jurisdiction-preference-command.v1',
          countryCode: 'CA',
          jurisdictionId: 'jurisdiction:ca:maple',
        },
        'idempotency:synthetic:1',
      ),
    ).resolves.toMatchObject({ jurisdictionId: 'jurisdiction:ca:maple' });
    await expect(
      deleteBroadJurisdiction(client, 'preference:synthetic:ca:1', 'idempotency:synthetic:2'),
    ).resolves.toBeUndefined();
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

  it.each([
    ['mobile', createMobileClient],
    ['web', createWebClient],
    ['portal', createPortalClient],
    ['admin', createAdminClient],
    ['worker', createWorkerClient],
    ['public-sdk', createPublicSdkClient],
  ] as const)(
    'makes the reviewed public-profile contract available to the %s client',
    async (_, factory) => {
      const client = factory('http://127.0.0.1:3000', createContractMockFetch());
      const list = await readPublicProfiles(client);
      const profileId = list.items[0]?.profileId ?? '';
      await expect(readPublicProfile(client, profileId)).resolves.toMatchObject({
        profileId,
        provenance: null,
        externalIdentityReferences: [],
      });
    },
  );

  it('validates profile timeline, source, coverage, and correction section clients', async () => {
    const client = createPublicSdkClient('http://127.0.0.1:3000', createContractMockFetch());
    const profileId = 'profile:ca:avery-quill:maple-member:2024';
    await expect(readPublicProfileTimeline(client, profileId)).resolves.toMatchObject({
      profileId,
      page: { nextCursor: null },
    });
    await expect(readPublicProfileSources(client, profileId)).resolves.toMatchObject({ profileId });
    await expect(readPublicProfileCoverage(client, profileId)).resolves.toMatchObject({
      profileId,
    });
    await expect(readPublicProfileCorrections(client, profileId)).resolves.toMatchObject({
      profileId,
    });
    await expect(readPublicProfileAppeals(client, profileId)).resolves.toMatchObject({ profileId });
  });
});
