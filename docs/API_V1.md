# API v1 contract foundation

**Status:** Contract and synthetic registry foundation, not a public civic-data release
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

The remaining v1 route families for representation, sources, coverage,
accounts, participation, evidence, due process, Civic Signal, notifications, Verus, and
provenance are discoverable as empty OpenAPI path items. They do not define callable
operations until their owning issue implements authorization, domain rules, persistence,
and tests. Empty discovery entries must not be described as released endpoints.

Issue #55 implements internal source retrieval and review persistence only. Its generated
connector-capability and coverage schemas are operational contracts between internal
packages, not HTTP operations. `/api/v1/sources` and `/api/v1/coverage` remain empty and
proposed until issue #11 defines privacy-reviewed public serializers and reads.

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

Each response identifies its deferred families. Public source/profile reads, location
resolution, participation, public conduct, representative authority, identity proof,
provenance, and scoring remain unavailable. Public attribution on synthetic records
includes freshness, coverage, conflict, observation time, source reference, and
supersession metadata.
