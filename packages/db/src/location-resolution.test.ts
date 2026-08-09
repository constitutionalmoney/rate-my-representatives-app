import { describe, expect, it } from 'vitest';

import { createSavedBroadJurisdiction } from '@rmr/domain';

import type { SqlExecutor } from './audit-outbox.js';
import { BroadJurisdictionPreferenceRepository } from './location-resolution.js';

const saved = createSavedBroadJurisdiction({
  createId: () => 'preference:synthetic:ca:1',
  now: '2026-06-01T12:00:00.000Z',
  selection: {
    countryCode: 'CA',
    jurisdictionId: 'jurisdiction:ca:maple',
    jurisdictionKind: 'province',
    label: 'Maple Province',
  },
});

const row = {
  country_code: saved.countryCode,
  created_at: saved.createdAt,
  jurisdiction_id: saved.jurisdictionId,
  jurisdiction_kind: saved.jurisdictionKind,
  label: saved.label,
  preference_id: saved.preferenceId,
  updated_at: saved.updatedAt,
};

const metadata = {
  accountId: 'account:synthetic:1',
  commandSha256: 'b'.repeat(64),
  correlationId: 'correlation:synthetic:1',
  eventId: 'event:synthetic:location:1',
  idempotencyKeySha256: 'a'.repeat(64),
  occurredAt: '2026-06-01T12:00:00.000Z',
  requestId: 'request:synthetic:1',
};

describe('broad jurisdiction PostgreSQL repository', () => {
  it('writes only broad fields through the atomic database function', async () => {
    const calls: Array<{ sql: string; values: readonly unknown[] }> = [];
    const database: SqlExecutor = {
      async query<T>(sql: string, values: readonly unknown[] = []) {
        calls.push({ sql, values });
        return { rowCount: 1, rows: [row as T] };
      },
    };
    const repository = new BroadJurisdictionPreferenceRepository(database);
    await expect(repository.put(saved, metadata)).resolves.toEqual(saved);
    expect(calls[0]?.sql).toContain('rmr_account.put_broad_jurisdiction');
    expect(JSON.stringify(calls)).not.toMatch(
      /address|coordinate|latitude|longitude|postal.?code|resolution.?token/i,
    );
  });

  it('uses account-scoped reads and idempotent deletion without a location payload', async () => {
    const calls: Array<{ sql: string; values: readonly unknown[] }> = [];
    const database: SqlExecutor = {
      async query<T>(sql: string, values: readonly unknown[] = []) {
        calls.push({ sql, values });
        const rows = sql.includes('delete_broad_jurisdiction') ? [{ deleted: true }] : [row];
        return { rowCount: rows.length, rows: rows as T[] };
      },
    };
    const repository = new BroadJurisdictionPreferenceRepository(database);
    await expect(repository.read(metadata.accountId)).resolves.toEqual(saved);
    await expect(repository.delete(saved.preferenceId, metadata)).resolves.toBe(true);
    expect(calls[0]?.values).toEqual([metadata.accountId]);
    expect(calls[1]?.sql).toContain('rmr_account.delete_broad_jurisdiction');
  });
});
