import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const root = new URL('../../', import.meta.url);
const read = (pathname: string) => readFile(new URL(pathname, root), 'utf8');

describe('issue #59 public-role lifecycle foundation', () => {
  it('keeps civic entities separate and PostgreSQL canonical', async () => {
    const migration = await read('packages/db/migrations/0004_public_role_lifecycle.sql');
    for (const table of [
      'person',
      'person_name',
      'office_term',
      'election',
      'candidacy',
      'person_resolution_decision',
      'external_identity_reference',
    ]) {
      expect(migration).toContain(`CREATE TABLE rmr_registry.${table}`);
    }
    expect(migration).toContain('name-only person resolution is forbidden');
    expect(migration).toContain('canonical_authority = false');
    expect(migration).toContain('grants_authorization = false');
  });

  it('publishes only the four read-only issue #59 operations', async () => {
    const openapi = await read('packages/contracts/openapi/v1.yaml');
    for (const operation of [
      'getPeopleRegistry',
      'getOfficeTermRegistry',
      'getElectionRegistry',
      'getCandidacyRegistry',
    ]) {
      expect(openapi).toContain(`operationId: ${operation}`);
    }
    expect(openapi).not.toMatch(
      /operationId: (create|update|delete).*?(Person|Term|Election|Candidacy)/i,
    );
  });

  it('keeps deferred and high-risk families out of the implementation', async () => {
    const migration = await read('packages/db/migrations/0004_public_role_lifecycle.sql');
    const seed = await read('packages/db/seeds/local/0003_synthetic_public_role_lifecycle.sql');
    const compose = await read('compose.yaml');
    expect(migration).not.toMatch(
      /CREATE TABLE .*?(score|rating|source_ingestion|provenance|verus)/i,
    );
    expect(seed).not.toMatch(/mainnet|real.person|identity.update/i);
    for (const flag of [
      'VERUS_ID_LINKING_ENABLED',
      'VERUS_IDENTITY_UPDATE_ENABLED',
      'PROVENANCE_WRITES_ENABLED',
      'COMPOSITE_SCORE_ENABLED',
    ]) {
      expect(compose).toContain(`${flag}: 'false'`);
    }
  });
});
