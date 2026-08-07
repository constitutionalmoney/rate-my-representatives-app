import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = async (name) =>
  JSON.parse(await readFile(path.join(packageDirectory, 'fixtures', name), 'utf8'));
const health = await fixture('health.ready.json');
const mobileCompatibility = await fixture('mobile-compatibility.ready.json');
const jurisdictions = await fixture('jurisdictions.synthetic.json');
const publicRoles = await fixture('public-role-registry.synthetic.json');
const notFound = await fixture('not-found.json');

function send(response, status, value) {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': status >= 400 ? 'application/problem+json' : 'application/json',
    ...(status >= 400 ? { 'x-correlation-id': value.correlationId } : {}),
  });
  response.end(JSON.stringify(value));
}

export function createContractMockServer() {
  return createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (request.method === 'GET' && url.pathname === '/api/v1/health') {
      send(response, 200, health);
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/v1/health/mobile') {
      send(response, 200, mobileCompatibility);
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/v1/jurisdictions') {
      send(response, 200, jurisdictions);
      return;
    }
    if (
      request.method === 'GET' &&
      [
        '/api/v1/people',
        '/api/v1/office-terms',
        '/api/v1/elections',
        '/api/v1/candidacies',
      ].includes(url.pathname)
    ) {
      send(response, 200, publicRoles);
      return;
    }
    send(response, 404, notFound);
  });
}

async function listen(server, port) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
}

async function close(server) {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

const isEntrypoint =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  const server = createContractMockServer();
  const smoke = process.argv.includes('--smoke');
  await listen(server, smoke ? 0 : Number(process.env.RMR_CONTRACT_MOCK_PORT ?? 4010));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Mock server address is unavailable.');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  if (smoke) {
    const [healthResponse, mobileResponse, jurisdictionResponse, peopleResponse, missingResponse] =
      await Promise.all([
        fetch(`${baseUrl}/api/v1/health`),
        fetch(`${baseUrl}/api/v1/health/mobile`),
        fetch(`${baseUrl}/api/v1/jurisdictions`),
        fetch(`${baseUrl}/api/v1/people`),
        fetch(`${baseUrl}/api/v1/missing`),
      ]);
    if (
      healthResponse.status !== 200 ||
      mobileResponse.status !== 200 ||
      jurisdictionResponse.status !== 200 ||
      peopleResponse.status !== 200 ||
      missingResponse.status !== 404
    ) {
      throw new Error('Contract mock server returned an unexpected status.');
    }
    await close(server);
    console.log('Synthetic OpenAPI mock server smoke passed.');
  } else {
    console.log(`Synthetic OpenAPI mock server listening at ${baseUrl}.`);
  }
}
