import { describe, expect, it } from 'vitest';

import type { SqlExecutor, SqlResult } from './audit-outbox.js';
import { PublicRoleRegistryRepository } from './public-role-registry.js';

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

describe('public-role PostgreSQL repository', () => {
  it('queries only security-barrier public views with one snapshot parameter set', async () => {
    const database = new FakeDatabase();
    const repository = new PublicRoleRegistryRepository(database);

    const result = await repository.read({
      asOf: '2026-08-07T12:00:00.000Z',
      countryCode: 'US',
      includeHistorical: true,
    });

    expect(Object.keys(result)).toHaveLength(12);
    expect(database.calls).toHaveLength(12);
    expect(database.calls.every(({ sql }) => sql.includes('rmr_registry.public_'))).toBe(true);
    expect(database.calls.every(({ sql }) => !/actor_reference|private_notes/.test(sql))).toBe(
      true,
    );
    expect(database.calls[0]?.parameters).toEqual(['2026-08-07T12:00:00.000Z', 'US', true]);
  });

  it('rejects invalid effective dates before database access', async () => {
    const database = new FakeDatabase();
    const repository = new PublicRoleRegistryRepository(database);

    await expect(repository.read({ asOf: '2026' })).rejects.toThrow('ISO-8601');
    expect(database.calls).toEqual([]);
  });
});
