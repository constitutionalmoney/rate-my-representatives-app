import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const root = new URL('../../', import.meta.url);
const read = (pathname: string) => readFile(new URL(pathname, root), 'utf8');

describe('issue #55 official-source ingestion foundation', () => {
  it('stores immutable retrieval, review, correction, and coverage history in PostgreSQL', async () => {
    const migration = await read('packages/db/migrations/0005_official_source_ingestion.sql');
    for (const table of [
      'source',
      'connector_version',
      'retrieval',
      'ingestion_run',
      'checkpoint_history',
      'candidate_record',
      'candidate_transformation',
      'candidate_match_evidence',
      'candidate_review_transition',
      'quarantine_item',
      'dead_letter_item',
      'reviewed_record_version',
      'coverage_snapshot',
    ]) {
      expect(migration).toContain(`CREATE TABLE rmr_source.${table}`);
    }
    expect(migration).toContain('official-source ingestion history is append-only');
    expect(migration).toContain('reviewed source records require an explicit human approval');
    expect(migration).toContain('coverage_gap_not_misconduct');
  });

  it('wires versioned generated contracts for both synthetic pilots and coverage', async () => {
    const generator = await read('packages/contracts/scripts/generate.mjs');
    const validator = await read('packages/contracts/scripts/validate-contracts.mjs');
    for (const filename of [
      'source-connector-capability.schema.json',
      'source-coverage-snapshot.schema.json',
      'source-connector-ca.synthetic.json',
      'source-connector-us.synthetic.json',
      'source-coverage.synthetic.json',
    ]) {
      expect(`${generator}\n${validator}`).toContain(filename);
    }
  });

  it('keeps runtime ingestion disabled and public source reads deferred', async () => {
    const [config, environment, compose, openapi] = await Promise.all([
      read('packages/config/src/index.ts'),
      read('.env.example'),
      read('compose.yaml'),
      read('packages/contracts/openapi/v1.yaml'),
    ]);
    expect(config).toContain('SOURCE_INGESTION_ENABLED');
    expect(environment).toContain('SOURCE_INGESTION_ENABLED=false');
    expect(compose).toContain("SOURCE_INGESTION_ENABLED: 'false'");
    expect(openapi).toContain('no public source read operation until issue #11');
    expect(openapi).not.toMatch(/operationId: .*?(Source|Coverage)/);
  });

  it('contains no Verus, scoring, identity update, or provenance write coupling', async () => {
    const connector = await read('packages/connectors/src/pipeline.ts');
    const migration = await read('packages/db/migrations/0005_official_source_ingestion.sql');
    const combined = `${connector}\n${migration}`;
    expect(combined).not.toMatch(/verus|mainnet|identity_update|representative_score/i);
    expect(combined).not.toContain('provenance.anchor.requested');
  });
});
