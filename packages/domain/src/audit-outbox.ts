export const AUDIT_ACTOR_TYPES = [
  'human',
  'representative',
  'staff',
  'reviewer',
  'admin',
  'service',
  'agent',
] as const;

export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number];

export const AUDIT_PRIVACY_CLASSES = ['public', 'internal', 'restricted', 'security'] as const;

export type AuditPrivacyClass = (typeof AUDIT_PRIVACY_CLASSES)[number];

export const OUTBOX_EVENT_TYPES = [
  'notification.dispatch',
  'search.index',
  'aggregate.recompute',
  'source.retrieve',
  'ai.draft.requested',
  'public_manifest.materialize',
  'provenance.anchor.requested',
] as const;

export type OutboxEventType = (typeof OUTBOX_EVENT_TYPES)[number];

export type JsonValue =
  boolean | number | string | null | JsonValue[] | { [key: string]: JsonValue };

export interface AuditEventInput {
  readonly eventId: string;
  readonly eventSchema: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly actorType: AuditActorType;
  readonly actorRef: string;
  readonly action: string;
  readonly priorStateRef: string | null;
  readonly newStateRef: string | null;
  readonly policyVersion: string;
  readonly methodVersion: string;
  readonly consentVersion: string | null;
  readonly requestId: string;
  readonly idempotencyKey: string;
  readonly correlationId: string;
  readonly occurredAt: string;
  readonly reasonCode: string;
  readonly reasonRef: string | null;
  readonly privacyClass: AuditPrivacyClass;
  readonly redactionVersion: string;
  readonly codeRevision: string;
  readonly environment: string;
  readonly safeDetail: Readonly<Record<string, JsonValue>>;
}

export interface OutboxEventInput {
  readonly eventId: string;
  readonly eventType: OutboxEventType;
  readonly eventSchema: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly idempotencyKey: string;
  readonly correlationId: string;
  readonly privacyClass: AuditPrivacyClass;
  readonly payload: Readonly<Record<string, JsonValue>>;
  readonly availableAt: string;
  readonly maxAttempts: number;
}

const PROHIBITED_AUDIT_KEYS = new Set([
  'accountid',
  'address',
  'abuseindicator',
  'categoryrating',
  'coordinate',
  'coordinates',
  'credential',
  'email',
  'evidence',
  'identityevidence',
  'identityproof',
  'location',
  'latitude',
  'longitude',
  'moderatornotes',
  'passphrase',
  'passkey',
  'preciseaddress',
  'preciselocation',
  'postalcode',
  'providerquery',
  'preference',
  'privateactivity',
  'privatekey',
  'recoverytoken',
  'representativesignal',
  'seed',
  'seedphrase',
  'signal',
  'subscription',
  'token',
  'walletpayload',
  'walletrequest',
  'wif',
]);

function normalizedKey(key: string): string {
  return key.toLowerCase().replaceAll(/[^a-z]/g, '');
}

function findProhibitedKey(value: JsonValue, path: readonly string[]): string | undefined {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      const match = findProhibitedKey(item, [...path, String(index)]);
      if (match) return match;
    }
    return undefined;
  }
  if (value === null || typeof value !== 'object') return undefined;

  for (const [key, item] of Object.entries(value)) {
    const childPath = [...path, key];
    if (PROHIBITED_AUDIT_KEYS.has(normalizedKey(key))) return childPath.join('.');
    const match = findProhibitedKey(item, childPath);
    if (match) return match;
  }
  return undefined;
}

export function assertAuditSafePayload(
  value: Readonly<Record<string, JsonValue>>,
): asserts value is Readonly<Record<string, JsonValue>> {
  const prohibitedPath = findProhibitedKey(value, []);
  if (prohibitedPath) {
    throw new Error(`Audit/outbox payload contains prohibited field: ${prohibitedPath}`);
  }
}

export interface RetryPolicy {
  readonly baseDelayMs: number;
  readonly maximumDelayMs: number;
  readonly jitterRatio: number;
}

export interface RetryDecision {
  readonly disposition: 'retry' | 'dead-letter';
  readonly delayMs: number;
}

export const DEFAULT_OUTBOX_RETRY_POLICY: RetryPolicy = Object.freeze({
  baseDelayMs: 1_000,
  maximumDelayMs: 15 * 60 * 1_000,
  jitterRatio: 0.2,
});

function stableUnitInterval(seed: string): number {
  let hash = 2_166_136_261;
  for (const character of seed) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) / 4_294_967_295;
}

export function decideOutboxRetry(
  eventId: string,
  failedAttempt: number,
  maxAttempts: number,
  policy: RetryPolicy = DEFAULT_OUTBOX_RETRY_POLICY,
): RetryDecision {
  if (!Number.isInteger(failedAttempt) || failedAttempt < 1) {
    throw new Error('failedAttempt must be a positive integer.');
  }
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error('maxAttempts must be a positive integer.');
  }
  if (failedAttempt >= maxAttempts) return { disposition: 'dead-letter', delayMs: 0 };

  const exponential = Math.min(
    policy.maximumDelayMs,
    policy.baseDelayMs * 2 ** Math.min(failedAttempt - 1, 30),
  );
  const jitter = (stableUnitInterval(`${eventId}:${failedAttempt}`) * 2 - 1) * policy.jitterRatio;
  return {
    disposition: 'retry',
    delayMs: Math.max(0, Math.round(exponential * (1 + jitter))),
  };
}
