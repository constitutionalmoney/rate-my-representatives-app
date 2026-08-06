import { foundationHealth } from './health.js';

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname === '/api/v1/health') {
    return Response.json(foundationHealth(), {
      headers: {
        'cache-control': 'no-store',
      },
    });
  }

  return Response.json(
    { code: 'NOT_FOUND', message: 'The requested foundation route does not exist.' },
    { status: 404 },
  );
}
