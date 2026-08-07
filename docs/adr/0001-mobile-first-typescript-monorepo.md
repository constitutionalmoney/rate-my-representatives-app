# ADR 0001: Mobile-first TypeScript monorepo foundation

- **Status:** Accepted for issue #8
- **Date:** 2026-08-06
- **Scope:** Repository and CI foundation only

## Context

The product requires first-class native iOS and Android clients, responsive public web,
representative and moderation surfaces, a versioned API, workers, and shared contracts.
The core must build without Verus or infrastructure introduced by later issues.

## Decision

1. Use a pnpm workspace with pinned Node.js and pnpm versions.
2. Compile all code in TypeScript strict mode with additional unchecked-index and exact-
   optional-property checks.
3. Use Expo SDK 57 and `expo-dev-client` with continuous native generation for the mobile
   foundation. iOS and Android prebuilds are generated independently in CI.
4. Use Vite and React for the responsive public, portal, and admin placeholders.
5. Use a small Node HTTP adapter for the typed health/example route. A server framework
   may be selected later when API issue requirements justify it.
6. Generate committed TypeScript contracts from OpenAPI 3.1 and JSON Schema 2020-12.
7. Enforce package boundaries in source imports and dependency manifests. Client/UI
   workspaces cannot import database, connector, Verus, provenance, API, or worker code.
8. Treat all high-risk flags as typed, false-by-default values. This ADR does not authorize
   enabling them.

## Consequences

- A clean checkout has one package-manager install and one complete validation command.
- Native projects can be regenerated instead of committing platform build artifacts.
- The generated client path is proven before the full API skeleton in issue #60.
- Database, queue, storage, ingestion, identity, participation, scoring, Verus, and
  provenance behavior remain absent.
- Changing workspace tooling, native architecture, or a public contract requires focused
  review and may require a later ADR or RFC under `GOVERNANCE.md`.

## Rollback

Issue #8 has no database or data migration. Reverting its commit removes the workspace and
generated artifacts without transforming records or external state.
