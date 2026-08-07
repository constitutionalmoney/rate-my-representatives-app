# ADR 0005: Versioned contracts and generated consumer clients

- Status: Accepted
- Date: 2026-08-06
- Issue: #60

## Context

Native releases can remain installed while the server evolves, and RMR has six official
API consumer surfaces. Handwritten types would drift and could erase privacy, actor, or
feature-state distinctions. Publishing planned routes as successful placeholders would
also falsely imply that civic data or writes exist.

## Decision

OpenAPI 3.1 at `packages/contracts/openapi/v1.yaml` and versioned JSON Schemas are the
canonical external contracts. TypeScript path types, schema types, schema documents, and
synthetic fixtures are generated and committed. Mobile, web, portal, admin, workers, and
the public SDK use surface-specific clients from `@rmr/contracts` and validate responses
at runtime.

OpenAPI may list a future route family without an HTTP operation. Only a complete,
authorized vertical slice may add an operation. Issue #60 implements health and a typed
proposed-state jurisdiction response; it does not implement jurisdiction records.

Compatibility is additive within v1 and checked against the parent commit in CI. Server
serialization is strict. Client validation removes additive unknown fields from a clone.
Errors use a single privacy-safe envelope.

## Consequences

- A contract change and its generated artifacts are reviewed together.
- Installed clients have explicit supported-version data and tolerant additive reads.
- Planned capabilities remain visibly non-operational.
- Intentional breaking work requires an explicit migration decision or a new version.
- Core build, validation, clients, and mock server require no Verus service.
