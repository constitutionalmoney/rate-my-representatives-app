import { describe, expect, it } from 'vitest';

import {
  parseApiError,
  parseHealthStatus,
  parseJurisdictionRegistry,
  parseMobileCompatibilityStatus,
  parsePublicRoleProfile,
  parsePublicRoleProfileAppeals,
  parsePublicRoleProfileCorrections,
  parsePublicRoleProfileCoverage,
  parsePublicRoleProfileList,
  parsePublicRoleProfileSources,
  parsePublicRoleProfileTimeline,
  parsePublicRoleRegistry,
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
    const response = await handleRequest(new Request('http://127.0.0.1:3000/api/v1/not-real'));
    expect(response.status).toBe(404);
    expect(parseApiError(await response.json(), 'server')).toMatchObject({ code: 'NOT_FOUND' });
  });

  it.each(['/api/v1/people', '/api/v1/office-terms', '/api/v1/elections', '/api/v1/candidacies'])(
    'serves the synthetic public-role graph from %s',
    async (pathname) => {
      const response = await handleRequest(new Request(`http://127.0.0.1:3000${pathname}`));
      expect(response.status).toBe(200);
      const body = parsePublicRoleRegistry(await response.json(), 'server');
      expect(body.dataMode).toBe('synthetic');
      expect(JSON.stringify(body)).not.toMatch(/actorReference|privateNotes/);
      expect(body.externalIdentityReferences).toEqual([]);
    },
  );

  it('keeps an election win separate from office-term confirmation', async () => {
    const response = await handleRequest(
      new Request(
        'http://127.0.0.1:3000/api/v1/candidacies?candidacyId=candidacy%3Aca%3Arowan%3Anorth-2025',
      ),
    );
    const body = parsePublicRoleRegistry(await response.json(), 'server');
    expect(body.candidacies).toHaveLength(1);
    expect(body.candidacies[0]?.currentState).toBe('won');
    expect(body.officeTerms).toEqual([]);
  });

  it('strictly rejects unknown, duplicate, and wrong-route public-role filters', async () => {
    for (const query of [
      'personId=person%3Aca%3Aavery&personId=person%3Aca%3Arowan',
      'officeTermId=term%3Aca%3Aavery',
      'latitude=49',
    ]) {
      const response = await handleRequest(
        new Request(`http://127.0.0.1:3000/api/v1/people?${query}`),
      );
      expect(response.status).toBe(400);
      expect(parseApiError(await response.json(), 'server').code).toBe('VALIDATION_ERROR');
    }
  });

  it('lists separate synthetic Canadian office-term and U.S. candidacy profiles', async () => {
    const response = await handleRequest(new Request('http://127.0.0.1:3000/api/v1/profiles'));
    expect(response.status).toBe(200);
    const body = parsePublicRoleProfileList(await response.json(), 'server');
    expect(body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          countryCode: 'CA',
          context: { kind: 'office_term', candidacyId: null, officeTermId: expect.any(String) },
        }),
        expect.objectContaining({
          countryCode: 'US',
          context: { kind: 'candidacy', candidacyId: expect.any(String), officeTermId: null },
        }),
      ]),
    );
    expect(response.headers.get('cache-control')).toContain('max-age=60');
  });

  it('serves an allowlisted profile with ETag conditional requests and no Verus dependency', async () => {
    const url =
      'http://127.0.0.1:3000/api/v1/profiles/profile%3Aca%3Aavery-quill%3Amaple-member%3A2024';
    const response = await handleRequest(new Request(url));
    expect(response.status).toBe(200);
    const profile = parsePublicRoleProfile(await response.json(), 'server');
    expect(profile).toMatchObject({
      provenance: null,
      externalIdentityReferences: [],
      method: { compositeScoreIncluded: false, signalAggregateIncluded: false },
    });
    expect(JSON.stringify(profile)).not.toMatch(
      /accountId|preciseLocation|representativeSignal|moderatorNotes|walletPayload/i,
    );
    const etag = response.headers.get('etag');
    expect(etag).toBe(profile.etag);
    const conditional = await handleRequest(
      new Request(url, { headers: { 'if-none-match': etag ?? '' } }),
    );
    expect(conditional.status).toBe(304);
    expect(await conditional.text()).toBe('');
  });

  it('serves profile sources, coverage gaps, corrections, and paginated history', async () => {
    const base =
      'http://127.0.0.1:3000/api/v1/profiles/profile%3Aca%3Aavery-quill%3Amaple-member%3A2024';
    const sources = await handleRequest(new Request(`${base}/sources`));
    expect(
      parsePublicRoleProfileSources(await sources.json(), 'server').items.length,
    ).toBeGreaterThan(0);
    const coverage = await handleRequest(new Request(`${base}/coverage`));
    expect(parsePublicRoleProfileCoverage(await coverage.json(), 'server').items).toEqual(
      expect.arrayContaining([expect.objectContaining({ state: 'coverage_gap' })]),
    );
    const corrections = await handleRequest(new Request(`${base}/corrections`));
    expect(
      parsePublicRoleProfileCorrections(await corrections.json(), 'server').items,
    ).toHaveLength(1);
    const appeals = await handleRequest(new Request(`${base}/appeals`));
    expect(parsePublicRoleProfileAppeals(await appeals.json(), 'server')).toMatchObject({
      availability: 'not_available',
      items: [],
    });
    const timeline = await handleRequest(new Request(`${base}/timeline?limit=1`));
    const firstPage = parsePublicRoleProfileTimeline(await timeline.json(), 'server');
    expect(firstPage.items).toHaveLength(1);
    expect(firstPage.page.nextCursor).not.toBeNull();
    const next = await handleRequest(
      new Request(
        `${base}/timeline?limit=1&cursor=${encodeURIComponent(firstPage.page.nextCursor ?? '')}`,
      ),
    );
    const secondPage = parsePublicRoleProfileTimeline(await next.json(), 'server');
    expect(secondPage.items[0]?.timelineItemId).not.toBe(firstPage.items[0]?.timelineItemId);
  });

  it('rejects invalid profile filters and hides unpublished or unknown profiles', async () => {
    const invalid = await handleRequest(
      new Request('http://127.0.0.1:3000/api/v1/profiles?countryCode=GB'),
    );
    expect(invalid.status).toBe(400);
    expect(parseApiError(await invalid.json(), 'server')).toMatchObject({
      code: 'VALIDATION_ERROR',
      fieldErrors: [{ field: 'query.countryCode' }],
    });
    const unknown = await handleRequest(
      new Request('http://127.0.0.1:3000/api/v1/profiles/profile%3Aunknown'),
    );
    expect(unknown.status).toBe(404);
    expect(parseApiError(await unknown.json(), 'server').code).toBe('NOT_FOUND');
  });
});
