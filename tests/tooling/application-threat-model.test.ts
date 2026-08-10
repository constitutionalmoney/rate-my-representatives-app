import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

const actorClasses = [
  'external_attacker',
  'compromised_user',
  'representative_or_staff',
  'coordinated_group',
  'malicious_submitter',
  'colluding_moderators',
  'insider',
  'data_broker',
  'scraper',
  'source_publisher',
  'compromised_dependency',
  'ai_provider',
  'wallet_link_attacker',
  'compromised_signer_or_node',
  'operator_error',
] as const;

const threatIds = [
  'AUTH-01',
  'AUTH-02',
  'AUTH-03',
  'PRIV-01',
  'PRIV-02',
  'PRIV-03',
  'NSC-01',
  'SRC-01',
  'SRC-02',
  'SRC-03',
  'SRC-04',
  'AI-01',
  'AI-02',
  'AI-03',
  'MOD-01',
  'MOD-02',
  'MOD-03',
  'MOB-01',
  'MOB-02',
  'MOB-03',
  'MOB-04',
  'VRLOGIN-01',
  'VRUPDATE-01',
  'VRMANAGED-01',
  'PROV-01',
  'PROV-02',
  'PROV-03',
  'PROV-04',
  'OPS-01',
  'OPS-02',
  'REG-01',
] as const;

describe('issue #6 application threat model', () => {
  it('defines the complete actor, boundary, and threat catalog with diagrams', async () => {
    const document = await read('docs/THREAT_MODEL.md');

    expect(document).toContain('**Version:** `application-threat-model.v1`');
    expect(document.match(/```mermaid/g)).toHaveLength(3);
    for (const actor of actorClasses) expect(document, actor).toContain(`\`${actor}\``);
    for (let boundary = 1; boundary <= 12; boundary += 1) {
      expect(document).toContain(`\`B${String(boundary).padStart(2, '0')}\``);
    }
    for (const threatId of threatIds) {
      expect(document.match(new RegExp('\\| `' + threatId + '` \\|', 'g'))).toHaveLength(1);
    }
  });

  it('maps scenarios to controls, evidence status, residual risk, owners, and degradation', async () => {
    const document = await read('docs/THREAT_MODEL.md');

    for (const phrase of [
      'Controls and evidence',
      'Residual risk / safe degradation',
      'Incident owner',
      '`I` implemented foundation',
      '`P` accepted policy',
      '`F` future required',
      '`U` unresolved',
      'production assurance',
    ]) {
      expect(document, phrase).toContain(phrase);
    }
    expect(document).toContain('The table records the controlling response, not a claim');
  });

  it('treats privacy and No Social Credit violations as security incidents', async () => {
    const document = await read('docs/THREAT_MODEL.md');

    expect(document).toContain(
      'A suspected No Social Credit path is a security/privacy incident, not merely a product',
    );
    for (const harm of [
      'Precise-location leakage',
      'Disclosure of individual signals',
      'Aggregate re-identification',
      'Hidden citizen score',
    ]) {
      expect(document, harm).toContain(harm);
    }
    expect(document).toContain('Publish no aggregate');
  });

  it('keeps the three Verus surfaces independent and all chain behavior optional', async () => {
    const [document, identityPolicy, verusSource, provenanceSource] = await Promise.all([
      read('docs/THREAT_MODEL.md'),
      read('docs/IDENTITY_AND_VERUS_MOBILE.md'),
      read('packages/verus/src/index.ts'),
      read('packages/provenance/src/index.ts'),
    ]);

    expect(document).toContain('**Optional account linking/proof**');
    expect(document).toContain('**Representative-controlled `IdentityUpdateRequest`**');
    expect(document).toContain('current path superseded and unauthorized');
    expect(document).toContain('**RMR-managed representative provisioning/activity publication**');
    expect(identityPolicy).toContain('VERUS_IDENTITY_UPDATE_ENABLED=false');
    expect(verusSource).toContain('requiredForCore: false');
    expect(verusSource).toContain('writesEnabled: false');
    expect(provenanceSource).toContain('anchoringEnabled: false');
    expect(provenanceSource).toContain('provesTruth: false');
  });

  it('requires safe public reads while optional or high-risk dependencies fail', async () => {
    const document = await read('docs/THREAT_MODEL.md');

    for (const dependency of [
      'AI provider unavailable, incompatible, or suspect',
      'Wallet/request signer/auth callback unavailable',
      'Representative provisioning/provenance signer or RPC unavailable',
      'Source connector/publisher unavailable, stale, changed, or retracted',
      'Push provider unavailable/compromised',
      'Moderation staffing unavailable/conflicted',
    ]) {
      expect(document, dependency).toContain(dependency);
    }
    expect(document).toContain('Safe public reads remain');
    expect(document).toContain('must not report the optional dependency as core readiness failure');
  });

  it('keeps pilot approval blocked pending named owners, tests, and independent review', async () => {
    const [document, fixtureText] = await Promise.all([
      read('docs/THREAT_MODEL.md'),
      read('packages/contracts/fixtures/threat-control-catalog.synthetic.json'),
    ]);
    const fixture = JSON.parse(fixtureText) as {
      dataMode: string;
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

    expect(fixture.dataMode).toBe('synthetic');
    expect(Object.values(fixture.hardRules).every((value) => value === false)).toBe(true);
    expect(fixture.releaseReadiness).toMatchObject({
      decision: 'blocked',
      namedOwnersAssigned: false,
      publicReadDegradationTested: false,
    });
    expect(Object.keys(fixture.releaseReadiness.independentReviews)).toHaveLength(8);
    expect(
      Object.values(fixture.releaseReadiness.independentReviews).every(
        (review) => review.status === 'pending' && review.evidenceReferences.length === 0,
      ),
    ).toBe(true);
    expect(fixture.releaseReadiness.unresolvedDecisionIds.length).toBeGreaterThan(0);
    expect(fixture.releaseReadiness.pilotBlockerThreatIds.length).toBeGreaterThan(0);
    expect(document).toContain('## 13. Pilot blockers and independent review');
    expect(document).toContain('## 14. Unresolved decisions');
  });

  it('links the canonical model from controlling architecture and security documents', async () => {
    const linkedDocuments = await Promise.all(
      [
        'README.md',
        'SECURITY.md',
        'docs/ARCHITECTURE.md',
        'docs/ROADMAP.md',
        'docs/CONTRACTS.md',
        'docs/DATA_CLASSIFICATION.md',
        'docs/AUTH_AND_IDENTITY.md',
        'docs/IDENTITY_AND_VERUS_MOBILE.md',
        'docs/NATIVE_MOBILE.md',
        'docs/SOURCE_INGESTION.md',
        'docs/MODERATION_AND_DUE_PROCESS.md',
      ].map(read),
    );

    for (const source of linkedDocuments) expect(source).toContain('THREAT_MODEL.md');
  });
});
