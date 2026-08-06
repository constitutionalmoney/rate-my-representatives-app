const SENSITIVE_KEYS = new Set([
  'address',
  'authorization',
  'cookie',
  'evidence',
  'identityevidence',
  'location',
  'moderatornotes',
  'passphrase',
  'preciselocation',
  'privatekey',
  'seed',
  'seedphrase',
  'signal',
  'wif',
]);

function normalizedKey(key: string): string {
  return key.toLowerCase().replaceAll(/[^a-z]/g, '');
}

export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redactSensitive(item));
  if (value === null || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.has(normalizedKey(key)) ? '[REDACTED]' : redactSensitive(item),
    ]),
  );
}

export interface StructuredEvent {
  readonly event: string;
  readonly fields: unknown;
  readonly timestamp: string;
}

export function createStructuredEvent(
  event: string,
  fields: Readonly<Record<string, unknown>> = {},
  timestamp = new Date().toISOString(),
): StructuredEvent {
  return Object.freeze({
    event,
    fields: redactSensitive(fields),
    timestamp,
  });
}
