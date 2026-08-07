const FORBIDDEN_GENERALIZED_SCORE_KEYS = new Set([
  'citizenscore',
  'civicrank',
  'conformityscore',
  'loyaltyscore',
  'reputationscore',
  'trustworthinessscore',
]);

const FORBIDDEN_SCORE_INPUT_KEYS = new Set([
  'abusestate',
  'accountstate',
  'attestationstate',
  'authenticationtier',
  'rolegrants',
]);

function normalizedKey(key: string): string {
  return key.toLowerCase().replaceAll(/[^a-z]/g, '');
}

export class NoSocialCreditViolationError extends Error {
  constructor() {
    super('Account security state cannot be used for a generalized citizen score.');
    this.name = 'NoSocialCreditViolationError';
  }
}

export function assertNoSocialCreditProjection(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => assertNoSocialCreditProjection(entry));
    return;
  }
  if (value === null || typeof value !== 'object') return;
  for (const [key, entry] of Object.entries(value)) {
    const normalized = normalizedKey(key);
    if (
      FORBIDDEN_GENERALIZED_SCORE_KEYS.has(normalized) ||
      FORBIDDEN_SCORE_INPUT_KEYS.has(normalized)
    ) {
      throw new NoSocialCreditViolationError();
    }
    assertNoSocialCreditProjection(entry);
  }
}

export function publicAccountSecurityProjection(): Readonly<Record<string, never>> {
  return Object.freeze({});
}
