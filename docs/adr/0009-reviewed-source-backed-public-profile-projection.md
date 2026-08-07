# ADR 0009: Reviewed source-backed public profile projection

- Status: Accepted for issue #11
- Date: 2026-08-07

## Context

Canonical civic entities and reviewed source versions already exist separately in
PostgreSQL. Public clients need a stable, cacheable profile view without gaining access
to private accounts, locations, signals, attestations, moderator state, or wallet data.
Source ingestion cannot be allowed to publish material records automatically.

## Decision

Add a rebuildable `rmr_public` projection keyed by a stable profile ID and exactly one
person plus office-term/candidacy context. A profile version requires a separate explicit
reviewer/admin publication decision and at least one reviewed source-record version.
Versions and timeline items are append-only.

Expose list, detail, cursor timeline, and profile-scoped source/coverage/response/
dispute/correction GET operations. Validate every server response against closed JSON
Schemas, generate all official clients from OpenAPI, and use record-version ETags.

Keep optional provenance absent while disabled. Return no score or representative-signal
aggregate. Add no write operation.

## Consequences

- Public profiles work without Verus and optional dependency failure cannot take them
  offline.
- Corrections and source refreshes visibly invalidate caches without silently rewriting
  history.
- Global source enumeration remains unavailable.
- Production source approval, moderation commands, representative authorization,
  participation, identity updates, provenance writes, and scoring remain separate work.
