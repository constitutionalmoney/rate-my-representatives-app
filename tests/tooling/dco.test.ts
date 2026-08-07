import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const checkerPath = resolve('scripts/check-dco.mjs');
const temporaryRepositories: string[] = [];

function git(repository: string, ...arguments_: string[]): string {
  return execFileSync('git', arguments_, {
    cwd: repository,
    encoding: 'utf8',
  }).trim();
}

function commitFile(repository: string, name: string, message: string): string {
  writeFileSync(join(repository, name), `${message}\n`, 'utf8');
  git(repository, 'add', name);
  git(repository, 'commit', '-m', message, '--signoff');
  return git(repository, 'rev-parse', 'HEAD');
}

function createPullRequestHistory(): { base: string; repository: string } {
  const repository = mkdtempSync(join(tmpdir(), 'rmr-dco-'));
  temporaryRepositories.push(repository);

  git(repository, 'init', '--initial-branch=main');
  git(repository, 'config', 'user.name', 'Synthetic Contributor');
  git(repository, 'config', 'user.email', 'synthetic@example.test');
  git(repository, 'config', 'core.autocrlf', 'false');

  commitFile(repository, 'base.txt', 'base');
  const base = git(repository, 'rev-parse', 'HEAD');

  git(repository, 'switch', '-c', 'feature');
  commitFile(repository, 'feature.txt', 'signed feature');

  git(repository, 'switch', 'main');
  commitFile(repository, 'main.txt', 'signed main');
  git(repository, 'merge', '--no-ff', 'feature', '-m', 'Synthetic pull request merge');

  return { base, repository };
}

afterEach(() => {
  for (const repository of temporaryRepositories.splice(0)) {
    rmSync(repository, { force: true, recursive: true });
  }
});

describe('DCO checker', () => {
  it('ignores a synthetic pull-request merge commit while checking authored commits', () => {
    const { base, repository } = createPullRequestHistory();

    const result = spawnSync(process.execPath, [checkerPath, `${base}..HEAD`], {
      cwd: repository,
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('include a DCO sign-off');
    expect(result.stderr).toBe('');
  });

  it('still rejects an unsigned authored commit', () => {
    const { base, repository } = createPullRequestHistory();
    writeFileSync(join(repository, 'unsigned.txt'), 'unsigned\n', 'utf8');
    git(repository, 'add', 'unsigned.txt');
    git(repository, 'commit', '-m', 'unsigned authored change');
    const unsignedSha = git(repository, 'rev-parse', 'HEAD');

    const result = spawnSync(process.execPath, [checkerPath, `${base}..HEAD`], {
      cwd: repository,
      encoding: 'utf8',
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Commits missing DCO sign-off');
    expect(result.stderr).toContain(unsignedSha);
  });
});
