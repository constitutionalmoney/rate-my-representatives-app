import { describe, expect, it, vi } from 'vitest';

import {
  createContractMockFetch,
  createWebClient,
  readPublicProfile,
  readPublicProfiles,
} from '@rmr/contracts';

import {
  createMemoryPublicDiscoveryCachePort,
  createPublicDiscoveryRepository,
  PUBLIC_DISCOVERY_CACHE_MAX_AGE_MILLISECONDS,
  PublicDiscoveryUnavailableError,
} from './repository.js';

const now = new Date('2026-08-08T20:00:00Z');

function remotePort() {
  const client = createWebClient('http://127.0.0.1:3000', createContractMockFetch());
  return {
    readProfile: (profileId: string) => readPublicProfile(client, profileId),
    readProfiles: (country: 'CA' | 'US') => readPublicProfiles(client, { countryCode: country }),
  };
}

describe('public-only discovery cache', () => {
  it('falls back to validated cached profiles without caching representative choices', async () => {
    const cache = createMemoryPublicDiscoveryCachePort();
    const online = createPublicDiscoveryRepository({ cache, now: () => now, remote: remotePort() });
    const list = await online.readProfiles('CA');
    const profile = await online.readProfile(list.value.items[0]?.profileId ?? '');
    expect(list.source).toBe('network');
    expect(profile.value.method).toMatchObject({
      compositeScoreIncluded: false,
      signalAggregateIncluded: false,
    });

    const unavailable = vi.fn().mockRejectedValue(new Error('offline'));
    const offline = createPublicDiscoveryRepository({
      cache,
      now: () => now,
      remote: { readProfile: unavailable, readProfiles: unavailable },
    });
    await expect(offline.readProfiles('CA')).resolves.toMatchObject({ source: 'public_cache' });
    await expect(offline.readProfile(profile.value.profileId)).resolves.toMatchObject({
      source: 'public_cache',
    });
    const snapshot = cache.snapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot).not.toMatch(/"intent"|"representativeSignal"|"preciseLocation"/u);
  });

  it('rejects expired, malformed, and oversized public cache entries', async () => {
    const cache = createMemoryPublicDiscoveryCachePort();
    const online = createPublicDiscoveryRepository({ cache, now: () => now, remote: remotePort() });
    await online.readProfiles('US');
    const raw = cache.snapshot();
    if (raw === null) throw new Error('Expected a populated cache.');
    const expired = raw.replaceAll(
      now.toISOString(),
      new Date(now.getTime() - PUBLIC_DISCOVERY_CACHE_MAX_AGE_MILLISECONDS - 1).toISOString(),
    );
    await cache.write(expired);
    const unavailable = vi.fn().mockRejectedValue(new Error('offline'));
    const offline = createPublicDiscoveryRepository({
      cache,
      now: () => now,
      remote: { readProfile: unavailable, readProfiles: unavailable },
    });
    await expect(offline.readProfiles('US')).rejects.toBeInstanceOf(
      PublicDiscoveryUnavailableError,
    );

    await cache.write('{malformed');
    await expect(offline.readProfiles('US')).rejects.toBeInstanceOf(
      PublicDiscoveryUnavailableError,
    );
  });

  it('falls back within the request budget instead of holding the civic screen indefinitely', async () => {
    const cache = createMemoryPublicDiscoveryCachePort();
    const online = createPublicDiscoveryRepository({ cache, now: () => now, remote: remotePort() });
    await online.readProfiles('CA');
    const never = new Promise<never>(() => undefined);
    const bounded = createPublicDiscoveryRepository({
      cache,
      now: () => now,
      remote: { readProfile: () => never, readProfiles: () => never },
      requestBudgetMilliseconds: 1,
    });
    await expect(bounded.readProfiles('CA')).resolves.toMatchObject({ source: 'public_cache' });
  });
});
