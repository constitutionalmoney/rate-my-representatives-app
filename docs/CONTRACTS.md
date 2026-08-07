# Versioned contract generation

**Status:** Issue #60 contract foundation. Health is operational; jurisdiction discovery
is proposed and returns no records; every other initial route family is proposed or
disabled.

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

`check:contracts` rejects generated drift and validates the OpenAPI document, all ten
schemas, synthetic fixtures, operation metadata, privacy fields, and human-intent
boundaries. `check:api-compat` compares the canonical contract with the parent commit and
rejects unapproved breaking changes. An intentional break requires a versioned migration
and an exact reviewed finding in `packages/contracts/compatibility-approvals.json`; an
approval is not a substitute for publishing the new API version.

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
- `GET /api/v1/jurisdictions` as a typed `503 FEATURE_DISABLED`; and
- all other requests as a typed `404 NOT_FOUND`.

`pnpm --filter @rmr/contracts mock:smoke` starts the mock on an ephemeral local port,
checks all three cases, and stops it. It does not use PostgreSQL, Verus, a wallet, keys,
external civic data, or network services.

See [API_V1.md](./API_V1.md) for operation metadata and compatibility policy.
