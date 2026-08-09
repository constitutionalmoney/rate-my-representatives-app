# Source-backed public profile API

**Status:** Issue #11 operational with synthetic data only
**Data effect:** Read only
**Canonical store:** PostgreSQL registry/source records; `rmr_public` is a rebuildable projection
**Verus dependency:** None

Issue #11 exposes one public profile for one person in relation to exactly one office
term or candidacy. It does not merge person, office, district, term, election, or
candidacy into a timeless politician record.

## Routes

```text
GET /api/v1/profiles
GET /api/v1/profiles/{profileId}
GET /api/v1/profiles/{profileId}/timeline
GET /api/v1/profiles/{profileId}/sources
GET /api/v1/profiles/{profileId}/coverage
GET /api/v1/profiles/{profileId}/responses
GET /api/v1/profiles/{profileId}/disputes
GET /api/v1/profiles/{profileId}/corrections
GET /api/v1/profiles/{profileId}/appeals
```

Profile lists filter by `countryCode` and `contextKind`. Timelines use opaque stable
cursors, a `1..50` limit, and an optional event-kind filter. Detail and section reads
return `Cache-Control` plus a weak ETag derived from `profileId` and `recordVersion`.
`If-None-Match` returns `304` when the reviewed projection is unchanged. A correction or
source refresh appends a version and changes the ETag.

## Publication boundary

Source connectors create candidates, never public facts. A reviewer or administrator
must first approve a source-record version. A separate reviewer/admin `publish` decision
then admits an allowlisted projection version to `rmr_public.current_profile_read`.
There is no public or internal automatic-publication route in issue #11.

The database enforces:

- exactly one office-term or candidacy context per stable profile;
- an explicit human publish decision per profile version;
- at least one reviewed source-record link per version;
- append-only publication decisions, versions, and timeline history; and
- prohibited-key rejection for public JSON payloads.

## Public serializer

The API constructs synthetic domain responses and validates them at the server boundary
against JSON Schema with `additionalProperties: false`. The allowlist includes separate
civic entities, official contact routes, material claims, sources, coverage, visible
responses/disputes/corrections, method metadata, and optional public identity/provenance
metadata.

It cannot expose account identifiers, precise location, private representative signals,
attestation evidence, staff evidence, moderator notes, sessions, private wallet material,
keys, or seeds. Unknown client response fields are stripped from a clone; undocumented
server output is rejected.

Every material claim includes one or more reviewed source IDs, a freshness state, and
supporting/challenging evidence links. Coverage distinguishes `available`,
`not_available`, `unsupported`, `stale`, and `coverage_gap`. A gap explicitly means
`coverage_gap_not_misconduct`. Conflicting sources remain visible and are not resolved by
the API.

## Synthetic fixtures

- Canada: Avery Quill in an appointed provincial office term, including a visible
  synthetic correction.
- United States: Morgan Fields in a withdrawn state-level candidacy, including a visible
  synthetic source-timestamp conflict and candidacy-transition history.

The fixtures describe no real person, office, vote, candidacy, or allegation.

## Deferred work

Issue #11 exposes no account, participation, evidence submission, representative claim,
publication, correction command, scoring, identity update, provenance write, wallet, RPC,
VRSCTEST, or mainnet operation. Provenance is `null`, external identity references are
empty, and method metadata confirms that no composite score or representative-signal
aggregate is included. All high-risk feature flags remain false.

Migration `0006_source_backed_public_profile_read.sql` is additive. Rollback before
production use consists of removing the `rmr_public` reader grants/views/schema after
confirming no downstream reader depends on it; canonical registry and reviewed-source
history remain untouched. Never roll back by mutating append-only profile versions.

See [API_V1.md](./API_V1.md), [SOURCE_INGESTION.md](./SOURCE_INGESTION.md), and
[COVERAGE_POLICY.md](./COVERAGE_POLICY.md). See also
[ADR 0009](./adr/0009-reviewed-source-backed-public-profile-projection.md).
