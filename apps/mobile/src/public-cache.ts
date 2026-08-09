import { File, Paths } from 'expo-file-system';

import type { PublicDiscoveryCachePort } from '@rmr/discovery';

const cacheFile = new File(Paths.cache, 'rmr-public-discovery-cache.v1.json');

export const mobilePublicDiscoveryCache: PublicDiscoveryCachePort = Object.freeze({
  clear: async () => {
    if (cacheFile.exists) cacheFile.delete();
  },
  read: async () => (cacheFile.exists ? cacheFile.text() : null),
  write: async (value: string) => {
    if (!cacheFile.exists) cacheFile.create({ intermediates: true });
    cacheFile.write(value);
  },
});
