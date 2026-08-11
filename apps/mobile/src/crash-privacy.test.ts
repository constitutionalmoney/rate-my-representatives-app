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

  it.each(['CitizenScoreError', 'IdeologyProfileError', 'SocialCreditError'])(
    'does not emit generalized citizen-profile error type %s',
    (name) => {
      const error = new Error('synthetic');
      error.name = name;
      expect(
        createRedactedCrashRecord({
          appBuild: 1,
          appVersion: '0.1.0',
          environment: 'development',
          error,
          occurredAt: '2026-08-11T12:00:00Z',
          platform: 'ios',
          routeKind: 'foundation',
        }).errorType,
      ).toBe('UnknownError');
    },
  );
});
