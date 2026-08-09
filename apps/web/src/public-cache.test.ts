import { describe, expect, it } from 'vitest';

import {
  createWebPublicDiscoveryCache,
  resolveWebPublicStorage,
  WEB_PUBLIC_DISCOVERY_CACHE_KEY,
} from './public-cache.js';

describe('web public discovery cache port', () => {
  it('uses one namespaced public-only storage entry and supports explicit clearing', async () => {
    const values = new Map<string, string>();
    const cache = createWebPublicDiscoveryCache({
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, value),
    });
    await cache.write('{"schemaVersion":"public-discovery-cache.v1"}');
    expect([...values.keys()]).toEqual([WEB_PUBLIC_DISCOVERY_CACHE_KEY]);
    await expect(cache.read()).resolves.toContain('public-discovery-cache.v1');
    await cache.clear();
    await expect(cache.read()).resolves.toBeNull();
  });

  it('falls back to memory when browser storage is unavailable', () => {
    const storage = resolveWebPublicStorage({
      get localStorage(): Storage {
        throw new Error('blocked');
      },
    });
    storage.setItem('public', 'value');
    expect(storage.getItem('public')).toBe('value');
    storage.removeItem('public');
    expect(storage.getItem('public')).toBeNull();
  });
});
