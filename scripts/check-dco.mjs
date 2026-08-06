import { spawnSync } from 'node:child_process';
import process from 'node:process';

const explicitRange = process.argv[2];
let range = explicitRange;
if (!range && process.env.GITHUB_BASE_REF) {
  const mergeBase = spawnSync(
    'git',
    ['merge-base', `origin/${process.env.GITHUB_BASE_REF}`, 'HEAD'],
    {
      encoding: 'utf8',
    },
  );
  if (mergeBase.status !== 0) {
    console.error(mergeBase.stderr);
    process.exit(mergeBase.status ?? 1);
  }
  range = `${mergeBase.stdout.trim()}..HEAD`;
}
range ??= 'HEAD^..HEAD';

const log = spawnSync('git', ['log', '--format=%H%x1f%B%x1e', range], { encoding: 'utf8' });
if (log.status !== 0) {
  console.error(log.stderr);
  process.exit(log.status ?? 1);
}

const failures = [];
for (const record of log.stdout.split('\x1e').filter((value) => value.trim() !== '')) {
  const separator = record.indexOf('\x1f');
  const sha = record.slice(0, separator).trim();
  const body = separator === -1 ? '' : record.slice(separator + 1);
  if (!/^Signed-off-by: .+ <[^<>\s]+@[^<>\s]+>$/im.test(body)) failures.push(sha);
}

if (failures.length > 0) {
  console.error(`Commits missing DCO sign-off:\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`All commits in ${range} include a DCO sign-off.`);
}
