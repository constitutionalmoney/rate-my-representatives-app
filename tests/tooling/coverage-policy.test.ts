import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const root = new URL('../../', import.meta.url);
const read = (pathname: string) => readFile(new URL(pathname, root), 'utf8');

describe('issue #7 coverage and pilot policy', () => {
  it('defines reproducible denominators, formulas, zero-denominator behavior, and gates', async () => {
    const policy = await read('docs/COVERAGE_POLICY.md');

    expect(policy).toContain('coverage_percent = round(100 * |Q| / |E|, 2)');
    expect(policy).toContain('current_percent = round(100 * current_count');
    expect(policy).toContain('connector_success_percent = round(100');
    expect(policy).toContain('percentage is `null`');
    expect(policy).toContain('structural-registry coverage is 100%');
    expect(policy).toMatch(/at\s+least 99% on an approved blind validation set/);
    expect(policy).toContain('material-claim source-metadata coverage is 100%');
  });

  it('keeps gaps public and prevents missing-data misconduct or scoring inferences', async () => {
    const policy = await read('docs/COVERAGE_POLICY.md');

    expect(policy).toContain('Missing data is never converted to zero');
    expect(policy).toContain('coverage_gap_not_misconduct');
    expect(policy).toContain('approves no representative-signal aggregate');
    expect(policy).toContain('Engagement, time in app, swipe volume');
    expect(policy).toMatch(/Raw user\s+activity is never provenance input/);
  });

  it('validates the versioned synthetic public-report contract', async () => {
    const [schemaText, fixtureText] = await Promise.all([
      read('packages/contracts/schemas/coverage-report.schema.json'),
      read('packages/contracts/fixtures/coverage-report.synthetic.json'),
    ]);
    const schema = JSON.parse(schemaText) as {
      properties: {
        schemaVersion: { const: string };
        policyVersion: { const: string };
        missingDataMeaning: { const: string };
      };
      required: string[];
    };
    const fixture = JSON.parse(fixtureText) as {
      dataMode: string;
      missingDataMeaning: string;
      provenance: { state: string };
      releaseDecision: { publicApproval: boolean; status: string };
      dimensions: Array<{ dimensionId: string }>;
    };
    expect(schema.properties.schemaVersion.const).toBe('coverage-report.v1');
    expect(schema.properties.policyVersion.const).toBe('coverage-policy.v1');
    expect(schema.properties.missingDataMeaning.const).toBe('coverage_gap_not_misconduct');
    expect(schema.required).toEqual(
      expect.arrayContaining([
        'jurisdictions',
        'authoritativeSources',
        'inventory',
        'dimensions',
        'freshness',
        'connectors',
        'gaps',
        'knownErrors',
        'corrections',
        'changelog',
        'releaseDecision',
      ]),
    );
    expect(fixture.dataMode).toBe('synthetic');
    expect(fixture.missingDataMeaning).toBe('coverage_gap_not_misconduct');
    expect(fixture.provenance.state).toBe('not_anchored');
    expect(fixture.releaseDecision).toEqual(
      expect.objectContaining({ publicApproval: false, status: 'not_ready' }),
    );
    expect(fixture.dimensions.map(({ dimensionId }) => dimensionId)).toEqual(
      expect.arrayContaining([
        'profile_coverage',
        'material_claim_source_coverage',
        'representative_match',
      ]),
    );
  });

  it('wires generated TypeScript and fixture output without adding a public route', async () => {
    const [generator, validator, openapi] = await Promise.all([
      read('packages/contracts/scripts/generate.mjs'),
      read('packages/contracts/scripts/validate-contracts.mjs'),
      read('packages/contracts/openapi/v1.yaml'),
    ]);

    expect(generator).toContain("'coverage-report.schema.json'");
    expect(generator).toContain("'coverage-report.synthetic.json'");
    expect(validator).toContain(
      "['coverage-report.synthetic.json', 'coverage-report.schema.json']",
    );
    expect(openapi).not.toContain('operationId: getCoverageReport');
  });
});
