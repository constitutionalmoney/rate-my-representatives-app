# ADR 0008: Candidate-only official-source ingestion

**Status:** Accepted for issue #55

## Decision

Implement source ingestion as an internal, versioned candidate pipeline. Connector
capabilities declare authority, scope, access, rights, effective-date, scheduling,
checkpoint, parser, content-safety, conflict/outage, and ownership policy. Only approved
synthetic Canada and United States pilots execute in this issue.

Retrieval runs store immutable metadata and SHA-256, not raw PostgreSQL blobs. The
retrieval boundary resolves DNS, blocks private/link-local/metadata networks and
rebinding, constrains redirects/content/size/expansion/time, and quarantines failures.
Normalization creates review candidates with transformation and matching evidence.
Name alone never resolves a person.

PostgreSQL is canonical only after an accountable reviewer/admin decision. A canonical
reviewed version, privacy-minimized audit event, and outbox event share a transaction.
All retrieval, candidate, review, correction, quarantine, dead-letter, and coverage
history is append-only. Corrections supersede instead of overwriting.

## Consequences

Core build and tests use only synthetic fixtures and no network, Verus, identity, or
wallet dependency. Coverage and freshness gaps remain explicit and never imply
misconduct. Production source access and public API serialization need separate release
review. Contributor evidence, AI conclusions, representative scoring, identity updates,
provenance writes, and mainnet work remain out of scope.
