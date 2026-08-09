import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

const requiredActors = [
  'Public visitor',
  'Basic participant',
  'Verified participant',
  'Evidence contributor',
  'Representative/candidate',
  'Authorized staff',
  'Moderator/reviewer',
  'Administrator',
  'Civic Agent/service',
] as const;

const requiredIndependentFacts = [
  'Authentication method',
  'Authentication assurance',
  'Actor type and role grant',
  'VerusID control',
  'Human attestation',
  'Jurisdiction eligibility',
  'Representative authority',
  'Privileged access',
] as const;

const sensitiveFlags = [
  'PASSKEY_AUTH_ENABLED',
  'VERIFIED_EMAIL_AUTH_ENABLED',
  'ACCOUNT_RECOVERY_ENABLED',
  'PRIVILEGED_ACCESS_ENABLED',
  'REPRESENTATIVE_CLAIMS_ENABLED',
  'REPRESENTATIVE_VERUS_CLAIMS_ENABLED',
  'VERUS_ID_LINKING_ENABLED',
  'VERUS_AUTH_ENABLED',
  'VERUS_IDENTITY_UPDATE_ENABLED',
  'CBC_ATTESTATION_ENABLED',
  'PROVENANCE_WRITES_ENABLED',
  'VERUS_ANCHORING_ENABLED',
] as const;

describe('issue #3 authentication and identity policy', () => {
  it('separates authentication, roles, identity, eligibility, authority, and privilege', async () => {
    const document = await read('docs/AUTH_AND_IDENTITY.md');

    for (const fact of requiredIndependentFacts) {
      expect(document, `missing independent fact ${fact}`).toContain(fact);
    }

    expect(document.match(/```mermaid/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
    expect(document).toContain('No arrow means equivalence');
    expect(document).toMatch(/A Civic\s+Agent is a service role, never a person/);
    expect(document).toMatch(/Higher authentication assurance cannot create a[\s\S]*role/);
  });

  it('defines every required public, participant, representative, staff, and operator role', async () => {
    const document = await read('docs/AUTH_AND_IDENTITY.md');

    for (const actor of requiredActors) {
      expect(document, `missing actor ${actor}`).toContain(`| ${actor} |`);
    }

    expect(document).toContain('Roles are additive, least-privilege grants, not ranks');
    expect(document).toContain('Human-intent commands reject service actors');
  });

  it('keeps representative claims, scoped delegation, expiry, revocation, and appeal local', async () => {
    const document = await read('docs/AUTH_AND_IDENTITY.md');

    expect(document).toContain(
      'Representative authorization is an application-local, human-reviewed fact',
    );
    expect(document).toMatch(/works\s+with every Verus flag false/);
    expect(document).toContain('exact office term or candidacy');
    expect(document).toContain('delegation is non-transitive');
    expect(document).toContain('Expiry is automatic; revocation is immediate');
    expect(document).toContain('application-local correction and appeal without requiring Verus');
    expect(document).toContain('official response or correction request');
    expect(document).toContain('Conflicted reviewers must recuse');
  });

  it('defines optional VerusID proof without keys or identity-update/login conflation', async () => {
    const document = await read('docs/AUTH_AND_IDENTITY.md');

    for (const phrase of [
      'immutable Verus identity i-address',
      'at least 32 bytes of secure randomness',
      'single-use nonce',
      'same-device',
      'public HTTPS callback',
      'unguessable polling reference',
      'audience',
      'network/chain',
      'response signature',
      'revocation/recovery',
    ]) {
      expect(document, `missing wallet rule ${phrase}`).toContain(phrase);
    }

    expect(document).toMatch(/Desktop\/web\s+uses a QR/);
    expect(document).toMatch(/pinned\s+schema\/wallet\/library compatibility/);

    expect(document).toContain('IdentityUpdateRequest is not login');
    expect(document).toContain('issue #50 is closed as superseded');
    expect(document).toMatch(
      /never requests or receives a private key, WIF, seed phrase, wallet file/,
    );
  });

  it('limits attestations to minimum status and keeps eligibility independent', async () => {
    const document = await read('docs/AUTH_AND_IDENTITY.md');

    for (const field of [
      'provider:',
      'attestationType:',
      'status:',
      'assuranceLevel:',
      'validFrom:',
      'validUntil:',
      'checkedAt:',
      'opaqueReference:',
      'jurisdictionScopes:',
      'policyVersion:',
    ]) {
      expect(document, `missing attestation field ${field}`).toContain(field);
    }

    expect(document).toContain('HumanAttestationProvider');
    expect(document).toMatch(/CBC\) or any other provider remains\s+false by default/);
    expect(document).toMatch(/must not receive or persist the[\s\S]*underlying identity evidence/);
    expect(document).toContain('A precise-location lookup is transient routing assistance');
    expect(document).toMatch(
      /does not automatically prove locality, citizenship, voter[\s\S]*eligibility/,
    );
  });

  it('documents secure sessions, recovery, data-class rights, deep-link threats, and consent', async () => {
    const document = await read('docs/AUTH_AND_IDENTITY.md');

    for (const phrase of [
      'Access/export',
      'Correction',
      'Deletion/expiry',
      'Objection, review, and appeal',
      'Deep-link and callback threats',
      'QR replacement',
      'privacy-minimized append-only audit',
    ]) {
      expect(document, `missing lifecycle/session rule ${phrase}`).toContain(phrase);
    }

    expect(document).toMatch(/Keychain\s+or Keystore/);
    expect(document).toMatch(/Reuse of a rotated credential revokes its session\s+family/);
    expect(document).toMatch(/Consent is purpose-, provider-, data-, and policy-version-specific/);
  });

  it('enforces No Social Credit and keeps every high-risk gate false by default', async () => {
    const [document, envExample, featureSchema, authPackage] = await Promise.all([
      read('docs/AUTH_AND_IDENTITY.md'),
      read('.env.example'),
      read('packages/contracts/schemas/feature-gates.schema.json'),
      read('packages/auth/package.json'),
    ]);
    const schema = JSON.parse(featureSchema) as {
      properties: Record<string, { default?: boolean }>;
    };

    expect(document).toContain('No Social Credit');
    expect(document).toMatch(/generalized citizen score,[\s\S]*rank,[\s\S]*reputation/);
    expect(document).toContain('no public projection joins an account');
    for (const flag of sensitiveFlags) {
      expect(envExample, `${flag} must be false in .env.example`).toContain(`${flag}=false`);
      expect(schema.properties[flag]?.default, `${flag} schema default`).toBe(false);
    }
    expect(authPackage.toLowerCase()).not.toContain('verus');
  });

  it('records the accepted ADR and links the canonical policy from source-of-truth docs', async () => {
    const [adr, readme, architecture, roadmap, foundation, walletGuide, prd] = await Promise.all([
      read('docs/adr/0014-authentication-identity-authority-separation.md'),
      read('README.md'),
      read('docs/ARCHITECTURE.md'),
      read('docs/ROADMAP.md'),
      read('docs/AUTH_SECURITY_FOUNDATION.md'),
      read('docs/IDENTITY_AND_VERUS_MOBILE.md'),
      read('docs/PRD.md'),
    ]);

    expect(adr).toContain('**Status:** Accepted');
    expect(adr).toContain('Issue #3 changes documentation and regression tests only');
    for (const source of [readme, architecture, roadmap, foundation]) {
      expect(source).toContain('AUTH_AND_IDENTITY.md');
    }
    for (const source of [walletGuide, roadmap, prd]) {
      expect(source).toMatch(/Issue\s+#50/i);
      expect(source).toContain('superseded');
      expect(source).toMatch(/issues\s+#80.{1,3}#83/i);
    }
  });
});
