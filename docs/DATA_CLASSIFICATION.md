# Data classification and security domains

**Status:** Issue #22 enforcement foundation plus issue #29 transient location boundary.
Synthetic local/CI data only. This document does not enable production accounts,
providers, participation, representative scoring, source publication, Verus identities,
provenance writes, or mainnet behavior.

## Classification levels

| Level | Meaning | Examples | Public output |
|---|---|---|---|
| P0 Public | Approved, source-backed public material | public-role registry projections, reviewed profile fields, approved public manifests | Allowlisted serializers/read models only |
| P1 Restricted | Internal operational material with bounded disclosure | source quarantine metadata, coverage review state, payload-free access decisions | Never direct; reviewed derived output only |
| P2 Highly restricted | Data that can authenticate, identify, locate, politically profile, moderate, or sign | credentials, precise location input, identity evidence, individual civic activity, moderation content, signer/RPC secrets | Never |

Classification follows data through queues, exports, backups, restores, analytics, and
derived stores. Moving a record does not lower its classification. Encryption does not
turn restricted data into public data.

## Enforced domain matrix

Unknown principal/domain/operation combinations are denied. The TypeScript policy in
`packages/domain/src/security-domains.ts`, PostgreSQL migration
`0007_security_domain_separation.sql`, generated `security-domain-policy.v1` contract,
and live infrastructure smoke encode the same eight-domain boundary.

| Domain | Classification | Canonical examples | Database/service boundary | Public access |
|---|---|---|---|---|
| Public registry | P0 after review | people, offices, terms, candidacies, sources, public claims/responses/corrections | `rmr_registry`, `rmr_public`; `rmr_api_public_service` receives only security-barrier/read views | Read and serialize allowlisted fields |
| Account authentication | P2 | email, passkeys, sessions, recovery, device state | reserved `rmr_account`; `rmr_account_service` only | None |
| Location resolver | P2 input, P0/P1 output | transient address/coordinates; returned district IDs | table-free `rmr_location`; request-scoped service plus public registry read | District IDs only; precise input is not persisted |
| Identity/attestation | P2 | VerusID links, representative claims, staff evidence, opaque provider status | reserved `rmr_identity`; `rmr_identity_service` only | Reviewed public reference through a separate projection only |
| Private civic activity | P2 | individual signals, ratings, preferences, subscriptions | reserved `rmr_participation`; `rmr_participation_service` only | None; future aggregates require separate privacy review |
| Moderation | P2 | notes, assignments, abuse indicators, private correspondence | reserved `rmr_moderation`; `rmr_moderation_service` and restricted audit view | None |
| Public methodology/provenance | P0 after approval | methods, public outputs, approved manifests, future public confirmation references | reserved `rmr_provenance`; publication/provenance service identities | Allowlisted reads only; no writer is enabled by issue #22 |
| Verus signing/RPC | P2 | request-signing identities, credentials, signer queues, node access | reserved `rmr_signer`; isolated signer service/network only | None |

The API login is `rmr_api_runtime`; the general worker login is
`rmr_worker_runtime`. Each uses a distinct generated secret and inherits one group role.
Neither inherits the database owner or legacy all-event outbox role. Migration ownership
stays in the one-shot migration container. Account, identity, participation, moderation,
publication, provenance, signer, security-auditor, and backup roles are `NOLOGIN` service
identities until a later issue provisions a dedicated process.

The core worker can claim only notification, search-index, and aggregate-recompute event
families. Source and provenance event families have separate claim functions and service
roles. The provenance family remains inert, and no core/native/web/public process receives
signer/RPC credentials or joins `signer-control`/`verus-rpc` networks.

## Public serialization and cross-domain access

Public reads are positive allowlists backed by JSON Schemas with
`additionalProperties: false`, runtime server validators, security-barrier PostgreSQL
views, and client validators that discard future additions. Account identifiers, precise
location, identity evidence, individual civic activity, moderation fields, wallet
payloads, and signer fields cannot enter the public profile contract.

`authorizeSecurityDomainAccess` requires a non-optional audit sink. Every allow or deny
decision records only principal, source/target domain, operation, decision, safe reason,
correlation ID, and timestamp. PostgreSQL's append-only
`rmr_security.access_review_event` has no payload or subject column. The security auditor
can review decisions and the static matrix but cannot mutate application data.

Privileged administrator access uses a separate role/session class from ordinary account
sessions. `PRIVILEGED_ACCESS_ENABLED` remains false by default; later enablement must use
recent presence, time-limited grants, a dedicated admin client/service identity, and
audited actions. A public or representative session never becomes privileged by route
selection.

## Location, observability, queues, and analytics

Precise location input is accepted only by the gated resolver's transient-process
operation. It may exist in process memory for the shortest practical interval and must be
discarded after returning district/jurisdiction IDs. It is prohibited from PostgreSQL,
object storage, logs, traces, analytics, queues, crash reports, audit detail, and support
exports.

`rmr_location` intentionally owns no table. An authenticated user may separately save
one `rmr_account.saved_broad_jurisdiction` row containing only an application
jurisdiction ID, country code, canonical country/province/state/territory kind and label,
and creation/update timestamps. Database checks, RLS, security-definer commands,
hashed idempotency receipts, and payload-free audit prevent reconstruction or
cross-account access. Municipality, district, boundary, address, coordinate, provider
query, and ambiguity-token fields are prohibited.

General observability recursively redacts credential, identity, precise-location,
individual-signal, moderation, wallet, and token keys. Product analytics uses a positive
event/field allowlist limited to operational quality such as coarse latency buckets,
platform, status, and accessibility errors. It records no representative choice,
address, jurisdiction sequence, person/account join, browsing history, or stable device
profile. Raw audit/outbox JSON also has database rejection constraints.

## Object storage

| Bucket | Class | Principal | Policy |
|---|---|---|---|
| `rmr-public` | P0 | anonymous/read-only API | approved public records only |
| `rmr-public-manifests` | P0 | anonymous/read-only API; separate manifest writer | approved public manifests only |
| `rmr-quarantine` | P1/P2 | quarantine worker | no anonymous/API/private-worker access |
| `rmr-private-evidence` | P2 | private-evidence worker | no anonymous/API/quarantine access |

The four principals use different generated secrets. The general worker receives no
object-storage credential. A future private-evidence process or publication process must
receive only its specific private-evidence or manifest-writer credential. Raw source bytes
remain outside PostgreSQL and must retain source rights, retention, and classification
metadata.

## Encryption, secret rotation, retention, and backup

- Network traffic uses TLS in deployed environments; database, queue, object-store, and
  signer endpoints are private and authenticated. Local loopback development is not
  production transport evidence.
- Production storage and backup media must use provider-managed encryption at rest plus
  separately controlled application/service secrets where applicable.
- Secrets live in a deployment secret manager or mounted secret files, never Git,
  images, logs, chat, client bundles, database rows, or general application config.
  Rotation creates a new credential, updates one scoped consumer, verifies health/audit,
  then revokes the old credential. Signer and privileged-admin rotation is independent.
- Retention is domain-specific and purpose-limited. Transient location has no retention;
  credentials/sessions follow security lifecycle; moderation/evidence follows legal and
  due-process policy; public records retain effective/supersession history; audit legal
  holds override future purge.
- `infra/backup/security-domain-manifest.synthetic.json` is a machine-checked example.
  Backups stay encrypted and preserve each database schema and bucket classification.
  Production data cannot be restored into development/test. Restore keeps service roles
  disabled, verifies migrations/grants/policies, runs the synthetic smoke, then enables
  one scoped consumer at a time.

Issue #25 still owns the production disaster-recovery exercise and measured recovery
objectives. Issue #22 establishes rules and executable synthetic checks; it does not
claim a hosted backup or completed production restore drill.

## No Social Credit enforcement

No query, view, event, export, API, model, feature, or analytics job may combine identity
or account state with individual civic activity to create a generalized citizen score,
reputation, ideology, loyalty, conformity, eligibility, risk, or political profile.
`assertPublicExportSafe`, generated-contract constants, schema/view scans, authentication
policy, and security tests reject those names and forbidden joins.

Future issue #57 owns the broader repository-wide covenant review, including narrow
single-purpose states. Issue #22 supplies the foundational deny rules; it does not weaken
the covenant or authorize any scoring feature.

## Review, rollback, and deferred exercises

Every new cross-domain grant needs security review, a purpose, least privilege, test
coverage, and a payload-free access-decision event. Review database memberships,
function/table/schema grants, storage policies, runtime network membership, analytics
allowlists, backup manifests, and generated public schemas together.

Migration `0007_security_domain_separation.sql` is forward-only. Roll back application
code without dropping schemas, access history, or roles; repair a faulty grant with a new
reviewed migration. Rotate affected runtime/storage credentials after any boundary error.
Dropping classified data requires explicit retention/legal authorization and a verified
classification-preserving backup.

Issue #6 still owns the full threat-model exercise and abuse-case review. Issue #25 owns
the disaster-recovery exercise. Neither exercise is claimed complete by this foundation.
