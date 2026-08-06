# Foundation contract generation

**Status:** Minimal issue #8 wiring. The complete OpenAPI v1 surface belongs to issue #60.

## Sources and outputs

| Kind | Canonical input | Generated output |
|---|---|---|
| OpenAPI 3.1 | `packages/contracts/openapi.yaml` | `packages/contracts/src/generated/openapi.ts` |
| JSON Schema 2020-12 | `packages/contracts/schemas/health-status.schema.json` | `packages/contracts/src/generated/health-status.ts` |

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

Issue #60 may replace or extend this minimal specification, but it must preserve versioned
generation and update committed outputs in the same change.
