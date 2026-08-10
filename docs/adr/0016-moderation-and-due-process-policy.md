# ADR 0016: Adopt a Versioned Moderation and Due-Process Policy

- **Status:** Accepted
- **Date:** 2026-08-10
- **Issue:** [#5](https://github.com/constitutionalmoney/rate-my-representatives-app/issues/5)
- **Requirements:** FR-EVD-001 through FR-EVD-006; FR-RATE-001 through FR-RATE-004

## Context

Rate My Representatives must be able to correct public records without becoming an
allegation feed or silently erasing history. The data model reserves distinct evidence,
response, dispute, correction, appeal, community-context, and moderation records, but no
policy previously defined who may submit, which transitions are permitted, how reviewer
conflicts are handled, or what blocks a pilot.

The repository already keeps evidence intake, community context, privileged access,
provenance writes, and Verus anchoring false by default. Issue #5 must establish the
policy consumed by later implementation issues without activating any of them.

## Decision

Adopt [`docs/MODERATION_AND_DUE_PROCESS.md`](../MODERATION_AND_DUE_PROCESS.md) as
`moderation-due-process-policy.v1`.

1. Keep evidence eligibility separate from representative signals, ratings, and identity
   tier; label every submitter class without treating attribution as truth.
2. Define explicit, append-only state machines for evidence, representative responses,
   corrections, disputes, appeals, community context, and source loss/retraction.
3. Prohibit timer-driven or otherwise automatic publication.
4. Require accountable human decisions, assignment, conflict disclosure, recusal,
   policy/method versions, source-version references, rights review, public reason, and
   immutable appeal/supersession links.
5. Preserve publicly inspectable original, disputed, corrected, withdrawn, archived,
   and superseding history while allowing audited emergency restriction.
6. Make independent appeals and staffed moderation queues pilot blockers; service targets
   are operational measurements, never automatic decisions.
7. Restrict AI to disclosed candidate discovery/drafting and require a human decider.
8. Permit future provenance only for approved public allowlists. Raw submissions,
   identity evidence, reviewer material, quarantine contents, and legal communications
   are never anchor inputs.
9. Add a generated moderation-decision contract and pure allowed-transition map. Neither
   component performs a transition, publication, persistence, or external call.

Issue #5 adds no evidence upload, source retrieval, moderation queue, account or portal
route, public claim write, notification, production data, Verus dependency, provenance
write, or mainnet behavior.

## Consequences

- Follow-on issues have one versioned policy and machine-readable decision boundary.
- Authority, identity, popularity, AI output, elapsed time, and blockchain confirmation
  cannot substitute for human review.
- Corrections and appeals are append-only and reconstructable.
- Restricted review material cannot leak through a public decision or provenance object.
- A technically functional pilot remains blocked without staffed, trained, independent,
  measurable operations.

## Rejected alternatives

### Publish when a response deadline expires

Rejected because silence and elapsed time are not evidence, and queue behavior must not
determine truth or publication.

### Require verified-human status for every submission

Rejected because useful public evidence may come from journalists, researchers,
organizations, representatives, or safely handled public contributors. Status informs
attribution and abuse controls, not truth.

### Replace corrected material in place

Rejected because it conceals what changed and breaks audit, appeal, cache, notification,
and future provenance history.

### Put the full review record into provenance

Rejected because restricted evidence, identities, notes, conflicts, and legal material
must not become public or durably anchored.

## Follow-up

- #39 may implement evidence intake and safe evidence handling.
- #16 may implement the staffed moderation console and reviewer controls.
- #17 may implement representative response and correction routes.
- #58 may implement category ratings and separately moderated community context.
- #27 may later implement public-only provenance after its independent release gates.
