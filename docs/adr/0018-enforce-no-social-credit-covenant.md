# ADR 0018: Enforce the No Social Credit Covenant across application surfaces

- Status: Accepted for the issue #57 repository foundation
- Date: 2026-08-11
- Decision owners: project steward; production privacy/security owners remain unassigned

## Context

Earlier authentication and security-domain work rejected obvious citizen-score fields and
identity/activity joins. Name-based rules alone cannot stop equivalent ranking, prediction,
cross-product linkage, analytics, AI inference, or combined narrow states. The Covenant must
be executable and reviewable before participation, analytics, AI, scoring, or production
data exists.

## Decision

Adopt `no-social-credit-policy.v1` as the canonical machine-readable baseline and
[`NO_SOCIAL_CREDIT.md`](../NO_SOCIAL_CREDIT.md) as the public policy. Enforce semantic data
use decisions in the domain layer, positive public/analytics allowlists, recursive event and
telemetry guards, database schema/view scans, required contribution impact assessments, and
a blocked evidence-based release gate.

Permit only the nine registered, exact-purpose private states. They are non-public,
non-portable, non-combinable, and unavailable for unrelated access decisions. Citizen data
cannot enter public-role methodology. No feature flag can weaken a hard rule.

## Consequences

All future work must identify data, purpose, ranking/prediction, access, retention, reasons
and appeal, cross-product use, unrelated effects, and proving tests. Semantic review remains
necessary because a field-name scan is only defense in depth. Production rights, retention,
aggregate privacy, provider review, named ownership, and independent review remain blockers.

This ADR adds no operational participation, AI, scoring, analytics export, Verus, provenance,
VRSCTEST, or mainnet behavior and provides no production assurance.
