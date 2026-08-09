import { createServer } from 'node:http';

import { loadRuntimeConfig } from '@rmr/config';
import { createStructuredEvent } from '@rmr/observability';

import { handleRequest, requestBodyTooLarge } from './handler.js';

const config = loadRuntimeConfig(process.env);
const MAX_REQUEST_BODY_BYTES = 64 * 1024;
const server = createServer(async (incoming, outgoing) => {
  const bodyChunks: Buffer[] = [];
  let bodyBytes = 0;
  let bodyTooLarge = false;
  if (incoming.method !== 'GET' && incoming.method !== 'HEAD') {
    for await (const chunk of incoming) {
      const buffer = Buffer.from(chunk);
      bodyBytes += buffer.length;
      if (bodyBytes > MAX_REQUEST_BODY_BYTES) {
        bodyTooLarge = true;
        break;
      }
      bodyChunks.push(buffer);
    }
  }
  const body = Buffer.concat(bodyChunks);
  const request = new Request(`http://${config.host}:${config.port}${incoming.url ?? '/'}`, {
    headers: incoming.headers as HeadersInit,
    method: incoming.method ?? 'GET',
    ...(body.length === 0 ? {} : { body }),
  });
  const response = bodyTooLarge
    ? requestBodyTooLarge(request)
    : await handleRequest(request, {
        accountDataAccessEnabled: config.featureFlags.ACCOUNT_DATA_ACCESS_ENABLED,
        locationResolutionEnabled: config.featureFlags.LOCATION_RESOLUTION_ENABLED,
      });
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
