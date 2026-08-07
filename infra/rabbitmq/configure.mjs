import { readFile } from 'node:fs/promises';

const baseUrl = process.env.RABBITMQ_MANAGEMENT_URL ?? 'http://rabbitmq:15672';
const username = process.env.RABBITMQ_USERNAME ?? 'rmr-local';
const password = (
  await readFile(process.env.RABBITMQ_PASSWORD_FILE ?? '/run/secrets/rabbitmq_password', 'utf8')
).trim();
const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

async function request(path, method, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { authorization, 'content-type': 'application/json' },
    method,
  });
  if (!response.ok) {
    throw new Error(`RabbitMQ topology request failed: ${method} ${path} -> ${response.status}`);
  }
}

const vhost = '%2F';
for (const exchange of ['rmr.jobs', 'rmr.retry', 'rmr.dead-letter']) {
  await request(`/api/exchanges/${vhost}/${exchange}`, 'PUT', {
    arguments: {},
    auto_delete: false,
    durable: true,
    internal: false,
    type: 'direct',
  });
}

await request(`/api/queues/${vhost}/rmr.jobs`, 'PUT', {
  arguments: {
    'x-dead-letter-exchange': 'rmr.dead-letter',
    'x-dead-letter-routing-key': 'failed',
  },
  auto_delete: false,
  durable: true,
});
await request(`/api/queues/${vhost}/rmr.jobs.retry`, 'PUT', {
  arguments: {
    'x-dead-letter-exchange': 'rmr.jobs',
    'x-dead-letter-routing-key': 'ready',
    'x-message-ttl': 1000,
  },
  auto_delete: false,
  durable: true,
});
await request(`/api/queues/${vhost}/rmr.jobs.dead`, 'PUT', {
  arguments: {},
  auto_delete: false,
  durable: true,
});

for (const binding of [
  ['rmr.jobs', 'rmr.jobs', 'ready'],
  ['rmr.retry', 'rmr.jobs.retry', 'retry'],
  ['rmr.dead-letter', 'rmr.jobs.dead', 'failed'],
]) {
  const [exchange, queue, routingKey] = binding;
  await request(`/api/bindings/${vhost}/e/${exchange}/q/${queue}`, 'POST', {
    arguments: {},
    routing_key: routingKey,
  });
}

process.stdout.write('RabbitMQ retry and dead-letter topology is ready.\n');
