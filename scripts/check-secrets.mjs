import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const result = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  encoding: 'utf8',
});
if (result.status !== 0) {
  console.error(result.stderr);
  process.exit(result.status ?? 1);
}

const patterns = [
  { label: 'private key material', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/ },
  { label: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  {
    label: 'generic assigned secret',
    pattern: /\b(?:api[_-]?key|client[_-]?secret|private[_-]?key)\s*[:=]\s*['"][^'"\s]{16,}['"]/i,
  },
  {
    label: 'wallet seed phrase field',
    pattern: /\b(?:seed[_-]?phrase|mnemonic|wif)\s*[:=]\s*['"][^'"]+['"]/i,
  },
];
const ignored = new Set(['pnpm-lock.yaml']);
const findings = [];

for (const file of result.stdout.split(/\r?\n/).filter(Boolean)) {
  if (ignored.has(file) || file.startsWith('.git/')) continue;
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch {
    continue;
  }
  for (const candidate of patterns) {
    if (candidate.pattern.test(text)) findings.push(`${file}: ${candidate.label}`);
  }
}

if (findings.length > 0) {
  console.error(`Potential secrets detected:\n${findings.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('No high-confidence secret patterns detected.');
}
