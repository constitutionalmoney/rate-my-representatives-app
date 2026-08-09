# ADR 0012: Request-scoped privacy-minimized jurisdiction resolution

- Status: Accepted
- Date: 2026-08-09
- Issue: #29

## Context

Representative discovery needs a way to map a location to effective jurisdictions and
office/candidacy scopes. A submitted address, postal code, or coordinate can identify or
locate a person and can become political-profile material when joined to representative
browsing. Persisting or broadly observing it would violate the project's security-domain
and No Social Credit boundaries.

## Decision

Use country-specific provider adapters behind a false-by-default feature gate. Normalize
and resolve precise input only in bounded request memory. Return public application IDs,
authoritative IDs, effective boundary versions, provider/geometry/licence metadata,
coverage gaps, and explicit resolved/ambiguous/unsupported/conflicting/stale/outage
states. Keep ambiguity state opaque, single-use, short-lived, bounded, and input-free.

Create no location table. Permit an authenticated account to save only a separately
selected canonical country, province, state, or territory through RLS-protected,
idempotent, payload-free-audited commands. Prohibit precise values from persistence,
queues, audit, observability, analytics, crash reports, AI, support exports, and Verus.
The resolver makes no legal-residence, citizenship, registration, or eligibility claim.

## Consequences

- Capability discovery works without Verus or a production provider; resolution remains
  disabled until separately approved.
- Client input is cleared before awaiting a result, and errors never echo it.
- Provider terms, data handling, coverage, geometry rights, and outage behavior are
  release gates, not implementation details.
- Process restart safely loses pending ambiguity state.
- Broad preference persistence cannot reconstruct a submitted location.

## Rollback

Disable `LOCATION_RESOLUTION_ENABLED` to stop resolution immediately. Preserve saved
broad preferences, hashed idempotency receipts, and audit history. Correct database
behavior with a forward migration; never drop evidence or introduce storage for precise
input as a rollback shortcut.
