import type {
  AuditEventInput,
  CandidateReviewDecision,
  OutboxEventInput,
  ReviewedSourceRecord,
} from '@rmr/domain';

import { AuditOutboxRepository, type SqlExecutor, type TransactionRunner } from './audit-outbox.js';

export interface PendingSourceCandidateRow extends Record<string, unknown> {
  readonly candidate_id: string;
  readonly country_code: 'CA' | 'US';
  readonly initial_review_state: 'pending_review' | 'quarantined';
  readonly jurisdiction_id: string;
  readonly match_outcome: 'ambiguous' | 'candidate_match' | 'conflict' | 'unmatched';
  readonly public_payload: Readonly<Record<string, unknown>>;
  readonly record_type: string;
  readonly source_availability: 'available' | 'missing' | 'retracted' | 'stale' | 'unavailable';
  readonly source_effective_at: string;
  readonly source_id: string;
  readonly source_record_id: string;
  readonly subject_kind: string;
  readonly subject_reference: string;
}

export interface SourceCoverageRow extends Record<string, unknown> {
  readonly candidate_count: number;
  readonly conflict_count: number;
  readonly country_code: 'CA' | 'US';
  readonly data_mode: 'synthetic';
  readonly generated_at: string;
  readonly jurisdiction_id: string;
  readonly missing_data_meaning: 'coverage_gap_not_misconduct';
  readonly pending_review_count: number;
  readonly provenance_state: 'not_anchored';
  readonly record_type: string;
  readonly snapshot_id: string;
  readonly source_availability: 'available' | 'missing' | 'retracted' | 'stale' | 'unavailable';
}

export interface ReviewedSourceRecordCommand {
  readonly audit: AuditEventInput;
  readonly decision: CandidateReviewDecision;
  readonly outbox: OutboxEventInput;
  readonly record: ReviewedSourceRecord;
}

const approveCandidateSql = `
  WITH candidate AS (
    SELECT *
    FROM rmr_source.candidate_record
    WHERE candidate_id = $2
      AND initial_review_state = 'pending_review'
      AND match_outcome <> 'conflict'
      AND source_availability = 'available'
      AND NOT EXISTS (
        SELECT 1 FROM rmr_source.candidate_review_transition prior
        WHERE prior.candidate_id = candidate_record.candidate_id
          AND prior.to_state IN ('approved', 'rejected', 'needs_correction', 'superseded')
      )
    FOR UPDATE
  ), review_transition AS (
    INSERT INTO rmr_source.candidate_review_transition (
      transition_id, candidate_id, from_state, to_state, actor_type,
      actor_reference, reason_code, policy_version, decided_at
    )
    SELECT $1, candidate_id, 'pending_review', 'approved', $3, $4, $5, $6, $7::timestamptz
    FROM candidate
    ON CONFLICT (transition_id) DO NOTHING
    RETURNING transition_id, candidate_id
  ), record_insert AS (
    INSERT INTO rmr_source.reviewed_record (
      record_id, record_type, subject_kind, subject_reference, created_at
    )
    SELECT $8, candidate.record_type, candidate.subject_kind, candidate.subject_reference, $7::timestamptz
    FROM candidate
    JOIN review_transition USING (candidate_id)
    ON CONFLICT (record_id) DO NOTHING
    RETURNING record_id
  ), record_ready AS (
    SELECT record_id FROM record_insert
    UNION ALL
    SELECT record_id FROM rmr_source.reviewed_record WHERE record_id = $8
  )
  INSERT INTO rmr_source.reviewed_record_version (
    version_id, record_id, candidate_id, review_transition_id, public_payload,
    source_id, retrieval_id, source_effective_at, approved_at,
    supersedes_version_id, correction_state
  )
  SELECT
    $9, $8, candidate.candidate_id, review_transition.transition_id,
    candidate.public_payload, candidate.source_id, candidate.retrieval_id,
    candidate.source_effective_at, $7::timestamptz, $10, 'active'
  FROM candidate
  JOIN review_transition USING (candidate_id)
  JOIN record_ready ON record_ready.record_id = $8
  ON CONFLICT (version_id) DO NOTHING
  RETURNING version_id
`;

export class SourceIngestionRepository {
  private readonly auditOutbox: AuditOutboxRepository;

  constructor(private readonly database: SqlExecutor & TransactionRunner) {
    this.auditOutbox = new AuditOutboxRepository(database);
  }

  async readPendingCandidates(limit = 50): Promise<readonly PendingSourceCandidateRow[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      throw new Error('Candidate review limit must be an integer from 1 through 200.');
    }
    const result = await this.database.query<PendingSourceCandidateRow>(
      `SELECT
         candidate_id, source_id, source_record_id, country_code, jurisdiction_id,
         record_type, source_effective_at, subject_kind, subject_reference,
         public_payload, match_outcome, initial_review_state, source_availability
       FROM rmr_source.candidate_record candidate
       WHERE initial_review_state = 'pending_review'
         AND NOT EXISTS (
           SELECT 1 FROM rmr_source.candidate_review_transition transition
           WHERE transition.candidate_id = candidate.candidate_id
             AND transition.to_state IN ('approved', 'rejected', 'needs_correction', 'superseded')
         )
       ORDER BY created_at, candidate_id
       LIMIT $1`,
      [limit],
    );
    return result.rows;
  }

  async readLatestCoverage(): Promise<readonly SourceCoverageRow[]> {
    const result = await this.database.query<SourceCoverageRow>(
      `SELECT * FROM rmr_source.coverage_snapshot_read
       WHERE snapshot_id = (
         SELECT snapshot_id FROM rmr_source.coverage_snapshot
         ORDER BY generated_at DESC, snapshot_id DESC LIMIT 1
       )
       ORDER BY country_code, jurisdiction_id, record_type, source_availability`,
    );
    return result.rows;
  }

  async recordHumanApproval(command: ReviewedSourceRecordCommand): Promise<ReviewedSourceRecord> {
    const { decision, record } = command;
    if (
      decision.decision !== 'approve' ||
      (decision.actorType !== 'reviewer' && decision.actorType !== 'admin') ||
      decision.candidateId !== record.candidateId ||
      decision.decisionId !== record.reviewDecisionId
    ) {
      throw new Error('Canonical source records require a matching reviewer or admin approval.');
    }
    return this.auditOutbox.executeAtomic({
      audit: command.audit,
      outbox: command.outbox,
      persistState: async (transaction) => {
        const result = await transaction.query<{ version_id: string }>(approveCandidateSql, [
          decision.decisionId,
          decision.candidateId,
          decision.actorType,
          decision.actorReference,
          decision.reasonCode,
          decision.policyVersion,
          decision.decidedAt,
          record.recordId,
          record.versionId,
          record.supersedesVersionId,
        ]);
        return { applied: result.rowCount === 1, state: record };
      },
    });
  }
}
