# Versioned contract generation

## Coverage policy report contract

Issue #7 adds `coverage-report.v1` as a generated TypeScript type, schema document, and
synthetic not-ready fixture. The contracts validator checks the fixture against the
canonical JSON Schema. It records declared scope and denominators, jurisdiction-level
support, source rights, profile/material-claim coverage, freshness, connector failures,
gaps, corrections, release decision, and optional public-artifact provenance state.
Issue #7 adds no HTTP operation; issue #21 owns live public-report publication.

Issue #22 adds generated `security-domain-policy.v1` TypeScript/schema/fixture wiring.
It fixes the eight domain names, deny default, classified object buckets,
classification-preserving backup requirements, signer isolation, and No Social Credit
constants. It is an internal policy contract and adds no HTTP route.

## Methodology and moderation policy contracts

Issue #4 adds generated `methodology-indicator-result.v1` and
`methodology-release-gate.v1` types, schema documents, and synthetic fixtures. They keep
missing inputs non-adverse and the composite release decision disabled unless every
separate gate is approved.

Issue #5 adds generated `moderation-decision.v1` type/schema/fixture wiring. The contract
requires a human decider, assignment and conflict outcome, source/method/policy versions,
a public reason, appeal/supersession links, false automatic publication, and an explicit
public/provenance boundary. It is restricted decision metadata, not a public response or
operational moderation route.

## Official-source internal contracts

Issue #55 adds generated TypeScript and runtime validators for
`source-connector-capability.v1` and `source-coverage-snapshot.v1`. Synthetic Canada and
United States connector fixtures plus a deterministic coverage fixture are validated in
CI. Issue #11 consumes the human-reviewed internal records through profile-scoped
source and coverage operations. Global `/api/v1/sources` and `/api/v1/coverage`
enumeration remains proposed.

Connector contract changes follow the same generated-drift and compatibility discipline
as other schemas. A material access, rights, parser, schema, schedule, or safety-policy
change creates a new connector version rather than mutating stored capability history.

**Status:** Issue #60 foundation plus issue #49/#59 registry reads, issue #55 internal
source contracts, issue #11 synthetic source-backed profile reads, issue #29 gated
location contracts, and issue #7's non-operational report contract. Remaining HTTP route
families are proposed or disabled.

## Canonical sources and committed outputs

| Kind | Canonical input | Generated output |
|---|---|---|
| OpenAPI 3.1 | `packages/contracts/openapi/v1.yaml` | `packages/contracts/src/generated/openapi.ts` |
| JSON Schema 2020-12 | `packages/contracts/schemas/*.schema.json` | `packages/contracts/src/generated/*.ts` |
| Schema documents | all JSON Schemas | `packages/contracts/src/generated/schema-documents.ts` |
| Synthetic examples | `packages/contracts/fixtures/*.json` | `packages/contracts/src/generated/contract-fixtures.ts` |

Generated files are committed so downstream clients have a reviewable contract. Edit
only the canonical YAML, schemas, or fixtures, then run:

```bash
pnpm generate:contracts
pnpm check:contracts
pnpm check:api-compat
pnpm test:contract
```

`check:contracts` rejects generated drift and validates the OpenAPI document, all 27
schemas, synthetic fixtures, operation metadata, privacy fields, and human-intent
boundaries. `check:api-compat` compares the canonical contract with the parent commit and
rejects unapproved breaking changes. An intentional break requires a versioned migration
and an exact reviewed finding in `packages/contracts/compatibility-approvals.json`; an
approval is not a substitute for publishing the new API version.

Issue #55 explicitly approves the required `SOURCE_INGESTION_ENABLED` field addition.
All typed consumers receive the field as `false` by default; omitting it is rejected so
older deployments cannot accidentally bypass the new deny-by-default execution gate.

Issue #29 explicitly approves the required false-by-default
`LOCATION_RESOLUTION_ENABLED` field and additive `UNAUTHENTICATED`, `FORBIDDEN`, and
`GONE` error codes used by the authenticated broad-preference and one-time ambiguity
routes. No existing status, operation, or error meaning is removed.

## Generated clients and runtime validation

`@rmr/contracts` publishes generated clients for mobile, web, portal, admin, worker, and
public SDK consumers. Each adds an `x-rmr-client-surface` diagnostic header and shares
the generated OpenAPI path types. The corresponding application packages import their
surface-specific factory rather than maintaining handwritten request/response types.

Responses cross an AJV 2020-12 validation boundary. Servers reject undocumented output.
Clients tolerate additive response fields by stripping them from a cloned value, which
supports compatible v1 growth without leaking unknown data further into an app.
Validation errors include paths and keywords only; they never echo submitted values.

## Mock and fixture policy

All committed examples are explicitly synthetic. Run the local, loopback-only mock with:

```bash
pnpm --filter @rmr/contracts mock
```

It serves:

- `GET /api/v1/health` as `200`;
- `GET /api/v1/health/mobile` as `200` with foundation native-client compatibility;
- `GET /api/v1/jurisdictions` as a typed `200` synthetic registry response; and
- the four public-role lifecycle reads as typed `200` synthetic responses;
- public profile list/detail/timeline/source/coverage/response/dispute/correction/appeal reads; and
- representation capability/resolve/ambiguity responses and broad-jurisdiction preference responses; and
- all other requests as a typed `404 NOT_FOUND`.

`pnpm --filter @rmr/contracts mock:smoke` starts the mock on an ephemeral local port,
checks representative operational routes/statuses, and stops it. It does not use PostgreSQL, Verus, a wallet, keys,
external civic data, or network services.

`jurisdiction-registry.schema.json` is generated into a public TypeScript response type,
runtime schema document, client path type, and fixture export. The same validator is
used at the API server boundary and by all six official client surfaces. The schema
contains no person, term, candidacy, precise-location, account, or wallet fields.
`public-role-registry.schema.json` separately generates the public person/term/election/
candidacy graph. It forbids undocumented fields and makes every external identity
reference explicitly non-canonical and non-authorizing.
`public-role-profile.schema.json` separately allowlists profile detail and section
responses. Dedicated list/timeline schemas preserve generated native/web types and
runtime validation. Server validation rejects undocumented private fields; clients strip
only additive fields after cloning.

Issue #29 adds strict request/response schemas for representation capabilities,
one-time resolution, ambiguity continuation, and saved broad jurisdiction. Generated
mobile/web clients validate responses and never expose a persistence operation for
precise input. The checked synthetic fixtures contain invented geography and `CC0-1.0`
metadata only; they do not describe a real address or person.

See [API_V1.md](./API_V1.md) for operation metadata and compatibility policy.
