/* Generated from public-role-profile-timeline.schema.json. Do not edit directly. */

export type Id = string;
export type TimelineKind =
  | 'office_term_transition'
  | 'candidacy_transition'
  | 'source_refresh'
  | 'correction'
  | 'response'
  | 'dispute'
  | 'appeal';

export interface PublicRoleProfileTimeline {
  schemaVersion: 'public-role-profile-timeline.v1';
  dataMode: 'synthetic';
  profileId: Id;
  recordVersion: number;
  updatedAt: string;
  filters: {
    kind: TimelineKind | null;
  };
  items: {
    timelineItemId: Id;
    kind: TimelineKind;
    occurredAt: string;
    summary: string;
    /**
     * @minItems 1
     */
    sourceIds: [Id, ...Id[]];
    freshness: 'current' | 'stale' | 'not_available' | 'unsupported' | 'coverage_gap';
    recordVersion: number;
  }[];
  page: {
    limit: number;
    nextCursor: Id | null;
  };
}
