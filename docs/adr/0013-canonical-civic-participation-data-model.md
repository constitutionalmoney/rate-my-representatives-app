# ADR 0013: Canonical Civic and Participation Data Model

- **Status:** Accepted
- **Date:** 2026-08-09
- **Issue:** [#2](https://github.com/constitutionalmoney/rate-my-representatives-app/issues/2)
- **Requirements:** FR-REG-001 through FR-REG-005, FR-SIG-001 through FR-SIG-007,
  FR-AUTH-001 through FR-AUTH-007, FR-PROV-001 through FR-PROV-006

## Context

The repository already has implemented synthetic slices for the civic registry,
public-role lifecycle, source ingestion, public read projections, authentication policy,
audit/outbox, security domains, and privacy-minimized location resolution. The PRD also
names later account, participation, moderation, identity, methodology, AI, and provenance
entities that do not yet have production-capable persistence.

Without one canonical model, later migrations could conflate a person with an office,
Civic Signal with a representative signal, source evidence with truth, identity control
with public authority, or private civic activity with a public profile. Documentation
could also accidentally describe planned tables as deployed behavior.

## Decision

Adopt [`docs/DATA_MODEL.md`](../DATA_MODEL.md) as the versioned logical baseline.

The baseline:

- distinguishes **Implemented**, **Foundation only**, and **Planned** entities;
- keeps PostgreSQL canonical and derived stores rebuildable;
- gives every logical entity a stable opaque identifier, temporal/versioning rules,
  source-of-truth owner, privacy class, and retention/correction class;
- separates person, office, district, office term, election, candidacy, and organization;
- separates authentication, role, VerusID control, attestation, eligibility, and public
  authority;
- separates Civic Signal, representative signals, category ratings, community context,
  evidence, official responses, disputes, corrections, appeals, and AI runs;
- makes skip a no-write navigation action and withdrawal an explicit private event;
- requires public/private schema and serializer boundaries that prevent a join from
  citizen identity to individual political activity;
- keeps Verus optional and prevents chain state from becoming canonical application
  state; and
- excludes generalized citizen scoring and unrelated treasury/reserve/currency systems.

Issue #2 is documentation-only. It does not create planned tables, routes, or feature
behavior, and it changes no feature gate.

## Consequences

### Positive

- Later issues have a shared naming, cardinality, temporal, privacy, and correction
  contract.
- Reviewers can distinguish the existing physical schema from the approved target.
- Critical uniqueness and isolation constraints are identified before sensitive writes
  are added.
- Migration plans can preserve current stable IDs and append-only history.
- Public-role reads remain independent of Verus and private account/participation data.

### Costs

- Future migrations must map their physical tables back to this logical model and explain
  any accepted deviation.
- Retention durations, aggregate thresholds, and legal deletion details remain blocked on
  their policy/governance issues rather than being guessed here.
- Some logical entities will remain planned for several phases; status labels must stay
  current as implementation lands.

## Rejected alternatives

### One profile table for person, office, term, and candidacy

Rejected because it cannot preserve effective history, changing districts, candidacy
outcomes, acting/appointed service, person-resolution decisions, or source attribution
without ambiguity.

### One identity or trust level

Rejected because authentication, actor role, VerusID control, human attestation,
eligibility, and representative authority answer different questions. Combining them
would enable authorization errors and social-credit-like ranking.

### Persist skip or no-current-judgment

Rejected. Skip is navigation, not civic intent. Absence and explicit withdrawal remain
distinguishable without inventing a neutral signal.

### Make Verus identity or chain data canonical

Rejected. Verus is optional proof/provenance infrastructure. Profiles, corrections, and
public reads must work during wallet, signer, RPC, or chain outages.

### Add all planned tables now

Rejected because documentation does not supply the authorization, policies, migrations,
privacy tests, UI, or release evidence required for sensitive runtime behavior.

## Follow-up

- Each owning issue must update the status mapping in `docs/DATA_MODEL.md` when its
  physical implementation merges.
- Breaking logical changes require an accepted ADR/RFC and API/migration compatibility
  plan.
- Issues #23 and #45 own policy-approved retention/deletion durations.
- Issues #13, #37, #38, and #57 must satisfy the participation and No Social Credit
  constraints before representative-signal writes can exist.
