import { describe, expect, it } from 'vitest';

import {
  SYNTHETIC_HEALTH_READY,
  SYNTHETIC_JURISDICTIONS,
  SYNTHETIC_PUBLIC_ROLE_REGISTRY,
  SYNTHETIC_PUBLIC_ROLE_PROFILE,
  SYNTHETIC_REPRESENTATION_CAPABILITIES,
  SYNTHETIC_CA_REPRESENTATION_RESOLUTION,
  SYNTHETIC_SAVED_BROAD_JURISDICTION,
  SYNTHETIC_SECURITY_DOMAIN_POLICY,
  SYNTHETIC_CA_SOURCE_CONNECTOR,
  SYNTHETIC_SOURCE_COVERAGE,
  SYNTHETIC_US_SOURCE_CONNECTOR,
} from './generated/contract-fixtures.js';
import {
  CIVIC_SIGNAL_BRIEFING_SCHEMA,
  REPRESENTATIVE_SIGNAL_COMMAND_SCHEMA,
  SECURITY_DOMAIN_POLICY_SCHEMA,
} from './generated/schema-documents.js';
import {
  ContractValidationError,
  parseApiError,
  parseHealthStatus,
  parseJurisdictionRegistry,
  parsePublicRoleRegistry,
  parsePublicRoleProfile,
  parseRepresentationCapabilities,
  parseRepresentationResolution,
  parseRepresentationResolutionRequest,
  parseSavedBroadJurisdiction,
  parseSourceConnectorCapability,
  parseSourceCoverageSnapshot,
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

  it('validates public-role output and rejects restricted review fields at the server boundary', () => {
    expect(parsePublicRoleRegistry(SYNTHETIC_PUBLIC_ROLE_REGISTRY, 'server')).toEqual(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY,
    );
    const fixture = structuredClone(SYNTHETIC_PUBLIC_ROLE_REGISTRY) as Record<string, unknown>;
    fixture.people = [
      {
        ...(SYNTHETIC_PUBLIC_ROLE_REGISTRY.people[0] as object),
        privateNotes: 'must not escape',
      },
    ];
    expect(() => parsePublicRoleRegistry(fixture, 'server')).toThrow(ContractValidationError);
  });

  it('validates both synthetic connector capabilities and reproducible coverage', () => {
    expect(parseSourceConnectorCapability(SYNTHETIC_CA_SOURCE_CONNECTOR, 'server')).toEqual(
      SYNTHETIC_CA_SOURCE_CONNECTOR,
    );
    expect(parseSourceConnectorCapability(SYNTHETIC_US_SOURCE_CONNECTOR, 'server')).toEqual(
      SYNTHETIC_US_SOURCE_CONNECTOR,
    );
    expect(parseSourceCoverageSnapshot(SYNTHETIC_SOURCE_COVERAGE, 'server')).toEqual(
      SYNTHETIC_SOURCE_COVERAGE,
    );
    expect(() =>
      parseSourceConnectorCapability(
        { ...SYNTHETIC_CA_SOURCE_CONNECTOR, privateKey: 'forbidden' },
        'server',
      ),
    ).toThrow(ContractValidationError);
  });

  it('validates the source-backed public profile and rejects private serializer fields', () => {
    expect(parsePublicRoleProfile(SYNTHETIC_PUBLIC_ROLE_PROFILE, 'server')).toEqual(
      SYNTHETIC_PUBLIC_ROLE_PROFILE,
    );
    const profile = structuredClone(SYNTHETIC_PUBLIC_ROLE_PROFILE) as Record<string, unknown>;
    profile.person = { ...(profile.person as object), accountId: 'must-not-escape' };
    expect(() => parsePublicRoleProfile(profile, 'server')).toThrow(ContractValidationError);
  });

  it('generates the deny-by-default security-domain contract from a synthetic fixture', () => {
    expect(SYNTHETIC_SECURITY_DOMAIN_POLICY).toMatchObject({
      dataMode: 'synthetic',
      defaultAccess: 'deny',
      signerIsolation: {
        coreWorkerHasCredentials: false,
        publicApiHasCredentials: false,
        verusRequiredForCore: false,
      },
      noSocialCredit: {
        generalizedCitizenScoreAllowed: false,
        identityActivityJoinAllowed: false,
      },
    });
    expect(SYNTHETIC_SECURITY_DOMAIN_POLICY.domains).toHaveLength(8);
    expect(SECURITY_DOMAIN_POLICY_SCHEMA.properties.defaultAccess.const).toBe('deny');
  });

  it('validates location contracts and rejects precise fields from response serializers', () => {
    expect(
      parseRepresentationCapabilities(SYNTHETIC_REPRESENTATION_CAPABILITIES, 'server'),
    ).toEqual(SYNTHETIC_REPRESENTATION_CAPABILITIES);
    expect(parseRepresentationResolution(SYNTHETIC_CA_REPRESENTATION_RESOLUTION, 'server')).toEqual(
      SYNTHETIC_CA_REPRESENTATION_RESOLUTION,
    );
    expect(parseSavedBroadJurisdiction(SYNTHETIC_SAVED_BROAD_JURISDICTION, 'server')).toEqual(
      SYNTHETIC_SAVED_BROAD_JURISDICTION,
    );
    expect(() =>
      parseRepresentationResolution(
        { ...SYNTHETIC_CA_REPRESENTATION_RESOLUTION, preciseAddress: 'forbidden' },
        'server',
      ),
    ).toThrow(ContractValidationError);
  });

  it('accepts precise input only at the strict request boundary', () => {
    const request = {
      schemaVersion: 'representation-resolution-request.v1',
      asOf: '2026-06-01T12:00:00.000Z',
      countryCode: 'CA',
      input: { kind: 'postal_code', value: 'A1A 1A1' },
    };
    expect(parseRepresentationResolutionRequest(request, 'server')).toEqual(request);
    expect(() =>
      parseRepresentationResolutionRequest({ ...request, analyticsConsent: true }, 'server'),
    ).toThrow(ContractValidationError);
  });
});
