import { describe, expect, it } from 'vitest';

import { createRedactedCrashRecord } from './crash-privacy';

describe('privacy-safe native crash boundary', () => {
  it('allowlists operational fields and discards error messages/private context', () => {
    const error = new Error('private signal and wallet payload must not escape');
    const record = createRedactedCrashRecord({
      appBuild: 1,
      appVersion: '0.1.0',
      environment: 'staging',
      error,
      occurredAt: '2026-08-07T15:00:00Z',
      platform: 'android',
      routeKind: 'profile',
    });
    expect(record.errorType).toBe('Error');
    expect(JSON.stringify(record)).not.toContain(error.message);
    expect(Object.keys(record).sort()).toEqual([
      'appBuild',
      'appVersion',
      'code',
      'environment',
      'errorType',
      'occurredAt',
      'platform',
      'routeKind',
    ]);
  });
});
