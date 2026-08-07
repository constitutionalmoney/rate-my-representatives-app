# ADR 0004: Append-only audit and transactional outbox

- Status: Accepted for issue #19
- Date: 2026-08-06

## Context

Later application commands will change canonical PostgreSQL state and trigger several
downstream projections. Direct publication from an HTTP request risks committed state
without an audit record, or an external effect without reliable recovery. Audit records
also have different participant, moderation, security, and public disclosure boundaries.

## Decision

Append a privacy-minimized audit event and transactional outbox envelope in the same
PostgreSQL transaction as domain state. Make audit rows immutable for ordinary roles.
Use stable correlation and idempotency keys, `SKIP LOCKED` leases, expired-lease recovery,
at-least-once delivery, bounded exponential retry with jitter, dead letters, controlled
replay, and unique handler receipts.

Reject sensitive JSON keys at both the domain and database boundaries. Expose only
role-specific audit views and aggregate payload-free outbox health. Store record-specific
retention and legal-hold policy separately from immutable audit rows.

Declare all anticipated event destinations as contracts, including public manifests and
provenance, but implement no destination worker in this issue. PostgreSQL is canonical;
Verus remains optional and absent from the core build and smoke test.

## Consequences

- Application commands gain a strict state/audit/outbox transaction boundary.
- Consumers must be idempotent because delivery is at least once.
- Audit is not a general-purpose log or a store for raw civic/identity data.
- Restore and replay are explicit operational procedures with observable safe metrics.
- Later issues may add consumers without changing the core command durability model.
- Issue #35 must add separate VRSCTEST worker, signing, reconciliation, and chain read-back
  controls before any provenance event can cause a chain write.
