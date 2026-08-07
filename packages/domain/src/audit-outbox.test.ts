import { describe, expect, it } from 'vitest';

import { assertAuditSafePayload, decideOutboxRetry, OUTBOX_EVENT_TYPES } from './audit-outbox.js';

describe('audit and outbox domain policy', () => {
  it('rejects prohibited sensitive fields at any depth', () => {
    expect(() =>
      assertAuditSafePayload({ safe: { nested: [{ private_key: 'blocked' }] } }),
    ).toThrow('safe.nested.0.private_key');
    expect(() => assertAuditSafePayload({ publicStatus: 'synthetic' })).not.toThrow();
  });

  it('uses deterministic bounded retry jitter and eventually dead-letters', () => {
    const first = decideOutboxRetry('synthetic-event-1', 1, 3);
    expect(first).toEqual(decideOutboxRetry('synthetic-event-1', 1, 3));
    expect(first.disposition).toBe('retry');
    expect(first.delayMs).toBeGreaterThanOrEqual(800);
    expect(first.delayMs).toBeLessThanOrEqual(1_200);
    expect(decideOutboxRetry('synthetic-event-1', 3, 3)).toEqual({
      disposition: 'dead-letter',
      delayMs: 0,
    });
  });

  it('declares future provenance as an inert downstream event type', () => {
    expect(OUTBOX_EVENT_TYPES).toContain('provenance.anchor.requested');
  });
});
