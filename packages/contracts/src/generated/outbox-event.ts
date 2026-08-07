/* Generated from outbox-event.schema.json. Do not edit directly. */

/**
 * At-least-once transactional outbox envelope.
 */
export interface OutboxEvent {
  eventId: string;
  eventType:
    | 'notification.dispatch'
    | 'search.index'
    | 'aggregate.recompute'
    | 'source.retrieve'
    | 'ai.draft.requested'
    | 'public_manifest.materialize'
    | 'provenance.anchor.requested';
  eventSchema: string;
  aggregateType: string;
  aggregateId: string;
  idempotencyKey: string;
  correlationId: string;
  privacyClass: 'public' | 'internal' | 'restricted' | 'security';
  payload: {
    [k: string]: unknown;
  };
  state: 'pending' | 'leased' | 'delivered' | 'dead_letter';
  availableAt: string;
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
}
