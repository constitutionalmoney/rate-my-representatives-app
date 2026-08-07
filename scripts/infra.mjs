import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chmod, mkdir, open, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localDirectory = path.join(root, '.local', 'infra');
const secretDirectory = path.join(localDirectory, 'secrets');
const composeArguments = ['compose', '-f', 'compose.infrastructure.yaml'];
const secretNames = [
  'postgres_password',
  'rabbitmq_password',
  'minio_root_password',
  'minio_api_password',
  'minio_quarantine_password',
  'minio_private_password',
  'verus_rpc_password',
];

async function writeNewSecret(name, value) {
  try {
    const handle = await open(path.join(secretDirectory, name), 'wx', 0o600);
    await handle.writeFile(value, 'utf8');
    await handle.close();
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
      const secretPath = path.join(secretDirectory, name);
      const current = (await readFile(secretPath, 'utf8')).trim();
      if (current.length === 0) throw new Error(`Local secret ${name} is empty.`);
      await writeFile(secretPath, current, { encoding: 'utf8', mode: 0o600 });
      await chmod(secretPath, 0o600);
      return;
    }
    throw error;
  }
}

async function prepare() {
  await mkdir(secretDirectory, { recursive: true, mode: 0o700 });
  for (const name of secretNames) {
    await writeNewSecret(name, randomBytes(32).toString('base64url'));
  }
  await writeNewSecret('verus_rpc_user', `rmr-local-rpc-${randomBytes(6).toString('hex')}`);
  process.stdout.write(
    `Local synthetic secrets are ready in ${path.relative(root, secretDirectory)}.\n`,
  );
}

function docker(arguments_, options = {}) {
  const result = spawnSync('docker', [...composeArguments, ...arguments_], {
    cwd: root,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stdout ?? '');
      process.stderr.write(result.stderr ?? '');
    }
    process.exit(result.status ?? 1);
  }
  return result.stdout ?? '';
}

async function reset() {
  if (!process.argv.includes('--confirm-local-reset')) {
    throw new Error('Refusing reset without --confirm-local-reset.');
  }
  const resolved = path.resolve(localDirectory);
  if (!resolved.startsWith(`${root}${path.sep}`) || resolved === root) {
    throw new Error(`Refusing to remove an unsafe path: ${resolved}`);
  }
  docker(['down', '--volumes', '--remove-orphans']);
  await rm(resolved, { force: true, recursive: true });
  process.stdout.write(
    'Removed only issue #9 local containers, named volumes, and generated secrets.\n',
  );
}

const command = process.argv[2];
switch (command) {
  case 'prepare':
    await prepare();
    break;
  case 'config':
    await prepare();
    docker(['config', '--quiet']);
    process.stdout.write('Core Compose configuration is valid.\n');
    break;
  case 'up':
    await prepare();
    docker(['up', '--detach', '--build', '--wait', '--wait-timeout', '300']);
    process.stdout.write(
      'Core local infrastructure is healthy; the Verus profile was not selected.\n',
    );
    break;
  case 'verus-up':
    await prepare();
    docker([
      '--profile',
      'verus',
      'up',
      '--detach',
      '--build',
      'verus-params',
      'verus-node',
      'wallet-request-signer-stub',
      'provenance-worker-signer-stub',
    ]);
    process.stdout.write('Optional VRSCTEST services started; no write feature was enabled.\n');
    break;
  case 'smoke': {
    await prepare();
    const result = spawnSync(process.execPath, ['scripts/smoke/infrastructure.mjs'], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'inherit',
    });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
    break;
  }
  case 'down':
    docker(['down', '--remove-orphans']);
    process.stdout.write(
      'Stopped local containers; named volumes and generated secrets were preserved.\n',
    );
    break;
  case 'reset':
    await reset();
    break;
  default:
    process.stderr.write(
      'Usage: node scripts/infra.mjs <prepare|config|up|smoke|down|reset|verus-up>\n',
    );
    process.exitCode = 64;
}
