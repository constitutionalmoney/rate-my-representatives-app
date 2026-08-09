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
  parseRepresentationCapabilities,
  parseRepresentationResolution,
  parseSavedBroadJurisdiction,
  type SavedBroadJurisdiction,
} from '@rmr/contracts';

import { EphemeralAmbiguityStore } from '@rmr/domain';

import {
  handleRequest,
  requestBodyTooLarge,
  type BroadJurisdictionPreferencePort,
} from './handler.js';

function locationContext(overrides: Record<string, unknown> = {}) {
  let next = 0;
  return {
    ambiguityStore: new EphemeralAmbiguityStore(),
    createId: () => `resolution:api:${++next}`,
    locationResolutionEnabled: true,
    now: () => new Date('2026-06-01T12:00:00.000Z'),
    ...overrides,
  };
}

function jsonRequest(path: string, body: unknown, headers: HeadersInit = {}): Request {
  return new Request(`http://127.0.0.1:3000${path}`, {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
    method: 'POST',
  });
}

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

  it('discovers location capabilities while keeping precise resolution disabled by default', async () => {
    const capabilities = await handleRequest(
      new Request('http://127.0.0.1:3000/api/v1/representation/capabilities'),
    );
    expect(parseRepresentationCapabilities(await capabilities.json(), 'server')).toMatchObject({
      items: [{ countryCode: 'CA', featureState: 'disabled' }, { countryCode: 'US' }],
    });
    const rawInput = 'A1A 1A1';
    const disabled = await handleRequest(
      jsonRequest('/api/v1/representation/resolve', {
        schemaVersion: 'representation-resolution-request.v1',
        asOf: '2026-06-01T12:00:00.000Z',
        countryCode: 'CA',
        input: { kind: 'postal_code', value: rawInput },
      }),
    );
    expect(disabled.status).toBe(503);
    expect(await disabled.text()).not.toContain(rawInput);
  });

  it('resolves every supported synthetic scope without returning the precise submission', async () => {
    const rawInput = 'A1A 1A1';
    const response = await handleRequest(
      jsonRequest('/api/v1/representation/resolve', {
        schemaVersion: 'representation-resolution-request.v1',
        asOf: '2026-06-01T12:00:00.000Z',
        countryCode: 'CA',
        input: { kind: 'postal_code', value: rawInput },
      }),
      locationContext(),
    );
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).not.toContain(rawInput);
    expect(parseRepresentationResolution(JSON.parse(text), 'server')).toMatchObject({
      inputDisposition: { persisted: false, queued: false, sentToAi: false, sentToVerus: false },
      legalDeterminations: {
        citizenship: 'not_determined',
        legalResidence: 'not_determined',
        voterEligibility: 'not_determined',
      },
      matches: [
        { scope: 'local' },
        { scope: 'regional' },
        { scope: 'province_state' },
        { scope: 'federal' },
      ],
      state: 'resolved',
    });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('supports address-free ambiguity continuation and explicit outage recovery', async () => {
    const context = locationContext();
    const ambiguousResponse = await handleRequest(
      jsonRequest('/api/v1/representation/resolve', {
        schemaVersion: 'representation-resolution-request.v1',
        asOf: '2026-06-01T12:00:00.000Z',
        countryCode: 'CA',
        input: { kind: 'postal_code', value: 'A1A 2A2' },
      }),
      context,
    );
    const ambiguous = parseRepresentationResolution(await ambiguousResponse.json(), 'server');
    expect(ambiguous.state).toBe('ambiguous');
    const selected = await handleRequest(
      jsonRequest('/api/v1/representation/resolve/ambiguity', {
        schemaVersion: 'representation-ambiguity-selection.v1',
        asOf: ambiguous.asOf,
        selectionToken: ambiguous.ambiguity?.selectionToken,
        optionId: ambiguous.ambiguity?.options[0]?.candidateId,
      }),
      context,
    );
    expect(parseRepresentationResolution(await selected.json(), 'server').state).toBe('resolved');

    const outage = await handleRequest(
      jsonRequest('/api/v1/representation/resolve', {
        schemaVersion: 'representation-resolution-request.v1',
        asOf: '2026-06-01T12:00:00.000Z',
        countryCode: 'US',
        input: { kind: 'address', value: '500 Outage Test Way, Example City, EX 00005' },
      }),
      context,
    );
    expect(parseRepresentationResolution(await outage.json(), 'server')).toMatchObject({
      detailCode: 'PROVIDER_TEMPORARILY_UNAVAILABLE',
      state: 'provider_unavailable',
    });
  });

  it('rejects malicious address strings without echoing them', async () => {
    const rawInput = '<script>synthetic-probe</script>\n';
    const response = await handleRequest(
      jsonRequest('/api/v1/representation/resolve', {
        schemaVersion: 'representation-resolution-request.v1',
        asOf: '2026-06-01T12:00:00.000Z',
        countryCode: 'US',
        input: { kind: 'address', value: rawInput },
      }),
      locationContext(),
    );
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain(rawInput);
  });

  it('returns a typed payload-free response when the transport body limit is exceeded', async () => {
    const response = requestBodyTooLarge(
      new Request('http://127.0.0.1:3000/api/v1/representation/resolve', {
        headers: { 'x-correlation-id': 'synthetic-body-limit' },
        method: 'POST',
      }),
    );
    expect(response.status).toBe(413);
    expect(parseApiError(await response.json(), 'server')).toMatchObject({
      code: 'VALIDATION_ERROR',
      correlationId: 'synthetic-body-limit',
      fieldErrors: [{ code: 'BODY_TOO_LARGE', field: 'body' }],
    });
  });

  it('supports authenticated idempotent broad-preference save, update, read, and delete', async () => {
    let current: SavedBroadJurisdiction | null = null;
    const writes = new Map<string, SavedBroadJurisdiction>();
    const preferences: BroadJurisdictionPreferencePort = {
      async delete(_accountId, preferenceId) {
        if (current?.preferenceId !== preferenceId) return false;
        current = null;
        return true;
      },
      async put(_accountId, preference, idempotencyKey) {
        const replay = writes.get(idempotencyKey);
        if (replay) return replay;
        current = preference;
        writes.set(idempotencyKey, preference);
        return preference;
      },
      async read() {
        return current;
      },
    };
    const context = locationContext({
      accountDataAccessEnabled: true,
      accountId: 'account:synthetic:api:1',
      preferences,
    });
    const save = await handleRequest(
      jsonRequest(
        '/api/v1/account/broad-jurisdiction',
        {
          schemaVersion: 'broad-jurisdiction-preference-command.v1',
          countryCode: 'CA',
          jurisdictionId: 'jurisdiction:ca:maple',
        },
        { 'idempotency-key': 'idempotency:api:save:1' },
      ),
      context,
    );
    expect(save.status).toBe(201);
    const saved = parseSavedBroadJurisdiction(await save.json(), 'server');
    expect(saved).toMatchObject({ jurisdictionKind: 'province' });
    const read = await handleRequest(
      new Request('http://127.0.0.1:3000/api/v1/account/broad-jurisdiction'),
      context,
    );
    expect(parseSavedBroadJurisdiction(await read.json(), 'server')).toEqual(saved);

    const updateRequest = jsonRequest(
      `/api/v1/account/broad-jurisdiction/${encodeURIComponent(saved.preferenceId)}`,
      {
        schemaVersion: 'broad-jurisdiction-preference-command.v1',
        countryCode: 'US',
        jurisdictionId: 'jurisdiction:us:example-state',
      },
      { 'idempotency-key': 'idempotency:api:update:1' },
    );
    const update = await handleRequest(new Request(updateRequest, { method: 'PUT' }), context);
    expect(parseSavedBroadJurisdiction(await update.json(), 'server')).toMatchObject({
      jurisdictionKind: 'state',
    });

    const deleted = await handleRequest(
      new Request(
        `http://127.0.0.1:3000/api/v1/account/broad-jurisdiction/${encodeURIComponent(saved.preferenceId)}`,
        { headers: { 'idempotency-key': 'idempotency:api:delete:1' }, method: 'DELETE' },
      ),
      context,
    );
    expect(deleted.status).toBe(204);
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
