import { createServer } from 'node:http';

import { loadRuntimeConfig } from '@rmr/config';
import { createStructuredEvent } from '@rmr/observability';

const config = loadRuntimeConfig(process.env);
const optionalVerus = config.featureFlags.VERUS_ANCHORING_ENABLED ? 'configured' : 'disabled';
const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(
      JSON.stringify({
        civicJobsRegistered: 0,
        optionalVerus,
        service: 'worker',
        status: 'ready',
      }),
    );
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ code: 'NOT_FOUND' }));
});

server.listen(config.port, config.host, () => {
  process.stdout.write(
    `${JSON.stringify(
      createStructuredEvent('foundation.worker.ready', {
        civicJobsRegistered: 0,
        optionalVerus,
        port: config.port,
      }),
    )}\n`,
  );
});
