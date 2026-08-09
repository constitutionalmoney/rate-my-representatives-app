import {
  parsePublicRoleProfile,
  parsePublicRoleProfileList,
  type PublicRoleProfile,
  type PublicRoleProfileList,
} from '@rmr/contracts';

import type { DiscoveryCountry } from './deck.js';

export const PUBLIC_DISCOVERY_CACHE_SCHEMA = 'public-discovery-cache.v1' as const;
export const PUBLIC_DISCOVERY_CACHE_MAX_BYTES = 2 * 1024 * 1024;
export const PUBLIC_DISCOVERY_CACHE_MAX_AGE_MILLISECONDS = 7 * 24 * 60 * 60 * 1_000;
export const PUBLIC_DISCOVERY_REQUEST_BUDGET_MILLISECONDS = 8_000;

export interface PublicDiscoveryCachePort {
  readonly clear: () => Promise<void>;
  readonly read: () => Promise<string | null>;
  readonly write: (value: string) => Promise<void>;
}

export interface PublicDiscoveryRemotePort {
  readonly readProfile: (profileId: string) => Promise<PublicRoleProfile>;
  readonly readProfiles: (country: DiscoveryCountry) => Promise<PublicRoleProfileList>;
}

export type DiscoveryRead<T> = Readonly<{
  cachedAt: string | null;
  source: 'network' | 'public_cache';
  value: T;
}>;

interface TimedValue<T> {
  readonly savedAt: string;
  readonly value: T;
}

interface PublicDiscoveryCacheDocument {
  readonly schemaVersion: typeof PUBLIC_DISCOVERY_CACHE_SCHEMA;
  readonly lists: Partial<Record<DiscoveryCountry, TimedValue<PublicRoleProfileList>>>;
  readonly profiles: Readonly<Record<string, TimedValue<PublicRoleProfile>>>;
}

export interface PublicDiscoveryRepository {
  readonly clearPublicCache: () => Promise<void>;
  readonly readProfile: (profileId: string) => Promise<DiscoveryRead<PublicRoleProfile>>;
  readonly readProfiles: (
    country: DiscoveryCountry,
  ) => Promise<DiscoveryRead<PublicRoleProfileList>>;
}

export class PublicDiscoveryUnavailableError extends Error {
  constructor(readKind: 'deck' | 'profile') {
    super(`The public ${readKind} is unavailable online and no current public cache exists.`);
    this.name = 'PublicDiscoveryUnavailableError';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function emptyDocument(): PublicDiscoveryCacheDocument {
  return {
    schemaVersion: PUBLIC_DISCOVERY_CACHE_SCHEMA,
    lists: {},
    profiles: {},
  };
}

function validSavedAt(savedAt: unknown, now: number): savedAt is string {
  if (typeof savedAt !== 'string') return false;
  const timestamp = Date.parse(savedAt);
  return (
    Number.isFinite(timestamp) &&
    timestamp <= now + 5 * 60_000 &&
    now - timestamp <= PUBLIC_DISCOVERY_CACHE_MAX_AGE_MILLISECONDS
  );
}

function parseCacheDocument(raw: string, now: number): PublicDiscoveryCacheDocument {
  if (new TextEncoder().encode(raw).byteLength > PUBLIC_DISCOVERY_CACHE_MAX_BYTES) {
    throw new Error('Public discovery cache exceeds its byte budget.');
  }
  const candidate: unknown = JSON.parse(raw);
  if (!isObject(candidate) || candidate.schemaVersion !== PUBLIC_DISCOVERY_CACHE_SCHEMA) {
    throw new Error('Public discovery cache has an unsupported schema.');
  }
  const lists: Partial<Record<DiscoveryCountry, TimedValue<PublicRoleProfileList>>> = {};
  if (isObject(candidate.lists)) {
    for (const country of ['CA', 'US'] as const) {
      const entry = candidate.lists[country];
      if (!isObject(entry) || !validSavedAt(entry.savedAt, now)) continue;
      const value = parsePublicRoleProfileList(entry.value, 'client');
      if (value.filters.countryCode !== country) continue;
      lists[country] = { savedAt: entry.savedAt, value };
    }
  }
  const profiles: Record<string, TimedValue<PublicRoleProfile>> = {};
  if (isObject(candidate.profiles)) {
    for (const [profileId, entry] of Object.entries(candidate.profiles)) {
      if (!isObject(entry) || !validSavedAt(entry.savedAt, now)) continue;
      const value = parsePublicRoleProfile(entry.value, 'client');
      if (value.profileId !== profileId) continue;
      profiles[profileId] = { savedAt: entry.savedAt, value };
    }
  }
  return { schemaVersion: PUBLIC_DISCOVERY_CACHE_SCHEMA, lists, profiles };
}

async function readCache(
  cache: PublicDiscoveryCachePort,
  now: number,
): Promise<PublicDiscoveryCacheDocument> {
  try {
    const raw = await cache.read();
    return raw === null ? emptyDocument() : parseCacheDocument(raw, now);
  } catch {
    return emptyDocument();
  }
}

async function writeCache(
  cache: PublicDiscoveryCachePort,
  document: PublicDiscoveryCacheDocument,
): Promise<void> {
  try {
    const serialized = JSON.stringify(document);
    if (new TextEncoder().encode(serialized).byteLength > PUBLIC_DISCOVERY_CACHE_MAX_BYTES) return;
    await cache.write(serialized);
  } catch {
    // A public cache failure must not turn a successful public API read into a product failure.
  }
}

async function withinRequestBudget<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error('Public discovery request exceeded its latency budget.')),
          milliseconds,
        );
      }),
    ]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

export function createPublicDiscoveryRepository(input: {
  readonly cache: PublicDiscoveryCachePort;
  readonly now?: () => Date;
  readonly remote: PublicDiscoveryRemotePort;
  readonly requestBudgetMilliseconds?: number;
}): PublicDiscoveryRepository {
  const now = input.now ?? (() => new Date());
  const requestBudget =
    input.requestBudgetMilliseconds ?? PUBLIC_DISCOVERY_REQUEST_BUDGET_MILLISECONDS;

  return Object.freeze({
    clearPublicCache: () => input.cache.clear(),
    readProfiles: async (
      country: DiscoveryCountry,
    ): Promise<DiscoveryRead<PublicRoleProfileList>> => {
      try {
        const value = await withinRequestBudget(input.remote.readProfiles(country), requestBudget);
        const savedAt = now().toISOString();
        const document = await readCache(input.cache, now().getTime());
        await writeCache(input.cache, {
          ...document,
          lists: { ...document.lists, [country]: { savedAt, value } },
        });
        return { cachedAt: null, source: 'network' as const, value };
      } catch {
        const document = await readCache(input.cache, now().getTime());
        const cached = document.lists[country];
        if (cached === undefined) throw new PublicDiscoveryUnavailableError('deck');
        return { cachedAt: cached.savedAt, source: 'public_cache' as const, value: cached.value };
      }
    },
    readProfile: async (profileId: string): Promise<DiscoveryRead<PublicRoleProfile>> => {
      try {
        const value = await withinRequestBudget(input.remote.readProfile(profileId), requestBudget);
        const savedAt = now().toISOString();
        const document = await readCache(input.cache, now().getTime());
        const profileEntries = Object.entries(document.profiles)
          .sort((left, right) => right[1].savedAt.localeCompare(left[1].savedAt))
          .slice(0, 49);
        await writeCache(input.cache, {
          ...document,
          profiles: Object.fromEntries([...profileEntries, [profileId, { savedAt, value }]]),
        });
        return { cachedAt: null, source: 'network' as const, value };
      } catch {
        const document = await readCache(input.cache, now().getTime());
        const cached = document.profiles[profileId];
        if (cached === undefined) throw new PublicDiscoveryUnavailableError('profile');
        return { cachedAt: cached.savedAt, source: 'public_cache' as const, value: cached.value };
      }
    },
  });
}

export function createMemoryPublicDiscoveryCachePort(): PublicDiscoveryCachePort & {
  readonly snapshot: () => string | null;
} {
  let value: string | null = null;
  return Object.freeze({
    clear: async () => {
      value = null;
    },
    read: async () => value,
    snapshot: () => value,
    write: async (nextValue: string) => {
      value = nextValue;
    },
  });
}
