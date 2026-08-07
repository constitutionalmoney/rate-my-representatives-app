import { describe, expect, it } from 'vitest';

import { parseApiError, parseHealthStatus, parseMobileCompatibilityStatus } from '@rmr/contracts';

import { handleRequest } from './handler.js';

describe('foundation API', () => {
  it('serves typed core readiness while optional Verus is stopped', async () => {
    const response = await handleRequest(new Request('http://127.0.0.1:3000/api/v1/health'));

    expect(response.status).toBe(200);
    const body = parseHealthStatus(await response.json(), 'server');
    expect(body.contract.currentVersion).toBe('v1');
    expect(body.featureStates.publicRegistry).toBe('proposed');
    expect(body.optionalDependencies.verus).toBe('disabled');
  });

  it('serves native minimum and supported contract versions', async () => {
    const response = await handleRequest(new Request('http://127.0.0.1:3000/api/v1/health/mobile'));
    expect(response.status).toBe(200);
    expect(parseMobileCompatibilityStatus(await response.json(), 'server')).toMatchObject({
      contract: { minimumSupportedVersion: 'v1' },
      platforms: {
        android: { releaseState: 'foundation' },
        ios: { releaseState: 'foundation' },
      },
    });
  });

  it('reports the public registry as proposed without returning registry records', async () => {
    const response = await handleRequest(
      new Request('http://127.0.0.1:3000/api/v1/jurisdictions', {
        headers: { 'x-correlation-id': 'synthetic-api-test' },
      }),
    );
    expect(response.status).toBe(503);
    expect(parseApiError(await response.json(), 'server')).toMatchObject({
      code: 'FEATURE_DISABLED',
      correlationId: 'synthetic-api-test',
      featureState: 'proposed',
    });
  });

  it('uses the privacy-safe envelope for unknown routes', async () => {
    const response = await handleRequest(new Request('http://127.0.0.1:3000/api/v1/people'));
    expect(response.status).toBe(404);
    expect(parseApiError(await response.json(), 'server')).toMatchObject({ code: 'NOT_FOUND' });
  });
});
