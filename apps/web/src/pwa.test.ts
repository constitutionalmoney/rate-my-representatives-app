import { describe, expect, it, vi } from 'vitest';

import { registerPublicDiscoveryWorker } from './pwa.js';

describe('public discovery PWA registration', () => {
  it('registers only in production and degrades without affecting public browsing', async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    await expect(registerPublicDiscoveryWorker({ register }, false)).resolves.toBe('unavailable');
    expect(register).not.toHaveBeenCalled();
    await expect(registerPublicDiscoveryWorker({ register }, true)).resolves.toBe('registered');
    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/', updateViaCache: 'none' });
    await expect(
      registerPublicDiscoveryWorker(
        { register: vi.fn().mockRejectedValue(new Error('unsupported')) },
        true,
      ),
    ).resolves.toBe('unavailable');
  });
});
