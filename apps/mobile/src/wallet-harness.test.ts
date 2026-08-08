import { describe, expect, it, vi } from 'vitest';

import { mobileEnvironments } from '../mobile-environments';
import {
  acceptWalletReturn,
  launchWalletHarness,
  recoverWalletResult,
  type WalletHarnessPort,
  type WalletHarnessStatus,
} from './wallet-harness';

function createPort(input?: {
  canOpen?: boolean;
  results?: WalletHarnessStatus[];
}): WalletHarnessPort & {
  openHttpsFallback: ReturnType<typeof vi.fn>;
  openWallet: ReturnType<typeof vi.fn>;
  pollResult: ReturnType<typeof vi.fn>;
  wait: ReturnType<typeof vi.fn>;
} {
  const results = [...(input?.results ?? ['pending', 'approved'])];
  return {
    openHttpsFallback: vi.fn(async () => undefined),
    openWallet: vi.fn(async () => input?.canOpen ?? true),
    pollResult: vi.fn(async () => results.shift() ?? 'failed'),
    wait: vi.fn(async () => undefined),
  };
}

const request = {
  challengeReference: 'challenge:synthetic:0001',
  expiresAt: '2026-08-07T15:05:00Z',
  rmrOrigin: 'https://staging-connect.ratemyrepresentatives.com',
  walletUrl: 'verus://request/synthetic-public-envelope',
};

describe('no-real-key Verus Mobile handoff harness', () => {
  it('launches only from an explicit VRSCTEST gesture and uses an RMR HTTPS fallback', async () => {
    const walletPort = createPort();
    await expect(
      launchWalletHarness({
        environment: mobileEnvironments.staging,
        explicitUserGesture: true,
        featureEnabled: true,
        now: '2026-08-07T15:00:00Z',
        port: walletPort,
        request,
      }),
    ).resolves.toEqual({ transport: 'wallet' });

    const fallbackPort = createPort({ canOpen: false });
    await expect(
      launchWalletHarness({
        environment: mobileEnvironments.staging,
        explicitUserGesture: true,
        featureEnabled: true,
        now: '2026-08-07T15:00:00Z',
        port: fallbackPort,
        request,
      }),
    ).resolves.toEqual({ transport: 'https_fallback' });
    expect(fallbackPort.openHttpsFallback).toHaveBeenCalledWith(
      'https://staging-connect.ratemyrepresentatives.com/wallet/help/challenge%3Asynthetic%3A0001',
    );
    await expect(
      launchWalletHarness({
        environment: mobileEnvironments.production,
        explicitUserGesture: true,
        featureEnabled: true,
        now: '2026-08-07T15:00:00Z',
        port: walletPort,
        request: {
          ...request,
          rmrOrigin: 'https://connect.ratemyrepresentatives.com',
        },
      }),
    ).rejects.toThrow('environment_mismatch');
  });

  it('binds cold, warm, and background returns to the exact public challenge reference', () => {
    for (const url of [
      'https://staging-connect.ratemyrepresentatives.com/app/wallet/result/challenge%3Asynthetic%3A0001',
      'rmr-staging://app/wallet/result/challenge%3Asynthetic%3A0001',
    ]) {
      expect(
        acceptWalletReturn({
          challengeReference: request.challengeReference,
          environment: mobileEnvironments.staging,
          url,
        }),
      ).toBe(true);
    }
    expect(
      acceptWalletReturn({
        challengeReference: request.challengeReference,
        environment: mobileEnvironments.staging,
        url: 'rmr-staging://app/wallet/result/challenge%3Asynthetic%3Aattacker',
      }),
    ).toBe(false);
  });

  it('recovers approved and decline results by bounded polling and expires closed', async () => {
    const approvedPort = createPort({ results: ['pending', 'approved'] });
    await expect(
      recoverWalletResult({
        challengeReference: request.challengeReference,
        expiresAt: request.expiresAt,
        maxAttempts: 3,
        now: () => '2026-08-07T15:00:00Z',
        pollIntervalMilliseconds: 250,
        port: approvedPort,
      }),
    ).resolves.toBe('approved');
    expect(approvedPort.wait).toHaveBeenCalledOnce();

    const declinedPort = createPort({ results: ['declined'] });
    await expect(
      recoverWalletResult({
        challengeReference: request.challengeReference,
        expiresAt: request.expiresAt,
        maxAttempts: 3,
        now: () => '2026-08-07T15:00:00Z',
        pollIntervalMilliseconds: 250,
        port: declinedPort,
      }),
    ).resolves.toBe('declined');

    const expiredPort = createPort();
    await expect(
      recoverWalletResult({
        challengeReference: request.challengeReference,
        expiresAt: request.expiresAt,
        maxAttempts: 3,
        now: () => '2026-08-07T15:05:00Z',
        pollIntervalMilliseconds: 250,
        port: expiredPort,
      }),
    ).resolves.toBe('expired');
    expect(expiredPort.pollResult).not.toHaveBeenCalled();

    await expect(
      recoverWalletResult({
        challengeReference: request.challengeReference,
        expiresAt: request.expiresAt,
        maxAttempts: 3,
        now: () => 'invalid-clock',
        pollIntervalMilliseconds: 250,
        port: createPort(),
      }),
    ).resolves.toBe('failed');
  });
});
