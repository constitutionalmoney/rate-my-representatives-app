import { createServer } from 'node:http';

import { loadRuntimeConfig } from '@rmr/config';
import { createStructuredEvent } from '@rmr/observability';

import { handleRequest } from './handler.js';

const config = loadRuntimeConfig(process.env);
const server = createServer(async (incoming, outgoing) => {
  const request = new Request(`http://${config.host}:${config.port}${incoming.url ?? '/'}`, {
    headers: incoming.headers as HeadersInit,
    method: incoming.method ?? 'GET',
  });
  const response = await handleRequest(request);
  outgoing.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(config.port, config.host, () => {
  process.stdout.write(
    `${JSON.stringify(
      createStructuredEvent('foundation.api.ready', {
        optionalVerus: 'disabled',
        host: config.host,
        port: config.port,
      }),
    )}\n`,
  );
});
