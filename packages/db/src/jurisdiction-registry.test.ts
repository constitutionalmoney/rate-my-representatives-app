import { describe, expect, it } from 'vitest';

import type { SqlExecutor, SqlResult } from './audit-outbox.js';
import { JurisdictionRegistryRepository } from './jurisdiction-registry.js';

class FakeDatabase implements SqlExecutor {
  readonly calls: Array<{ sql: string; parameters: readonly unknown[] }> = [];

  async query<Row extends Record<string, unknown>>(
    sql: string,
    parameters: readonly unknown[] = [],
  ): Promise<SqlResult<Row>> {
    this.calls.push({ sql, parameters });
    return { rowCount: 0, rows: [] };
  }
}

describe('jurisdiction registry PostgreSQL repository', () => {
  it('reads every public registry view with date and country parameters', async () => {
    const database = new FakeDatabase();
    const repository = new JurisdictionRegistryRepository(database);

    const result = await repository.read({
      asOf: '2026-08-06T12:00:00.000Z',
      countryCode: 'CA',
    });

    expect(Object.keys(result)).toHaveLength(11);
    expect(database.calls).toHaveLength(11);
    expect(database.calls.every((call) => call.sql.includes('rmr_registry.public_'))).toBe(true);
    expect(
      database.calls.every((call) => !call.sql.match(/person|candidacy|office_term|verus/i)),
    ).toBe(true);
    expect(database.calls[0]?.parameters).toEqual(['2026-08-06T12:00:00.000Z', 'CA', false]);
  });

  it('rejects invalid historical query dates before accessing PostgreSQL', async () => {
    const database = new FakeDatabase();
    const repository = new JurisdictionRegistryRepository(database);

    await expect(repository.read({ asOf: 'not-a-date' })).rejects.toThrow('ISO-8601');
    await expect(repository.read({ asOf: '2026' })).rejects.toThrow('ISO-8601');
    expect(database.calls).toEqual([]);
  });
});
