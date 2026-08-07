import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

const root = new URL('../../', import.meta.url);
const read = (pathname: string) => readFile(new URL(pathname, root), 'utf8');

describe('issue #11 source-backed public profile API', () => {
  it('stores human-published, source-linked, append-only profile projections', async () => {
    const migration = await read(
      'packages/db/migrations/0006_source_backed_public_profile_read.sql',
    );
    for (const relation of [
      'profile_publication_decision',
      'profile',
      'profile_version',
      'profile_version_source',
      'profile_timeline_item',
      'profile_timeline_source',
    ]) {
      expect(migration).toContain(`CREATE TABLE rmr_public.${relation}`);
    }
    expect(migration).toContain('num_nonnulls(office_term_id, candidacy_id) = 1');
    expect(migration).toContain('an explicit reviewer or admin publish decision');
    expect(migration).toContain(
      'a public profile version requires at least one reviewed source record',
    );
    expect(migration).toContain('public profile history is append-only');
  });

  it('publishes list, detail, timeline, source, coverage, response, dispute, and correction reads', async () => {
    const openapi = await read('packages/contracts/openapi/v1.yaml');
    for (const operation of [
      'listPublicRoleProfiles',
      'getPublicRoleProfile',
      'getPublicRoleProfileTimeline',
      'getPublicRoleProfileSources',
      'getPublicRoleProfileCoverage',
      'getPublicRoleProfileResponses',
      'getPublicRoleProfileDisputes',
      'getPublicRoleProfileCorrections',
      'getPublicRoleProfileAppeals',
    ]) {
      expect(openapi).toContain(`operationId: ${operation}`);
    }
    expect(openapi).not.toMatch(
      /operationId: (create|update|delete|publish).*?(Profile|Source|Coverage)/i,
    );
    expect(openapi).toContain('conditional-get-etag');
  });

  it('generates native/web contracts and validates the public serializer allowlist', async () => {
    const [generator, validator, mobile, web] = await Promise.all([
      read('packages/contracts/scripts/generate.mjs'),
      read('packages/contracts/src/validators.ts'),
      read('apps/mobile/src/api.ts'),
      read('apps/web/src/health.ts'),
    ]);
    expect(generator).toContain('public-role-profile.schema.json');
    expect(validator).toContain('parsePublicRoleProfile');
    expect(mobile).toContain('readMobilePublicProfile');
    expect(web).toContain('readWebPublicProfile');
  });

  it('keeps Verus, automatic publication, signals, scoring, and provenance writes out', async () => {
    const [profile, handler, compose] = await Promise.all([
      read('packages/domain/src/public-profile.ts'),
      read('apps/api/src/handler.ts'),
      read('compose.yaml'),
    ]);
    expect(profile).toContain('provenance: null');
    expect(profile).toContain("'automatic_publication'");
    expect(profile).toContain('compositeScoreIncluded: false');
    expect(handler).not.toMatch(/updateidentity|sendcurrency|contentmultimap/i);
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
