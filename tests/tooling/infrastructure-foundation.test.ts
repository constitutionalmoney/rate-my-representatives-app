import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { FEATURE_FLAG_NAMES } from '../../packages/config/src/index.js';
import { LOCAL_INFRASTRUCTURE_CONTRACT } from '../../packages/contracts/src/infrastructure.js';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

describe('issue #9 local infrastructure foundation', () => {
  it('declares all core services and keeps Verus outside the core contract', () => {
    expect(LOCAL_INFRASTRUCTURE_CONTRACT.coreServices).toEqual([
      'postgres',
      'migrations',
      'rabbitmq',
      'object-storage',
      'mailpit',
      'api',
      'worker',
    ]);
    expect(LOCAL_INFRASTRUCTURE_CONTRACT.optionalProfiles.verus.enabledByDefault).toBe(false);
    expect(LOCAL_INFRASTRUCTURE_CONTRACT.optionalProfiles.verus.writesEnabled).toBe(false);
  });

  it('keeps every high-risk feature false in the infrastructure compose file', async () => {
    const compose = await read('compose.infrastructure.yaml');
    const flags = compose.match(/[A-Z_]+_ENABLED: ['"]false['"]/g) ?? [];
    expect(flags.map((line) => line.split(':')[0]).sort()).toEqual([...FEATURE_FLAG_NAMES].sort());
  });

  it('requires the Verus profile and never publishes authenticated RPC', async () => {
    const compose = await read('compose.infrastructure.yaml');
    const verusNode = compose.slice(
      compose.indexOf('  verus-node:'),
      compose.indexOf('  wallet-request-signer-stub:'),
    );

    expect(verusNode).toContain("profiles: ['verus']");
    expect(verusNode).toContain('VERUS_NETWORK: VRSCTEST');
    expect(verusNode).toContain("expose:\n      - '27486'");
    expect(verusNode).not.toContain('ports:');
    expect(compose).not.toMatch(/27486:27486/);
    expect(compose).toContain('verus-rpc:\n    internal: true');
  });

  it('mounts generated secrets and contains no key, seed, WIF, or mainnet fixture', async () => {
    const files = await Promise.all([
      read('compose.infrastructure.yaml'),
      read('infra/verus/fixtures/wallet-request.json'),
      read('infra/verus/fixtures/provenance-job.json'),
    ]);
    const text = files.join('\n');

    expect(text).toContain('.local/infra/secrets');
    expect(text).not.toMatch(/mainnet|seed phrase|private key|\bwif\b/i);
    expect(text).toContain('signingEnabled": false');
    expect(text).toContain('writeEnabled": false');
  });

  it('isolates public records, public manifests, quarantine, and private evidence', async () => {
    const [publicPolicy, manifestPolicy, quarantinePolicy, privatePolicy] = await Promise.all([
      read('infra/object-storage/policies/api-public-reader.json'),
      read('infra/object-storage/policies/manifest-writer.json'),
      read('infra/object-storage/policies/quarantine-worker.json'),
      read('infra/object-storage/policies/private-worker.json'),
    ]);

    expect(publicPolicy).toContain('rmr-public/*');
    expect(publicPolicy).toContain('rmr-public-manifests/*');
    expect(publicPolicy).not.toMatch(/rmr-private-evidence|rmr-quarantine/);
    expect(manifestPolicy).toContain('rmr-public-manifests/*');
    expect(manifestPolicy).not.toMatch(/rmr-private-evidence|rmr-quarantine|rmr-public\/\*/);
    expect(quarantinePolicy).toContain('rmr-quarantine/*');
    expect(quarantinePolicy).not.toMatch(/rmr-private-evidence|rmr-public/);
    expect(privatePolicy).toContain('rmr-private-evidence/*');
    expect(privatePolicy).not.toMatch(/rmr-quarantine|rmr-public/);
  });

  it('passes generated MinIO credentials after an end-of-options delimiter', async () => {
    const storageSetup = await read('infra/object-storage/configure-storage.sh');

    expect(storageSetup).toContain(
      'mc alias set -- local "${MINIO_ENDPOINT}" "${MINIO_ROOT_USER}" "${root_password}"',
    );
    expect(storageSetup.match(/mc admin user add -- local/g)).toHaveLength(4);
    expect(storageSetup).not.toMatch(/^mc (?:alias set|admin user add) local /m);
  });

  it('does not apply object-prefix conditions to unsupported MinIO actions', async () => {
    const publicPolicy = JSON.parse(
      await read('infra/object-storage/policies/api-public-reader.json'),
    ) as {
      Statement: Array<{ Action: string[]; Condition?: unknown }>;
    };
    const bucketLocationStatement = publicPolicy.Statement.find((statement) =>
      statement.Action.includes('s3:GetBucketLocation'),
    );
    const listStatement = publicPolicy.Statement.find((statement) =>
      statement.Action.includes('s3:ListBucket'),
    );

    expect(bucketLocationStatement?.Condition).toBeUndefined();
    expect(listStatement?.Condition).toBeUndefined();
  });

  it('creates portable API and worker deploy directories with injected workspace packages', async () => {
    const [workspace, apiDockerfile, workerDockerfile] = await Promise.all([
      read('pnpm-workspace.yaml'),
      read('infra/docker/api.Dockerfile'),
      read('infra/docker/worker.Dockerfile'),
    ]);

    expect(workspace).toContain('injectWorkspacePackages: true');
    for (const dockerfile of [apiDockerfile, workerDockerfile]) {
      expect(dockerfile).toContain('--prod deploy /opt/');
      expect(dockerfile).not.toContain('--legacy');
    }
  });

  it('provides checksummed migrations, synthetic seed data, and guarded reset behavior', async () => {
    const [runner, seed, manager] = await Promise.all([
      read('infra/postgres/run-migrations.sh'),
      read('packages/db/seeds/local/0001_synthetic_foundation.sql'),
      read('scripts/infra.mjs'),
    ]);

    expect(runner).toContain('schema_migration');
    expect(runner).toContain('sha256sum');
    expect(seed).toContain('synthetic.infrastructure.foundation.v1');
    expect(manager).toContain('--confirm-local-reset');
    expect(manager).toContain("docker(['down', '--volumes', '--remove-orphans'])");
  });
});
