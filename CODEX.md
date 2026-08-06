# Codex Execution Contract

This file tells Codex how to work in the official Rate My Representatives repository.

## 1. Authority and order

Before changing code, read:

1. `README.md`
2. `docs/PRD.md`
3. `docs/ROADMAP.md`
4. `docs/ARCHITECTURE.md`
5. `docs/IDENTITY_AND_VERUS_MOBILE.md`
6. `docs/WEBSITE_ALIGNMENT.md`
7. the assigned GitHub issue and linked RFCs
8. `CONTRIBUTING.md`, `SECURITY.md`, and `AI_CONTRIBUTIONS.md`

When requirements conflict, do not silently improvise. State the conflict in the pull request and follow the source hierarchy in the PRD.

## 2. Core invariants

Codex must preserve these invariants in code, tests, schemas, and documentation:

- PostgreSQL is canonical; Verus is optional identity/provenance infrastructure.
- Public profiles work without Verus.
- A politician's public-role identity is an application record, not a mandatory VerusID.
- Civic Signal means monitoring/briefings.
- Representative signal means explicitly confirmed `support` or `concern` for one office term.
- Skip creates no record.
- Withdrawal is explicit.
- Evidence, ratings, comments, representative signals, official responses, and AI analysis are separate types.
- Identity status affects authorization/labeling, not factual truth.
- No AI or delegated agent may cast human civic intent.
- No citizen social-credit or generalized civic reputation score may be implemented.
- No composite Representative Accountability Score exists while its feature flag is false.
- No private keys, seed phrases, WIFs, wallet files, identity evidence, precise addresses, private signals, or moderator notes enter source control, logs, analytics, public APIs, or on-chain content.
- Provenance proves commitment to bytes, not truth.
- Corrections are visible and can supersede prior manifests.
- Optional dependencies degrade safely.

## 3. Working method

For each issue:

1. Read the issue, dependencies, and affected requirement IDs.
2. Inspect current repository state; do not assume planned directories exist.
3. Write a short implementation plan in the pull request or working notes.
4. Identify ambiguity, privacy/security risk, migration risk, and feature flags.
5. Update contracts and domain rules before adapters and UI.
6. Implement the smallest complete vertical slice that satisfies acceptance criteria.
7. Add tests at the appropriate layers.
8. Update documentation and generated artifacts.
9. Run the full relevant validation suite.
10. Review the diff for secrets, personal data, fabricated claims, stale status language, and unnecessary scope.
11. Commit with DCO sign-off.

Do not create an unrelated framework migration, redesign, token, treasury, currency, PBaaS feature, or Mirror-State dependency while implementing a core issue.

## 4. Repository bootstrap target

Until the scaffold issue is complete, Codex should create the target monorepo deliberately:

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
packages/mobile-ui
packages/web-ui
packages/observability
packages/config
infra/docker
infra/deployment
infra/mobile
infra/monitoring
```

The core local stack must run without Verus. Verus services belong in an optional profile.

## 5. Definition of a complete issue

An implementation issue is complete only when applicable items exist:

- domain types and invariants;
- database migration and constraints;
- repository/data-access layer;
- OpenAPI/JSON Schema contract;
- API authorization and idempotency;
- worker/outbox behavior;
- native iOS/Android client behavior;
- web/portal/admin behavior;
- structured redacted audit/observability;
- feature flag and environment safety;
- unit tests;
- contract tests;
- integration tests;
- privacy/security tests;
- accessibility tests;
- device/wallet tests where relevant;
- migration/rollback notes;
- documentation and status language.

A UI mock, untested route, or schema alone is not a complete feature.

## 6. Coding rules

- Use strict types and avoid unvalidated `any` at trust boundaries.
- Parse external input with versioned schemas.
- Use UTC and explicit ISO-8601 strings at external boundaries.
- Use opaque UUID/ULID-style identifiers; do not expose sequential database IDs where enumeration matters.
- Keep state transitions in the domain package.
- Enforce critical uniqueness and referential rules in the database as well as domain code.
- Use transactions for state change, audit append, and outbox insert.
- Make retried public writes idempotent.
- Keep public and private read models separate.
- Use allowlists for public serialization and on-chain payloads.
- Do not log whole request/response bodies on sensitive routes.
- Do not catch and discard errors without a structured outcome.
- Never label an unconfirmed or unread-back transaction `verified`.
- Avoid dependency addition when the platform already provides a safe maintained primitive.

## 7. Testing matrix

### Domain

- person, office, district, term, and candidacy separation;
- legal state transitions only;
- skip produces no signal event;
- withdrawal removes active signal and preserves history;
- one active signal per participant/office term;
- agent actor rejection;
- evidence cannot skip review;
- correction/supersession history;
- no score while disabled;
- No Social Credit forbidden joins/commands.

### Contracts

- generated native/web clients match OpenAPI;
- actor type, authentication, authorization, errors, idempotency, rate limits, and privacy classifications documented;
- backward compatibility or version bump for breaking changes.

### Privacy

- precise location absent from logs/traces/queues/analytics/crash output;
- private signals inaccessible across accounts and to representatives;
- public APIs cannot join identity links to civic activity;
- attestation source evidence absent;
- aggregate suppression and differencing controls;
- public manifests and Verus payloads contain allowlisted fields only.

### Native mobile

- iOS and Android builds;
- VoiceOver/TalkBack;
- dynamic type/font scaling;
- reduced motion;
- visible alternatives to swipe;
- deep-link/app-link validation;
- secure storage and sign-out cleanup;
- offline/degraded public reads where designed;
- push preference and unsubscribe behavior.

### Verus Mobile

- exact pinned version matrix;
- same-device and desktop QR flow;
- nonce replay/concurrency;
- expiry, wrong session, wrong audience, wrong chain;
- wrong/revoked/recovered signer and identity;
- malformed request details;
- callback forgery;
- polling recovery;
- decline/cancel/timeout;
- identity-update payload mismatch;
- readback verification;
- accidental mainnet gate.

### Provenance

- deterministic bytes and digest;
- sorted input invariance;
- content change changes digest;
- size preflight;
- correct VDXF key derivation;
- array-form `contentmultimap`;
- read-merge-write preserves unrelated content;
- duplicate outbox delivery produces one logical anchor;
- lost acknowledgement reconciliation;
- reorganization recovery;
- exact chain readback.

## 8. Data and fixtures

Use synthetic or clearly licensed public fixtures.

Do not use:

- real private addresses;
- identity documents;
- private emails or phone numbers;
- production representative-claim evidence;
- real participant political choices;
- private keys or seeds;
- confidential government data;
- copied proprietary datasets without permission.

A public official's public record still requires source and licence/terms review.

## 9. Verus safety

- Default network is VRSCTEST.
- Check the current official approved daemon release at implementation time; do not treat a dated document example as permanent.
- Verify network and synchronization before writes.
- Keep RPC private and method-allowlisted.
- Keep signers separate from general API processes.
- Do not use `IdentityUpdateRequest` for login.
- Do not enable a request type based solely on a library class; prove released wallet support on iOS and Android.
- Do not ask a user to paste a key.
- Do not require a representative identity update for profile existence.
- Record full user-visible payload and consent version before an update.
- Read every approved write back from chain.

## 10. AI implementation safety

Runtime AI output is a draft. Store source references, process/model version, confidence, reviewer, decision, and correction state.

Codex must not implement a hidden generative scoring engine, synthetic civic participation, automated allegation publication, or citizen ideology profile.

## 11. Pull-request template for Codex

Use this structure:

```markdown
## Issue and requirements
Closes #...
PRD: FR-...

## What changed
...

## Product/status effect
Operational / pilot / testnet-only / disabled / documentation only

## Architecture and data
Entities, migrations, contracts, state transitions, outbox/events

## Security and privacy
Threats considered, data classification, logging/redaction, authorization

## Mobile and accessibility
Platforms and tests

## Verus impact
None / VRSCTEST-only / wallet matrix / RPC / identity update / provenance

## Tests
Commands and results

## Migration and rollback
...

## Known limitations
...

## Checklist
- [ ] DCO-signed commits
- [ ] Contracts updated
- [ ] Tests pass
- [ ] No secrets or personal data
- [ ] Documentation and status language accurate
- [ ] Feature disabled until release gate where required
```

## 12. Suggested first Codex sequence

Execute in this order, one issue/PR at a time:

1. scaffold monorepo and CI;
2. typed configuration and feature flags;
3. PostgreSQL/migration/outbox foundation;
4. OpenAPI v1 skeleton and generated client pipeline;
5. canonical civic registry entities and constraints;
6. source/coverage connector framework;
7. read-only API and seed fixtures;
8. native/web card-deck read-only slice;
9. accounts and roles;
10. representative claim/staff delegation;
11. Civic Signal subscription/briefing slice;
12. human-attestation provider contract;
13. representative-signal domain and explicit confirmation;
14. category ratings/context;
15. evidence and due process;
16. optional VerusID proof-of-control;
17. optional representative identity update on VRSCTEST;
18. provenance manifests, outbox worker, and verifier;
19. pilot hardening;
20. score decision only after governance approval.

Do not jump to the visually exciting blockchain or scoring work before the source-backed public record, authorization, privacy, and correction systems exist. That is how civic software turns into a very expensive lie detector that cannot detect lies.
