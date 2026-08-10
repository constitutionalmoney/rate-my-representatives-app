import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import {
  SYNTHETIC_METHODOLOGY_INDICATOR,
  SYNTHETIC_METHODOLOGY_RELEASE_GATE,
} from './generated/contract-fixtures.js';
import {
  METHODOLOGY_INDICATOR_RESULT_SCHEMA,
  METHODOLOGY_RELEASE_GATE_SCHEMA,
} from './generated/schema-documents.js';

function validator(schema: object) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(structuredClone(schema));
}

function propertyNames(value: unknown, output: string[] = []): string[] {
  if (value === null || typeof value !== 'object') return output;
  for (const [key, nested] of Object.entries(value)) {
    output.push(key);
    propertyNames(nested, output);
  }
  return output;
}

describe('issue #4 generated methodology contracts', () => {
  it('validates the disabled release state and refuses flag-only enablement', () => {
    const validate = validator(METHODOLOGY_RELEASE_GATE_SCHEMA);
    expect(validate(SYNTHETIC_METHODOLOGY_RELEASE_GATE), JSON.stringify(validate.errors)).toBe(
      true,
    );

    const flagOnly = structuredClone(SYNTHETIC_METHODOLOGY_RELEASE_GATE) as Record<string, unknown>;
    flagOnly.runtimeFlagEnabled = true;
    expect(validate(flagOnly)).toBe(false);
  });

  it('validates a synthetic, non-composite, reproducible indicator example', () => {
    const validate = validator(METHODOLOGY_INDICATOR_RESULT_SCHEMA);
    expect(validate(SYNTHETIC_METHODOLOGY_INDICATOR), JSON.stringify(validate.errors)).toBe(true);

    const inputs = Object.fromEntries(
      SYNTHETIC_METHODOLOGY_INDICATOR.result.calculationInputs.map((input) => [
        input.name,
        input.value,
      ]),
    );
    const calculated =
      (100 * (inputs.published_within_threshold ?? 0)) / (inputs.eligible_events ?? 1);

    expect(calculated).toBe(SYNTHETIC_METHODOLOGY_INDICATOR.result.value);
    expect(SYNTHETIC_METHODOLOGY_INDICATOR).toMatchObject({
      dataMode: 'synthetic',
      participationIncluded: false,
      publicationState: 'test_only',
      missingData: { treatment: 'no_adverse_inference' },
      provenance: { meaning: 'commitment_not_truth', state: 'not_anchored' },
    });
  });

  it('makes an indicator unavailable instead of treating missing inputs as negative', () => {
    const validate = validator(METHODOLOGY_INDICATOR_RESULT_SCHEMA);
    const missing = structuredClone(SYNTHETIC_METHODOLOGY_INDICATOR) as Record<string, unknown>;
    missing.missingData = {
      state: 'gap',
      missingInputCount: 1,
      treatment: 'no_adverse_inference',
      publicExplanation: 'One synthetic source input is missing.',
    };

    expect(validate(missing)).toBe(false);
    missing.result = {
      ...(missing.result as object),
      status: 'unavailable',
      value: null,
    };
    expect(validate(missing), JSON.stringify(validate.errors)).toBe(true);
  });

  it('contains no citizen, account, identity-reputation, participation, or generic score field', () => {
    const forbidden = new Set([
      'accountid',
      'citizenid',
      'identityassurance',
      'reputation',
      'representativesignal',
      'score',
    ]);
    const normalized = propertyNames(METHODOLOGY_INDICATOR_RESULT_SCHEMA).map((key) =>
      key.toLowerCase().replaceAll(/[^a-z]/g, ''),
    );

    for (const key of forbidden) expect(normalized).not.toContain(key);
  });
});
