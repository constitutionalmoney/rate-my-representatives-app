import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

describe('issue #29 privacy-minimized location resolver foundation', () => {
  it('keeps every deployment gate false by default', async () => {
    const [configuration, environment, dokploy, infrastructure] = await Promise.all([
      read('packages/config/src/index.ts'),
      read('.env.example'),
      read('compose.yaml'),
      read('compose.infrastructure.yaml'),
    ]);
    expect(configuration).toContain('LOCATION_RESOLUTION_ENABLED');
    for (const source of [environment, dokploy, infrastructure]) {
      expect(source).toMatch(/LOCATION_RESOLUTION_ENABLED\s*(?::|=)\s*'?false'?/);
    }
  });

  it('exposes all required versioned routes and generated schemas', async () => {
    const [openapi, generator, compatibilityApprovals] = await Promise.all([
      read('packages/contracts/openapi/v1.yaml'),
      read('packages/contracts/scripts/generate.mjs'),
      read('packages/contracts/compatibility-approvals.json'),
    ]);
    for (const route of [
      '/api/v1/representation/capabilities',
      '/api/v1/representation/resolve',
      '/api/v1/representation/resolve/ambiguity',
      '/api/v1/account/broad-jurisdiction',
    ]) {
      expect(openapi).toContain(route);
    }
    expect(openapi).toContain('request-body-never-logged-or-persisted');
    expect(openapi).toContain('legal-residence');
    expect(generator).toContain('representation-resolution.schema.json');
    expect(generator).toContain('representation-capabilities.synthetic.json');
    expect(compatibilityApprovals).toContain(
      'feature-gates.schema.json:required-field-added:LOCATION_RESOLUTION_ENABLED',
    );
    expect(compatibilityApprovals).toContain('api-error.schema.json.code:enum-value-added:GONE');
  });

  it('prohibits precise persistence while allowing only canonical broad account preferences', async () => {
    const migration = await read(
      'packages/db/migrations/0008_privacy_minimized_location_resolution.sql',
    );
    expect(migration).not.toMatch(/CREATE TABLE rmr_location/i);
    expect(migration).toContain(
      "jurisdiction_kind IN ('country', 'province', 'state', 'territory')",
    );
    expect(migration).toContain('saved_broad_jurisdiction_account_isolation');
    expect(migration).toContain('rmr_account.put_broad_jurisdiction');
    expect(migration).toContain('rmr_account.delete_broad_jurisdiction');
    const tables = migration.match(/CREATE TABLE[\s\S]*?\);/g)?.join('\n') ?? '';
    expect(tables).not.toMatch(
      /address|coordinate|latitude|longitude|postal.?code|precise.?location|resolution.?token/i,
    );
  });

  it('provides manual accessible web/native flows with visible recovery', async () => {
    const [web, mobile, accessibility] = await Promise.all([
      read('apps/web/src/location-resolver.tsx'),
      read('apps/mobile/src/location-resolver-screen.tsx'),
      read('apps/mobile/src/location-resolver-accessibility.ts'),
    ]);
    expect(web).toContain('Browse by country instead');
    expect(web).toContain('Retry capability check');
    expect(web).toContain("setValue('')");
    expect(mobile).toContain('accessibilityRole="radio"');
    expect(mobile).toContain('accessibilityLiveRegion="polite"');
    expect(mobile).toContain("setValue('')");
    expect(accessibility).toContain('visibleRetryAction: true');
  });

  it('adds provider outage, redistricting, malicious-input, and database smoke coverage', async () => {
    const [domainTests, handlerTests, server, smoke] = await Promise.all([
      read('packages/domain/src/location-resolution.test.ts'),
      read('apps/api/src/handler.contract.test.ts'),
      read('apps/api/src/server.ts'),
      read('scripts/smoke/location-resolution.sql'),
    ]);
    expect(domainTests).toContain('effective-date and redistricting');
    expect(domainTests).toContain('provider_unavailable');
    expect(domainTests).toContain('malicious inputs');
    expect(handlerTests).toContain('without echoing them');
    expect(server).toContain('MAX_REQUEST_BODY_BYTES');
    expect(server).toContain('requestBodyTooLarge');
    expect(smoke).toContain('Transient location schema must not persist tables');
    expect(smoke).toContain('ROLLBACK');
  });
});
