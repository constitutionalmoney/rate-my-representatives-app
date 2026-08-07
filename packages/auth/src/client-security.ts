import { createHash, timingSafeEqual } from 'node:crypto';

import type { AuthenticatedSession } from './contracts.js';

export const WEB_SESSION_COOKIE_NAME = '__Host-rmr_session';

export const WEB_SESSION_POLICY = Object.freeze({
  cookieDomainAllowed: false,
  httpOnly: true,
  path: '/',
  sameSite: 'Lax',
  secure: true,
});

export const AUTH_SCREEN_ANALYTICS_POLICY = Object.freeze({
  sessionReplayAllowed: false,
  thirdPartyAnalyticsAllowed: false,
});

export type SensitiveStateClearReason =
  'account-deletion' | 'device-compromise' | 'session-revoked' | 'sign-out';

export interface NativeSessionVault {
  readonly protection: 'android-keystore' | 'ios-keychain' | 'plain-storage';
  clear(): Promise<void>;
  set(value: string): Promise<void>;
}

export interface SensitiveClientCache {
  clearSensitiveState(reason: SensitiveStateClearReason): Promise<void>;
}

export class InsecureSessionStorageError extends Error {
  constructor() {
    super('Session material requires approved operating-system secure storage.');
    this.name = 'InsecureSessionStorageError';
  }
}

export async function storeNativeSessionMaterial(
  vault: NativeSessionVault,
  session: AuthenticatedSession,
): Promise<void> {
  if (vault.protection === 'plain-storage') throw new InsecureSessionStorageError();
  await vault.set(session.sessionToken);
}

export async function clearSensitiveClientState(
  vault: NativeSessionVault,
  caches: readonly SensitiveClientCache[],
  reason: SensitiveStateClearReason,
): Promise<void> {
  await vault.clear();
  await Promise.all(caches.map(async (cache) => cache.clearSensitiveState(reason)));
}

export function createWebSessionCookie(sessionToken: string, maxAgeSeconds: number): string {
  if (!/^[A-Za-z0-9-]+\.[A-Za-z0-9_-]+$/.test(sessionToken)) {
    throw new Error('Session token contains invalid cookie characters.');
  }
  if (!Number.isInteger(maxAgeSeconds) || maxAgeSeconds < 1) {
    throw new Error('Session cookie max age must be a positive integer.');
  }
  return `${WEB_SESSION_COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=${maxAgeSeconds}; Secure; HttpOnly; SameSite=Lax`;
}

export function hashCsrfToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface CsrfRequest {
  readonly expectedOrigin: string;
  readonly expectedTokenHash: string;
  readonly method: string;
  readonly origin: string | null;
  readonly presentedToken: string | null;
}

export function isCsrfRequestValid(request: CsrfRequest): boolean {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return true;
  }
  if (request.origin !== request.expectedOrigin || !request.presentedToken) return false;
  const expected = Buffer.from(request.expectedTokenHash, 'hex');
  const presented = Buffer.from(hashCsrfToken(request.presentedToken), 'hex');
  return expected.length === presented.length && timingSafeEqual(expected, presented);
}
