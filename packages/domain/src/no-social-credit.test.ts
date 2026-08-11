import { describe, expect, it } from 'vitest';

import {
  assertNoSocialCreditDataUse,
  CITIZEN_DATA_CLASSES,
  evaluateNoSocialCreditDataUse,
  NARROW_STATE_KINDS,
  NoSocialCreditPolicyViolationError,
  PURPOSE_LIMITED_STATE_RULES,
  type CitizenDataUseRequest,
} from './no-social-credit.js';

const publicRoleMethod: CitizenDataUseRequest = {
  purpose: 'calculate_one_versioned_public_role_method_result',
  actorType: 'service',
  narrowStatePrincipal: null,
  inputClasses: ['public_role_record', 'public_source_record'],
  narrowStateKinds: [],
  outputKind: 'public_role_method_result',
  outputSubject: 'public_role',
  stableCitizenIdentifierIncluded: false,
  ranksOrPredictsPerson: false,
  affectsUnrelatedAccess: false,
  portableAcrossContexts: false,
  crossProductLinkage: false,
  publicIndividualDisclosure: false,
  commercialTargeting: false,
  exercisesHumanIntent: false,
};

describe('No Social Credit domain policy', () => {
  it('defines every purpose-limited state with access, retention, reason, and review rules', () => {
    expect(PURPOSE_LIMITED_STATE_RULES).toHaveLength(NARROW_STATE_KINDS.length);
    expect(new Set(PURPOSE_LIMITED_STATE_RULES.map((rule) => rule.stateKind))).toEqual(
      new Set(NARROW_STATE_KINDS),
    );
    for (const rule of PURPOSE_LIMITED_STATE_RULES) {
      expect(rule.purpose).not.toBe('');
      expect(rule.dataClasses.length).toBeGreaterThan(0);
      expect(rule.allowedPrincipals.length).toBeGreaterThan(0);
      expect(rule.retentionClass).toContain('pending_issues_23_45');
      expect(rule).toMatchObject({
        retentionStatus: 'follow_on_policy_required',
        publicDisclosureAllowed: false,
        portable: false,
        combinable: false,
        unrelatedAccessAllowed: false,
      });
      expect(['generic_external_reason', 'purpose_specific_reason']).toContain(rule.reasonRule);
      expect(['access_and_correction', 'access_correction_and_appeal']).toContain(rule.reviewRight);
    }
  });

  it.each([
    'generalized_citizen_value',
    'citizen_trait_prediction',
    'commercial_targeting_profile',
  ] as const)('rejects the prohibited %s output regardless of feature flags', (outputKind) => {
    expect(evaluateNoSocialCreditDataUse({ ...publicRoleMethod, outputKind })).toMatchObject({
      allowed: false,
      reason: 'prohibited_output',
    });
  });

  it.each([
    ['ranksOrPredictsPerson', 'person_ranking_or_prediction'],
    ['affectsUnrelatedAccess', 'unrelated_access'],
    ['portableAcrossContexts', 'portable_state'],
    ['crossProductLinkage', 'cross_product_linkage'],
    ['publicIndividualDisclosure', 'public_individual_disclosure'],
    ['commercialTargeting', 'commercial_targeting'],
  ] as const)('rejects semantic misuse through %s', (field, reason) => {
    expect(evaluateNoSocialCreditDataUse({ ...publicRoleMethod, [field]: true })).toMatchObject({
      allowed: false,
      reason,
    });
  });

  it('allows one exact private narrow state and rejects combination or purpose drift', () => {
    const rule = PURPOSE_LIMITED_STATE_RULES.find(
      (candidate) => candidate.stateKind === 'action_eligibility',
    );
    expect(rule).toBeDefined();
    const request: CitizenDataUseRequest = {
      ...publicRoleMethod,
      purpose: rule?.purpose ?? '',
      inputClasses: rule?.dataClasses ?? [],
      narrowStateKinds: ['action_eligibility'],
      outputKind: 'purpose_limited_state',
      outputSubject: 'account_private',
      stableCitizenIdentifierIncluded: true,
      narrowStatePrincipal: rule?.allowedPrincipals[0] ?? null,
    };
    expect(evaluateNoSocialCreditDataUse(request)).toEqual({
      allowed: true,
      reason: 'explicit_narrow_state_allow',
    });
    expect(
      evaluateNoSocialCreditDataUse({
        ...request,
        narrowStateKinds: ['action_eligibility', 'attestation_status'],
      }),
    ).toMatchObject({ allowed: false, reason: 'combined_narrow_states' });
    expect(
      evaluateNoSocialCreditDataUse({ ...request, purpose: 'unrelated_access' }),
    ).toMatchObject({ allowed: false, reason: 'invalid_narrow_state_policy' });
    expect(
      evaluateNoSocialCreditDataUse({
        ...request,
        narrowStatePrincipal: 'moderation_service',
      }),
    ).toMatchObject({ allowed: false, reason: 'invalid_narrow_state_policy' });
    expect(evaluateNoSocialCreditDataUse({ ...request, actorType: 'agent' })).toMatchObject({
      allowed: false,
      reason: 'invalid_narrow_state_policy',
    });
  });

  it('keeps citizen attributes out of public-role methodology', () => {
    expect(evaluateNoSocialCreditDataUse(publicRoleMethod)).toEqual({
      allowed: true,
      reason: 'explicit_public_role_method_allow',
    });
    for (const dataClass of CITIZEN_DATA_CLASSES) {
      expect(
        evaluateNoSocialCreditDataUse({ ...publicRoleMethod, inputClasses: [dataClass] }),
        dataClass,
      ).toMatchObject({ allowed: false, reason: 'citizen_data_in_public_role_method' });
    }
  });

  it('allows only non-identifiable coarse operational metrics', () => {
    const operational: CitizenDataUseRequest = {
      ...publicRoleMethod,
      purpose: 'measure_service_reliability',
      inputClasses: [],
      outputKind: 'coarse_operational_metric',
      outputSubject: 'anonymous_aggregate',
    };
    expect(evaluateNoSocialCreditDataUse(operational)).toEqual({
      allowed: true,
      reason: 'explicit_operational_metric_allow',
    });
    expect(
      evaluateNoSocialCreditDataUse({ ...operational, stableCitizenIdentifierIncluded: true }),
    ).toMatchObject({ allowed: false, reason: 'identifiable_operational_metric' });
  });

  it('rejects agent/service human intent and provides a typed fail-closed assertion', () => {
    const unsafe = { ...publicRoleMethod, actorType: 'agent' as const, exercisesHumanIntent: true };
    expect(evaluateNoSocialCreditDataUse(unsafe)).toMatchObject({
      allowed: false,
      reason: 'agent_human_intent',
    });
    expect(() => assertNoSocialCreditDataUse(unsafe)).toThrow(NoSocialCreditPolicyViolationError);
  });
});
