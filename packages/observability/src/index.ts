const SENSITIVE_KEYS = new Set([
  'accountid',
  'address',
  'abuseindicator',
  'actorid',
  'assertion',
  'authorization',
  'browsinghistory',
  'challenge',
  'categoryrating',
  'coordinate',
  'coordinates',
  'cookie',
  'crossproductsubjectid',
  'credential',
  'csrftoken',
  'deviceid',
  'email',
  'evidence',
  'identityevidence',
  'identityproof',
  'identifier',
  'ideologyprofile',
  'ideologyscore',
  'location',
  'latitude',
  'longitude',
  'moderatornotes',
  'passphrase',
  'passkey',
  'politicalbelief',
  'politicalprofile',
  'preciseaddress',
  'preciselocation',
  'postalcode',
  'providerquery',
  'preference',
  'privateactivity',
  'privatekey',
  'recoverytoken',
  'requestid',
  'representativesignal',
  'representativefollowed',
  'role',
  'rolegrants',
  'seed',
  'seedphrase',
  'signal',
  'subscription',
  'topicread',
  'session',
  'sessionid',
  'sessiontoken',
  'token',
  'walletpayload',
  'walletrequest',
  'votingchoice',
  'wif',
]);

const PROHIBITED_GENERALIZED_PROFILE_KEYS = new Set([
  'citizenriskscore',
  'citizenscore',
  'civicrank',
  'civicreputation',
  'civicworth',
  'conformityscore',
  'ideologyprofile',
  'ideologyscore',
  'loyaltyscore',
  'politicalprofile',
  'reputationscore',
  'socialcredit',
  'trustscore',
  'trustworthinessscore',
]);

const PROHIBITED_GENERALIZED_PROFILE_PATTERN =
  /(citizen.*(?:score|rank|risk|trust)|civic(?:rank|reputation|worth)|ideology(?:profile|score)|loyaltyscore|politicalprofile|reputationscore|socialcredit|trustworthinessscore)/;

const ANALYTICS_EVENT_FIELDS = Object.freeze({
  'accessibility.error': new Set(['component', 'platform', 'status']),
  'deck.complete': new Set(['durationBucket', 'platform', 'status']),
  'deck.error': new Set(['errorCode', 'platform', 'status']),
  'deck.load': new Set(['durationBucket', 'platform', 'status']),
  'location.resolve': new Set(['countryCode', 'providerId', 'status']),
});

export type ObservabilitySink = 'audit' | 'crash' | 'log' | 'queue' | 'trace';

function normalizedKey(key: string): string {
  return key.toLowerCase().replaceAll(/[^a-z]/g, '');
}

function assertNoGeneralizedProfileField(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((item) => assertNoGeneralizedProfileField(item));
    return;
  }
  if (value === null || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const normalized = normalizedKey(key);
    if (
      PROHIBITED_GENERALIZED_PROFILE_KEYS.has(normalized) ||
      PROHIBITED_GENERALIZED_PROFILE_PATTERN.test(normalized)
    ) {
      throw new Error('Observability cannot receive a generalized citizen profile field.');
    }
    assertNoGeneralizedProfileField(item);
  }
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

export function sanitizeForObservabilitySink(
  _sink: ObservabilitySink,
  fields: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  assertNoGeneralizedProfileField(fields);
  return Object.freeze(redactSensitive(fields) as Record<string, unknown>);
}

export interface AnalyticsEvent {
  readonly event: keyof typeof ANALYTICS_EVENT_FIELDS;
  readonly fields: Readonly<Record<string, boolean | number | string>>;
  readonly timestamp: string;
}

export function createAnalyticsEvent(
  event: keyof typeof ANALYTICS_EVENT_FIELDS,
  fields: Readonly<Record<string, boolean | number | string>>,
  timestamp = new Date().toISOString(),
): AnalyticsEvent {
  assertNoGeneralizedProfileField(fields);
  const allowedFields = ANALYTICS_EVENT_FIELDS[event];
  for (const key of Object.keys(fields)) {
    if (!allowedFields.has(key) || SENSITIVE_KEYS.has(normalizedKey(key))) {
      throw new Error(`Analytics field is not allowlisted for ${event}: ${key}`);
    }
  }
  return Object.freeze({ event, fields: Object.freeze({ ...fields }), timestamp });
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
    fields: sanitizeForObservabilitySink('log', fields),
    timestamp,
  });
}
