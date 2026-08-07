import { describe, expect, it } from 'vitest';

import {
  AuditOutboxRepository,
  type SqlExecutor,
  type SqlResult,
  type TransactionRunner,
} from './audit-outbox.js';

class FakeDatabase implements SqlExecutor, TransactionRunner {
  readonly statements: string[] = [];
  failOnOutbox = false;
  rolledBack = false;

  async query<Row extends Record<string, unknown>>(text: string): Promise<SqlResult<Row>> {
    this.statements.push(text);
    if (this.failOnOutbox && text.includes('INSERT INTO rmr_outbox.event')) {
      throw new Error('synthetic outbox failure');
    }
    return { rows: [], rowCount: 1 };
  }

  async transaction<Result>(
    operation: (transaction: SqlExecutor) => Promise<Result>,
  ): Promise<Result> {
    const savepoint = this.statements.length;
    try {
      return await operation(this);
    } catch (error) {
      this.statements.splice(savepoint);
      this.rolledBack = true;
      throw error;
    }
  }
}

const command = {
  audit: {
    eventId: 'synthetic-audit-1',
    eventSchema: 'audit.synthetic.v1',
    aggregateType: 'synthetic_fixture',
    aggregateId: 'synthetic-aggregate-1',
    actorType: 'service' as const,
    actorRef: 'synthetic-service',
    action: 'synthetic_fixture.recorded',
    priorStateRef: null,
    newStateRef: 'synthetic-state-v1',
    policyVersion: 'synthetic-policy-v1',
    methodVersion: 'synthetic-method-v1',
    consentVersion: null,
    requestId: 'synthetic-request-1',
    idempotencyKey: 'synthetic-command-1',
    correlationId: 'synthetic-correlation-1',
    occurredAt: '2026-01-01T00:00:00Z',
    reasonCode: 'synthetic_test',
    reasonRef: null,
    privacyClass: 'internal' as const,
    redactionVersion: 'redaction-v1',
    codeRevision: 'synthetic-revision',
    environment: 'test',
    safeDetail: { fixture: true },
  },
  outbox: {
    eventId: 'synthetic-outbox-1',
    eventType: 'public_manifest.materialize' as const,
    eventSchema: 'outbox.synthetic.v1',
    aggregateType: 'synthetic_fixture',
    aggregateId: 'synthetic-aggregate-1',
    idempotencyKey: 'synthetic-command-1:manifest',
    correlationId: 'synthetic-correlation-1',
    privacyClass: 'internal' as const,
    payload: { fixture: true },
    availableAt: '2026-01-01T00:00:00Z',
    maxAttempts: 3,
  },
  persistState: async (transaction: SqlExecutor) => {
    await transaction.query('INSERT INTO synthetic_domain_state VALUES ($1)', ['synthetic']);
    return { applied: true, state: 'synthetic-state-v1' };
  },
};

describe('audit outbox repository', () => {
  it('persists state, audit, and outbox in one transaction', async () => {
    const database = new FakeDatabase();
    const repository = new AuditOutboxRepository(database);

    await expect(repository.executeAtomic(command)).resolves.toBe('synthetic-state-v1');
    expect(database.statements).toHaveLength(3);
    expect(database.statements[1]).toContain('INSERT INTO rmr_audit.event');
    expect(database.statements[2]).toContain('INSERT INTO rmr_outbox.event');
  });

  it('rolls the whole transaction back when the outbox insert fails', async () => {
    const database = new FakeDatabase();
    database.failOnOutbox = true;
    const repository = new AuditOutboxRepository(database);

    await expect(repository.executeAtomic(command)).rejects.toThrow('synthetic outbox failure');
    expect(database.rolledBack).toBe(true);
    expect(database.statements).toEqual([]);
  });

  it('returns an existing state without duplicating audit or outbox rows', async () => {
    const database = new FakeDatabase();
    const repository = new AuditOutboxRepository(database);
    const duplicate = {
      ...command,
      persistState: async (transaction: SqlExecutor) => {
        await transaction.query('SELECT synthetic_existing_state($1)', ['synthetic']);
        return { applied: false, state: 'synthetic-state-v1' };
      },
    };

    await expect(repository.executeAtomic(duplicate)).resolves.toBe('synthetic-state-v1');
    expect(database.statements).toHaveLength(1);
    expect(database.statements[0]).not.toMatch(/rmr_(?:audit|outbox)/);
  });

  it('rejects sensitive payloads before opening a transaction', async () => {
    const database = new FakeDatabase();
    const repository = new AuditOutboxRepository(database);
    const unsafe = {
      ...command,
      outbox: { ...command.outbox, payload: { preciseAddress: 'synthetic-address' } },
    };

    await expect(repository.executeAtomic(unsafe)).rejects.toThrow('preciseAddress');
    expect(database.statements).toEqual([]);
  });
});
