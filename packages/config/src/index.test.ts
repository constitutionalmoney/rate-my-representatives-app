import { describe, expect, it } from 'vitest';

import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_NAMES,
  loadFeatureFlags,
  loadRuntimeConfig,
} from './index.js';

describe('foundation configuration', () => {
  it('keeps every high-risk feature disabled by default', () => {
    expect(FEATURE_FLAG_NAMES).toHaveLength(13);
    expect(Object.values(DEFAULT_FEATURE_FLAGS).every((value) => value === false)).toBe(true);
    expect(loadFeatureFlags()).toEqual(DEFAULT_FEATURE_FLAGS);
  });

  it('accepts only explicit boolean feature values', () => {
    expect(loadFeatureFlags({ VERUS_AUTH_ENABLED: 'true' }).VERUS_AUTH_ENABLED).toBe(true);
    expect(() => loadFeatureFlags({ VERUS_AUTH_ENABLED: '1' })).toThrow(/exactly/);
  });

  it('provides a typed, local-only runtime baseline', () => {
    const config = loadRuntimeConfig({ NODE_ENV: 'test', PORT: '4100' });
    expect(config.environment).toBe('test');
    expect(config.port).toBe(4100);
    expect(config.featureFlags.VERUS_ANCHORING_ENABLED).toBe(false);
  });
});
