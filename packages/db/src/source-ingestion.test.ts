import { describe, expect, it } from 'vitest';

import type { SqlExecutor, SqlResult, TransactionRunner } from './audit-outbox.js';
import { SourceIngestionRepository } from './source-ingestion.js';

class RecordingDatabase implements SqlExecutor, TransactionRunner {
  readonly calls: Array<{ readonly parameters: readonly unknown[]; readonly text: string }> = [];

  async query<Row extends Record<string, unknown>>(
    text: string,
    parameters: readonly unknown[] = [],
  ): Promise<SqlResult<Row>> {
    this.calls.push({ parameters, text });
    if (text.includes('RETURNING version_id')) {
      return {
        rowCount: 1,
        rows: [{ version_id: 'source-version:1' } as unknown as Row],
      };
    }
    return { rowCount: 1, rows: [] };
  }

  async transaction<Result>(
    operation: (transaction: SqlExecutor) => Promise<Result>,
  ): Promise<Result> {
    return operation(this);
  }
}

const decision = {
  actorReference: 'reviewer:synthetic',
  actorType: 'reviewer' as const,
  candidateId: 'candidate:ca:synthetic:avery',
  decidedAt: '2026-08-07T15:00:00Z',
  decision: 'approve' as const,
  decisionId: 'decision:source:1',
  policyVersion: 'source-review.v1',
  reasonCode: 'SOURCE_RECORD_CONFIRMED',
};

const record = {
  approvedAt: decision.decidedAt,
  candidateId: decision.candidateId,
  correctionState: 'active' as const,
  publicPayload: { displayName: 'Avery Quill', synthetic: true },
  recordId: 'source-record:1',
  recordType: 'person' as const,
  retrievalId: 'retrieval:ca:synthetic:001',
  reviewDecisionId: decision.decisionId,
  sourceEffectiveAt: '2026-08-01T00:00:00Z',
  sourceId: 'source:ca:synthetic-pilot',
  subject: { kind: 'person' as const, personId: 'person:ca:avery-quill' as never },
  supersedesVersionId: null,
  versionId: 'source-version:1',
};

describe('official-source ingestion repository', () => {
  it('persists human approval, audit, and outbox in one transaction', async () => {
    const database = new RecordingDatabase();
    const repository = new SourceIngestionRepository(database);
    await expect(
      repository.recordHumanApproval({
        audit: {
          action: 'source.candidate.approved',
          actorRef: decision.actorReference,
          actorType: decision.actorType,
          aggregateId: record.recordId,
          aggregateType: 'source_record',
          codeRevision: 'issue-55',
          consentVersion: null,
          correlationId: 'correlation:source:1',
          environment: 'test',
          eventId: 'audit:source:1',
          eventSchema: 'audit-event.v1',
          idempotencyKey: 'approval:source:1',
          methodVersion: 'source-review.v1',
          newStateRef: record.versionId,
          occurredAt: decision.decidedAt,
          policyVersion: decision.policyVersion,
          priorStateRef: null,
          privacyClass: 'internal',
          reasonCode: 'source_record_confirmed',
          reasonRef: decision.decisionId,
          redactionVersion: 'audit-redaction.v1',
          requestId: 'request:source:1',
          safeDetail: { countryCode: 'CA', recordType: 'person', synthetic: true },
        },
        decision,
        outbox: {
          aggregateId: record.recordId,
          aggregateType: 'source_record',
          availableAt: decision.decidedAt,
          correlationId: 'correlation:source:1',
          eventId: 'outbox:source:1',
          eventSchema: 'source-record-reviewed.v1',
          eventType: 'search.index',
          idempotencyKey: 'approval:source:1',
          maxAttempts: 5,
          payload: { recordId: record.recordId, versionId: record.versionId },
          privacyClass: 'internal',
        },
        record,
      }),
    ).resolves.toBe(record);
    expect(database.calls).toHaveLength(3);
    expect(database.calls[0]?.text).toContain('candidate_review_transition');
    expect(database.calls[1]?.text).toContain('rmr_audit.event');
    expect(database.calls[2]?.text).toContain('rmr_outbox.event');
  });

  it('rejects service or mismatched decisions before touching PostgreSQL', async () => {
    const database = new RecordingDatabase();
    const repository = new SourceIngestionRepository(database);
    await expect(
      repository.recordHumanApproval({
        audit: {} as never,
        decision: { ...decision, candidateId: 'candidate:other' },
        outbox: {} as never,
        record,
      }),
    ).rejects.toThrow(/matching reviewer or admin/);
    expect(database.calls).toHaveLength(0);
  });

  it('uses bounded, deterministic review and coverage reads', async () => {
    const database = new RecordingDatabase();
    const repository = new SourceIngestionRepository(database);
    await repository.readPendingCandidates(25);
    await repository.readLatestCoverage();
    expect(database.calls[0]).toMatchObject({ parameters: [25] });
    expect(database.calls[0]?.text).toContain("initial_review_state = 'pending_review'");
    expect(database.calls[1]?.text).toContain('coverage_snapshot_read');
    await expect(repository.readPendingCandidates(0)).rejects.toThrow(/1 through 200/);
  });
});
