# Rate My Representatives — Target Architecture

**Status:** Approved target; implementation remains pending  
**Last updated:** 2026-08-05

## 1. Architecture goals

The architecture must support a mobile-first civic product without confusing public-role identity, citizen identity, evidence, human judgment, AI analysis, or blockchain provenance.

The core design separates:

1. canonical civic records;
2. private accounts and credentials;
3. precise location resolution;
4. private civic activity;
5. moderation and sensitive review material;
6. public aggregates and published records;
7. Verus wallet approval flows; and
8. server-controlled Verus provenance.

## 2. System context

```text
ratemyrepresentatives.com
  Marketing, status disclosures, early access, public legal pages
  Separate deployment and database

Native iOS / Native Android / Web app
  Public browsing, card deck, Civic Signal, participation, profile detail
                         |
                         v
api.ratemyrepresentatives.com
  Authentication, authorization, contracts, domain commands, public queries
                         |
       +-----------------+------------------+
       |                 |                  |
       v                 v                  v
PostgreSQL           Queue/Workers       Object storage
Canonical records    async workflows     approved public manifests,
private domains       ingestion, alerts,  quarantined/allowed artifacts
and outbox            moderation, AI,
                     aggregation, Verus
       |
       +--> transactional outbox
                         |
                         v
                    Verus worker
                         |
                         v
                 private authenticated RPC
                         |
                         v
                      VRSCTEST

Verus Mobile
  <--- signed request / complete payload review
  ---> signed response or approved identity-update result
                         |
                         v
connect.ratemyrepresentatives.com / public HTTPS callback
```

## 3. Repository topology

```text
apps/
  mobile/          React Native iOS and Android
  web/             Responsive web/PWA fallback and public app
  portal/          Representative and authorized-staff portal
  admin/           Moderator and administrator console
  api/             Versioned API and authorization boundary
  worker/          Ingestion, notification, aggregation, AI and Verus jobs

packages/
  domain/          Entities, commands, state machines, invariants, policy decisions
  db/              PostgreSQL migrations, repositories, transaction helpers, outbox
  contracts/       OpenAPI, JSON Schema, generated clients, event schemas
  auth/            Passkeys, email, sessions, roles, VerusID links, attestations
  connectors/      Approved source and jurisdiction adapters
  methodology/     Coverage, freshness, indicators, Light Mathematics versions
  civic-signal/    Subscriptions, briefings, notification rules
  moderation/      Evidence, disputes, responses, corrections, appeals
  verus/            Wallet requests, callback verification, identity updates, RPC
  provenance/       Canonicalization, manifests, hashing, anchors, verifier
  mobile-ui/       Native design system and accessible card interactions
  web-ui/          Web design system and accessible components
  observability/    Structured events, redaction, metrics, traces, audit helpers
  config/           Typed configuration, feature flags, environment safety

infra/
  docker/           Local services and optional Verus profile
  deployment/       Environments, network policy, secrets, migrations
  mobile/           App identifiers, universal/app links, build and store config
  monitoring/       Dashboards, alerts, SLOs, incident integrations
```

## 4. Technology baseline

The implementation issue must pin actual versions. The intended baseline is:

- TypeScript in strict mode;
- React Native with Expo development builds/prebuild for iOS and Android;
- a TypeScript web framework suitable for accessible server/public rendering;
- Node.js API and worker runtime unless an accepted RFC changes it;
- PostgreSQL;
- a durable queue supporting retries, leases, and dead-letter handling;
- S3-compatible object storage;
- OpenAPI 3.1 and JSON Schema;
- Docker for local and server workloads;
- infrastructure-as-code for deployed environments;
- OpenTelemetry-compatible observability with aggressive redaction.

Framework choice is subordinate to the domain, privacy, wallet, accessibility, and app-store requirements.

## 5. Bounded contexts

### 5.1 Civic registry

Owns:

- countries and jurisdiction hierarchy;
- districts and boundary versions;
- people;
- offices;
- office terms;
- elections and candidacies;
- official identifiers;
- source-backed status transitions.

It does not own ratings, private accounts, wallet keys, or score methodology.

Issue #49 implements the first bounded slice of this context: stable jurisdiction,
district, public-body, and office IDs; effective-dated versions and graph edges;
boundary references/digests; external identifiers; and public attribution/gap state.
The graph permits multiple parents and overlaps and is not derived from a treasury,
currency, VerusID, or other universal hierarchy. People, office terms, candidacies,
source ingestion, and location resolution remain with their owning later issues. See
`docs/JURISDICTION_REGISTRY.md`.

### 5.2 Source and coverage

Owns source publishers, URLs, retrievals, licences/terms, hashes, freshness, conflicts, quarantine, coverage snapshots, and connector health.

A source record is not automatically a verified claim. Review and claim state remain explicit.

### 5.3 Accounts and authorization

Owns accounts, authenticators, sessions, roles, staff delegations, representative claims, optional VerusID links, and attestation snapshots.

Authentication tier and actor role remain separate. A linked VerusID is not a verified human, resident, representative, or truth source by itself.

Issue #12 implements only the storage-independent security core: verifier ports, hashed
rotating session policy, scoped effective-dated role grants, route/domain authorization,
and typed audited feature gates. Its in-memory stores are synthetic test adapters, not a
hosted account database. See `docs/AUTH_SECURITY_FOUNDATION.md`.

### 5.4 Civic Signal

Owns subscriptions, follow rules, briefing generation, notification preferences, delivery state, corrections to earlier briefings, and source links.

This context has read-only access to civic records and cannot invoke representative-signal commands.

### 5.5 Human participation

Owns eligibility snapshots, representative signals/events, category ratings, community context, privacy-safe aggregates, withdrawal, and abuse controls.

Representative signals and ratings are private individual data. Public output is aggregate-only under a versioned privacy method.

### 5.6 Evidence and due process

Owns evidence submissions, claim review, representative responses, disputes, corrections, appeals, reviewer assignments, conflicts, decisions, and public history.

AI outputs enter as drafts within this context and never bypass state transitions.

### 5.7 Methodology

Owns coverage/freshness calculations, category definitions, approved indicators, Light Mathematics versions, confidence, missing-data rules, and the disabled-by-default Representative Accountability Score decision.

### 5.8 Verus wallet integration

Owns signed wallet requests, challenge state, callback verification, identity-state resolution, compatibility inventory, and optional representative-controlled identity-update orchestration.

It does not own the public-role profile.

### 5.9 Provenance

Owns deterministic public manifests, digests, outbox work, anchor attempts, confirmations, readback, supersession, and public verification.

It does not decide whether a factual claim is true.

## 6. Canonical data and replication

PostgreSQL is the canonical transactional store. Search indexes, caches, materialized views, analytical stores, object storage, mobile caches, and Verus records are derived or referenced representations.

Rules:

- no derived store may become the only copy of a domain decision;
- public APIs identify record version or `updated_at`/ETag where needed;
- workers consume transactional outbox events, not ad hoc best-effort callbacks;
- rebuild procedures exist for search, aggregates, briefings, and public manifests;
- migrations are ordered, reviewed, tested from empty and production-like snapshots, and accompanied by recovery plans.

## 7. Security-domain separation

At minimum use separate database schemas/roles or equivalent service controls for:

| Domain | Examples | Public join allowed? |
|---|---|---|
| Public civic registry | people, offices, terms, sources, public claims | Yes, through public read models |
| Account authentication | email, passkeys, sessions, recovery | No |
| Precise location resolver | transient submitted address/location | No; return district IDs only |
| Identity/attestations | VerusID links, CBC opaque status | No public participant enumeration |
| Private civic activity | individual signals, ratings, preferences | Aggregate-only |
| Moderation | notes, assignments, abuse indicators | Restricted |
| Public provenance | manifests, digests, txids | Yes |
| Verus signing/RPC | credentials, signer state, queues | No public network access |

The public read model must not be able to join a person/account identity to private political activity.

## 8. Command/query model

The API can use conventional REST while enforcing a conceptual command/query split.

Queries:

- do not mutate state;
- use public or permission-scoped read models;
- include coverage, freshness, version, and status metadata.

Commands:

- authenticate actor and actor type;
- authorize at route and domain layer;
- require idempotency for externally retried writes;
- validate state transition;
- write domain state and append audit event in one transaction;
- insert outbox work in the same transaction;
- never wait synchronously for AI, source fetching, notifications, or blockchain confirmation.

## 9. State-machine ownership

State machines live in `packages/domain`. Database constraints enforce invariants but do not replace domain validation.

### Evidence

```text
draft -> submitted -> validated -> under_review
under_review -> published | disputed | rejected
published/disputed -> corrected | withdrawn | archived
rejected -> appealed -> appeal_upheld | appeal_denied
```

### Representative profile claim

```text
draft -> submitted -> under_review
under_review -> approved | rejected | needs_more_information
approved -> active -> expired | revoked | superseded
rejected -> appealed -> appeal_upheld | appeal_denied
```

### Representative signal

```text
none -> support | concern
support <-> concern
support/concern -> withdrawn
```

`skip` is not in the state machine because it creates no record.

### Provenance

```text
planned -> materialized -> queued -> submitted -> confirmed -> verified
queued/submitted -> retryable_failed -> queued
submitted/confirmed -> orphaned -> queued
any pre-verified -> permanently_failed
verified -> superseded
```

### Identity update

```text
draft -> presented -> approved_by_user | declined | expired
approved_by_user -> submitted -> confirmed -> readback_verified
submitted/confirmed -> retryable_failed | orphaned
readback_verified -> superseded
```

No application profile state depends on identity-update success.

## 10. Native mobile architecture

### Shared and native boundaries

Share:

- API contracts;
- domain value objects that contain no secrets;
- validation schemas;
- methodology display logic;
- feature flags;
- design tokens where practical.

Keep platform-specific:

- deep links and app links;
- push notification tokens;
- secure storage;
- biometrics/passkey integration;
- app lifecycle and background handling;
- accessibility semantics where native APIs differ;
- store signing and release configuration.

### Local storage

- Store authentication refresh/session material only in approved secure storage.
- Do not store precise addresses after resolution.
- Encrypt or avoid caching private civic activity.
- Public profile caching may use ordinary application storage with version/expiry.
- Clear sensitive local state on sign-out, account deletion, device-compromise response, or revoked session.

### Deep-link safety

- Use Universal Links and Android App Links for RMR-controlled HTTPS hosts.
- Allowlist `verus://` only for explicit wallet launch.
- Reject `javascript:`, `data:`, file, and unknown schemes.
- Do not put secrets or private data in URLs or QR payloads.
- Bind return state to a server challenge rather than trusting client parameters.

## 11. Verus architecture

### Wallet path

```text
API creates challenge/request
  -> signs request using isolated application identity service
  -> mobile app opens Verus Mobile or web shows QR
  -> Verus Mobile displays exact request
  -> user approves or declines
  -> wallet sends signed response to public HTTPS callback
  -> API validates cryptography and current identity state
  -> nonce is claimed atomically
  -> application stores verified result and creates its own session/action state
```

### RPC path

```text
domain publication transaction
  -> outbox event
  -> provenance worker
  -> internal RPC adapter
  -> private verusd RPC
  -> tx confirmation
  -> getidentity/getidentitycontent readback
  -> digest comparison
  -> public provenance status
```

The browser and native apps never connect directly to authenticated RPC.

### Version policy

At deployment and before write work:

- verify the current approved mandatory daemon release from official sources;
- parse versions semantically, not lexicographically;
- verify network, synchronization, tip freshness, identity state, and signer readiness;
- pin Verus Mobile and TypeScript library versions in the compatibility matrix;
- disable writes on mismatch;
- reject mainnet writes unless all explicit production gates are true.

As of 2026-08-05, the current GitHub release marked **Latest** is Verus `v1.2.16-1`; runtime policy, not this dated example, controls deployment.

## 12. Source ingestion architecture

Submitted or scheduled source retrieval flows through:

1. URL parsing and normalization;
2. scheme allowlist (`https` by default);
3. DNS resolution and private/link-local/internal address rejection;
4. redirect limits with revalidation each hop;
5. response size, timeout, and content-type limits;
6. malware/document quarantine where applicable;
7. immutable retrieval metadata and hash;
8. parsing in a restricted worker;
9. candidate claim extraction; and
10. accountable human review.

The originally submitted URL and normalized/final URL remain separate.

## 13. AI architecture

AI jobs receive source references and purpose-limited text rather than unrestricted database access.

For every material run retain:

- model/provider and process version;
- prompt/template reference;
- source IDs;
- redaction/classification state;
- output and confidence;
- reviewer;
- decision; and
- publication/correction state.

Tool permissions are typed by actor. An agent token cannot access signal commands even if a UI bug exposes a control.

## 14. Provenance manifests

Public manifests use stable ordering, UTC, an explicitly versioned canonical JSON method, exact byte storage, SHA-256 or an approved digest, public-only allowlisted fields, and a `supersedes` reference for corrections.

Suggested namespace:

```text
ratemyrepresentatives::v1.schema
ratemyrepresentatives::v1.anchor.evidence_batch
ratemyrepresentatives::v1.anchor.profile_snapshot
ratemyrepresentatives::v1.anchor.correction_batch
ratemyrepresentatives::v1.anchor.methodology
ratemyrepresentatives::v1.anchor.moderation_policy
ratemyrepresentatives::v1.anchor.coverage_report
ratemyrepresentatives::v1.anchor.representative_signal_aggregate
ratemyrepresentatives::v1.identity.public_role_reference
ratemyrepresentatives::v1.identity.official_response_reference
```

Names are proposals until derived with `getvdxfid`, documented, approved, and tested on VRSCTEST. Do not copy example i-addresses.

## 15. Feature flags

Minimum flags:

```text
NATIVE_PARTICIPATION_ENABLED=false
CIVIC_SIGNAL_ENABLED=false
REPRESENTATIVE_SIGNALS_ENABLED=false
CATEGORY_RATINGS_ENABLED=false
COMMUNITY_CONTEXT_ENABLED=false
EVIDENCE_SUBMISSION_ENABLED=false
AI_RESEARCH_ENABLED=false
VERUS_AUTH_ENABLED=false
REPRESENTATIVE_VERUS_CLAIMS_ENABLED=false
VERUS_IDENTITY_UPDATE_ENABLED=false
CBC_ATTESTATION_ENABLED=false
VERUS_ANCHORING_ENABLED=false
COMPOSITE_SCORE_ENABLED=false
```

Flags are environment and cohort scoped, audited, typed, and deny by default. A flag cannot override a domain invariant or release gate.

## 16. Health and degradation

```text
/health/live          process is alive
/health/ready         core API can safely serve its enabled routes
/health/dependencies  database, queue, object storage, notification, source state
/health/verus         sanitized node, signer, queue, and latest anchor state
/health/mobile        current supported app/API contract versions
```

Core read readiness does not fail solely because Verus, AI, or notifications are offline. A route requiring a degraded dependency returns an explicit feature/dependency status rather than pretending success.

## 17. Observability

Observability must answer operational questions without becoming surveillance.

- Use event names and internal IDs, not raw political content or precise location.
- Redact authentication, wallet, evidence, signal, moderator, and identity-update payloads.
- Do not use session replay on sensitive screens.
- Keep public-product analytics separate from security audit records.
- Apply retention limits.
- Alert on queue age, failed state transitions, authorization failures, aggregate suppression errors, source freshness, correction backlog, wallet callback anomalies, signer/node readiness, and unverified-anchor age.

## 18. Deployment environments

- `local`: synthetic data, optional VRSCTEST profile.
- `ci`: ephemeral services and deterministic fixtures; no external mainnet writes.
- `development`: shared non-production, test credentials.
- `staging`: production-like, VRSCTEST only.
- `pilot`: limited real users; only approved features and policies.
- `production`: requires separate governance and release approval.

Environment identity, keys, databases, object storage, push credentials, app identifiers, and Verus identities remain isolated.

## 19. Architecture definition of done

The architecture is implemented only when:

- boundaries are enforced in code and permissions;
- contracts generate clients and pass compatibility tests;
- public reads work without optional dependencies;
- sensitive domains cannot be joined through public roles;
- native clients pass accessibility and deep-link tests;
- source ingestion passes SSRF and malicious-content tests;
- agent actors cannot create human civic intent;
- wallet challenges reject replay, wrong chain, wrong audience, expired state, forged callback, and revoked identity;
- identity updates are optional, allowlisted, and read back;
- provenance is deterministic and idempotent;
- backup restoration works; and
- the status page tells the truth about degraded and disabled features.
