# ADR 0006: Effective-dated jurisdiction graph

- Status: Accepted
- Date: 2026-08-06
- Issue: #49

## Context

Canada and the United States do not share one civic hierarchy. Municipal, county,
regional, special-district, electoral, public-body, and office boundaries can overlap
or change independently. Names and external identifiers can change without changing an
entity's RMR identity, while redistricting and amalgamation can create true successors.
A universal parent tree or blockchain identity hierarchy would conflate these facts.

Issue #49 precedes the person/term/candidacy lifecycle and source-ingestion issues in the
prescribed build sequence. The structural registry must therefore be complete enough to
support those later relationships without implementing their records early.

## Decision

Use stable opaque RMR IDs plus append-only effective-dated versions. Model jurisdiction
relationships, district/jurisdiction relationships, body/jurisdiction relationships,
and district lineage as separate graph edges. Permit multiple parents and overlaps,
reject effective containment cycles, and prevent overlapping versions for one entity or
boundary in PostgreSQL and domain validation.

Keep PostgreSQL canonical. Publish only security-barrier views with synthetic attribution,
freshness, coverage, conflict, and supersession metadata. Expose the same read model
through an operational synthetic v1 route and generated clients. Keep people, office
terms, candidacies, source ingestion, location resolution, Verus identity, provenance
writes, treasury/reserve/currency hierarchy, and real civic data outside this decision.

## Consequences

- Canada and United States structures can differ without schema exceptions.
- Historical, future, renamed, amalgamated, redistricted, appointed, acting, vacant,
  and abolished states remain explicit and queryable by date.
- Later person/term/candidacy records can refer to stable office IDs without being
  embedded in the office record.
- Public consumers see known gaps and conflicts instead of inferred completeness.
- Core builds, tests, API reads, and database operation require no Verus node.
- Location resolution and official-source trust remain separate reviewed decisions.
