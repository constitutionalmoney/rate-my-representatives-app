# API v1 contract foundation

**Status:** Contract, synthetic registry, and synthetic source-backed profile reads; not a production civic-data release
**Canonical specification:** `packages/contracts/openapi/v1.yaml`

## Implemented operations

| Operation | State | Result | Data effect |
|---|---|---|---|
| `GET /api/v1/health` | Operational | Typed contract and safe feature-state discovery | None |
| `GET /api/v1/health/mobile` | Operational | Synthetic native minimum-build and contract-version policy | None |
| `GET /api/v1/jurisdictions` | Operational, synthetic | Effective-dated jurisdictions, districts, bodies, offices, identifiers, and gaps | Read only |
| `GET /api/v1/people` | Operational, synthetic | People, names, related terms/candidacies, and reviewed resolution history | Read only |
| `GET /api/v1/office-terms` | Operational, synthetic | Current/former/pending term lifecycle and public office contacts | Read only |
| `GET /api/v1/elections` | Operational, synthetic | Effective-dated elections and related candidacies | Read only |
| `GET /api/v1/candidacies` | Operational, synthetic | Declared through outcome candidacy lifecycle; winning creates no term | Read only |
| `GET /api/v1/profiles` | Operational, synthetic | Human-published profile summaries, filterable by country/context | Read only |
| `GET /api/v1/profiles/{profileId}` | Operational, synthetic | One person in one office-term or candidacy context | Read only |
| `GET /api/v1/profiles/{profileId}/timeline` | Operational, synthetic | Filterable, cursor-paginated visible history | Read only |
| `GET /api/v1/profiles/{profileId}/sources` | Operational, synthetic | Reviewed sources, hashes, rights, retrieval, and freshness | Read only |
| `GET /api/v1/profiles/{profileId}/coverage` | Operational, synthetic | Explicit gaps, stale/unsupported states, and conflicts | Read only |
| `GET /api/v1/profiles/{profileId}/responses` | Operational, synthetic | Published items or explicit availability state | Read only |
| `GET /api/v1/profiles/{profileId}/disputes` | Operational, synthetic | Visible items or explicit availability state | Read only |
| `GET /api/v1/profiles/{profileId}/corrections` | Operational, synthetic | Visible correction/supersession history | Read only |
| `GET /api/v1/profiles/{profileId}/appeals` | Operational, synthetic | Visible appeal history or explicit availability state | Read only |

The registry accepts optional `asOf`, `countryCode`, `jurisdictionId`, and
`includeHistorical` filters. Its default timestamp and every returned record are
deterministic synthetic fixtures. Unknown filters—including latitude, longitude,
address, and other location-resolution inputs—return the typed `400 VALIDATION_ERROR`
envelope. The endpoint does not determine legal residence, citizenship, eligibility,
or the district for a precise location.

The public-role reads accept `asOf`, `countryCode`, `includeHistorical`, and their one
route-specific opaque ID. Public output omits reviewer references/private notes and
returns inert external identity references only. Structural offices stay in
`/api/v1/jurisdictions`.

Profile reads accept stable application IDs. Timelines accept `cursor`, `limit`, and
`kind`; profile lists accept `countryCode` and `contextKind`. Detail and section reads
return a weak ETag derived from the reviewed record version and honor `If-None-Match`
with `304`. A correction or source refresh increments the record version and therefore
invalidates the prior ETag.

Every material claim names reviewed sources and freshness. Coverage distinguishes
`available`, `not_available`, `unsupported`, `stale`, and `coverage_gap`; missing data
means `coverage_gap_not_misconduct`. Source conflicts remain visible. The server validates
an exact allowlist that excludes account, precise-location, signal, attestation,
staff-evidence, moderator-note, and private wallet data.

The remaining v1 route families for representation, global sources/coverage enumeration,
accounts, participation, evidence writes, due-process writes, Civic Signal, notifications, Verus, and
provenance are discoverable as empty OpenAPI path items. They do not define callable
operations until their owning issue implements authorization, domain rules, persistence,
and tests. Empty discovery entries must not be described as released endpoints.

Issue #55 implements internal source retrieval and review persistence. Its generated
connector-capability and coverage schemas are operational contracts between internal
packages. Issue #11 exposes only profile-scoped reviewed source and coverage reads; the
global `/api/v1/sources` and `/api/v1/coverage` paths remain non-callable to avoid broad
enumeration.

## Required operation policy

Every callable operation declares a stable operation ID, feature status, allowed actors,
required scopes, authentication and recent-presence requirements, field privacy classification,
public/private serializer policy, idempotency and concurrency behavior, rate-limit class, safe error
codes, audit/outbox effects, pagination/filter/sort behavior, cache policy, version policy,
and source metadata. Contract validation fails when any field is absent.

The contract preserves these product boundaries:

- Civic Signal is monitoring and briefing; it cannot express human civic intent.
- Representative signals and category ratings are human-only and agent-forbidden.
- Skip has no write operation and creates no record.
- No representative score or scoring operation exists.
- Verus and provenance routes are disabled; no identity, signer, RPC, or chain-write
  operation exists. VRSCTEST is the only declared future Verus network.

## Error and privacy model

All API errors use `api-error.v1`. The envelope exposes a safe code, generic message,
opaque correlation ID, allowlisted field errors, retry policy, and explicit feature or
dependency state. It contains no account, identity, political-choice, precise-location,
moderator-note, wallet, or secret fields. Unknown routes and disabled features use the
same shape to avoid enumeration through divergent errors.

## Compatibility policy

v1 is additive. Existing operations, operation IDs, status codes, required parameters,
authentication requirements, property types, constants, enum members, and unknown-field
behavior cannot be narrowed silently. Newly required fields are breaking. The CI
compatibility checker compares against the parent contract, includes its own regression
self-test, and reports exact findings. Planned breaking changes require a new API/schema
version or a specifically reviewed migration approval.

Health publishes `currentVersion`, `minimumSupportedVersion`, and `supportedVersions`.
`/api/v1/health/mobile` adds foundation minimum builds and per-platform supported contract
versions so installed clients can make compatibility decisions without depending on
Verus or other optional services. `releaseState: foundation` makes clear that this is not
an app-store release claim.

Public profiles work with every Verus flag false. Optional provenance is `null` while
disabled, external identity references are empty, and neither a composite score nor a
representative-signal aggregate is exposed. No API operation automatically publishes a
record. See [PUBLIC_PROFILE_API.md](./PUBLIC_PROFILE_API.md).
