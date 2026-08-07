import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

describe('issue #49 jurisdiction registry foundation', () => {
  it('enforces temporal overlap, graph integrity, stable IDs, and public view isolation', async () => {
    const migration = await read('packages/db/migrations/0003_jurisdiction_registry.sql');
    expect(migration).toContain('CREATE EXTENSION IF NOT EXISTS btree_gist');
    expect(migration).toMatch(
      /EXCLUDE USING gist \(jurisdiction_id WITH =, effective_period WITH &&\)/,
    );
    expect(migration).toContain('effective-dated jurisdiction containment cycle');
    expect(migration).toContain('registry edge crosses a country boundary');
    expect(migration).toContain('CREATE VIEW rmr_registry.public_jurisdiction_version');
    expect(migration).toContain('REVOKE ALL ON ALL TABLES IN SCHEMA rmr_registry FROM PUBLIC');
  });

  it('provides materially different synthetic Canada and United States fixtures', async () => {
    const seed = await read('packages/db/seeds/local/0002_synthetic_jurisdiction_registry.sql');
    expect(seed).toContain("'jurisdiction:ca:north-region'");
    expect(seed).toContain("'regional_district'");
    expect(seed).toContain("'jurisdiction:us:example-county'");
    expect(seed).toContain("'jurisdiction:us:water'");
    expect(seed).toContain("'overlaps'");
    expect(seed).toContain("'redistricted_from'");
    expect(seed).toContain("'amalgamated'");
  });

  it('does not create deferred people, term, candidacy, location, or prohibited hierarchy tables', async () => {
    const implementation = (
      await Promise.all([
        read('packages/db/migrations/0003_jurisdiction_registry.sql'),
        read('packages/domain/src/jurisdiction-registry.ts'),
      ])
    ).join('\n');
    for (const prohibited of [
      /CREATE TABLE .*person/i,
      /CREATE TABLE .*office_term/i,
      /CREATE TABLE .*candidacy/i,
      /CREATE TABLE .*location/i,
      /CREATE TABLE .*verus/i,
      /CREATE TABLE .*treasury/i,
      /CREATE TABLE .*reserve/i,
      /CREATE TABLE .*currency/i,
    ]) {
      expect(implementation).not.toMatch(prohibited);
    }
    expect(implementation).not.toMatch(/sendcurrency|getidentity|updateidentity|verus\.exe/i);
  });

  it('wires the generated registry schema, fixture, and operational read response', async () => {
    const [generator, openapi] = await Promise.all([
      read('packages/contracts/scripts/generate.mjs'),
      read('packages/contracts/openapi/v1.yaml'),
    ]);
    expect(generator).toContain('jurisdiction-registry.schema.json');
    expect(generator).toContain('jurisdictions.synthetic.json');
    expect(openapi).toContain('featureStatus: operational');
    expect(openapi).toContain("'200':");
  });
});
