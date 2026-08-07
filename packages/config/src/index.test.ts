import { describe, expect, it } from 'vitest';

import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_NAMES,
  FeatureGateDeniedError,
  FeatureGateEvaluator,
  loadFeatureFlags,
  loadRuntimeConfig,
  type FeatureGateAuditRecord,
} from './index.js';

describe('typed runtime configuration', () => {
  it('keeps every high-risk feature disabled by default', () => {
    expect(FEATURE_FLAG_NAMES).toHaveLength(25);
    expect(Object.values(DEFAULT_FEATURE_FLAGS).every((value) => value === false)).toBe(true);
    expect(loadFeatureFlags()).toEqual(DEFAULT_FEATURE_FLAGS);
  });

  it('accepts only explicit boolean feature values', () => {
    expect(loadFeatureFlags({ PASSKEY_AUTH_ENABLED: 'true' }).PASSKEY_AUTH_ENABLED).toBe(true);
    expect(() => loadFeatureFlags({ VERUS_AUTH_ENABLED: '1' })).toThrow(/exactly/);
  });

  it('rejects unsafe feature dependency combinations', () => {
    expect(() => loadFeatureFlags({ VERUS_IDENTITY_UPDATE_ENABLED: 'true' })).toThrow(
      /requires enabled feature gates/,
    );
    expect(
      loadFeatureFlags({
        REPRESENTATIVE_CLAIMS_ENABLED: 'true',
        VERUS_IDENTITY_UPDATE_ENABLED: 'true',
        VERUS_ID_LINKING_ENABLED: 'true',
      }).VERUS_IDENTITY_UPDATE_ENABLED,
    ).toBe(true);
  });

  it('provides a typed, local-only runtime baseline', () => {
    const config = loadRuntimeConfig({ NODE_ENV: 'test', PORT: '4100' });
    expect(config.environment).toBe('test');
    expect(config.host).toBe('127.0.0.1');
    expect(config.port).toBe(4100);
    expect(config.featureFlags.VERUS_ANCHORING_ENABLED).toBe(false);
    expect(config.featureFlags.SOURCE_INGESTION_ENABLED).toBe(false);
  });

  it('allows an explicit all-interface bind for a container and rejects arbitrary hosts', () => {
    expect(loadRuntimeConfig({ HOST: '0.0.0.0' }).host).toBe('0.0.0.0');
    expect(() => loadRuntimeConfig({ HOST: 'public.example' })).toThrow(/HOST/);
  });
});

describe('audited feature gates', () => {
  it('denies by default and records every decision without actor data', () => {
    const records: FeatureGateAuditRecord[] = [];
    const evaluator = new FeatureGateEvaluator(
      DEFAULT_FEATURE_FLAGS,
      { record: (entry) => records.push(entry) },
      () => new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(() =>
      evaluator.assertEnabled('EVIDENCE_SUBMISSION_ENABLED', {
        boundary: 'domain',
        operation: 'submit-evidence',
      }),
    ).toThrow(FeatureGateDeniedError);
    expect(records).toEqual([
      {
        boundary: 'domain',
        decision: 'deny',
        evaluatedAt: '2026-01-01T00:00:00.000Z',
        feature: 'EVIDENCE_SUBMISSION_ENABLED',
        operation: 'submit-evidence',
        reason: 'disabled-by-default',
      },
    ]);
  });

  it('allows only an explicitly enabled flag and audits the allow', () => {
    const records: FeatureGateAuditRecord[] = [];
    const evaluator = new FeatureGateEvaluator(
      loadFeatureFlags({ PASSKEY_AUTH_ENABLED: 'true' }),
      { record: (entry) => records.push(entry) },
      () => new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(
      evaluator.evaluate('PASSKEY_AUTH_ENABLED', {
        boundary: 'route',
        operation: 'begin-passkey-authentication',
      }),
    ).toBe(true);
    expect(records[0]?.decision).toBe('allow');
  });
});
