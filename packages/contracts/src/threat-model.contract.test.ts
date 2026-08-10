import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { SYNTHETIC_THREAT_CONTROL_CATALOG } from './generated/contract-fixtures.js';
import { THREAT_CONTROL_CATALOG_SCHEMA } from './generated/schema-documents.js';

function validator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(structuredClone(THREAT_CONTROL_CATALOG_SCHEMA));
}

function propertyNames(value: unknown, output: string[] = []): string[] {
  if (value === null || typeof value !== 'object') return output;
  for (const [key, nested] of Object.entries(value)) {
    output.push(key);
    propertyNames(nested, output);
  }
  return output;
}

const domains = [
  'authentication_authority',
  'privacy_location',
  'no_social_credit',
  'sources_documents',
  'ai',
  'moderation_safety',
  'mobile_supply_chain',
  'mobile_links_storage_push',
  'verus_account_proof',
  'verus_identity_update',
  'verus_managed_identities',
  'provenance',
  'operations_resilience',
  'public_registry_memory',
] as const;

describe('issue #6 generated threat-control catalog', () => {
  it('validates the synthetic blocked foundation catalog', () => {
    const validate = validator();
    expect(validate(SYNTHETIC_THREAT_CONTROL_CATALOG), JSON.stringify(validate.errors)).toBe(true);
    expect(SYNTHETIC_THREAT_CONTROL_CATALOG).toMatchObject({
      dataMode: 'synthetic',
      policyVersion: 'application-threat-model.v1',
      releaseReadiness: {
        decision: 'blocked',
        namedOwnersAssigned: false,
        publicReadDegradationTested: false,
      },
    });
    expect(SYNTHETIC_THREAT_CONTROL_CATALOG.domainCoverage).toEqual(domains);
    expect(
      new Set(SYNTHETIC_THREAT_CONTROL_CATALOG.threats.map((threat) => threat.domain)),
    ).toEqual(new Set(domains));
  });

  it('makes every irreversible hard rule false', () => {
    expect(Object.values(SYNTHETIC_THREAT_CONTROL_CATALOG.hardRules)).toEqual(Array(9).fill(false));
  });

  it('rejects unsafe hard-rule changes and invented pilot approval', () => {
    const validate = validator();
    const unsafe = structuredClone(SYNTHETIC_THREAT_CONTROL_CATALOG) as unknown as {
      hardRules: Record<string, boolean>;
      releaseReadiness: {
        decision: string;
        namedOwnersAssigned: boolean;
        publicReadDegradationTested: boolean;
        independentReviews: Record<string, { status: string; evidenceReferences: string[] }>;
        unresolvedDecisionIds: string[];
        pilotBlockerThreatIds: string[];
      };
    };
    unsafe.hardRules.mainnetWritesAllowed = true;
    expect(validate(unsafe)).toBe(false);

    unsafe.hardRules.mainnetWritesAllowed = false;
    unsafe.releaseReadiness.decision = 'approved_for_pilot';
    unsafe.releaseReadiness.namedOwnersAssigned = true;
    unsafe.releaseReadiness.publicReadDegradationTested = true;
    unsafe.releaseReadiness.unresolvedDecisionIds = [];
    unsafe.releaseReadiness.pilotBlockerThreatIds = [];
    expect(validate(unsafe)).toBe(false);

    for (const review of Object.values(unsafe.releaseReadiness.independentReviews)) {
      review.status = 'approved';
      review.evidenceReferences = ['synthetic://independent-review/evidence'];
    }
    expect(validate(unsafe), JSON.stringify(validate.errors)).toBe(true);
  });

  it('requires redacted evidence and keeps blockers linked to known threats', () => {
    const threatIds = new Set(
      SYNTHETIC_THREAT_CONTROL_CATALOG.threats.map((threat) => threat.threatId),
    );
    for (const threat of SYNTHETIC_THREAT_CONTROL_CATALOG.threats) {
      expect(threat.tests.every((test) => test.redactionRequired)).toBe(true);
      expect(threat.controls.length).toBeGreaterThan(0);
      expect(threat.safeDegradation.length).toBeGreaterThan(0);
    }
    for (const blocker of SYNTHETIC_THREAT_CONTROL_CATALOG.releaseReadiness.pilotBlockerThreatIds) {
      expect(threatIds.has(blocker)).toBe(true);
    }
  });

  it('contains no citizen/account identity, private key, score, or wallet-secret field', () => {
    const forbidden = new Set([
      'accountid',
      'citizenid',
      'privatekey',
      'reputationscore',
      'seedphrase',
      'trustscore',
      'walletaddress',
      'wif',
    ]);
    const normalized = propertyNames(THREAT_CONTROL_CATALOG_SCHEMA).map((key) =>
      key.toLowerCase().replaceAll(/[^a-z]/g, ''),
    );
    for (const key of forbidden) expect(normalized).not.toContain(key);
  });
});
