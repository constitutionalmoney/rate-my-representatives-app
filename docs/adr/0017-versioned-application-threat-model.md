# ADR 0017: Adopt a Versioned Application Threat Model and Fail-Closed Review Gate

- **Status:** Accepted
- **Date:** 2026-08-10
- **Issue:** [#6](https://github.com/constitutionalmoney/rate-my-representatives-app/issues/6)
- **Requirements:** Security, Privacy, Reliability, FR-AI-001 through FR-AI-004,
  FR-VID-001 through FR-VID-007, and FR-PROV-001 through FR-PROV-006

## Context

RMR combines public civic records with planned high-risk account, political
participation, evidence, moderation, AI, native wallet, representative identity, and
durable provenance paths. A control in one layer cannot establish safety in another. For
example, a valid wallet signature is not representative authority or truth, and a source
hash is not publication approval.

The repository has tested security foundations but no production deployment assurance,
independent security review, DPIA, hostile-document stack, AI provider, cryptographic
wallet callback, signer/RPC pipeline, production restore exercise, or mainnet approval.
The architecture needs one status-aware model that neither ignores planned threats nor
mislabels foundations as completed operational controls.

## Decision

Adopt [`docs/THREAT_MODEL.md`](../THREAT_MODEL.md) as
`application-threat-model.v1`.

1. Inventory public/private/signing assets, fifteen actor classes, and twelve trust
   boundaries across clients, API/domain, classified stores, sources, providers, wallet,
   signer/node, CI/releases, analytics, support, and backups.
2. Record each control as implemented foundation, accepted policy, future required, or
   unresolved; record test evidence separately.
3. Treat No Social Credit violations, private political profiling, moderation capture,
   provenance-as-truth, and public-memory manipulation as security/privacy harms.
4. Keep Verus account proof, superseded representative-controlled identity update, and
   planned RMR-managed representative provisioning/activity publication as separate
   threat surfaces with separate purposes and authorities.
5. Require optional dependency failures to preserve safe canonical public reads while
   failing closed for dependent commands and writes.
6. Prohibit AI human intent, automatic allegation publication, public provenance of
   private material, client/general-worker signer access, mainnet writes, and claims that
   provenance proves truth.
7. Make named incident ownership, unresolved decisions, pilot blockers, independent
   review, and evidence expiry visible.
8. Add generated `threat-control-catalog.v1` contract/fixture wiring. The foundation
   fixture remains synthetic and `blocked`; it is not a production risk register.

Issue #6 changes no runtime gate, route, database, worker, mobile behavior, source
connector, AI integration, Verus request, signer/RPC path, identity, manifest, or chain
state. It claims no penetration test, DPIA, independent review, incident exercise, wallet
compatibility certification, or deployment assurance.

## Consequences

- Later implementations have explicit threat/control/evidence/owner/safe-degradation
  requirements before code or release claims.
- Existing foundation tests remain useful without being overstated.
- Optional Verus and AI failures cannot take canonical public reads offline or corrupt
  application state.
- Security and privacy reviewers can identify unresolved decisions and pilot blockers
  without reverse-engineering the roadmap.
- The model must evolve with architecture and cannot be approved once and forgotten.

## Rejected alternatives

### Model only implemented code

Rejected because planned evidence, AI, wallet, signer, representative identity, and
provenance paths are precisely where early architecture constraints prevent expensive or
dangerous mistakes.

### Mark every documented control implemented

Rejected because policy, unit tests, local infrastructure, device installation, and
VRSCTEST experiments are different evidence classes and do not establish production
assurance.

### Treat Verus failures as application-record failures

Rejected because PostgreSQL and exact public bytes are canonical. Optional chain
publication must degrade asynchronously without blocking safe profiles or corrections.

### Use one trust score for threats or users

Rejected because risk scoring can hide assumptions and because any generalized citizen
trust/reputation value would violate the No Social Credit Covenant.

## Follow-up

- #43 maps every threat and release gate to automated/manual evidence.
- #57 completes repository-wide No Social Credit enforcement and review.
- #39 implements contributor evidence and hostile-content controls.
- #25 supplies backup/restore and incident exercises.
- #31 supplies optional VerusID proof only after compatibility/security review.
- #80-#83 govern RMR-managed representative naming, VRSCTEST provisioning, and approved
  activity publication under the separate signer/provenance controls.
