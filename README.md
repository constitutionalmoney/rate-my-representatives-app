# Rate My Representatives

> **Digital ID for Politicians. Self-Sovereign Identity for Citizens.**

Rate My Representatives is a mobile-first public-accountability application for Canada and the United States. It is designed to help people identify who represents them, inspect the sourced public record, follow changes over time, contribute human civic judgment and evidence under published rules, and see responses, disputes, and corrections without turning citizen identity into a citizen score.

This repository is the implementation home for the application described at [ratemyrepresentatives.com](https://ratemyrepresentatives.com/). It is stewarded by **Checks and Balances Committee Ltd.**

## Current status

**Repository-foundation stage — synthetic registry and source-backed profile reads only; not a production civic release.**

The mobile-first TypeScript workspace and CI foundation now exist. The native, web,
portal, admin, API, and worker surfaces are deliberately limited to placeholder,
typed health, and synthetic registry behavior. Domain packages that belong to later
roadmap issues remain explicit non-operational stubs.

Issue #12 adds a synthetic, deny-by-default authentication and authorization core:
generated passkey/email/session/role contracts, rotating revocable session policy,
scoped role checks, service-agent prohibitions, and audited feature gates. Every account
and high-risk gate remains false; no public account route, credential provider, database,
or civic write is operational.

Issue #9 adds a reproducible local/CI infrastructure stack: PostgreSQL migrations and a
synthetic seed, RabbitMQ retry/dead-letter topology, isolated S3-compatible buckets,
Mailpit, and API/worker container wiring. An optional Compose profile can start a pinned
`verusd` on VRSCTEST plus disabled signer stubs. No Verus profile or civic write is
enabled by default, and the application-only Dokploy Compose remains independent.

Issue #19 adds an append-only, privacy-minimized audit ledger and transactional outbox.
State, audit, and queued effects share one PostgreSQL transaction; workers use safe
leases, bounded retry, dead letters, controlled replay, and idempotent delivery receipts.
The live synthetic smoke runs with Verus disabled. Provenance is only a reserved event
contract—no signer, RPC call, identity operation, or chain write is implemented.

Issue #60 publishes the canonical OpenAPI 3.1 v1 skeleton, versioned JSON Schemas,
privacy-safe error envelope, runtime validators, compatibility checks, synthetic mock
server, and generated clients for mobile, web, portal, admin, workers, and the public
SDK. Health and native-client compatibility discovery are operational.

Issue #49 adds the effective-dated synthetic civic registry for jurisdictions,
districts, public bodies, offices, external identifiers, and public coverage/conflict
gaps. Canada and United States fixtures exercise different graph shapes, including
multiple parents, overlaps, redistricting, rename, and amalgamation. The generated
`GET /api/v1/jurisdictions` read contract is operational in synthetic mode. Source
ingestion and location resolution remain deferred; the registry makes no residence,
citizenship, or eligibility determination.

Issue #59 adds separate synthetic person, office-term, election, candidacy, official-ID,
and reviewed person-resolution records. Read-only `people`, `office-terms`, `elections`,
and `candidacies` v1 operations are generated and operational. PostgreSQL remains
canonical; winning does not create a term; names alone cannot resolve people; and public
serializers omit private review fields. External identity references are optional,
empty, and non-authoritative. Source ingestion, Verus identity/proof/update,
participation, provenance writes, and scoring remain deferred.

Issue #55 adds an internal, candidate-only official-source framework with versioned
capability declarations, SSRF-safe conditional retrieval, immutable hashes/metadata,
checkpoint/idempotency/retry/quarantine/dead-letter behavior, reviewer-only canonical
approval, correction history, and reproducible coverage. Approved Canada and United
States pilots are synthetic `.invalid` fixtures. `SOURCE_INGESTION_ENABLED` remains
false and no material record is auto-published.

Issue #11 adds a read-only, reviewed public-role profile API with list, detail,
cursor-paginated timeline, source, coverage, response, dispute, correction, and appeal views.
Synthetic Canadian office-term and United States candidacy profiles keep every civic
entity separate, attach sources and freshness to material claims, disclose gaps and
conflicts, and use record-version ETags. Only explicit reviewer/admin publication
decisions enter the public projection. Verus/provenance is absent, no score or signal
aggregate is returned, and no publication or other civic write route is implemented.

Issue #61 adds the production-capable native delivery boundary without publishing an
app: isolated development/staging/pilot/production identifiers and origins, generated
API compatibility checks, Universal/App Link policy, Keychain/Keystore storage, private
push foundations, privacy-redacted crash records, accessible native baselines, unsigned
iOS/Android CI builds, and a disabled VRSCTEST-only no-real-key Verus Mobile transport
harness. Representative VerusID provisioning, authenticated RPC, activity publication,
participation, scoring, and all mainnet behavior remain outside the mobile client and
disabled.

- No production iOS or Android app is released.
- No production representative profile, category rating, representative signal, Civic Signal briefing, authenticated aggregate, VerusID claim, or Representative Accountability Score is live; issue #11 responses are synthetic only.
- No composite score is approved.
- Checks and Balances Protocol integration is planned and disabled by default.
- Passkey, verified-email, recovery, privileged access, source ingestion, representative
  claims, evidence, AI, Verus, provenance, and scoring gates are disabled by default.
- All Verus wallet, identity-update, and provenance work must be developed on **VRSCTEST** before any mainnet decision.
- The folder tree below exists as a buildable foundation; its presence is not a claim that civic behavior is implemented.
- Registry records and API examples are synthetic and do not describe real people, offices, or civic conditions.
- The marketing site owns public explanation, early access, and prelaunch status. This repository owns application code, civic data, workflows, APIs, native clients, moderation, and Verus integration. The two systems must not share a production database.

The project will not label a proposed capability as operational merely because a mockup, schema, issue, or experimental test exists.

## Product promise

Rate My Representatives should answer six questions:

1. **Where do I live, and which jurisdictions apply?**
2. **Who currently exercises public power in those jurisdictions?**
3. **What does the sourced public record show for the correct person, office, term, and candidacy?**
4. **How is each contribution labeled: authenticated, unverified, anonymous, official, or AI-assisted?**
5. **How was an indicator or future accountability result produced?**
6. **What changed after new evidence, a response, a dispute, or a correction?**

The mobile card deck is a discovery and input interface. It is not the evidence model, the moderation model, or a substitute for due process.

## Canonical terminology

The application uses these terms consistently:

| Term | Meaning |
|---|---|
| **Civic Signal** | The monitoring, briefing, notification, and source-alert product. It watches approved public sources but never votes, rates, signs, agrees, disagrees, or speaks as the user. |
| **Representative signal** | A human participant's explicitly confirmed `support` or `concern` judgment for one office term. It is not an election vote. |
| **Skip** | Navigation only. Skip creates no signal, no event in public aggregates, and no hidden judgment. |
| **Withdraw judgment** | An explicit confirmed action that removes the participant's current representative signal and appends a private audit event. |
| **Category rating** | A structured human rating under a named category and published method. It remains separate from a quick representative signal. |
| **Evidence submission** | A source-backed claim or context packet that enters moderation. Evidence truth is not determined by the submitter's identity tier. |
| **Public-role digital identity** | The canonical application record connecting a person, office, term, candidacy, authority, official identifiers, public conduct, responses, disputes, and corrections. It exists without Verus. |
| **VerusID reference** | An optional external identity reference or proof-of-control link. It never replaces the canonical public-role record. |
| **Representative Accountability Score** | A possible future public-office accountability result produced under the published Light Mathematics Protocol. It is not an assumed deliverable and is never a citizen score. |

## Product decisions

### 1. Native mobile is a first-class target

The primary consumer experience will be delivered as dedicated **Apple iOS and Android applications**, with a responsive web application for public access, deep-link fallback, accessibility, and desktop use.

The preferred starting stack is React Native with Expo development builds and prebuild support, sharing typed contracts and domain logic with the web application. The project may move to a more native configuration only where tested wallet, accessibility, security, or platform requirements justify it.

### 2. Public-role identity is application-native

A politician's “digital ID” is principally a persistent, source-backed application record. It must distinguish:

- a person;
- an office;
- a district or jurisdiction;
- an office term;
- a candidacy;
- current, former, appointed, elected, acting, and declared-candidate states; and
- official, claimed, disputed, corrected, and historical identity links.

No profile depends on a reserve currency, treasury identity, jurisdictional parent VerusID, Mirror-State deployment, or blockchain availability.

### 3. Verus Mobile is used at explicit approval boundaries

Verus Mobile may be used for:

- optional citizen VerusID account linking;
- proof that a representative or authorized staff member controls a claimed VerusID;
- signing an official response or correction request;
- approving an optional public reference on a representative-controlled VerusID; and
- reviewing the exact network, fields, signer, purpose, expiry, and fee before an identity update.

Use `GenericRequest` / `GenericResponse` for authentication and proof-of-control flows after pinned-version compatibility testing.

Use an `IdentityUpdateRequest` only when all of the following are true:

1. the VerusID is controlled by the representative or an authorized controller;
2. the update is optional and feature-flagged;
3. the user sees the complete public payload before approval;
4. the payload contains only an allowlisted public profile reference, role/term claim, signature reference, or approved correction pointer;
5. the flow has passed iOS and Android testing against pinned Verus Mobile and library versions;
6. the update begins on VRSCTEST;
7. the server verifies the callback, current identity state, transaction result, and chain readback; and
8. declining or failing the update does not prevent the canonical RMR profile from existing or being corrected.

The application must never request or receive a private key, WIF, seed phrase, wallet file, z-seed, or spending key. It must never place citizen signals, addresses, KYC material, identity evidence, private civic history, or moderator notes on-chain.

### 4. Evidence is not universally identity-gated

Verified-human status and jurisdiction eligibility are required for an authenticated representative signal. Evidence has a separate policy. Researchers, journalists, representatives, staff, basic accounts, and distinctly labeled public submitters may be permitted to submit source-backed material under different rate limits and review priorities.

Identity status affects attribution, abuse controls, and workflow. It does not make a factual claim true.

### 5. No score before the method

The only product score name is **Representative Accountability Score**. Any future result must use a public, versioned **Light Mathematics Protocol** that exposes:

- record-analysis factors;
- community-input factors;
- source coverage and freshness;
- confidence and missing-data treatment;
- authenticated, unverified, and anonymous input separately;
- AI's exact role;
- weights, exclusions, and formula version; and
- disputes, corrections, and superseding results.

No composite score may launch before public methodology review, bias testing, adversarial testing, correction testing, privacy review, legal review, and governance approval.

### 6. Mirror-State and Direct Republic remain future context

Mirror-State is a proposed civic-record concept and Direct Republic is a long-term governance vision. Neither is required infrastructure for the Rate My Representatives application. Treasury, reserve, AxeTax, currency, DEX, NFT, and PBaaS work are outside the core build unless separately approved later.

## No Social Credit Covenant

The following is an architectural invariant, not marketing decoration:

> No social credit scores shall be created with this technology by Civic Ledger AI Ltd. or Checks and Balances Committee Ltd., or in any implementation that either company develops, operates, governs, or licenses.

Citizen identity, lawful speech, political beliefs, associations, representative ratings, petitions, evidence submissions, voting choices, criticism, browsing history, or use of civic tools must not become a generalized reputation, conformity, loyalty, eligibility, or trustworthiness score.

The software must prevent:

- cross-context citizen scoring;
- political profiling for targeted advertising;
- access to housing, employment, credit, insurance, mobility, benefits, or unrelated services based on civic activity;
- combining purpose-limited account, attestation, submission, moderation, abuse, or participation states into a portable citizen score; and
- exposing a participant's private representative signal to the representative or the public.

Public-role accountability is limited to a defined public office, term, duty, and source-backed public record.

## Planned product surfaces

| Surface | Purpose | Recommended host |
|---|---|---|
| Marketing and public status | Product explanation, roadmap disclosure, early access, legal pages | `ratemyrepresentatives.com` |
| Web application | Public profiles, desktop access, installed PWA fallback | `app.ratemyrepresentatives.com` |
| iOS application | Native mobile discovery, Civic Signal, participation, Verus Mobile handoff | Apple App Store |
| Android application | Native mobile discovery, Civic Signal, participation, Verus Mobile handoff | Google Play |
| Versioned API | Mobile, web, public, representative, moderation, and provenance APIs | `api.ratemyrepresentatives.com` |
| Wallet and app links | Universal links, Android App Links, QR/deep-link landing, wallet callback handoff | `connect.ratemyrepresentatives.com` |
| Representative portal | Profile claims, staff authorization, official responses, correction requests | `portal.ratemyrepresentatives.com` |
| Moderation console | Evidence review, disputes, corrections, appeals, audit history | `admin.ratemyrepresentatives.com` |
| Public verifier | Provenance manifests, hashes, signatures, and chain readback | `verify.ratemyrepresentatives.com` |
| Developer documentation | OpenAPI, schemas, SDKs, auth.md, integration and status docs | `docs.ratemyrepresentatives.com` |
| Service health | Uptime, incidents, degraded dependencies | `status.ratemyrepresentatives.com` |

See [docs/SUBDOMAINS.md](./docs/SUBDOMAINS.md).

## Target architecture

```text
apps/
  mobile/          React Native iOS and Android application
  web/             Responsive public web app and PWA fallback
  portal/          Representative and authorized-staff portal
  admin/           Moderation and administration console
  api/             Versioned HTTP API and authorization boundary
  worker/          Ingestion, notifications, aggregation, AI review, provenance

packages/
  domain/          Entities, state machines, invariants, authorization decisions
  db/              PostgreSQL schema, migrations, repositories, outbox
  contracts/       OpenAPI, JSON Schema, generated TypeScript clients
  auth/            Passkeys, email, sessions, roles, VerusID links, attestations
  mobile-ui/       Native accessible components and card-deck primitives
  web-ui/          Web accessible components
  connectors/      Canada/U.S. government and approved-source adapters
  methodology/     Coverage, freshness, indicators, Light Mathematics versions
  civic-signal/    Subscriptions, briefings, notification rules, source alerts
  moderation/      Evidence, disputes, responses, corrections, appeals
  verus/            Wallet requests, identity claims, optional updates, RPC adapter
  provenance/       Canonical manifests, hashing, VDXF, anchoring, verification
  observability/    Structured logs, metrics, traces, privacy redaction
  config/           Typed environment and feature-flag configuration

infra/
  docker/
  deployment/
  mobile/
  monitoring/

docs/
  PRD.md
  ROADMAP.md
  ARCHITECTURE.md
  IDENTITY_AND_VERUS_MOBILE.md
  SUBDOMAINS.md
  WEBSITE_ALIGNMENT.md
```

### Runtime boundary

```text
iOS / Android / Web
        |
        v
Versioned API ---------------> PostgreSQL (canonical records)
        |                              |
        |                              +--> transactional outbox
        +--> queue/workers
                 |--> source connectors
                 |--> Civic Signal briefings
                 |--> moderation and notifications
                 |--> privacy-safe aggregation
                 |--> canonical public manifests
                              |
                              v
                       Verus worker
                              |
                              v
                    private verusd RPC
                              |
                              v
                          VRSCTEST

Verus Mobile
   |--> user-approved GenericResponse
   |--> optional user-approved IdentityUpdateRequest result
   +--> public HTTPS callback through connect/API boundary
```

The native apps and browsers never connect directly to authenticated `verusd` RPC.

## Core domain rules

- `person`, `office`, `district`, `office_term`, and `candidacy` are separate records.
- Every material public claim has attributable sources, retrieval state, freshness, and coverage status.
- Missing data is not a negative value.
- “Skip” never creates a representative signal.
- One active representative signal may exist per eligible participant and office term.
- Representative signals, category ratings, comments, evidence, and official responses are separate record types.
- Authenticated, unverified, and anonymous participation are never silently blended.
- AI output enters as a draft or analysis record and requires accountable human review before public factual publication.
- Provenance proves commitment to bytes; it does not prove factual truth.
- Corrections create visible superseding history rather than silently replacing an anchored record.
- Public profiles continue to work when Verus, AI, or notification dependencies are unavailable.

## Build phases

0. **Governance and repository foundation** — licensing, contribution rules, PRD, architecture, terminology, OpenAPI conventions, CI, environments.
1. **Public-role registry and source pipeline** — jurisdictions, people, offices, terms, candidacies, official-source ingestion, coverage, freshness, read-only profiles.
2. **Native mobile and web discovery** — iOS/Android clients, web fallback, location minimization, card deck, accessible interaction, saved broad jurisdictions.
3. **Accounts and representative identity** — passkeys/email, roles, representative claims, optional VerusID proof of control, signed responses, wallet compatibility matrix.
4. **Civic Signal briefings** — source monitoring, subscriptions, topic/jurisdiction preferences, notification controls, source and correction alerts.
5. **Human participation** — Checks and Balances Protocol provider, jurisdiction eligibility, representative signals, explicit confirmation, privacy-safe aggregates, category ratings and moderated context.
6. **Evidence and due process** — source submissions, safe ingestion, moderation, responses, disputes, corrections, appeals, audit history.
7. **Verus provenance** — deterministic public manifests, VDXF namespace, VRSCTEST anchoring, idempotency, readback, verifier, recovery drills.
8. **Pilot and production hardening** — legal, privacy, app-store, accessibility, security, incident, backup, abuse, observability, and operational gates.
9. **Accountability-score decision** — implement only if the Light Mathematics method and all approval gates justify it.

See [docs/ROADMAP.md](./docs/ROADMAP.md).

## Development foundation

The workspace pins Node.js `24.19.0` and pnpm `11.20.0`. After installing those
prerequisites, a clean checkout installs with one command:

```bash
pnpm install --frozen-lockfile
```

Run the complete local foundation validation with:

```bash
pnpm check
```

The command generates contracts, formats-checks, lints, enforces workspace boundaries,
type-checks, tests, builds, checks generated artifacts, reviews dependency licences, and
scans tracked source for high-confidence secret patterns. It does not require PostgreSQL,
a queue, object storage, Verus, wallet software, keys, or external civic data.

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md),
[docs/CONTRACTS.md](./docs/CONTRACTS.md), [docs/API_V1.md](./docs/API_V1.md),
[docs/PUBLIC_PROFILE_API.md](./docs/PUBLIC_PROFILE_API.md),
[docs/NATIVE_MOBILE.md](./docs/NATIVE_MOBILE.md), and
[docs/adr/0001-mobile-first-typescript-monorepo.md](./docs/adr/0001-mobile-first-typescript-monorepo.md).

The issue #12 security boundaries and non-operational status are documented in
[docs/AUTH_SECURITY_FOUNDATION.md](./docs/AUTH_SECURITY_FOUNDATION.md) and
[ADR 0002](./docs/adr/0002-deny-by-default-auth-boundaries.md).

The application-only [Docker Compose foundation](./compose.yaml) can build the public
web placeholder and synthetic read-only API without Verus or backing services. It is
prepared for GitHub-sourced Dokploy deployment; see
[docs/DEPLOY_DOKPLOY.md](./docs/DEPLOY_DOKPLOY.md).

For local or CI infrastructure, `pnpm infra:up` starts the core
[Compose stack](./compose.infrastructure.yaml) and `pnpm infra:smoke` verifies migrations,
fixtures, retry/dead-letter behavior, storage policy isolation, email readiness, and
Verus-off API/worker health. The separately selected `pnpm infra:verus:up` command is
VRSCTEST-only and contains no signer keys. See
[docs/LOCAL_INFRASTRUCTURE.md](./docs/LOCAL_INFRASTRUCTURE.md).

## Release gates

No public pilot may open until the applicable release has:

- a public coverage report and explicit gaps;
- source and freshness state for every material profile claim;
- legally reviewed application terms and privacy documentation;
- staffed moderation, response, correction, dispute, and appeal procedures;
- threat-model and security review;
- tested backup restoration and incident response;
- phishing-resistant authentication for privileged users;
- iOS and Android accessibility review plus WCAG 2.2 AA for web;
- App Store and Play policy review;
- no planned capability mislabeled as operational;
- no unlabeled or unexplained score;
- No Social Credit architecture tests passing;
- location, identity evidence, and political-opinion redaction tests passing;
- safe degradation when AI, notification, Verus, or source connectors fail; and
- a pinned compatibility matrix for every enabled Verus Mobile flow.

Verus-specific gates apply only when the corresponding feature is enabled. A read-only profile release must not be blocked by a disabled optional blockchain integration.

## Documentation

- [Codex-ready Product Requirements Document](./docs/PRD.md)
- [End-to-end roadmap](./docs/ROADMAP.md)
- [System architecture](./docs/ARCHITECTURE.md)
- [Source-backed public profile API](./docs/PUBLIC_PROFILE_API.md)
- [Native mobile foundation](./docs/NATIVE_MOBILE.md)
- [Identity and Verus Mobile integration](./docs/IDENTITY_AND_VERUS_MOBILE.md)
- [Subdomain and deployment plan](./docs/SUBDOMAINS.md)
- [Website alignment and product decisions](./docs/WEBSITE_ALIGNMENT.md)
- [Codex execution contract](./CODEX.md)

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md), [GOVERNANCE.md](./GOVERNANCE.md), [SECURITY.md](./SECURITY.md), and the [Developer Certificate of Origin](./DCO.txt) before contributing.

- Open or claim a GitHub issue before substantial implementation.
- Keep pull requests narrow and mapped to acceptance criteria.
- Sign each commit with `Signed-off-by: Name <email>`.
- Do not put private keys, seed phrases, personal information, precise addresses, private representative signals, confidential evidence, or undisclosed vulnerabilities in issues or pull requests.
- Contributors remain responsible for provenance, licensing, security, and correctness when using AI-assisted development tools.

## License, stewardship, and trademarks

Repository content identified as such is licensed under the [Apache License 2.0](./LICENSE), except for third-party material expressly identified under another licence. Attribution notices are in [NOTICE](./NOTICE).

**Checks and Balances Committee Ltd.** is the steward of the official repository, roadmap, maintainer appointments, release process, hosted services, and official product recognition.

Checks and Balances Committee Ltd. owns copyright only in material it authored or validly acquired. Individual contributors retain copyright in their contributions unless they separately assign it in a signed written agreement. Accepted contributions are distributed under Apache-2.0 and require DCO 1.1 sign-off.

Apache-2.0 permits use, modification, redistribution, forking, and commercial implementation subject to its terms. It does not grant rights to the Rate My Representatives name, logos, domains, official badges, hosted services, production infrastructure, signing keys, production databases, personal information, or third-party material. See [TRADEMARKS.md](./TRADEMARKS.md).

A fork may truthfully identify its origin but must not imply sponsorship, certification, affiliation, endorsement, or operation by Checks and Balances Committee Ltd.

Checks and Balances Committee Ltd. may operate hosted services, seek grants or investment, enter commercial contracts, and provide paid implementation or support. Those activities do not revoke Apache-2.0 rights already granted for released repository content.

Submitting a contribution does not create employment, compensation, equity, committee membership, verification authority, fiduciary status, or governance rights unless separately granted in a signed written agreement.

Rate My Representatives is an independent project designed to integrate with Verus technologies. It must not be represented as an official Verus project or as endorsed by Verus developers or the Verus community without express authorization.
