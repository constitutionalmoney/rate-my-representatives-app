# Rate My Representatives — Product Requirements Document

**Version:** 1.0  
**Status:** Approved build baseline; features remain pre-release until their gates pass  
**Last updated:** 2026-08-05  
**Product steward:** Checks and Balances Committee Ltd.  
**Primary markets:** Canada and the United States  
**Primary platforms:** Apple iOS, Android, responsive web  
**Verus network:** VRSCTEST before any mainnet decision

## 1. Purpose

Rate My Representatives is a mobile-first public-accountability application that connects people with the correct public officials, offices, terms, districts, and candidacies; presents source-backed public records with visible coverage and freshness; supports distinctly labeled human civic input and evidence; and preserves responses, disputes, corrections, and provenance over time.

The core proposition is:

> **Digital ID for Politicians. Self-Sovereign Identity for Citizens.**

“Digital ID for politicians” means a persistent, source-aware **public-role application record**. It does not require a blockchain identity. “Self-Sovereign Identity for Citizens” means people control their credentials and disclose only the minimum claim required for a civic action.

Verus has a narrower role:

> Use VerusID and Verus Mobile for optional, explicit proof-of-control and approval flows, and use VDXF for provenance of approved public manifests without exposing private civic activity on-chain.

## 2. Product status and truthfulness rule

The application is in specification and repository-foundation development.

No production native app, public representative profile, representative signal, category rating, Civic Signal briefing, authenticated aggregate, VerusID identity claim, identity update, VDXF anchor, or Representative Accountability Score is live merely because this document describes it.

Every deployed surface must distinguish:

- operational;
- pilot;
- testnet-only;
- in development;
- proposed;
- disabled; and
- historical or superseded.

## 3. Source hierarchy

For implementation decisions, use this order:

1. this PRD and accepted RFCs;
2. domain contracts, OpenAPI, and versioned schemas;
3. `README.md`, `ROADMAP.md`, architecture and policy documents;
4. current website promises and status disclosures;
5. GitHub issue acceptance criteria; and
6. mockups, prototypes, or historical notes.

A conflict must be resolved explicitly. Codex must not silently choose one interpretation.

## 4. Product principles

1. **Source the claim.** Every material public assertion has attributable evidence, retrieval state, freshness, coverage, and a correction path.
2. **Separate the entities.** A person, office, district, office term, candidacy, claim, source, response, signal, and score are not one record.
3. **Public power is the subject.** Accountability follows a defined public role and term, not unrelated private life.
4. **Citizen identity contracts.** The system requests the minimum claim needed for the action.
5. **Human judgment remains human.** AI may investigate and organize; it may not impersonate civic intent.
6. **Methods precede metrics.** No indicator or score appears without a published, versioned method.
7. **Missing data is not guilt.** Gaps and uncertainty are displayed, not converted into negative values.
8. **Corrections extend history.** Public correction is visible; provenance is not used to freeze error.
9. **Integrity is not truth.** A signature, hash, or timestamp proves an action or commitment, not factual accuracy.
10. **Optional dependencies degrade safely.** Public records remain readable when AI, Verus, wallet, source, or notification services fail.
11. **No social credit.** Citizen identity and civic activity never become a generalized score or eligibility system.
12. **Do not optimize outrage.** Swipe count, anger, time-on-site, and allegation volume are anti-metrics.

## 5. Canonical terminology

### Civic Signal

The citizen-facing monitoring and briefing product. It watches approved public sources, follows topics and jurisdictions, detects relevant changes, and presents alerts with sources and correction updates. It never votes, rates, signs, agrees, disagrees, comments, or speaks as the user.

### Representative signal

A participant's current, explicitly confirmed `support` or `concern` judgment for one office term. It is not an election vote and is not Civic Signal.

### Skip

A navigation action that creates no representative signal, no public aggregate input, and no hidden judgment.

### Withdraw judgment

An explicit confirmed action that removes an active representative signal and appends a private audit event. It is not inferred from skip, inactivity, closing the screen, or deleting the application.

### Category rating

A structured human rating for a named category under a published method. It is stored and aggregated independently from the quick representative signal.

### Community context

A moderated text contribution linked to a public-role record. It is distinct from evidence, official response, category rating, and representative signal.

### Public-role digital identity

The application-native record connecting a person to the correct office, district, term, candidacy, official identifiers, source-backed conduct, responses, disputes, corrections, and optional external identity references.

### Representative Accountability Score

A possible future office-term accountability result created through the published Light Mathematics Protocol. It is conditional, inspectable, versioned, and never a citizen score.

## 6. No Social Credit Covenant

No social credit scores shall be created with this technology by Civic Ledger AI Ltd. or Checks and Balances Committee Ltd., or in any implementation that either company develops, operates, governs, or licenses.

The system must not convert citizen identity, lawful speech, political beliefs, associations, ratings, petitions, evidence submissions, voting choices, criticism, browsing history, or use of civic tools into a generalized reputation, conformity, loyalty, eligibility, or trustworthiness score.

The architecture must prevent:

- cross-context citizen scoring;
- hidden ideology or loyalty profiles;
- political targeting for advertising;
- use of civic activity to determine housing, employment, credit, insurance, mobility, benefits, or unrelated services;
- blending narrow account, attestation, abuse, submission, moderation, or participation states into a portable citizen score;
- public or representative access to a participant's private individual representative signal; and
- AI inference of political traits for targeting.

## 7. Users and actors

### Public reader

Can browse representative profiles, sources, coverage, methods, public aggregates, responses, disputes, corrections, and provenance without an account.

### Basic participant

Can save broad jurisdictions, bookmarks, Civic Signal subscriptions, notification preferences, and evidence drafts after passkey or verified-email authentication.

### Verified human and jurisdiction-eligible participant

Can submit or change an authenticated representative signal when an approved attestation and eligibility rule are current.

### Evidence contributor

May be a basic account, verified participant, journalist, researcher, representative, staff member, organization, or distinctly labeled public submitter under the approved evidence policy. Identity tier affects attribution, abuse controls, and review priority—not factual truth.

### Representative or candidate

Can claim a public-role profile, prove authorization, appoint staff within policy, submit official responses, sign statements, request corrections, and appeal decisions.

### Authorized staff

Can act only within a representative-granted and application-approved role, scope, office term, and validity period.

### Moderator or reviewer

Can review submissions and make scoped decisions under least privilege, conflict rules, strong authentication, and immutable audit.

### Administrator

Manages operational configuration but cannot silently change public methodology, published records, or review decisions.

### Civic Agent

Can read public records, discover sources, classify, extract, compare, draft, and submit work for human review within declared scopes. It cannot cast a representative signal, category rating, comment as a person, official response, signature, or identity update.

## 8. Platforms and experience strategy

### Native mobile

Dedicated iOS and Android applications are first-class product clients. The preferred baseline is React Native with Expo development builds and prebuild support, subject to proof that wallet deep links, universal/app links, security controls, accessibility, background notifications, and app-store requirements are supported.

### Responsive web

The web application provides public read access, accessibility, desktop workflows, deep-link fallback, installed-PWA capability, and a recovery surface when native installation is unavailable.

### Representative portal

A responsive portal optimized for strong authentication, profile claims, staff authorization, official responses, correction requests, wallet handoff, and audit history.

### Moderation console

A restricted desktop-first application for evidence review, disputes, corrections, appeals, source inspection, conflict disclosure, and operational audit.

## 9. Primary product journeys

### Journey 1 — Find representation

1. Ask for country.
2. Request only the minimum location detail needed for supported districts.
3. Resolve local/municipal, regional/provincial/state, and federal representation.
4. Discard precise input immediately unless the user deliberately saves a broader region.
5. Return authoritative district identifiers and office terms.
6. Display unsupported, conflicting, stale, or missing coverage.

### Journey 2 — Browse the card deck

Each finite, jurisdiction-relevant card represents one person in relation to one office term or candidacy.

Card front:

- sourced name and photograph;
- office, district, government level, and term/candidacy status;
- party or affiliation only when sourced and current;
- source coverage and freshness;
- no more than approved non-composite indicators; and
- `Open sourced record`.

Actions:

- support;
- concern;
- skip; and
- open record.

A swipe selects an intended action but does not submit a representative signal. Visible buttons provide equivalent actions. Skip writes nothing.

### Journey 3 — Inspect the public-role record

The profile exposes, where available:

- identity, office, district, term, candidacy, and status history;
- official identifiers and contact routes;
- votes, attendance, committee work, spending, disclosures, public statements, promises, policy positions, public events, and documented outcomes;
- source, retrieval date, freshness, coverage, conflicts, and gaps;
- claims and supporting/challenging evidence;
- representative responses;
- disputes, decisions, corrections, and appeals;
- category ratings and community context, separately labeled;
- representative-signal aggregate, only when privacy-safe;
- methodology and AI-assistance disclosures; and
- provenance state.

### Journey 4 — Use Civic Signal

1. Choose broad jurisdictions, offices, issues, and sources to follow.
2. Choose notification channel, frequency, quiet hours, and context depth.
3. Receive a briefing when an approved source changes or a followed record, response, dispute, or correction is published.
4. Open the original source and RMR record.
5. Decide personally whether to support, concern, skip, contribute evidence, add context, or take no action.

Civic Signal must never preselect or submit a civic judgment.

### Journey 5 — Submit a representative signal

1. The user chooses support or concern.
2. The app shows a neutral confirmation screen naming the person, office term, selected signal, eligibility state, change/withdraw rights, and privacy-threshold method.
3. The user performs recent-presence confirmation.
4. The API verifies account, active human attestation, jurisdiction eligibility, actor type, rate limits, and idempotency.
5. The domain service appends a signal event and updates the single active signal.
6. Aggregate recalculation is queued.
7. Publication occurs only under the approved suppression policy.

Cancellation, navigation away, failed validation, or skip creates no signal.

### Journey 6 — Submit evidence or context

The initial evidence release accepts structured claims and source URLs, not arbitrary file uploads.

Required evidence fields:

- target person/office term/candidacy;
- claim category;
- concise claim or challenge;
- original source URL;
- publisher;
- publication/event date;
- relevant excerpt or explanation;
- submitter declaration;
- conflict-of-interest disclosure; and
- requested action.

The system validates and fetches sources through an SSRF-safe, size-limited, content-type-restricted, redirect-controlled pipeline. AI may prepare a draft but cannot publish the claim.

### Journey 7 — Representative claim and response

1. A representative or staff member creates an account with strong authentication.
2. They select a public-role profile and submit authorization evidence under policy.
3. They may optionally prove control of a VerusID through Verus Mobile.
4. RMR approves, rejects, or requests more information; authorization state remains visible to the claimant.
5. An authorized actor can submit an official response or correction request.
6. The actor may sign the response through Verus Mobile when supported.
7. Separately governed RMR-managed directory publication may later reference an approved
   public response under issues #80–#83; it is not part of claim approval or login.
8. Any enabled publication path verifies authorization, transaction, identity state,
   confirmation, and exact chain readback.
9. Disabled, declined, or failed Verus behavior does not block the RMR profile, response,
   or correction workflow.

### Journey 8 — Correct and appeal

Representatives, submitters, participants, researchers, and moderators receive role-appropriate routes to dispute, respond, correct, withdraw where permitted, appeal, and inspect the final history. No timer automatically publishes an allegation.

## 10. Functional requirements

### Registry and jurisdiction

- **FR-REG-001:** Store person, office, district, office term, candidacy, election, and organization as separate entities.
- **FR-REG-002:** Support nested country, province/state/territory, municipality/locality, district, chamber/body, and special-district structures without requiring treasury or Verus parent identities.
- **FR-REG-003:** Preserve effective dates and geometry versions.
- **FR-REG-004:** Represent current, former, acting, appointed, elected, declared, withdrawn, disqualified, and historical states explicitly.
- **FR-REG-005:** Profiles function when Verus is disabled.

### Sources and public record

- **FR-SRC-001:** Every material claim references one or more source records.
- **FR-SRC-002:** Record original URL, normalized URL, publisher, source type, retrieval time, content hash, licence/terms note, freshness state, and fetch outcome.
- **FR-SRC-003:** Publish coverage gaps instead of implying completeness.
- **FR-SRC-004:** Quarantine conflicting, malformed, inaccessible, or suspicious source material for review.
- **FR-SRC-005:** Preserve the originally reviewed record version for reproducibility where legally permitted.

### Mobile card deck

- **FR-MOB-001:** Deliver native iOS and Android card-deck clients plus web fallback.
- **FR-MOB-002:** Gesture direction is never the sole carrier of meaning.
- **FR-MOB-003:** Skip creates no domain event.
- **FR-MOB-004:** A consequential signal requires a separate explicit confirmation.
- **FR-MOB-005:** The deck is finite and jurisdiction-relevant with a clear completion state.
- **FR-MOB-006:** Do not optimize recommendation order for outrage, negativity, or time-on-site.

### Civic Signal

- **FR-CS-001:** Support subscriptions by broad jurisdiction, office, person, issue, source class, and change type.
- **FR-CS-002:** Support notification frequency, quiet hours, digest mode, and pause/unsubscribe.
- **FR-CS-003:** Every briefing links to sources and identifies AI assistance.
- **FR-CS-004:** Correction and dispute updates can supersede earlier alerts.
- **FR-CS-005:** Civic Signal cannot call representative-signal or rating commands.

### Representative signals

- **FR-SIG-001:** One active signal per eligible participant and office term.
- **FR-SIG-002:** Allowed active values are `support` and `concern`.
- **FR-SIG-003:** `skip` is not persisted as a signal.
- **FR-SIG-004:** Withdrawal is explicit, confirmed, and append-only in private history.
- **FR-SIG-005:** Agent actors are structurally rejected.
- **FR-SIG-006:** Public aggregate publication uses versioned thresholds and differencing protections.
- **FR-SIG-007:** Individual signals are not exposed to representatives or public readers.

### Category ratings and context

- **FR-RATE-001:** Category ratings use a versioned category and scale.
- **FR-RATE-002:** Ratings remain distinct from representative signals and evidence-derived indicators.
- **FR-RATE-003:** Comments/context require moderation and participation-status labels.
- **FR-RATE-004:** Authenticated, unverified, and anonymous inputs are never silently blended.

### Evidence and moderation

- **FR-EVD-001:** Evidence has a state machine: `draft -> submitted -> validated -> under_review -> published | disputed | rejected -> corrected | withdrawn | archived`.
- **FR-EVD-002:** No automatic publish-on-timer path exists.
- **FR-EVD-003:** Verified-human status is not universally required to submit evidence.
- **FR-EVD-004:** Reviewer decisions include actor, conflicts, sources, policy/method versions, reason, and time.
- **FR-EVD-005:** Representative responses and correction history remain visible.
- **FR-EVD-006:** File uploads remain disabled until malware scanning, retention, rights, and moderation policy are approved.

### Authentication, identity, and roles

- **FR-AUTH-001:** Public browsing requires no account.
- **FR-AUTH-002:** Basic authentication supports passkeys and verified email.
- **FR-AUTH-003:** Authentication tier and actor role are separate concepts.
- **FR-AUTH-004:** Privileged roles require phishing-resistant MFA and least privilege.
- **FR-AUTH-005:** VerusID linking is optional and stores the immutable i-address as the external key.
- **FR-AUTH-006:** Human attestation, identity control, jurisdiction eligibility, and current intent are independently evaluated.
- **FR-AUTH-007:** Checks and Balances Protocol integration uses a provider interface and remains disabled until its contract, privacy, consent, recovery, revocation, and legal gates pass.

### Representative identity and Verus Mobile

- **FR-VID-001:** A representative profile exists without a VerusID.
- **FR-VID-002:** Proof of VerusID control uses a signed, single-use, session-bound, expiring request/response flow after pinned-version compatibility testing.
- **FR-VID-003:** Representative/staff authorization has application-local review and expiry.
- **FR-VID-004:** An `IdentityUpdateRequest` is never used for login.
- **FR-VID-005:** Any identity update is opt-in, VRSCTEST-first, allowlisted, fee-disclosed, human-approved, callback-verified, and read back from chain.
- **FR-VID-006:** An update failure does not corrupt or block the canonical application record.
- **FR-VID-007:** The application never receives a user's private key or seed.

### AI

- **FR-AI-001:** AI may discover, classify, extract, compare, deduplicate, summarize neutrally, measure coverage, and flag abuse for review.
- **FR-AI-002:** AI cannot submit human civic intent or official authority.
- **FR-AI-003:** Published AI-assisted output records model/process version, source identifiers, confidence, human reviewer, decision, and correction state.
- **FR-AI-004:** AI failure degrades to manual workflow rather than automatic publication.

### Methodology and scoring

- **FR-METH-001:** Every computed indicator identifies method version, source set, coverage, calculation time, confidence, and correction state.
- **FR-METH-002:** Missing data is not negative.
- **FR-METH-003:** Verified civic sentiment is displayed separately.
- **FR-METH-004:** Website factor language and beta display categories map through one canonical Light Mathematics document.
- **FR-METH-005:** `COMPOSITE_SCORE_ENABLED` defaults to false and cannot be enabled without reserved governance approval.

### Provenance

- **FR-PROV-001:** PostgreSQL remains canonical.
- **FR-PROV-002:** Anchor deterministic public manifests, not raw private records.
- **FR-PROV-003:** Approved anchor types include public evidence batches, profile snapshots, correction batches, methodology releases, moderation policies, coverage reports, and privacy-safe aggregate batches.
- **FR-PROV-004:** Never anchor individual signals, identity mappings, addresses, KYC/attestation evidence, moderator notes, private correspondence, abuse signals, or private prompts.
- **FR-PROV-005:** Writes use a transactional outbox, idempotency, confirmation tracking, reorganization handling, and chain readback.
- **FR-PROV-006:** Public states are `not_anchored`, `pending`, `confirmed`, `verified`, `verification_failed`, and `superseded`.

## 11. Data model

Minimum entities:

- `person`
- `office`
- `district`
- `office_term`
- `election`
- `candidacy`
- `organization`
- `official_identifier`
- `profile_claim`
- `source`
- `source_retrieval`
- `claim`
- `evidence_submission`
- `evidence_item`
- `representative_response`
- `dispute`
- `correction`
- `appeal`
- `account`
- `authenticator`
- `actor_role`
- `staff_delegation`
- `representative_claim`
- `verus_identity_link`
- `verus_wallet_challenge`
- `identity_update_request`
- `identity_update_result`
- `attestation_status`
- `eligibility_snapshot`
- `representative_signal`
- `representative_signal_event`
- `representative_signal_aggregate`
- `rating_category_version`
- `category_rating`
- `community_context`
- `civic_signal_subscription`
- `civic_signal_briefing`
- `notification_delivery`
- `methodology_version`
- `indicator_result`
- `coverage_snapshot`
- `ai_run`
- `audit_event`
- `outbox_event`
- `anchor_batch`
- `anchor_attempt`
- `anchor_confirmation`
- `feature_flag`

Private account/identity, precise-location, private civic activity, moderation, public record, provenance, and Verus signing/RPC domains require separate access boundaries.

## 12. API baseline

The external API is versioned from the first implementation. `docs/openapi.yaml` will be canonical.

Minimum route families:

```text
/api/v1/jurisdictions
/api/v1/representation
/api/v1/people
/api/v1/offices
/api/v1/office-terms
/api/v1/candidacies
/api/v1/sources
/api/v1/claims
/api/v1/coverage
/api/v1/methodologies
/api/v1/auth
/api/v1/account
/api/v1/representative-claims
/api/v1/representative-signals
/api/v1/category-ratings
/api/v1/community-context
/api/v1/evidence
/api/v1/responses
/api/v1/disputes
/api/v1/corrections
/api/v1/appeals
/api/v1/civic-signal
/api/v1/notifications
/api/v1/provenance
/api/v1/health
```

Every write contract declares actor type, authorization, idempotency behavior, rate limits, validation errors, privacy classification, audit event, and state transition.

## 13. Verus Mobile integration decisions

### Authentication and proof of control

Prefer a signed `GenericRequest` / `GenericResponse` flow only after an exact combination of Verus Mobile and TypeScript library versions passes iOS and Android tests. The challenge must include at least 32 bytes of secure randomness, account/session binding, relying-party audience, purpose, network, issued time, expiry, and single-use nonce.

Same-device mobile uses an allowlisted `verus://` deep link where supported. Desktop uses QR. The callback is public HTTPS and the server verifies request ID, nonce, expiry, audience, chain, signer, response signature, and current identity state. A polling result endpoint supports return-flow recovery.

### Identity update governance

No representative-controlled identity update is approved for the initial model. Issue
#50 is closed as superseded; issues #80–#83 govern administrator-controlled RMR directory
identities and approved representative activity publication. Any future custody handoff
or representative-controlled `IdentityUpdateRequest` requires a new governance issue.

The following allowlist and wallet-review constraints remain mandatory if such a future
ceremony is separately approved:

Allowlisted payload classes may include:

- RMR public-role profile URL and stable profile ID;
- office and term claim with effective dates;
- proof that the representative signed an official response;
- correction or supersession pointer;
- schema and policy versions; and
- no private or unreviewed content.

The wallet must display the relying party, network, identity, purpose, fields, public
nature, fee, expiry, and effect. The update is never required for baseline profile
existence or correction rights and is never login.

### Provenance

A separate controlled project identity publishes deterministic approved manifests through private RPC. User wallets do not anchor ordinary public batches.

## 14. Non-functional requirements

### Security

- least privilege and deny-by-default authorization;
- phishing-resistant MFA for privileged users;
- secure session rotation;
- encryption in transit and at rest;
- secret management and rotation;
- public RPC prohibition;
- SSRF-safe ingestion;
- SAST, dependency, secret, SBOM, and container scanning;
- append-only audit events;
- tested backup and restore;
- incident, revocation, and signer-compromise runbooks.

### Privacy

- precise location absent from logs, traces, analytics, crash reports, queues, and audits;
- no hidden political profiles;
- no individual signal disclosure;
- minimum attestation fields;
- no raw identity evidence on-chain;
- small-cell and differencing protections;
- record-type-specific access, correction, deletion, objection, and appeal rules;
- separate marketing and application databases.

### Accessibility

- native iOS and Android support VoiceOver/TalkBack, dynamic type, reduced motion, switch control, sufficient target sizes, accessible gestures, and text alternatives;
- web meets WCAG 2.2 AA;
- card deck works without drag;
- signal confirmation and wallet handoff are screen-reader operable;
- moderation and representative portals support keyboard-only operation.

### Reliability

- public reads continue during optional dependency outages;
- job workers use leases, retries with jitter, idempotency, and dead-letter handling;
- health endpoints distinguish liveness, core readiness, dependencies, and Verus state;
- no unconfirmed chain state is described as verified.

### Performance

Performance budgets will be versioned, but the initial targets are:

- cached profile API p95 under 500 ms in-region;
- first useful native screen under 2.5 seconds on the supported baseline device/network after cold start;
- card transition response under 100 ms excluding network fetch;
- jurisdiction-resolution p95 under 2 seconds excluding third-party outage;
- no source or AI task on the synchronous representative-signal path.

## 15. Delivery phases

See `ROADMAP.md`. The dependency order is:

1. governance and contracts;
2. registry and source pipeline;
3. read-only native/web product;
4. accounts and representative authorization;
5. Civic Signal;
6. verified human participation;
7. evidence and due process;
8. provenance;
9. production hardening; and
10. conditional score decision.

## 16. Release gates

No pilot launches until:

- public coverage and gaps are published;
- every material claim has source and freshness state;
- privacy and terms receive legal review;
- moderation, response, correction, dispute, and appeal procedures are staffed;
- threat model and security review are complete;
- backup restore and incident drills pass;
- privileged accounts use strong authentication;
- iOS, Android, and web accessibility reviews pass;
- app-store privacy and policy requirements are met;
- No Social Credit tests pass;
- no precise location or identity evidence leaks through observability;
- enabled wallet flows pass the pinned compatibility matrix;
- enabled Verus writes use the current approved daemon release, VRSCTEST evidence, and tested recovery;
- AI and Verus failures degrade safely;
- no planned feature is mislabeled operational; and
- no unlabeled or unexplained score appears.

## 17. Success measures

Measure:

- correct representative-match rate;
- source coverage and freshness;
- percentage of material claims with complete source metadata;
- correction acknowledgment and resolution time;
- representative response rate;
- Civic Signal briefing usefulness and unsubscribe rate;
- signal completion and withdrawal correctness;
- aggregate suppression correctness;
- evidence review turnaround and overturn rate;
- accessibility conformance;
- crash-free native sessions;
- API performance and availability;
- provenance queue delay and verified-anchor success when enabled.

Do not treat outrage, swipe volume, time-on-site, negative-signal volume, allegation volume, a rising score, on-chain byte volume, or notification volume as success.

## 18. Non-goals for the core build

- running an election or replacing official election systems;
- determining citizenship, legal residence, or voter eligibility without separately approved rules;
- building a social network optimized for engagement;
- generalized citizen scoring;
- automatic truth determination;
- token, payment, DEX, NFT, currency, treasury, reserve, or PBaaS functionality;
- making Mirror-State, Direct Republic, AxeTax, or another portfolio product a launch dependency;
- storing the application database on-chain;
- requiring representatives or citizens to use Verus;
- requiring a representative-controlled identity update for profile existence; and
- launching a composite score by default.

## 19. Codex acceptance contract

When Codex implements an issue, it must:

1. cite the issue and affected PRD requirement IDs;
2. state assumptions and stop only when a required secret, legal decision, or external credential truly cannot be supplied synthetically;
3. update contracts before client/server implementation;
4. keep domain rules outside UI and route handlers;
5. add migrations and rollback/recovery notes;
6. add unit, contract, integration, privacy, accessibility, and relevant device tests;
7. update documentation and feature flags;
8. avoid production claims and mainnet actions;
9. never use real personal information or keys; and
10. leave the repository buildable, typed, tested, and auditable.

A checklist passing in code is necessary but not sufficient for a feature to become operational. Governance and release gates still apply.
