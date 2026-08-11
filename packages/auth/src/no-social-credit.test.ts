import { describe, expect, it } from 'vitest';

import {
  NoSocialCreditViolationError,
  assertNoSocialCreditProjection,
  publicAccountSecurityProjection,
} from './no-social-credit.js';

describe('No Social Credit account boundary', () => {
  it('emits no public account security fields', () => {
    expect(publicAccountSecurityProjection()).toEqual({});
  });

  it.each(['accountState', 'abuseState', 'attestationState', 'authenticationTier', 'roleGrants'])(
    'rejects %s as an input to a public scoring projection',
    (field) => {
      expect(() => assertNoSocialCreditProjection({ citizen: { [field]: 'synthetic' } })).toThrow(
        NoSocialCreditViolationError,
      );
    },
  );

  it('rejects generalized citizen score outputs regardless of source data', () => {
    expect(() => assertNoSocialCreditProjection({ citizenScore: 100 })).toThrow(
      NoSocialCreditViolationError,
    );
  });

  it.each([
    'civicReputation',
    'ideologyProfile',
    'loyaltyScore',
    'politicalProfile',
    'socialCredit',
    'citizenCommercialTrustRank',
  ])('rejects generalized citizen profile output %s', (field) => {
    expect(() => assertNoSocialCreditProjection({ [field]: 'synthetic' })).toThrow(
      NoSocialCreditViolationError,
    );
  });

  it.each([
    'browsingHistory',
    'categoryRating',
    'jurisdiction',
    'notificationBehavior',
    'representativeSignal',
    'subscription',
    'votingChoice',
  ])('rejects private civic input %s from a public citizen projection', (field) => {
    expect(() => assertNoSocialCreditProjection({ citizen: { [field]: 'synthetic' } })).toThrow(
      NoSocialCreditViolationError,
    );
  });
});
