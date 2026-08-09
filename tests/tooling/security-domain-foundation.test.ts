import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

describe('issue #22 security-domain enforcement foundation', () => {
  it('uses distinct least-privilege database logins for API, worker, and migrations', async () => {
    const [compose, runner, migration] = await Promise.all([
      read('compose.infrastructure.yaml'),
      read('infra/postgres/run-migrations.sh'),
      read('packages/db/migrations/0007_security_domain_separation.sql'),
    ]);
    const api = compose.slice(compose.indexOf('  api:'), compose.indexOf('  worker:'));
    const worker = compose.slice(compose.indexOf('  worker:'), compose.indexOf('  verus-params:'));
    expect(api).toContain('DATABASE_USER: rmr_api_runtime');
    expect(api).toContain('postgres_api_password');
    expect(api).not.toContain('postgres_password\n');
    expect(worker).toContain('DATABASE_USER: rmr_worker_runtime');
    expect(worker).toContain('postgres_worker_password');
    expect(worker).not.toContain('postgres_password\n');
    expect(worker).not.toMatch(/OBJECT_STORAGE_ACCESS_KEY|minio_(api|manifest|private)_password/);
    expect(runner).toContain('GRANT rmr_api_public_service TO rmr_api_runtime');
    expect(runner).toContain('GRANT rmr_core_worker_service TO rmr_worker_runtime');
    expect(migration).not.toMatch(/GRANT rmr_outbox_worker TO rmr_(api|core)/);
  });

  it('reserves eight schemas and denies public defaults', async () => {
    const migration = await read('packages/db/migrations/0007_security_domain_separation.sql');
    for (const schema of [
      'rmr_account',
      'rmr_location',
      'rmr_identity',
      'rmr_participation',
      'rmr_moderation',
      'rmr_provenance',
      'rmr_signer',
      'rmr_security',
    ]) {
      expect(migration).toContain(`CREATE SCHEMA ${schema};`);
      expect(migration).toContain(schema);
    }
    expect(migration).toContain('REVOKE ALL ON SCHEMA public FROM PUBLIC');
    expect(migration).toContain('REVOKE ALL ON TABLES FROM PUBLIC');
    expect(migration).toContain('REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC');
    expect(migration).toContain('REVOKE USAGE ON TYPES FROM PUBLIC');
    expect(migration).toContain('NOBYPASSRLS');
  });

  it('scopes queue claims and keeps provenance events unavailable to the general worker', async () => {
    const migration = await read('packages/db/migrations/0007_security_domain_separation.sql');
    const coreClaim = migration.slice(
      migration.indexOf('CREATE OR REPLACE FUNCTION rmr_outbox.claim_core_events'),
      migration.indexOf('CREATE OR REPLACE FUNCTION rmr_outbox.claim_source_events'),
    );
    expect(coreClaim).toMatch(/notification\.dispatch.*search\.index.*aggregate\.recompute/s);
    expect(coreClaim).not.toMatch(/public_manifest|provenance\.anchor|source\.retrieve/);
    expect(migration).toContain('complete_core_event');
    expect(migration).toContain('fail_core_event');
    expect(migration).toContain('claim_provenance_events');
    expect(migration).toContain('TO rmr_provenance_service');
  });

  it('structurally excludes payload and subject data from access reviews', async () => {
    const migration = await read('packages/db/migrations/0007_security_domain_separation.sql');
    const table = migration.slice(
      migration.indexOf('CREATE TABLE rmr_security.access_review_event'),
      migration.indexOf('COMMENT ON TABLE rmr_security.access_review_event'),
    );
    expect(table).not.toMatch(
      /account_id|address|evidence|moderator_note|precise_location|signal|subject_id|wallet/i,
    );
    expect(migration).toContain('BEFORE UPDATE OR DELETE OR TRUNCATE');
  });

  it('isolates signing networks and credentials from API, web, native, and core worker', async () => {
    const compose = await read('compose.infrastructure.yaml');
    const apiAndWorker = compose.slice(
      compose.indexOf('  api:'),
      compose.indexOf('  verus-params:'),
    );
    const signer = compose.slice(
      compose.indexOf('  provenance-worker-signer-stub:'),
      compose.indexOf('\nsecrets:'),
    );
    expect(apiAndWorker).not.toMatch(/signer-control|verus-rpc|verus_rpc_(user|password)/);
    expect(signer).toContain('signer-control');
    expect(signer).toContain('verus-rpc');
  });

  it('carries classification through encrypted backup and restore metadata', async () => {
    const manifest = JSON.parse(
      await read('infra/backup/security-domain-manifest.synthetic.json'),
    ) as Record<string, unknown>;
    expect(manifest).toMatchObject({
      dataMode: 'synthetic',
      encrypted: true,
      restoreMustPreserveClassification: true,
      productionToNonProductionAllowed: false,
    });
    expect(manifest.domains).toHaveLength(8);
    expect(manifest.objectStorage).toHaveLength(4);
  });

  it('tests database grants, forbidden views, and payload-free access decisions in smoke', async () => {
    const smoke = await read('scripts/smoke/security-domains.sql');
    expect(smoke).toContain('rmr_api_runtime');
    expect(smoke).toContain('rmr_worker_runtime');
    expect(smoke).toContain('rmr_signer_service');
    expect(smoke).toMatch(/citizenscore\|socialcredit\|politicalprofile/);
    expect(smoke).toContain('record_access_decision');
  });
});
