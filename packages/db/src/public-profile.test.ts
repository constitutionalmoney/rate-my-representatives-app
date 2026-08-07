import { describe, expect, it } from 'vitest';

import type { SqlExecutor, SqlResult } from './audit-outbox.js';
import { PublicProfileRepository } from './public-profile.js';

class RecordingDatabase implements SqlExecutor {
  readonly calls: Array<{ readonly parameters: readonly unknown[]; readonly text: string }> = [];
  rows: readonly Record<string, unknown>[] = [];

  async query<Row extends Record<string, unknown>>(
    text: string,
    parameters: readonly unknown[] = [],
  ): Promise<SqlResult<Row>> {
    this.calls.push({ parameters, text });
    return { rowCount: this.rows.length, rows: this.rows as readonly Row[] };
  }
}

describe('public profile repository', () => {
  it('reads only the allowlisted current profile projection by stable ID', async () => {
    const database = new RecordingDatabase();
    database.rows = [{ profile_id: 'profile:ca:synthetic', record_version: 1 }];
    const repository = new PublicProfileRepository(database);
    await expect(repository.readProfile('profile:ca:synthetic')).resolves.toMatchObject({
      record_version: 1,
    });
    expect(database.calls[0]?.text).toContain('rmr_public.current_profile_read');
    expect(database.calls[0]?.parameters).toEqual(['profile:ca:synthetic']);
    await expect(repository.readProfile('../private')).rejects.toThrow(/stable identifier/);
  });

  it('uses bounded keyset timeline pagination and stable cursors', async () => {
    const database = new RecordingDatabase();
    database.rows = [
      { timeline_item_id: 'timeline:1' },
      { timeline_item_id: 'timeline:2' },
      { timeline_item_id: 'timeline:3' },
    ];
    const repository = new PublicProfileRepository(database);
    const page = await repository.readTimeline('profile:ca:synthetic', {
      kind: 'correction',
      limit: 2,
    });
    expect(page.items).toHaveLength(2);
    expect(page.nextCursor).toBe('timeline:2');
    expect(database.calls[0]?.parameters).toEqual(['profile:ca:synthetic', 'correction', null, 3]);
    expect(database.calls[0]?.text).toContain('ORDER BY occurred_at DESC, timeline_item_id ASC');
    await expect(repository.readTimeline('profile:ca:synthetic', { limit: 51 })).rejects.toThrow(
      /1 through 50/,
    );
  });
});
