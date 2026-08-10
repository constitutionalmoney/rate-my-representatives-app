# ADR 0015: Define Light Mathematics Policy and a Fail-Closed Composite Gate

- **Status:** Accepted
- **Date:** 2026-08-09
- **Issue:** [#4](https://github.com/constitutionalmoney/rate-my-representatives-app/issues/4)
- **Requirements:** FR-METH-001 through FR-METH-005

## Context

The product website proposed ten Representative Accountability Score factor families,
the original beta guide proposed seven display headings, and the current illustrative
phone UI consolidates four preview rows. Without a canonical crosswalk, future code or UI
could create silent taxonomies, blend human judgments into record analysis, penalize
missing records, or expose an experimental composite as an unexplained number.

The foundation already keeps `COMPOSITE_SCORE_ENABLED=false`, models coverage gaps as
record conditions rather than misconduct, separates authentication/identity facts from
authority and reputation, and exposes no operational methodology route. Issue #18, not
issue #4, owns future indicator execution.

## Decision

Adopt [`docs/METHODOLOGY.md`](../METHODOLOGY.md) as the canonical Light Mathematics policy.

1. Preserve the seven beta headings as display categories, with only B01-B05 organizing
   evidence-derived record analysis.
2. Map all ten website factor families and the current four preview rows through stable
   W/B identifiers.
3. Keep evidence-derived indicators, coverage/freshness, authenticated human aggregates,
   unverified/anonymous input, ratings, context, AI analysis, and corrections separately
   inspectable.
4. Require immutable indicator metadata for method/source set/coverage/freshness/missing
   data/confidence/calculation/correction/AI/publication/provenance state.
5. Make missing required inputs produce `unavailable` and `null`, never an adverse value.
6. Permit AI only as disclosed, purpose-limited assistance with required human review;
   never as a hidden calculation engine or synthetic participant.
7. Require append-only correction, appeal, retraction, method-version, change-log, and
   supersession history.
8. Enforce all eleven composite prerequisites in a generated schema and a fail-closed
   evaluator in `packages/methodology`.
9. Retain `COMPOSITE_SCORE_ENABLED=false`; recognize rejection or a decision never to
   publish as valid outcomes.
10. Treat provenance as proof of byte commitment, never proof of truth or fairness.

Issue #4 adds policy, generated contract shapes, synthetic fixtures, and release-gate
tests only. It adds no representative indicator execution, score calculation, public
methodology API, persistence, production data, AI run, Verus dependency, or provenance
write.

## Consequences

- Product copy and future interfaces have one explicit taxonomy crosswalk.
- Missing and low-coverage records cannot silently disadvantage a representative.
- Human participation cannot be presented as evidence-derived fact or verified consensus
  across participation labels.
- An environment-variable change cannot bypass method approval or review evidence.
- Future issue #18 must implement approved methods against these contracts and add
  persistence/API behavior without weakening the gates.
- A composite remains unimplemented and may never be authorized.

## Rejected alternatives

### Average the seven beta headings

Rejected because two headings are human sentiment and record-quality context, not
representative-quality factors, and none of the seven is an approved number.

### Treat missing sources as zero

Rejected because source availability varies by jurisdiction and time and would convert
institutional data gaps into adverse claims about a person.

### Let the runtime flag authorize a composite

Rejected because a flag carries no evidence of method, fairness, correction, legal,
consultation, or governance approval.

### Use a generative model as the calculation engine

Rejected because outputs would be non-deterministic, difficult to reconstruct, and
capable of hiding political judgments behind model behavior.

## Follow-up

- #18 may implement approved non-composite indicator execution and, only after every
  future gate is approved, consider the separately authorized composite path.
- #57 enforces No Social Credit invariants across domain and architecture tests.
- #27 governs optional provenance manifests and anchoring without changing truth status.
