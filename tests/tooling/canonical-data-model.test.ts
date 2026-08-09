import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

const requiredEntities = [
  'jurisdiction',
  'district',
  'boundary_version',
  'person',
  'office',
  'office_term',
  'election',
  'candidacy',
  'organization',
  'official_identifier',
  'source',
  'source_retrieval',
  'claim',
  'profile_claim',
  'coverage_snapshot',
  'methodology_version',
  'indicator_result',
  'account',
  'authenticator',
  'session',
  'actor_role',
  'staff_delegation',
  'representative_claim',
  'verus_identity_link',
  'wallet_challenge',
  'identity_update_request',
  'identity_update_result',
  'attestation_status',
  'eligibility_snapshot',
  'representative_signal',
  'representative_signal_event',
  'representative_signal_aggregate',
  'rating_category_version',
  'category_rating',
  'community_context',
  'civic_signal_subscription',
  'civic_signal_briefing',
  'notification_delivery',
  'evidence_submission',
  'evidence_item',
  'representative_response',
  'dispute',
  'correction',
  'appeal',
  'moderation_decision',
  'ai_run',
  'audit_event',
  'outbox_event',
  'manifest',
  'anchor_batch',
  'anchor_attempt',
  'anchor_confirmation',
  'feature_flag',
] as const;

describe('issue #2 canonical data-model baseline', () => {
  it('catalogs every required logical entity without presenting planned tables as deployed', async () => {
    const document = await read('docs/DATA_MODEL.md');

    for (const entity of requiredEntities) {
      expect(document, `missing entity ${entity}`).toContain(`\`${entity}\``);
    }

    expect(document).toContain('**Implemented**');
    expect(document).toContain('**Foundation only**');
    expect(document).toContain('**Planned**');
    expect(document).toContain('Issue #2 adds no migration');
    expect(document).toContain('Migrations `0001` through `0008`');
  });

  it('defines identifiers, time, source-of-truth, privacy, and correction conventions', async () => {
    const document = await read('docs/DATA_MODEL.md');

    for (const section of [
      '### 3.1 Identifiers',
      '### 3.2 Time and versioning',
      '### 3.3 Privacy classes',
      '### 3.4 Retention and correction classes',
      '## 4. Canonical versus derived stores',
      '## 16. Deletion, correction, and account closure',
      '## 17. Migration and compatibility strategy',
    ]) {
      expect(document).toContain(section);
    }

    expect(document).toContain('PostgreSQL is canonical');
    expect(document).toContain('stable `*_id`');
    expect(document).toContain('`effective_from` and `effective_to`');
    expect(document).toContain('`supersedes_*_id`');
  });

  it('keeps candidacy, Civic Signal, representative signals, and skip semantically separate', async () => {
    const document = await read('docs/DATA_MODEL.md');
    const signalMachine = document.slice(
      document.indexOf('### 10.1 Representative-signal state machine'),
      document.indexOf('## 11. Civic Signal'),
    );

    expect(document).toContain('A winning candidacy never creates a term automatically.');
    expect(document).toContain('monitoring/briefings, not participation');
    expect(signalMachine).not.toMatch(/--> skip|skip -->/i);
    expect(signalMachine).toContain('explicit withdrawal');
    expect(signalMachine).toContain('write no signal event');
  });

  it('contains the required ERDs and lifecycle state machines', async () => {
    const document = await read('docs/DATA_MODEL.md');

    expect(document.match(/```mermaid/g)?.length ?? 0).toBeGreaterThanOrEqual(10);
    expect(document.match(/erDiagram/g)?.length ?? 0).toBeGreaterThanOrEqual(5);
    expect(document).toContain('### 12.1 Evidence and moderation state machine');
    expect(document).toContain('### 12.2 Representative claim and staff delegation');
    expect(document).toContain('### 12.3 Correction and supersession');
    expect(document).toContain('### 13.1 Provenance state machine');
    expect(document).toContain('### 13.2 Wallet challenge and identity update state machines');
  });

  it('makes the privacy boundary and No Social Credit prohibitions explicit', async () => {
    const document = await read('docs/DATA_MODEL.md');

    expect(document).toContain('There is deliberately no `precise_location`');
    expect(document).toContain('No Social Credit enforcement model');
    expect(document).toMatch(/no public view\/function may join account identity/i);
    expect(document).toMatch(/no generalized citizen-score entity/i);
    expect(document).toContain('Verus remains optional and non-authoritative');
    expect(document).toContain('Treasury, reserve, currency, DEX, NFT, PBaaS');
  });

  it('records the accepted decision and links it from repository source-of-truth docs', async () => {
    const [adr, readme, architecture, roadmap] = await Promise.all([
      read('docs/adr/0013-canonical-civic-participation-data-model.md'),
      read('README.md'),
      read('docs/ARCHITECTURE.md'),
      read('docs/ROADMAP.md'),
    ]);

    expect(adr).toContain('**Status:** Accepted');
    expect(adr).toContain('Issue #2 is documentation-only');
    for (const source of [readme, architecture, roadmap]) {
      expect(source).toContain('DATA_MODEL.md');
    }
  });
});
