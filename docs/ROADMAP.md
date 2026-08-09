# Rate My Representatives — End-to-End Roadmap

**Status:** Build sequence for the official repository  
**Last updated:** 2026-08-08
**Rule:** A merged feature is not operational until its release gates pass.

## Roadmap model

The roadmap is dependency-based rather than date-promissory. Each phase has deliverables, exit gates, and work that must remain disabled. Parallel work is allowed where it does not bypass a dependency.

### Global constraints

- Native iOS and Android are first-class product clients; responsive web remains a public and fallback surface.
- PostgreSQL is canonical.
- Verus is optional identity and provenance infrastructure.
- VRSCTEST precedes every mainnet decision.
- Civic Signal means monitoring and briefings; representative signals mean human support/concern judgments.
- Skip creates no signal.
- Evidence is not universally gated by verified-human status.
- No Social Credit enforcement applies in every phase.
- No Representative Accountability Score is assumed.
- Mirror-State, Direct Republic, treasury, reserve, AxeTax, token, DEX, and PBaaS work are not core dependencies.

## Phase 0 — Governance, repository, and contracts

### Objective

Turn the empty repository and conflicting backlog into an honest, buildable source of truth.

### Deliverables

- Apache-2.0 `LICENSE` and `NOTICE`.
- DCO 1.1, contribution, governance, security, trademark, third-party, and AI policies.
- Canonical README terminology and status.
- Codex-ready PRD.
- Architecture, subdomain, wallet/identity, website-alignment, privacy, threat-model, moderation, methodology, and coverage documentation.
- OpenAPI v1 skeleton and JSON Schema conventions.
- Monorepo decision record.
- Canonical logical data model and ERDs (`DATA_MODEL.md`).
- Issue tracker consolidated and relabeled by phase.
- CI baseline for formatting, type checking, tests, dependency review, secret scanning, and licence checks.

### Exit gate

- No unresolved ambiguity about `Civic Signal`, `representative signal`, `skip`, `withdraw judgment`, public-role identity, VerusID, attestation, evidence, category rating, indicator, Representative Accountability Score, anchor, and correction.
- No README link falsely claims a non-existent implementation.
- Superseded and out-of-scope issues are closed with references.

### Disabled

All public data, identity, wallet, signal, AI publication, provenance write, and score features.

### Foundation progress

Issue #2 now defines `rmr-data-model.v1`: stable identifiers, temporal/versioning rules,
source-of-truth ownership, privacy and retention classes, state machines, ERDs, critical
database constraints, and migration compatibility for every required civic and
participation entity. It distinguishes implemented migrations from foundation-only and
planned entities. No planned table, civic write, Verus operation, or score is enabled by
the documentation baseline. See [`DATA_MODEL.md`](./DATA_MODEL.md) and ADR 0013.

## Phase 1 — Monorepo and local development foundation

### Objective

Create a reproducible, secure development platform without making optional services mandatory.

### Deliverables

```text
apps/mobile
apps/web
apps/portal
apps/admin
apps/api
apps/worker
packages/domain
packages/db
packages/contracts
packages/auth
packages/connectors
packages/methodology
packages/civic-signal
packages/moderation
packages/verus
packages/provenance
packages/observability
packages/config
packages/discovery
infra/docker
infra/deployment
infra/mobile
```

- TypeScript strict mode and pinned runtime/package manager.
- React Native/Expo development-build foundation for iOS and Android, with isolated
  environment identifiers, native links, secure storage, privacy-safe push scaffolding,
  minimum-version enforcement, and unsigned CI compilation (issue #61).
- Responsive web application.
- API and worker skeletons.
- PostgreSQL, queue, object storage, and mail catcher.
- Optional Compose profile for VRSCTEST daemon/signers.
- Database migration framework.
- Typed configuration and feature flags.
- Health endpoints and structured redacted logging.
- Generated OpenAPI client workflow.
- CI matrices for server, web, iOS, and Android units/build checks.

Issue #22 now enforces the eight security domains with deny-by-default runtime policy,
generated contracts, PostgreSQL schemas/service roles, distinct API/worker credentials,
domain-scoped outbox claims, four classified object buckets, payload-free access audit,
operational-only analytics, and classification-preserving backup metadata. This is a
synthetic foundation, not completion of issue #6's threat exercise or issue #25's
production restore exercise.

### Exit gate

- Clean checkout can install, build, lint, type-check, test, migrate an empty database, and run the core stack without Verus.
- Public API readiness does not fail solely because optional Verus services are stopped.
- No RPC port is publicly exposed.

## Phase 2 — Public-role registry and official-source pipeline

### Objective

Build the canonical civic record before adding human opinion.

### Deliverables

- Country, jurisdiction, district, office, person, office-term, election, candidacy, organization, and official-identifier models.
- Effective dates, nested jurisdiction relationships, boundary versions, and status histories.
- Connector interface for Canada/U.S. official sources.
- Source licence/terms inventory.
- Retrieval hashes, retry policy, quarantine, conflict handling, and freshness calculation.
- Coverage snapshots and public gap reporting.
- Reviewer workflows for person matching and duplicate resolution.
- Seed fixtures for a deliberately limited pilot geography.
- Read-only APIs and profile pages.

### Exit gate

- Person, office, term, candidacy, and district cannot be conflated by schema or domain code.
- Every material claim has source and freshness state.
- Coverage gaps are visible.
- Profile creation and resolution work with all Verus flags disabled.

### Disabled

Representative signals, category ratings, community context, composite scoring, public AI conclusions, and mainnet writes.

### Foundation progress

Issues #49, #59, #55, and #11 now provide the synthetic jurisdiction graph, distinct
public-role lifecycles, internal candidate-only source ingestion, and reviewed read-only
profile API respectively. The synthetic pilots do not constitute production source
approval or pilot release evidence.

Issue #7 now defines reproducible coverage/freshness dimensions, source-rights review,
visible gap/correction rules, and explicit support thresholds through a generated
synthetic report contract. Issue #21 still owns public report publication and production
pilot evidence; no geography is approved as supported yet.

## Phase 3 — Native mobile and web discovery pilot

### Objective

Deliver the six-step product-led experience as a read-only civic application.

### Deliverables

- Country-first, minimized jurisdiction resolution.
- Native iOS and Android card decks.
- Responsive web/PWA fallback.
- Finite jurisdiction-relevant deck and completion state.
- Visible support, concern, skip, and open-record controls in preview mode, with writes disabled.
- Profile detail, source, coverage, freshness, dispute, correction, and provenance-status surfaces.
- Saved broad jurisdiction and bookmarks for basic accounts only if Phase 4 authentication is ready; otherwise device-local non-sensitive state.
- VoiceOver, TalkBack, dynamic type, reduced motion, switch control, no-drag operation, and web WCAG review.
- Mobile analytics limited to operational product quality; no political profiling.

### Exit gate

- Correct representative-match rate meets the approved pilot target.
- Raw location is absent from logs, traces, analytics, crash reports, and queues.
- Gestures have visible equivalents.
- The UI accurately says no public signal or composite score is live.

### Foundation progress

Issue #30 now provides a synthetic country-only finite deck and sourced detail view for
native iOS/Android and responsive web/PWA. It uses the generated issue #11 GET clients,
a validated public-only offline cache, safe profile deep links, explicit completion and
coverage-gap states, and visible no-drag controls. Support/concern remain unsubmitted
local previews, skip creates no retained event, and no score or Verus dependency exists.
Issue #29 now provides disabled-by-default transient Canada/United States resolution,
effective-dated synthetic boundary/provider contracts, accessible manual web/native
recovery, and optional account persistence limited to a canonical country, province,
state, or territory. Precise input is never retained, and no resolver provider or
geography is production-approved. Issue #37 still owns confirmed representative-signal
writes. Production coverage, browser/device release evidence, and the Phase 3 pilot exit
metrics remain separate release gates.

## Phase 4 — Accounts, roles, and representative authorization

### Objective

Introduce secure local accounts and a defensible route for representatives to control official responses without making Verus mandatory.

### Deliverables

- Passkeys and verified-email authentication.
- Session rotation, device/session management, recovery, and deletion routes.
- Separate authentication tiers and actor roles.
- Phishing-resistant MFA for privileged users.
- Representative profile-claim workflow.
- Staff delegation with scope, office term, start, expiry, revocation, and audit.
- Official response and correction-request drafts.
- Optional VerusID proof-of-control behind a feature flag.
- Signed wallet challenge, mobile deep link, desktop QR, HTTPS callback, polling recovery, and replay/wrong-chain tests.
- Pinned Verus Mobile/library compatibility matrix.

### Exit gate

- Authorization can be approved, expired, revoked, and appealed without Verus.
- Enabled wallet flows pass iOS and Android tests.
- No private key, seed, WIF, or wallet file reaches the application.
- A VerusID proves control only; it does not automatically prove public office or truth.

## Phase 5 — Civic Signal monitoring and briefings

### Objective

Deliver the website-promised human-controlled monitoring product before asking users to make consequential judgments.

### Deliverables

- Subscriptions by broad jurisdiction, person, office, issue, source class, and change type.
- Source-change and correction-event detection.
- Digest and immediate modes.
- Quiet hours, notification frequency, pause, unsubscribe, and data deletion.
- Native push notifications, email fallback, and in-app inbox.
- Briefings with source links, confidence/coverage, correction notices, and AI disclosure.
- Human action choices after opening the record.
- Domain prohibition against Civic Signal submitting ratings or representative signals.

### Exit gate

- Every briefing is reproducible from identified public records.
- A user can disable notifications and delete preferences.
- No automated pathway can create civic intent.
- Notification performance and abuse controls pass review.

## Phase 6 — Verified human participation and representative signals

### Objective

Enable privacy-safe, authenticated human support/concern signals while preserving optional participation and distinct labels.

### Dependencies

- Approved Checks and Balances Protocol or another attestation-provider contract.
- Approved jurisdiction-eligibility method.
- Privacy-threshold and differencing review.
- No Social Credit tests.

### Deliverables

- `HumanAttestationProvider` interface.
- Checks and Balances Protocol adapter disabled by default until approved.
- Eligibility snapshots separated from identity control and human status.
- One-active-signal invariant.
- Neutral confirmation ceremony.
- Recent-user-presence check.
- Append-only signal events.
- Explicit withdrawal.
- Skip as no write.
- Privacy-safe aggregation with suppression, interval controls, and versioned methodology.
- Abuse detection that does not become a citizen reputation score.
- Participant access, change, withdrawal, and deletion/retention rights.

### Exit gate

- Agent credentials cannot invoke signal commands at route or domain layer.
- Small-cell and differencing attacks are mitigated under the approved policy.
- Individual signals cannot be retrieved by representatives or public APIs.
- Revoked/expired attestations prevent new signals and are handled reproducibly in future aggregates.

## Phase 7 — Structured category ratings and moderated community context

### Objective

Add the website-promised deeper human input without blending it into quick sentiment or evidence-derived analysis.

### Deliverables

- Versioned category taxonomy and rating scale.
- Separate category-rating storage and aggregates.
- Participation-status labels.
- Moderated community context/comments.
- Edit, withdraw, report, moderation, dispute, and appeal flows.
- Rate limits and coordinated-abuse review.
- Explicit UI separating representative signal, category rating, evidence, official response, and AI analysis.

### Exit gate

- No rating is described as verified evidence.
- Anonymous/unverified and authenticated inputs remain separate.
- Moderation is staffed and response targets are measurable.

## Phase 8 — Evidence, due process, and public memory

### Objective

Create a source-backed, correctable record rather than an allegation feed.

### Deliverables

- Structured URL evidence submissions.
- SSRF-safe retrieval and quarantine.
- Claim/evidence state machines.
- Human review queue, conflict disclosure, assignment, and decision records.
- Representative responses.
- Disputes, corrections, appeals, and visible supersession.
- Evidence contributor attribution policy and public labeling.
- AI-assisted discovery/extraction with human publication decisions.
- Source snapshot/retention policy.
- Moderation metrics and public policy versions.

### Exit gate

- No timer can auto-publish an allegation.
- Every public claim carries source, context, review state, method/policy versions, and correction path.
- Representative authorization proves authority to respond, not truth.
- File uploads remain off unless a separate release gate passes.

## Phase 9 — Representative-controlled Verus identity updates

### Objective

Allow a representative to approve a narrowly scoped public reference or signed response on a controlled VerusID without making it the canonical profile or a prerequisite.

### Deliverables

- VRSCTEST-only `IdentityUpdateRequest` proof of concept.
- Allowlisted payload schema.
- Complete wallet review of relying party, network, identity, purpose, fields, public nature, fee, expiry, and effect.
- Representative/staff authorization binding.
- Callback verification, transaction tracking, current identity validation, and chain readback.
- Cancellation, timeout, rejection, wrong-chain, recovery/revocation, and supersession handling.
- Public UI explaining application record versus optional on-chain reference.
- Separate governance approval to enable per environment.

### Exit gate

- iOS and Android pinned-version matrix passes.
- Payload contains no private, unreviewed, or citizen data.
- Failure leaves the canonical profile and correction rights intact.
- Recovery and revocation runbooks pass.

### Disabled

Mainnet identity updates unless separately approved.

## Phase 10 — VDXF public provenance

### Objective

Prove commitments to exact approved public manifests without publishing private civic activity.

### Deliverables

- Project-owned, versioned VDXF namespace derived with `getvdxfid`.
- RFC 8785 or explicitly versioned canonicalization.
- Public manifest store.
- Transactional outbox and single-writer-per-identity queue.
- Private RPC adapter with method allowlist.
- Size preflight, identity read-merge-write, idempotency, retries, confirmation, reorganization, and readback.
- Public verifier and provenance status pages.
- Superseding correction anchors.
- Signer revocation/recovery and node-upgrade runbooks.

### Exit gate

- Deterministic fixtures rebuild byte-for-byte.
- Same logical batch creates at most one logical anchor.
- Readback digest matches stored bytes.
- Unconfirmed transactions are never labeled verified.
- Public reads work while Verus is stopped.
- VRSCTEST evidence exists before mainnet consideration.

## Phase 11 — Pilot hardening and store release preparation

### Objective

Make the limited pilot legally, operationally, technically, and publicly supportable.

### Deliverables

- App terms, privacy, community, evidence, moderation, response, correction, dispute, appeal, copyright, and retention policies reviewed.
- DPIA/privacy impact review and threat-model review.
- Independent security review.
- App Store and Google Play privacy disclosures, permission minimization, signing, release tracks, and review materials.
- Production infrastructure, backups, restore drills, incident response, on-call ownership, and status page.
- Abuse, fraud, misinformation, takedown, and legal-hold procedures.
- Accessibility review.
- Public pilot coverage report and feature-status matrix.
- Pilot-support and moderation staffing.

### Exit gate

Every applicable release gate in the PRD is evidenced and approved. A launch date is not an exit criterion; evidence is.

## Phase 12 — Representative Accountability Score decision

### Objective

Decide whether a composite result is justified after the underlying public record, human input, due process, and methodology systems are working.

### Required work before implementation

- Canonical Light Mathematics methodology.
- Mapping between website factor families and beta display categories.
- Public factors, weights, exclusions, missing-data rules, confidence, source coverage, and versioning.
- Bias, adversarial, manipulation, stability, correction, and small-data tests.
- Representative response and appeal behavior.
- Public consultation and governance decision.
- UI showing record analysis, human input, source coverage, confidence, AI role, formula version, and corrections separately.

### Decision outcomes

1. **Do not build:** continue with inspectable factors and indicators.
2. **Limited pilot:** feature-flagged, labeled experimental, no broad ranking.
3. **Approved product:** only after all gates and reserved governance approval.

The score remains off by default in all outcomes until an approved release explicitly enables it.

## Future context, not core backlog

The following may be documented in a non-normative vision area but must not block or distort the build above:

- Mirror-State;
- Direct Republic;
- AxeTax integration;
- jurisdictional reserve or treasury identities;
- currencies, baskets, payments, DEX, NFTs, or PBaaS chains;
- representative Verus sub-ID issuance hierarchies; and
- generalized agent passports.

A future RFC may propose an optional integration after the core app is proven. It must not rewrite the canonical person/office/term model.
