# Public-role identity and candidacy lifecycle

**Status:** Issue #59 synthetic read foundation. Not a production civic-data release.

Issue #59 implements PRD requirements FR-REG-001 through FR-REG-005 as an
application-native “Digital ID for Politicians.” PostgreSQL is canonical. The core
workspace and all four public reads work without Verus, a wallet, identity proof,
source ingestion, or blockchain availability.

## Canonical model

The registry deliberately keeps these records separate:

- `person` and effective-dated `person_name` records;
- structural offices, districts, jurisdictions, and bodies owned by issue #49;
- `office_term` plus append-only state transitions, official contacts, and
  predecessor/successor relationships;
- `election` plus effective-dated versions;
- `candidacy` plus append-only state transitions;
- official identifiers scoped to exactly one public-role entity;
- reviewed, supersedable merge/split/distinct person-resolution decisions; and
- optional inert `external_identity_reference` rows.

A candidacy win never creates or confirms an office term. A separate, reviewed term
record and lifecycle transition are required. Future public conduct may attach only to
an `office_term` or `candidacy`, not to a person globally; issue #59 implements no
conduct, rating, signal, or scoring record.

## Lifecycle rules

Office terms begin `pending`, then may become `active` or `cancelled`. Active terms may
end, resign, be removed, become deceased/disqualified, or be superseded. Origin,
selection method, and service capacity are distinct so elected, appointed, acting, and
interim service remain explicit.

Candidacies may begin declared, registered, qualified, or active and follow the finite
state graph in the domain and database migration. Public data has no `rumored` state.
Every transition carries synthetic source attribution, effective time, accountable
actor/process metadata, and a public reason code. Database history is append-only.

## Person resolution and privacy

Names alone cannot merge or split people. A resolution requires at least two evidence
records, at least one non-name context, at least two assertion IDs, and reviewer/admin
accountability. Decisions are retained and superseded instead of rewritten, making
merge/split review reversible through later history.

Public serializers expose actor type, process, reason code, and recorded time. They do
not expose `actor_reference` or `private_notes`. Similar synthetic names are kept
distinct using official-identifier and district context.

External identity references are optional and empty in the core fixture. Database and
JSON Schema constraints require `canonicalAuthority: false` and
`grantsAuthorization: false`. No VerusID link, proof, update, representative claim,
authentication, or identity write is implemented.

## Read surface

The same relational read model is available through:

- `GET /api/v1/people` with optional `personId`;
- `GET /api/v1/office-terms` with optional `officeTermId`;
- `GET /api/v1/elections` with optional `electionId`; and
- `GET /api/v1/candidacies` with optional `candidacyId`.

All accept `asOf`, `countryCode`, and `includeHistorical`. Unknown, duplicate, and
wrong-route filters fail with `400 VALIDATION_ERROR`. Structural offices remain in the
issue #49 jurisdiction graph rather than being duplicated.

## Migration and recovery

Migration `0004_public_role_lifecycle.sql` is checksummed and must never be edited after
deployment; add a later migration for corrections. Local seed
`0003_synthetic_public_role_lifecycle.sql` is synthetic and transactionally validated.
Before a hosted migration, back up PostgreSQL, test restore plus the full smoke suite,
apply migrations before application rollout, and retain the prior application image.
Rollback means restoring the verified pre-migration database and prior image—never
deleting individual history rows. Public-role transition and resolution tables are
append-only by design.

## Explicitly deferred

Issue #55 owns official-source ingestion. Later issues own source-backed profile reads,
native UX, participation, representative authority, external identity proof/update,
provenance writes, and scoring. Issue #59 performs none of them and uses no mainnet.
