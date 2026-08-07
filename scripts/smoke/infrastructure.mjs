import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const secretDirectory = path.join(root, '.local', 'infra', 'secrets');
const rabbitPassword = (
  await readFile(path.join(secretDirectory, 'rabbitmq_password'), 'utf8')
).trim();
const rabbitPort = process.env.RMR_RABBITMQ_MANAGEMENT_PORT ?? '15672';
const authorization = `Basic ${Buffer.from(`rmr-local:${rabbitPassword}`).toString('base64')}`;
const rabbitBase = `http://127.0.0.1:${rabbitPort}`;
const vhost = '%2F';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function jsonRequest(pathname, method = 'GET', body) {
  const response = await fetch(`${rabbitBase}${pathname}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { authorization, 'content-type': 'application/json' },
    method,
  });
  if (!response.ok) throw new Error(`RabbitMQ smoke request failed: ${method} ${pathname}`);
  if (response.status === 204) return undefined;
  return response.json();
}

async function waitFor(predicate, message) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(message);
}

for (const queue of ['rmr.jobs', 'rmr.jobs.retry', 'rmr.jobs.dead']) {
  await jsonRequest(`/api/queues/${vhost}/${queue}/contents`, 'DELETE');
}

const fixture = JSON.stringify({ fixtureId: 'synthetic-queue-retry-0001', personalData: false });
const publish = await jsonRequest(`/api/exchanges/${vhost}/rmr.retry/publish`, 'POST', {
  payload: fixture,
  payload_encoding: 'string',
  properties: {
    content_type: 'application/json',
    delivery_mode: 2,
    message_id: 'synthetic-queue-retry-0001',
  },
  routing_key: 'retry',
});
assert(publish?.routed === true, 'Retry fixture was not routed.');

await waitFor(async () => {
  const queue = await jsonRequest(`/api/queues/${vhost}/rmr.jobs`);
  return queue?.messages_ready === 1;
}, 'Retry queue did not return the fixture to the primary queue.');

let rejected;
await waitFor(async () => {
  rejected = await jsonRequest(`/api/queues/${vhost}/rmr.jobs/get`, 'POST', {
    ackmode: 'reject_requeue_false',
    count: 1,
    encoding: 'auto',
    truncate: 50_000,
  });
  return Array.isArray(rejected) && rejected.length === 1;
}, 'Primary fixture could not be rejected.');

await waitFor(async () => {
  const queue = await jsonRequest(`/api/queues/${vhost}/rmr.jobs.dead`);
  return queue?.messages_ready === 1;
}, 'Rejected fixture did not reach the dead-letter queue.');

let dead;
await waitFor(async () => {
  dead = await jsonRequest(`/api/queues/${vhost}/rmr.jobs.dead/get`, 'POST', {
    ackmode: 'ack_requeue_false',
    count: 1,
    encoding: 'auto',
    truncate: 50_000,
  });
  return Array.isArray(dead) && dead[0]?.payload === fixture;
}, 'Dead-letter payload changed.');

const apiPort = process.env.RMR_API_PORT ?? '3000';
const storagePort = process.env.RMR_OBJECT_STORAGE_PORT ?? '9000';
const mailpitPort = process.env.RMR_MAILPIT_UI_PORT ?? '8025';

const api = await fetch(`http://127.0.0.1:${apiPort}/api/v1/health`).then((response) =>
  response.json(),
);
assert(api.status === 'ready', 'API did not report ready.');
assert(api.optionalDependencies?.verus === 'disabled', 'API incorrectly requires Verus.');
assert(api.featureStates?.publicRegistry === 'operational', 'Registry did not report operational.');

const registry = await fetch(`http://127.0.0.1:${apiPort}/api/v1/jurisdictions`).then(
  (response) => {
    assert(response.status === 200, 'Jurisdiction registry request failed.');
    return response.json();
  },
);

for (const pathname of ['/people', '/office-terms', '/elections', '/candidacies']) {
  const response = await fetch(`http://127.0.0.1:${apiPort}/api/v1${pathname}`);
  assert(response.status === 200, `Public-role API request failed: ${pathname}.`);
  const body = await response.json();
  assert(body.dataMode === 'synthetic', `Public-role API was not synthetic: ${pathname}.`);
  assert(
    !/actorReference|privateNotes|identityProof|representativeScore/i.test(JSON.stringify(body)),
    `Public-role API exposed a restricted or deferred field: ${pathname}.`,
  );
}
assert(registry.dataMode === 'synthetic', 'Registry returned non-synthetic data.');
assert(
  registry.jurisdictions.some(({ countryCode }) => countryCode === 'CA') &&
    registry.jurisdictions.some(({ countryCode }) => countryCode === 'US'),
  'Registry does not contain both country fixtures.',
);
assert(
  !/verus|treasury|reserve|currency/i.test(JSON.stringify(registry)),
  'Registry conflated a prohibited hierarchy.',
);

const workerHealth = spawnSync(
  'docker',
  [
    'compose',
    '-f',
    'compose.infrastructure.yaml',
    'exec',
    '-T',
    'worker',
    'node',
    '-e',
    "fetch('http://127.0.0.1:3001/health').then(async response => { if (!response.ok) process.exit(1); process.stdout.write(await response.text()); }).catch(() => process.exit(1))",
  ],
  { cwd: root, encoding: 'utf8' },
);
assert(workerHealth.status === 0, workerHealth.stderr || 'Worker health request failed.');
const worker = JSON.parse(workerHealth.stdout);
assert(
  worker.status === 'ready' && worker.optionalVerus === 'disabled',
  'Worker health is unsafe.',
);

const publicObject = await fetch(
  `http://127.0.0.1:${storagePort}/rmr-public/approved-manifests/synthetic-foundation.json`,
);
assert(publicObject.status === 200, 'Approved public manifest is not anonymously readable.');
for (const pathname of [
  '/rmr-public/unapproved/synthetic-foundation.json',
  '/rmr-quarantine/synthetic-quarantine-object.txt',
  '/rmr-private/synthetic-private-object.txt',
]) {
  const response = await fetch(`http://127.0.0.1:${storagePort}${pathname}`);
  assert(response.status === 403 || response.status === 404, `${pathname} was publicly exposed.`);
}

const mailpit = await fetch(`http://127.0.0.1:${mailpitPort}/readyz`);
assert(mailpit.ok, 'Mailpit was not ready.');

const database = spawnSync(
  'docker',
  [
    'compose',
    '-f',
    'compose.infrastructure.yaml',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    'rmr',
    '-d',
    'rmr',
    '--tuples-only',
    '--no-align',
    '--command',
    "SELECT fixture_key FROM rmr.synthetic_seed_marker WHERE fixture_key = 'synthetic.infrastructure.foundation.v1'",
  ],
  { cwd: root, encoding: 'utf8' },
);
assert(database.status === 0, database.stderr || 'Database smoke query failed.');
assert(
  database.stdout.trim() === 'synthetic.infrastructure.foundation.v1',
  'Database migration or seed fixture is missing.',
);

const auditOutboxSmoke = spawnSync(
  'docker',
  [
    'compose',
    '-f',
    'compose.infrastructure.yaml',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    'rmr',
    '-d',
    'rmr',
    '--set',
    'ON_ERROR_STOP=1',
    '--file=-',
  ],
  {
    cwd: root,
    encoding: 'utf8',
    input: await readFile(path.join(root, 'scripts', 'smoke', 'audit-outbox.sql'), 'utf8'),
  },
);
assert(
  auditOutboxSmoke.status === 0,
  auditOutboxSmoke.stderr || 'Audit/outbox PostgreSQL smoke failed.',
);

const registrySmoke = spawnSync(
  'docker',
  [
    'compose',
    '-f',
    'compose.infrastructure.yaml',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    'rmr',
    '-d',
    'rmr',
    '--set',
    'ON_ERROR_STOP=1',
    '--file=-',
  ],
  {
    cwd: root,
    encoding: 'utf8',
    input: await readFile(path.join(root, 'scripts', 'smoke', 'jurisdiction-registry.sql'), 'utf8'),
  },
);
assert(
  registrySmoke.status === 0,
  registrySmoke.stderr || 'Jurisdiction registry PostgreSQL smoke failed.',
);

const publicRoleSmoke = spawnSync(
  'docker',
  [
    'compose',
    '-f',
    'compose.infrastructure.yaml',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    'rmr',
    '-d',
    'rmr',
    '--set',
    'ON_ERROR_STOP=1',
    '--file=-',
  ],
  {
    cwd: root,
    encoding: 'utf8',
    input: await readFile(path.join(root, 'scripts', 'smoke', 'public-role-lifecycle.sql'), 'utf8'),
  },
);
assert(
  publicRoleSmoke.status === 0,
  publicRoleSmoke.stderr || 'Public-role lifecycle PostgreSQL smoke failed.',
);

const sourceIngestionSmoke = spawnSync(
  'docker',
  [
    'compose',
    '-f',
    'compose.infrastructure.yaml',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    'rmr',
    '-d',
    'rmr',
    '--set',
    'ON_ERROR_STOP=1',
    '--file=-',
  ],
  {
    cwd: root,
    encoding: 'utf8',
    input: await readFile(path.join(root, 'scripts', 'smoke', 'source-ingestion.sql'), 'utf8'),
  },
);
assert(
  sourceIngestionSmoke.status === 0,
  sourceIngestionSmoke.stderr || 'Official-source ingestion PostgreSQL smoke failed.',
);

const running = spawnSync(
  'docker',
  ['compose', '-f', 'compose.infrastructure.yaml', 'ps', '--services', '--status', 'running'],
  { cwd: root, encoding: 'utf8' },
);
assert(running.status === 0, running.stderr || 'Could not inspect running services.');
assert(
  !running.stdout.includes('verus-node'),
  'Core smoke unexpectedly started the Verus profile.',
);
assert(!running.stdout.includes('signer-stub'), 'Core smoke unexpectedly started signer stubs.');

process.stdout.write(
  'Core infrastructure smoke passed: migration/seed, jurisdiction/public-role/source-ingestion registries, atomic audit/outbox, leases/retry/DLQ/replay, bucket isolation, mail, API, worker, and Verus-off readiness.\n',
);
