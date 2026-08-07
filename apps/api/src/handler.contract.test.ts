import { describe, expect, it } from 'vitest';

import {
  parseApiError,
  parseHealthStatus,
  parseJurisdictionRegistry,
  parseMobileCompatibilityStatus,
} from '@rmr/contracts';

import { handleRequest } from './handler.js';

describe('foundation API', () => {
  it('serves typed core readiness while optional Verus is stopped', async () => {
    const response = await handleRequest(new Request('http://127.0.0.1:3000/api/v1/health'));

    expect(response.status).toBe(200);
    const body = parseHealthStatus(await response.json(), 'server');
    expect(body.contract.currentVersion).toBe('v1');
    expect(body.featureStates.publicRegistry).toBe('operational');
    expect(body.dataMode).toBe('synthetic');
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

  it('returns an effective-dated synthetic nested registry', async () => {
    const response = await handleRequest(
      new Request('http://127.0.0.1:3000/api/v1/jurisdictions', {
        headers: { 'x-correlation-id': 'synthetic-api-test' },
      }),
    );
    expect(response.status).toBe(200);
    expect(parseJurisdictionRegistry(await response.json(), 'server')).toMatchObject({
      dataMode: 'synthetic',
      jurisdictions: expect.arrayContaining([
        expect.objectContaining({ countryCode: 'CA' }),
        expect.objectContaining({ countryCode: 'US' }),
      ]),
    });
  });

  it('filters by country/date and rejects location-resolution parameters', async () => {
    const filtered = await handleRequest(
      new Request(
        'http://127.0.0.1:3000/api/v1/jurisdictions?countryCode=CA&asOf=2025-01-01T00%3A00%3A00.000Z',
      ),
    );
    const registry = parseJurisdictionRegistry(await filtered.json(), 'server');
    expect(registry.jurisdictions.every(({ countryCode }) => countryCode === 'CA')).toBe(true);
    expect(JSON.stringify(registry)).not.toContain('Harbour City');

    const unsupported = await handleRequest(
      new Request('http://127.0.0.1:3000/api/v1/jurisdictions?latitude=49'),
    );
    expect(unsupported.status).toBe(400);
    expect(parseApiError(await unsupported.json(), 'server')).toMatchObject({
      code: 'VALIDATION_ERROR',
      fieldErrors: [{ field: 'query.latitude' }],
    });
  });

  it('uses the privacy-safe envelope for unknown routes', async () => {
    const response = await handleRequest(new Request('http://127.0.0.1:3000/api/v1/people'));
    expect(response.status).toBe(404);
    expect(parseApiError(await response.json(), 'server')).toMatchObject({ code: 'NOT_FOUND' });
  });
});
