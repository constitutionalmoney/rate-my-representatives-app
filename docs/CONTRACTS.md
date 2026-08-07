# Foundation contract generation

**Status:** Issue #8 generation pipeline plus issue #12 security schemas. The complete
OpenAPI v1 surface belongs to issue #60.

## Sources and outputs

| Kind | Canonical input | Generated output |
|---|---|---|
| OpenAPI 3.1 | `packages/contracts/openapi.yaml` | `packages/contracts/src/generated/openapi.ts` |
| JSON Schema 2020-12 | `packages/contracts/schemas/health-status.schema.json` | `packages/contracts/src/generated/health-status.ts` |
| JSON Schema 2020-12 | `packages/contracts/schemas/authentication.schema.json` | `packages/contracts/src/generated/authentication.ts` |
| JSON Schema 2020-12 | `packages/contracts/schemas/feature-gates.schema.json` | `packages/contracts/src/generated/feature-gates.ts` |
| JSON Schema 2020-12 | `packages/contracts/schemas/audit-event.schema.json` | `packages/contracts/src/generated/audit-event.ts` |
| JSON Schema 2020-12 | `packages/contracts/schemas/outbox-event.schema.json` | `packages/contracts/src/generated/outbox-event.ts` |

Run:

```bash
pnpm generate:contracts
pnpm check:contracts
```

The generated OpenAPI path types are wrapped by `@rmr/contracts`. The public web app
consumes that typed client in `apps/web/src/health.ts`, and contract tests execute it with
a synthetic response. The API handler returns the same `HealthStatus` type.

The only route is `GET /api/v1/health`. It proves contract, server, client, generation,
and optional-dependency wiring without introducing representative records or civic
behavior. It reports Verus as disabled and does not attempt an RPC connection.

Issue #12 adds generated payload types for authentication starts, private sessions,
effective scoped role grants, and the complete false-by-default feature-gate map. These
schemas are consumed by contract tests without declaring planned auth routes operational.
See `docs/AUTH_SECURITY_FOUNDATION.md`.

Issue #19 adds generated append-only audit and at-least-once outbox envelopes. They
declare privacy, idempotency, correlation, schema-version, retry-state, and future
destination fields without adding any public API route or making a downstream worker
operational. See `docs/AUDIT_OUTBOX.md`.

Issue #60 may replace or extend this minimal specification, but it must preserve versioned
generation and update committed outputs in the same change.
