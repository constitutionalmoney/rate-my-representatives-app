import { readFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const expectedDirectories = [
  'apps/mobile',
  'apps/web',
  'apps/portal',
  'apps/admin',
  'apps/api',
  'apps/worker',
  'packages/domain',
  'packages/db',
  'packages/contracts',
  'packages/auth',
  'packages/connectors',
  'packages/methodology',
  'packages/civic-signal',
  'packages/moderation',
  'packages/verus',
  'packages/provenance',
  'packages/mobile-ui',
  'packages/web-ui',
  'packages/observability',
  'packages/config',
  'infra/docker',
  'infra/deployment',
  'infra/mobile',
  'infra/monitoring',
];

describe('issue #8 workspace foundation', () => {
  it('contains every prescribed application, package, and infrastructure boundary', async () => {
    for (const directory of expectedDirectories) {
      await expect(stat(path.join(root, directory))).resolves.toMatchObject({});
    }
  });

  it('enforces client and UI dependency boundaries', () => {
    const result = spawnSync(process.execPath, ['scripts/check-workspace-boundaries.mjs'], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('boundaries are valid');
  });

  it('documents every high-risk environment flag as false', async () => {
    const example = await readFile(path.join(root, '.env.example'), 'utf8');
    const highRiskLines = example.split(/\r?\n/).filter((line) => /^[A-Z_]+_ENABLED=/.test(line));

    expect(highRiskLines).toHaveLength(13);
    expect(highRiskLines.every((line) => line.endsWith('=false'))).toBe(true);
    expect(example).not.toMatch(/mainnet/i);
  });

  it('provides an application-only Dokploy compose foundation with safe feature defaults', async () => {
    const compose = await readFile(path.join(root, 'compose.yaml'), 'utf8');

    expect(compose).toContain('dockerfile: infra/docker/api.Dockerfile');
    expect(compose).toContain('dockerfile: infra/docker/web.Dockerfile');
    expect(compose.match(/[A-Z_]+_ENABLED: ['"]false['"]/g)).toHaveLength(13);
    expect(compose).not.toMatch(/postgres|redis|rabbitmq|minio/i);
    expect(compose).not.toMatch(/image:\s*[^\n]*verus/i);
    expect(compose).not.toContain('container_name:');
  });
});
