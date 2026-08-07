import type { SqlExecutor } from './audit-outbox.js';

export interface PublicProfileRow extends Record<string, unknown> {
  readonly profile_id: string;
  readonly person_id: string;
  readonly office_term_id: string | null;
  readonly candidacy_id: string | null;
  readonly profile_version_id: string;
  readonly record_version: number;
  readonly updated_at: string;
  readonly etag: string;
  readonly public_payload: Readonly<Record<string, unknown>>;
}

export interface PublicProfileTimelineRow extends Record<string, unknown> {
  readonly timeline_item_id: string;
  readonly profile_id: string;
  readonly kind:
    | 'office_term_transition'
    | 'candidacy_transition'
    | 'source_refresh'
    | 'correction'
    | 'response'
    | 'dispute'
    | 'appeal';
  readonly occurred_at: string;
  readonly public_summary: string;
  readonly freshness: 'current' | 'stale' | 'not_available' | 'unsupported' | 'coverage_gap';
  readonly record_version: number;
  readonly reviewed_record_version_ids: readonly string[];
}

export interface PublicProfileTimelinePage {
  readonly items: readonly PublicProfileTimelineRow[];
  readonly nextCursor: string | null;
}

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const TIMELINE_KINDS = new Set([
  'office_term_transition',
  'candidacy_transition',
  'source_refresh',
  'correction',
  'response',
  'dispute',
  'appeal',
]);

function assertId(value: string, field: string): void {
  if (!ID_PATTERN.test(value)) throw new Error(`${field} must be a stable identifier.`);
}

export class PublicProfileRepository {
  constructor(private readonly database: SqlExecutor) {}

  async readProfile(profileId: string): Promise<PublicProfileRow | undefined> {
    assertId(profileId, 'profileId');
    const result = await this.database.query<PublicProfileRow>(
      `SELECT
         profile_id, person_id, office_term_id, candidacy_id, profile_version_id,
         record_version, updated_at, etag, public_payload
       FROM rmr_public.current_profile_read
       WHERE profile_id = $1`,
      [profileId],
    );
    return result.rows[0];
  }

  async readTimeline(
    profileId: string,
    options: {
      readonly cursor?: string;
      readonly kind?: PublicProfileTimelineRow['kind'];
      readonly limit?: number;
    } = {},
  ): Promise<PublicProfileTimelinePage> {
    assertId(profileId, 'profileId');
    if (options.cursor !== undefined) assertId(options.cursor, 'cursor');
    if (options.kind !== undefined && !TIMELINE_KINDS.has(options.kind)) {
      throw new Error('kind is not a public profile timeline kind.');
    }
    const limit = options.limit ?? 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new Error('limit must be an integer from 1 through 50.');
    }
    const result = await this.database.query<PublicProfileTimelineRow>(
      `SELECT
         timeline_item_id, profile_id, kind, occurred_at, public_summary,
         freshness, record_version, reviewed_record_version_ids
       FROM rmr_public.profile_timeline_read item
       WHERE profile_id = $1
         AND ($2::text IS NULL OR kind = $2)
         AND (
           $3::text IS NULL OR (occurred_at, timeline_item_id) < (
             SELECT occurred_at, timeline_item_id
             FROM rmr_public.profile_timeline_read cursor_item
             WHERE cursor_item.profile_id = $1 AND cursor_item.timeline_item_id = $3
           )
         )
       ORDER BY occurred_at DESC, timeline_item_id ASC
       LIMIT $4`,
      [profileId, options.kind ?? null, options.cursor ?? null, limit + 1],
    );
    const hasNext = result.rows.length > limit;
    const items = result.rows.slice(0, limit);
    return {
      items,
      nextCursor: hasNext ? (items.at(-1)?.timeline_item_id ?? null) : null,
    };
  }
}
