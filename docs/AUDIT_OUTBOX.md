# Append-only audit and transactional outbox

**Status:** Issue #19 foundation. Synthetic local/CI behavior only. This does not
implement representative scoring, source ingestion, Verus identities, identity updates,
provenance writes, or mainnet behavior.

## Transaction boundary

Every state-changing application command must use one PostgreSQL transaction:

1. persist canonical domain state;
2. append one privacy-minimized `rmr_audit.event`; and
3. insert one or more `rmr_outbox.event` envelopes.

Any failure rolls back all three operations. `AuditOutboxRepository.executeAtomic`
provides the TypeScript boundary, and `rmr.record_synthetic_command` is an executable
synthetic example. An idempotency key identifies the logical command/delivery; retries
must not create a second logical audit action or downstream effect.

PostgreSQL remains canonical. The `provenance.anchor.requested` event type is only a
reserved downstream contract. It has no consumer, RPC call, signing capability, or chain
write in this issue. Issue #35 owns the future VRSCTEST provenance worker and read-back
validation.

## Audit schema and privacy

Audit events carry stable event, aggregate, actor, action, state-reference, policy,
method, consent, request, idempotency, correlation, time, reason, privacy, redaction,
code-revision, and environment fields. Actor types are `human`, `representative`,
`staff`, `reviewer`, `admin`, `service`, and `agent`.

`safe_detail` is optional operational context, never an escape hatch for raw data. Both
TypeScript and PostgreSQL recursively reject fields associated with credentials, private
keys, wallet payloads, precise location/address, identity evidence, moderator notes,
individual signals, or tokens. Logs use the same redaction vocabulary. Store stable
internal references or hashes in explicit columns; do not put raw civic content,
authentication material, evidence, addresses, or identity material in audit/outbox JSON.

The audit table rejects update, delete, and truncate through triggers. Ordinary roles
also lack those privileges. Any future regulated-erasure design requires a separate
reviewed mechanism; it must not silently weaken append-only evidence.

## Access views

| Principal | Available history | Excluded |
|---|---|---|
| participant | own allowlisted human action history after `rmr.actor_ref` is set for the transaction | abuse/security internals and all other actors |
| moderation | non-security audit history | security-only records |
| security | audit records and record policy | no application mutation grant |
| public provenance | allowlisted public manifest/confirmed-anchor projection | internal/restricted/security records and individual signals |
| outbox worker | leases, safe transition functions, receipts, and aggregate health | audit mutation and unrestricted replay |

Representative/staff access does not expose an individual's representative signal. The
database also prevents `representative_signal.*` actions from being classified public.

`rmr_audit.record_policy` stores record-specific retention dates and legal holds. Issue
#19 intentionally implements policy state but no purge executor. Retention changes must
be authorized, reason-referenced, and audited by the caller. A legal hold wins over any
future expiry operation.

## Delivery, failure, and replay

Workers claim available or expired-lease events with `FOR UPDATE SKIP LOCKED`. Delivery
is at least once: a worker may crash after performing an external effect and before
acknowledgement. Each downstream handler therefore uses the envelope idempotency key and
the unique delivery receipt to make duplicates harmless.

Failed attempts use bounded exponential backoff with deterministic 20 percent jitter.
Only safe error codes/summaries are persisted; raw exceptions and payloads remain out of
logs and metrics. Exhausted events enter `dead_letter`. Security-authorized replay resets
delivery attempts, records a reason reference, and increments `replay_count`; the
application command invoking replay must append its own audit action in the same
transaction.

`rmr_outbox.health_metrics` exposes event type/state counts, oldest creation time,
maximum attempt count, expired-lease count, failed-event count, and replay count. It exposes no actor,
aggregate, payload, or failure detail. Alerting should cover:

- oldest pending age beyond the event-type objective;
- expired leases accumulating;
- dead-letter or retry growth;
- repeated replay; and
- a worker that claims without completing or failing events.

## Schema evolution

Event types use versioned `event_schema` values. Consumers must:

- accept only explicitly supported versions;
- ignore additive fields when the version permits them;
- deploy backward-compatible readers before writers emit a new version;
- introduce a new schema version for semantic or required-field changes; and
- dead-letter unknown versions with a safe code rather than guessing.

Replay preserves the original event ID, idempotency key, schema, payload, and correlation
ID. Do not rewrite historical audit rows or mutate a failed envelope into a different
meaning. A corrected action is a new command, audit event, and outbox event linked by a
new correlation ID or an explicit supersession reference.

## Backup, restore, and verification

Back up PostgreSQL audit, outbox, delivery receipt, migration ledger, and canonical state
together so the transaction boundary is preserved. After restore:

1. verify migration checksums before starting application workers;
2. keep workers stopped while checking row counts and referential consistency;
3. confirm audit mutation triggers and role grants still exist;
4. run `pnpm infra:smoke` against an isolated restored environment;
5. inspect pending, expired-lease, dead-letter, and replay metrics;
6. start one worker pool and allow idempotent delivery receipts to absorb duplicates; and
7. reconcile every future external system from its own read-back before marking delivery
   complete.

The live smoke test exercises atomic rollback, recursive redaction rejection,
immutability, role grants, legal hold, lease exclusion/expiry, retry jitter, dead-letter,
replay, duplicate delivery, and privacy-safe metrics inside a transaction that is rolled
back. It runs with Verus disabled.

## Rollback policy

Migration `0002_audit_outbox_foundation.sql` is forward-only. Do not edit it after
application. A rollback is an application rollback that leaves the append-only data and
schema intact, followed by a reviewed forward migration if schema repair is needed.
Dropping audit/outbox data is destructive, violates the ordinary rollback procedure, and
requires explicit retention/legal authorization plus a verified backup.
