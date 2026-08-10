import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { SYNTHETIC_MODERATION_DECISION } from './generated/contract-fixtures.js';
import { MODERATION_DECISION_SCHEMA } from './generated/schema-documents.js';

function validator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(structuredClone(MODERATION_DECISION_SCHEMA));
}

function propertyNames(value: unknown, output: string[] = []): string[] {
  if (value === null || typeof value !== 'object') return output;
  for (const [key, nested] of Object.entries(value)) {
    output.push(key);
    propertyNames(nested, output);
  }
  return output;
}

describe('issue #5 generated moderation decision contract', () => {
  it('validates a restricted synthetic human decision', () => {
    const validate = validator();
    expect(validate(SYNTHETIC_MODERATION_DECISION), JSON.stringify(validate.errors)).toBe(true);
    expect(SYNTHETIC_MODERATION_DECISION).toMatchObject({
      dataMode: 'synthetic',
      policyVersion: 'moderation-due-process-policy.v1',
      review: { humanDecider: true },
      ai: { decidedOutcome: false },
      publication: {
        automaticPublication: false,
        rawPrivateMaterialIncluded: false,
        provenanceEligible: false,
      },
    });
  });

  it('rejects automatic publication and restricted material in a public projection', () => {
    const validate = validator();
    const unsafe = structuredClone(SYNTHETIC_MODERATION_DECISION) as unknown as {
      publication: Record<string, unknown>;
    };

    unsafe.publication = {
      state: 'public_projection_approved',
      automaticPublication: true,
      allowedPublicFields: ['decisionId'],
      rawPrivateMaterialIncluded: true,
      provenanceEligible: true,
    };
    expect(validate(unsafe)).toBe(false);
  });

  it('requires appeal independence and an original decision reference', () => {
    const validate = validator();
    const appeal = structuredClone(SYNTHETIC_MODERATION_DECISION) as unknown as {
      workflow: string;
      review: { reviewerRole: string; independentOfOriginalDecision: boolean };
      history: { appealedDecisionId: string | null };
    };
    appeal.workflow = 'appeal';
    appeal.review.reviewerRole = 'reviewer';
    appeal.review.independentOfOriginalDecision = false;
    appeal.history.appealedDecisionId = null;

    expect(validate(appeal)).toBe(false);

    appeal.review.reviewerRole = 'appeal_reviewer';
    appeal.review.independentOfOriginalDecision = true;
    appeal.history.appealedDecisionId = 'synthetic:moderation-decision:original';
    expect(validate(appeal), JSON.stringify(validate.errors)).toBe(true);
  });

  it('contains no raw evidence, private identity, reviewer identity, note, credential, or key field', () => {
    const forbidden = new Set([
      'accountid',
      'contactdetails',
      'identityevidence',
      'privatekey',
      'rawevidence',
      'revieweridentity',
      'reviewernotes',
      'seedphrase',
      'wif',
    ]);
    const normalized = propertyNames(MODERATION_DECISION_SCHEMA).map((key) =>
      key.toLowerCase().replaceAll(/[^a-z]/g, ''),
    );

    for (const key of forbidden) expect(normalized).not.toContain(key);
  });
});
