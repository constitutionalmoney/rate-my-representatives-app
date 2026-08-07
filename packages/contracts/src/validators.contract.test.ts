import { describe, expect, it } from 'vitest';

import { SYNTHETIC_HEALTH_READY, SYNTHETIC_JURISDICTIONS } from './generated/contract-fixtures.js';
import {
  CIVIC_SIGNAL_BRIEFING_SCHEMA,
  REPRESENTATIVE_SIGNAL_COMMAND_SCHEMA,
} from './generated/schema-documents.js';
import {
  ContractValidationError,
  parseApiError,
  parseHealthStatus,
  parseJurisdictionRegistry,
} from './validators.js';

describe('runtime contract validators', () => {
  it('allows additive response fields at clients and strips them from the result', () => {
    const parsed = parseHealthStatus({ ...SYNTHETIC_HEALTH_READY, futureField: true });

    expect(parsed).toEqual(SYNTHETIC_HEALTH_READY);
    expect('futureField' in parsed).toBe(false);
  });

  it('rejects server output with undocumented fields', () => {
    expect(() =>
      parseHealthStatus({ ...SYNTHETIC_HEALTH_READY, privateNote: 'must not escape' }, 'server'),
    ).toThrow(ContractValidationError);
  });

  it('rejects malformed errors without echoing their values', () => {
    try {
      parseApiError({ code: 'secret-value' });
      throw new Error('Expected validation to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(ContractValidationError);
      expect(String(error)).not.toContain('secret-value');
    }
  });

  it('validates the generated synthetic registry and strips client-only additions', () => {
    const parsed = parseJurisdictionRegistry({
      ...SYNTHETIC_JURISDICTIONS,
      privateEligibilityInference: true,
    });

    expect(parsed).toEqual(SYNTHETIC_JURISDICTIONS);
    expect('privateEligibilityInference' in parsed).toBe(false);
  });

  it('keeps monitoring distinct from human-only representative judgment', () => {
    expect(CIVIC_SIGNAL_BRIEFING_SCHEMA.properties.kind.const).toBe('civic_signal_briefing');
    expect(CIVIC_SIGNAL_BRIEFING_SCHEMA['x-rmr-human-intent']).toBe('forbidden');
    expect(REPRESENTATIVE_SIGNAL_COMMAND_SCHEMA.properties.kind.const).toBe(
      'representative_signal_command',
    );
    expect(REPRESENTATIVE_SIGNAL_COMMAND_SCHEMA['x-rmr-allowed-actors']).toEqual(['human']);
    expect(REPRESENTATIVE_SIGNAL_COMMAND_SCHEMA['x-rmr-agent-access']).toBe('forbidden');
    expect(REPRESENTATIVE_SIGNAL_COMMAND_SCHEMA.properties.judgment.enum).not.toContain('skip');
  });
});
