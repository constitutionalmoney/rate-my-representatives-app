import { describe, expect, it } from 'vitest';

import {
  advancePublicProfileVersion,
  listPublicProfiles,
  profileEtag,
  publicProfileDeferredWrites,
  readPublicProfile,
  readPublicProfileTimeline,
} from './public-profile.js';

describe('source-backed public profiles', () => {
  it('keeps Canadian office terms and United States candidacies as separate contexts', () => {
    const profiles = listPublicProfiles();
    expect(profiles.items).toHaveLength(2);
    expect(profiles.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          countryCode: 'CA',
          context: { kind: 'office_term', officeTermId: expect.any(String), candidacyId: null },
        }),
        expect.objectContaining({
          countryCode: 'US',
          context: { kind: 'candidacy', officeTermId: null, candidacyId: expect.any(String) },
          roleStatus: 'withdrawn',
        }),
      ]),
    );
    expect(listPublicProfiles({ countryCode: 'CA' }).items).toHaveLength(1);
    expect(listPublicProfiles({ contextKind: 'candidacy' }).items[0]?.countryCode).toBe('US');
  });

  it('publishes only reviewed sources and freshness for every material claim', () => {
    for (const summary of listPublicProfiles().items) {
      const profile = readPublicProfile(summary.profileId);
      expect(profile?.publication).toMatchObject({ method: 'human_review', state: 'published' });
      const sourceIds = new Set(
        (profile?.sources.items as readonly { readonly sourceId: string }[]).map(
          ({ sourceId }) => sourceId,
        ),
      );
      for (const claim of profile?.claims as readonly {
        readonly freshness: string;
        readonly sourceIds: readonly string[];
      }[]) {
        expect(claim.sourceIds.length).toBeGreaterThan(0);
        expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
        expect(claim.freshness).toMatch(/current|stale|not_available|unsupported|coverage_gap/);
      }
    }
  });

  it('never returns private account, location, signal, moderator, or wallet state', () => {
    const json = JSON.stringify(readPublicProfile('profile:ca:avery-quill:maple-member:2024'));
    expect(json).not.toMatch(
      /accountId|preciseLocation|representativeSignal|moderatorNotes|walletPayload/i,
    );
    expect(json).not.toContain('Never public.');
  });

  it('makes gaps and source conflicts explicit without a score or provenance dependency', () => {
    const canada = readPublicProfile('profile:ca:avery-quill:maple-member:2024');
    const unitedStates = readPublicProfile('profile:us:morgan-fields:state-senate:2026');
    expect(canada?.coverage.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ state: 'coverage_gap' }),
        expect.objectContaining({ state: 'not_available' }),
        expect.objectContaining({ state: 'unsupported' }),
      ]),
    );
    expect(unitedStates?.coverage.conflicts).toHaveLength(1);
    expect(canada?.provenance).toBeNull();
    expect(canada?.externalIdentityReferences).toEqual([]);
    expect(canada?.method).toMatchObject({
      compositeScoreIncluded: false,
      signalAggregateIncluded: false,
    });
    expect(canada).not.toHaveProperty('score');
  });

  it('changes record version and ETag after either correction or source refresh', () => {
    const current = readPublicProfile('profile:ca:avery-quill:maple-member:2024');
    if (!current) throw new Error('Expected a synthetic public profile.');
    const corrected = advancePublicProfileVersion(current, {
      kind: 'correction',
      updatedAt: '2026-08-07T15:10:00Z',
    });
    const refreshed = advancePublicProfileVersion(corrected, {
      kind: 'source_refresh',
      updatedAt: '2026-08-07T15:20:00Z',
    });
    expect(new Set([current.etag, corrected.etag, refreshed.etag]).size).toBe(3);
    expect(refreshed.recordVersion).toBe(current.recordVersion + 2);
    expect(refreshed.sources).toMatchObject({
      recordVersion: refreshed.recordVersion,
      updatedAt: refreshed.updatedAt,
    });
    expect(profileEtag(current.profileId)).toBe(current.etag);
  });

  it('filters and cursor-paginates visible candidacy transitions', () => {
    const profileId = 'profile:us:morgan-fields:state-senate:2026';
    const first = readPublicProfileTimeline(profileId, { kind: 'candidacy_transition', limit: 1 });
    expect(first?.items).toHaveLength(1);
    expect(first?.page.nextCursor).toBe(first?.items[0]?.timelineItemId);
    const cursor = first?.page.nextCursor;
    if (!cursor) throw new Error('Expected a synthetic timeline cursor.');
    const second = readPublicProfileTimeline(profileId, {
      cursor,
      kind: 'candidacy_transition',
      limit: 1,
    });
    expect(second?.items).toHaveLength(1);
    expect(second?.items[0]?.timelineItemId).not.toBe(first?.items[0]?.timelineItemId);
    expect(second?.page.nextCursor).toBeNull();
  });

  it('keeps every high-risk write family outside issue #11', () => {
    expect(publicProfileDeferredWrites()).toEqual([
      'automatic_publication',
      'representative_signals',
      'composite_scoring',
      'identity_updates',
      'provenance_writes',
      'mainnet',
    ]);
  });
});
