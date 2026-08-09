import type { PublicDiscoveryCachePort } from '@rmr/discovery';

export const WEB_PUBLIC_DISCOVERY_CACHE_KEY = 'rmr.public-discovery-cache.v1';

export interface PublicStorage {
  readonly getItem: (key: string) => string | null;
  readonly removeItem: (key: string) => void;
  readonly setItem: (key: string, value: string) => void;
}

export function createWebPublicDiscoveryCache(storage: PublicStorage): PublicDiscoveryCachePort {
  return Object.freeze({
    clear: async () => storage.removeItem(WEB_PUBLIC_DISCOVERY_CACHE_KEY),
    read: async () => storage.getItem(WEB_PUBLIC_DISCOVERY_CACHE_KEY),
    write: async (value: string) => storage.setItem(WEB_PUBLIC_DISCOVERY_CACHE_KEY, value),
  });
}

export function resolveWebPublicStorage(windowLike: Pick<Window, 'localStorage'>): PublicStorage {
  try {
    const storage = windowLike.localStorage;
    const probe = 'rmr.public-discovery-cache.probe';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (key) => memory.get(key) ?? null,
      removeItem: (key) => {
        memory.delete(key);
      },
      setItem: (key, value) => {
        memory.set(key, value);
      },
    };
  }
}
