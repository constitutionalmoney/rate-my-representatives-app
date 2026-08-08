import type { MobileEnvironment } from '../mobile-environments';
import { authorizeWalletLaunch, parseNativeLink } from './links';

export type WalletHarnessStatus =
  'approved' | 'cancelled' | 'declined' | 'expired' | 'failed' | 'pending';

export type WalletHarnessPort = Readonly<{
  openHttpsFallback(url: string): Promise<void>;
  openWallet(url: string): Promise<boolean>;
  pollResult(challengeReference: string): Promise<WalletHarnessStatus>;
  wait(milliseconds: number): Promise<void>;
}>;

export type WalletHarnessRequest = Readonly<{
  challengeReference: string;
  expiresAt: string;
  rmrOrigin: string;
  walletUrl: string;
}>;

const challengeReferencePattern = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{15,127}$/u;

export async function launchWalletHarness(input: {
  environment: MobileEnvironment;
  explicitUserGesture: boolean;
  featureEnabled: boolean;
  now: string;
  port: WalletHarnessPort;
  request: WalletHarnessRequest;
}): Promise<Readonly<{ transport: 'https_fallback' | 'wallet' }>> {
  if (!challengeReferencePattern.test(input.request.challengeReference)) {
    throw new Error('Wallet challenge reference is invalid.');
  }
  const expectedOrigin = `https://${input.environment.appLinkHost}`;
  const launch = authorizeWalletLaunch({
    displayedRmrOrigin: input.request.rmrOrigin,
    expectedRmrOrigin: expectedOrigin,
    explicitUserGesture: input.explicitUserGesture,
    expiresAt: input.request.expiresAt,
    featureEnabled: input.featureEnabled,
    network: input.environment.verusNetwork === 'VRSCTEST' ? 'VRSCTEST' : 'VRSC',
    now: input.now,
    url: input.request.walletUrl,
  });
  if (!launch.allowed) throw new Error(`Wallet launch rejected: ${launch.reason}.`);
  if (await input.port.openWallet(launch.url)) return { transport: 'wallet' };
  await input.port.openHttpsFallback(
    `${expectedOrigin}/wallet/help/${encodeURIComponent(input.request.challengeReference)}`,
  );
  return { transport: 'https_fallback' };
}

export function acceptWalletReturn(input: {
  challengeReference: string;
  environment: MobileEnvironment;
  url: string;
}): boolean {
  const decision = parseNativeLink(input.url, input.environment);
  return (
    decision.accepted &&
    decision.route.kind === 'wallet_result' &&
    decision.route.challengeReference === input.challengeReference
  );
}

export async function recoverWalletResult(input: {
  challengeReference: string;
  expiresAt: string;
  maxAttempts: number;
  now(): string;
  pollIntervalMilliseconds: number;
  port: WalletHarnessPort;
}): Promise<Exclude<WalletHarnessStatus, 'pending'>> {
  if (!challengeReferencePattern.test(input.challengeReference)) {
    throw new Error('Wallet challenge reference is invalid.');
  }
  if (
    !Number.isInteger(input.maxAttempts) ||
    input.maxAttempts < 1 ||
    input.maxAttempts > 20 ||
    !Number.isInteger(input.pollIntervalMilliseconds) ||
    input.pollIntervalMilliseconds < 250 ||
    input.pollIntervalMilliseconds > 30_000
  ) {
    throw new Error('Wallet polling policy is invalid.');
  }
  const expiry = Date.parse(input.expiresAt);
  if (!Number.isFinite(expiry)) throw new Error('Wallet expiry is invalid.');
  for (let attempt = 0; attempt < input.maxAttempts; attempt += 1) {
    const now = Date.parse(input.now());
    if (!Number.isFinite(now)) return 'failed';
    if (now >= expiry) return 'expired';
    const result = await input.port.pollResult(input.challengeReference);
    if (result !== 'pending') return result;
    if (attempt + 1 < input.maxAttempts) await input.port.wait(input.pollIntervalMilliseconds);
  }
  return 'failed';
}
