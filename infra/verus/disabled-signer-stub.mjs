import { createServer } from 'node:http';

const kind = process.env.STUB_KIND ?? 'unspecified-signer-stub';
const port = Number(process.env.PORT ?? '3100');

const server = createServer((request, response) => {
  response.setHeader('content-type', 'application/json');
  response.setHeader('cache-control', 'no-store');

  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200);
    response.end(
      JSON.stringify({ network: 'VRSCTEST', service: kind, signing: 'disabled', status: 'ready' }),
    );
    return;
  }

  response.writeHead(503);
  response.end(
    JSON.stringify({
      code: 'SIGNING_NOT_IMPLEMENTED',
      message: 'This deterministic VRSCTEST stub contains no signer material.',
    }),
  );
});

server.listen(port, '0.0.0.0');
