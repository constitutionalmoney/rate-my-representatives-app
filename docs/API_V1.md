# API v1 contract foundation

**Status:** Contract foundation, not a public civic-data release
**Canonical specification:** `packages/contracts/openapi/v1.yaml`

## Implemented operations

| Operation | State | Result | Data effect |
|---|---|---|---|
| `GET /api/v1/health` | Operational | Typed contract and safe feature-state discovery | None |
| `GET /api/v1/health/mobile` | Operational | Synthetic native minimum-build and contract-version policy | None |
| `GET /api/v1/jurisdictions` | Proposed | Typed `503 FEATURE_DISABLED` | None; returns no jurisdictions |

The initial v1 route families for representation, civic records, sources, coverage,
accounts, participation, evidence, due process, Civic Signal, notifications, Verus, and
provenance are discoverable as empty OpenAPI path items. They do not define callable
operations until their owning issue implements authorization, domain rules, persistence,
and tests. Empty discovery entries must not be described as released endpoints.

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
