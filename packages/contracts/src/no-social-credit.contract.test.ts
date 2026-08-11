import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import { SYNTHETIC_NO_SOCIAL_CREDIT_POLICY } from './generated/contract-fixtures.js';
import { NO_SOCIAL_CREDIT_POLICY_SCHEMA } from './generated/schema-documents.js';

function validator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  return ajv.compile(structuredClone(NO_SOCIAL_CREDIT_POLICY_SCHEMA));
}

describe('issue #57 generated No Social Credit policy', () => {
  it('validates the synthetic, blocked enforcement baseline', () => {
    const validate = validator();
    expect(validate(SYNTHETIC_NO_SOCIAL_CREDIT_POLICY), JSON.stringify(validate.errors)).toBe(true);
    expect(SYNTHETIC_NO_SOCIAL_CREDIT_POLICY).toMatchObject({
      dataMode: 'synthetic',
      policyVersion: 'no-social-credit-policy.v1',
      releaseGate: {
        decision: 'blocked',
        participatoryPilotAllowed: false,
        productionLegalReviewApproved: false,
        namedOwnerAssigned: false,
      },
    });
  });

  it('makes every hard rule false and feature flags unable to override policy', () => {
    expect(Object.values(SYNTHETIC_NO_SOCIAL_CREDIT_POLICY.hardRules)).toEqual(
      Array(12).fill(false),
    );
    expect(SYNTHETIC_NO_SOCIAL_CREDIT_POLICY.enforcement.featureFlagsCannotOverride).toBe(true);
  });

  it('defines nine non-public, non-portable, non-combinable narrow states', () => {
    expect(SYNTHETIC_NO_SOCIAL_CREDIT_POLICY.narrowStates).toHaveLength(9);
    expect(
      new Set(SYNTHETIC_NO_SOCIAL_CREDIT_POLICY.narrowStates.map((state) => state.stateKind)).size,
    ).toBe(9);
    for (const state of SYNTHETIC_NO_SOCIAL_CREDIT_POLICY.narrowStates) {
      expect(state.purpose).not.toBe('');
      expect(state.dataClasses.length).toBeGreaterThan(0);
      expect(state.allowedPrincipals.length).toBeGreaterThan(0);
      expect(state).toMatchObject({
        retentionStatus: 'follow_on_policy_required',
        publicDisclosureAllowed: false,
        portable: false,
        combinable: false,
        unrelatedAccessAllowed: false,
      });
    }
  });

  it('rejects a prohibited hard rule and invented pilot approval', () => {
    const validate = validator();
    const unsafe = structuredClone(SYNTHETIC_NO_SOCIAL_CREDIT_POLICY) as unknown as {
      hardRules: Record<string, boolean>;
      releaseGate: {
        decision: string;
        participatoryPilotAllowed: boolean;
        productionLegalReviewApproved: boolean;
        namedOwnerAssigned: boolean;
        evidence: Record<string, { status: string; references: string[] }>;
        openBlockers: string[];
      };
    };
    unsafe.hardRules.generalizedCitizenValueAllowed = true;
    expect(validate(unsafe)).toBe(false);

    unsafe.hardRules.generalizedCitizenValueAllowed = false;
    unsafe.releaseGate.decision = 'approved_for_pilot';
    unsafe.releaseGate.participatoryPilotAllowed = true;
    unsafe.releaseGate.productionLegalReviewApproved = true;
    unsafe.releaseGate.namedOwnerAssigned = true;
    unsafe.releaseGate.openBlockers = [];
    expect(validate(unsafe)).toBe(false);

    for (const evidence of Object.values(unsafe.releaseGate.evidence)) {
      evidence.status = 'approved';
      evidence.references = ['synthetic://review/evidence'];
    }
    expect(validate(unsafe), JSON.stringify(validate.errors)).toBe(true);
  });

  it('contains policy metadata only, never a per-person citizen record', () => {
    expect(JSON.stringify(SYNTHETIC_NO_SOCIAL_CREDIT_POLICY)).not.toMatch(
      /accountId|citizenId|participantId|walletAddress|privateKey|seedPhrase|wif/i,
    );
    expect(SYNTHETIC_NO_SOCIAL_CREDIT_POLICY.rightsAndReporting).toMatchObject({
      productionContactApproved: false,
      accessCorrectionObjectionDeletionStatus: 'follow_on_policy_required',
    });
  });
});
