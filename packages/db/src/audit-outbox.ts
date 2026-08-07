import {
  assertAuditSafePayload,
  decideOutboxRetry,
  type AuditEventInput,
  type OutboxEventInput,
} from '@rmr/domain';

export interface SqlResult<Row extends Record<string, unknown> = Record<string, unknown>> {
  readonly rows: readonly Row[];
  readonly rowCount: number;
}

export interface SqlExecutor {
  query<Row extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    parameters?: readonly unknown[],
  ): Promise<SqlResult<Row>>;
}

export interface TransactionRunner {
  transaction<Result>(operation: (transaction: SqlExecutor) => Promise<Result>): Promise<Result>;
}

export interface AtomicCommand<State> {
  readonly persistState: (transaction: SqlExecutor) => Promise<StateChangeResult<State>>;
  readonly audit: AuditEventInput;
  readonly outbox: OutboxEventInput;
}

export interface StateChangeResult<State> {
  readonly applied: boolean;
  readonly state: State;
}

export interface ClaimedOutboxEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly idempotencyKey: string;
  readonly attemptCount: number;
  readonly maxAttempts: number;
}

const insertAuditSql = `
  INSERT INTO rmr_audit.event (
    event_id, event_schema, aggregate_type, aggregate_id, actor_type, actor_ref,
    action, prior_state_ref, new_state_ref, policy_version, method_version,
    consent_version, request_id, idempotency_key, correlation_id, occurred_at,
    reason_code, reason_ref, privacy_class, redaction_version, code_revision,
    environment, safe_detail
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
    $16::timestamptz, $17, $18, $19, $20, $21, $22, $23::jsonb
  )
`;

const insertOutboxSql = `
  INSERT INTO rmr_outbox.event (
    event_id, event_type, event_schema, aggregate_type, aggregate_id,
    idempotency_key, correlation_id, privacy_class, payload, available_at, max_attempts
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::timestamptz, $11)
`;

export class AuditOutboxRepository {
  constructor(private readonly database: TransactionRunner & SqlExecutor) {}

  async executeAtomic<State>(command: AtomicCommand<State>): Promise<State> {
    assertAuditSafePayload(command.audit.safeDetail);
    assertAuditSafePayload(command.outbox.payload);

    return this.database.transaction(async (transaction) => {
      const stateChange = await command.persistState(transaction);
      if (!stateChange.applied) return stateChange.state;
      const audit = command.audit;
      await transaction.query(insertAuditSql, [
        audit.eventId,
        audit.eventSchema,
        audit.aggregateType,
        audit.aggregateId,
        audit.actorType,
        audit.actorRef,
        audit.action,
        audit.priorStateRef,
        audit.newStateRef,
        audit.policyVersion,
        audit.methodVersion,
        audit.consentVersion,
        audit.requestId,
        audit.idempotencyKey,
        audit.correlationId,
        audit.occurredAt,
        audit.reasonCode,
        audit.reasonRef,
        audit.privacyClass,
        audit.redactionVersion,
        audit.codeRevision,
        audit.environment,
        JSON.stringify(audit.safeDetail),
      ]);
      const outbox = command.outbox;
      await transaction.query(insertOutboxSql, [
        outbox.eventId,
        outbox.eventType,
        outbox.eventSchema,
        outbox.aggregateType,
        outbox.aggregateId,
        outbox.idempotencyKey,
        outbox.correlationId,
        outbox.privacyClass,
        JSON.stringify(outbox.payload),
        outbox.availableAt,
        outbox.maxAttempts,
      ]);
      return stateChange.state;
    });
  }

  async claim(
    workerRef: string,
    batchSize = 25,
    leaseSeconds = 60,
  ): Promise<readonly ClaimedOutboxEvent[]> {
    const result = await this.database.query<{
      attempt_count: number;
      event_id: string;
      event_type: string;
      idempotency_key: string;
      max_attempts: number;
    }>('SELECT * FROM rmr_outbox.claim_events($1, $2, make_interval(secs => $3))', [
      workerRef,
      batchSize,
      leaseSeconds,
    ]);
    return result.rows.map((row) => ({
      eventId: row.event_id,
      eventType: row.event_type,
      idempotencyKey: row.idempotency_key,
      attemptCount: row.attempt_count,
      maxAttempts: row.max_attempts,
    }));
  }

  async complete(eventId: string, workerRef: string, handlerName: string): Promise<boolean> {
    const result = await this.database.query<{ completed: boolean }>(
      'SELECT rmr_outbox.complete_event($1, $2, $3) AS completed',
      [eventId, workerRef, handlerName],
    );
    return result.rows[0]?.completed ?? false;
  }

  async fail(
    event: ClaimedOutboxEvent,
    workerRef: string,
    failureCode: string,
    failureSummaryCode: string,
  ): Promise<'retry' | 'dead-letter'> {
    const expected = decideOutboxRetry(event.eventId, event.attemptCount, event.maxAttempts);
    const result = await this.database.query<{ state: 'dead_letter' | 'pending' | null }>(
      'SELECT rmr_outbox.fail_event($1, $2, $3, $4) AS state',
      [event.eventId, workerRef, failureCode, failureSummaryCode],
    );
    const state = result.rows[0]?.state;
    if (state === null || state === undefined) throw new Error('Outbox lease is no longer owned.');
    if ((state === 'dead_letter') !== (expected.disposition === 'dead-letter')) {
      throw new Error('Database retry policy diverged from the domain policy.');
    }
    return expected.disposition;
  }
}
