import { describe, expect, it } from 'vitest';

import type { AuditEvent, OutboxEvent } from './index.js';

describe('issue #19 generated event contracts', () => {
  it('represents an append-only synthetic audit and outbox pair', () => {
    const audit = {
      eventId: 'synthetic-audit-1',
      eventSchema: 'audit.synthetic.v1',
      aggregateType: 'synthetic_fixture',
      aggregateId: 'synthetic-aggregate-1',
      actorType: 'service',
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
      recordedAt: '2026-01-01T00:00:01Z',
      reasonCode: 'synthetic_test',
      reasonRef: null,
      privacyClass: 'internal',
      redactionVersion: 'redaction-v1',
      codeRevision: 'synthetic-revision',
      environment: 'test',
      safeDetail: { fixture: true },
    } satisfies AuditEvent;
    const outbox = {
      eventId: 'synthetic-outbox-1',
      eventType: 'public_manifest.materialize',
      eventSchema: 'outbox.synthetic.v1',
      aggregateType: 'synthetic_fixture',
      aggregateId: 'synthetic-aggregate-1',
      idempotencyKey: 'synthetic-command-1:manifest',
      correlationId: audit.correlationId,
      privacyClass: 'internal',
      payload: { fixture: true },
      state: 'pending',
      availableAt: '2026-01-01T00:00:01Z',
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: '2026-01-01T00:00:01Z',
    } satisfies OutboxEvent;

    expect(audit.actorType).toBe('service');
    expect(outbox.state).toBe('pending');
  });
});
