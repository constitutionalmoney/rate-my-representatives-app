/* Generated from audit-event.schema.json. Do not edit directly. */

/**
 * Privacy-minimized append-only audit event contract.
 */
export interface AuditEvent {
  eventId: string;
  eventSchema: string;
  aggregateType: string;
  aggregateId: string;
  actorType: 'human' | 'representative' | 'staff' | 'reviewer' | 'admin' | 'service' | 'agent';
  actorRef: string;
  action: string;
  priorStateRef: string | null;
  newStateRef: string | null;
  policyVersion: string;
  methodVersion: string;
  consentVersion: string | null;
  requestId: string;
  idempotencyKey: string;
  correlationId: string;
  occurredAt: string;
  recordedAt: string;
  reasonCode: string;
  reasonRef: string | null;
  privacyClass: 'public' | 'internal' | 'restricted' | 'security';
  redactionVersion: string;
  codeRevision: string;
  environment: string;
  safeDetail: {
    [k: string]: unknown;
  };
}
