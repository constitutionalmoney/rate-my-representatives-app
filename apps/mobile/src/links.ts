import type { MobileEnvironment } from '../mobile-environments';
import { containsUnsafeControlCharacter } from './text-safety';

export type NativeRoute =
  | Readonly<{ kind: 'notifications' }>
  | Readonly<{ kind: 'profile'; profileId: string }>
  | Readonly<{ challengeReference: string; kind: 'wallet_result' }>;

export type LinkDecision =
  | Readonly<{ accepted: true; route: NativeRoute }>
  | Readonly<{ accepted: false; reason: 'environment_mismatch' | 'invalid' | 'unsafe' }>;

const stableIdentifier = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/u;

function decodeIdentifier(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  try {
    const decoded = decodeURIComponent(value);
    return stableIdentifier.test(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
}

export function parseNativeLink(raw: string, environment: MobileEnvironment): LinkDecision {
  if (raw.length < 1 || raw.length > 2048 || containsUnsafeControlCharacter(raw)) {
    return { accepted: false, reason: 'unsafe' };
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { accepted: false, reason: 'invalid' };
  }
  if (
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.hash.length > 0 ||
    [...url.searchParams.keys()].length > 0
  ) {
    return { accepted: false, reason: 'unsafe' };
  }
  let path: string;
  if (url.protocol === 'https:') {
    if (url.hostname !== environment.appLinkHost || url.port.length > 0) {
      return { accepted: false, reason: 'environment_mismatch' };
    }
    path = url.pathname;
  } else if (url.protocol === `${environment.scheme}:`) {
    if (url.hostname !== 'app') return { accepted: false, reason: 'environment_mismatch' };
    path = `/app${url.pathname}`;
  } else {
    return { accepted: false, reason: 'environment_mismatch' };
  }
  const segments = path.split('/').filter(Boolean);
  if (segments[0] !== 'app') return { accepted: false, reason: 'invalid' };
  if (segments.length === 3 && segments[1] === 'profiles') {
    const profileId = decodeIdentifier(segments[2]);
    return profileId === undefined
      ? { accepted: false, reason: 'invalid' }
      : { accepted: true, route: { kind: 'profile', profileId } };
  }
  if (segments.length === 3 && segments[1] === 'settings' && segments[2] === 'notifications') {
    return { accepted: true, route: { kind: 'notifications' } };
  }
  if (segments.length === 4 && segments[1] === 'wallet' && segments[2] === 'result') {
    const challengeReference = decodeIdentifier(segments[3]);
    return challengeReference === undefined
      ? { accepted: false, reason: 'invalid' }
      : { accepted: true, route: { challengeReference, kind: 'wallet_result' } };
  }
  return { accepted: false, reason: 'invalid' };
}

export type WalletLaunchDecision =
  | Readonly<{ allowed: true; url: string }>
  | Readonly<{
      allowed: false;
      reason:
        | 'disabled'
        | 'environment_mismatch'
        | 'expired'
        | 'origin_not_confirmed'
        | 'unsafe_url'
        | 'user_gesture_required';
    }>;

export function authorizeWalletLaunch(input: {
  displayedRmrOrigin: string;
  expectedRmrOrigin: string;
  explicitUserGesture: boolean;
  expiresAt: string;
  featureEnabled: boolean;
  network: 'VRSCTEST' | 'VRSC';
  now: string;
  url: string;
}): WalletLaunchDecision {
  if (!input.featureEnabled) return { allowed: false, reason: 'disabled' };
  if (!input.explicitUserGesture) return { allowed: false, reason: 'user_gesture_required' };
  if (input.network !== 'VRSCTEST') return { allowed: false, reason: 'environment_mismatch' };
  if (input.displayedRmrOrigin !== input.expectedRmrOrigin) {
    return { allowed: false, reason: 'origin_not_confirmed' };
  }
  const now = Date.parse(input.now);
  const expiresAt = Date.parse(input.expiresAt);
  if (!Number.isFinite(now) || !Number.isFinite(expiresAt) || expiresAt <= now) {
    return { allowed: false, reason: 'expired' };
  }
  if (
    input.url.length < 1 ||
    input.url.length > 8192 ||
    containsUnsafeControlCharacter(input.url)
  ) {
    return { allowed: false, reason: 'unsafe_url' };
  }
  let url: URL;
  try {
    url = new URL(input.url);
  } catch {
    return { allowed: false, reason: 'unsafe_url' };
  }
  if (
    url.protocol !== 'verus:' ||
    url.hostname !== 'request' ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.hash.length > 0 ||
    url.search.length > 0 ||
    !/^\/[A-Za-z0-9_-]{16,4096}$/u.test(url.pathname)
  ) {
    return { allowed: false, reason: 'unsafe_url' };
  }
  return { allowed: true, url: url.toString() };
}
