import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { PURPOSE_LIMITED_STATE_RULES } from '../../packages/domain/src/no-social-credit.js';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

describe('issue #57 No Social Credit enforcement foundation', () => {
  it('keeps the generated policy and domain narrow-state rules aligned', async () => {
    const fixture = JSON.parse(
      await read('packages/contracts/fixtures/no-social-credit-policy.synthetic.json'),
    ) as {
      narrowStates: unknown[];
      hardRules: Record<string, boolean>;
      releaseGate: { decision: string };
    };
    expect(fixture.narrowStates).toEqual(PURPOSE_LIMITED_STATE_RULES);
    expect(Object.values(fixture.hardRules).every((value) => value === false)).toBe(true);
    expect(fixture.releaseGate.decision).toBe('blocked');
  });

  it('documents prohibitions, narrow-state limits, rights, incidents, and blockers', async () => {
    const policy = await read('docs/NO_SOCIAL_CREDIT.md');
    for (const heading of [
      '## Covenant',
      '## Prohibited outcomes and uses',
      '## Purpose-limited state register',
      '## Enforcement by surface',
      '## Required impact assessment',
      '## Rights, reasons, review, and reporting',
      '## Release gate',
      '## Unresolved production blockers',
    ])
      expect(policy).toContain(heading);
    expect(policy).toContain('No feature flag can override');
    expect(policy).toContain('security/privacy incident');
    expect(policy).toMatch(/does not authorize a\s+participatory pilot/);
  });

  it('links the policy from controlling architecture, security, and governance docs', async () => {
    const documents = await Promise.all(
      [
        'README.md',
        'SECURITY.md',
        'CONTRIBUTING.md',
        'docs/ARCHITECTURE.md',
        'docs/ROADMAP.md',
        'docs/CONTRACTS.md',
        'docs/DATA_CLASSIFICATION.md',
        'docs/AUTH_AND_IDENTITY.md',
        'docs/METHODOLOGY.md',
        'docs/THREAT_MODEL.md',
      ].map(read),
    );
    for (const document of documents) expect(document).toContain('NO_SOCIAL_CREDIT.md');
  });

  it('keeps SQL, public contracts, telemetry, events, exports, and AI under deny guards', async () => {
    const evidence = await Promise.all(
      [
        'scripts/check-no-social-credit.mjs',
        'scripts/smoke/security-domains.sql',
        'packages/contracts/scripts/validate-contracts.mjs',
        'packages/auth/src/no-social-credit.ts',
        'packages/domain/src/audit-outbox.ts',
        'packages/domain/src/no-social-credit.ts',
        'packages/observability/src/index.ts',
        'apps/mobile/src/crash-privacy.ts',
      ].map(read),
    );
    for (const source of evidence) expect(source).toMatch(/social.?credit|generalized|citizen/i);
  });

  it('requires all nine impact-assessment fields in every contribution path', async () => {
    const templates = await Promise.all(
      [
        '.github/PULL_REQUEST_TEMPLATE.md',
        '.github/ISSUE_TEMPLATE/rfc.yml',
        '.github/ISSUE_TEMPLATE/feature_request.yml',
      ].map(read),
    );
    for (const template of templates) {
      for (const field of [
        'Citizen data',
        'Purpose',
        'Ranking or prediction',
        'Access',
        'Retention',
        'Reason and appeal',
        'Cross-product use',
        'Unrelated access effect',
        'Proving tests',
      ])
        expect(template.toLowerCase()).toContain(field.toLowerCase());
    }
  });
});
