# ADR 0003: Isolated local infrastructure and optional VRSCTEST profile

- Status: Accepted for issue #9
- Date: 2026-08-06

## Context

The application needs reproducible PostgreSQL, queue, object storage, email, API, and
worker foundations before later civic domain issues can be implemented. Verus is optional
identity/provenance infrastructure and must not become a core-read dependency. Local
credentials, object quarantine, future signing material, and public-facing services have
different trust boundaries.

## Decision

Use a standalone `compose.infrastructure.yaml` for local and ephemeral CI services. Keep
the root Dokploy `compose.yaml` application-only. Generate random local credentials into
an ignored directory and mount them as Compose secrets. Use named volumes, explicit
health/dependency conditions, checksummed forward migrations, and clearly synthetic seeds.

RabbitMQ supplies durable retry/dead-letter primitives. Object storage uses three buckets
and least-privilege principals; anonymous access is limited to approved public manifests.
Mailpit remains localhost-only. API and worker foundations depend on successful core
initialization, but no business worker or source pipeline is added.

Put `verusd`, parameter setup, and disabled signer stubs behind the `verus` profile.
Enforce VRSCTEST in the container entrypoint, keep authenticated RPC unpublished on an
internal network, and do not attach the API to it. The stubs contain no signer material
and fail every signing request.

## Consequences

- `pnpm check` remains independent of Docker and Verus.
- CI can exercise the complete ephemeral core stack without chain software.
- Local state survives normal shutdown and reset is explicit and scoped.
- The source-built MinIO container costs more CI build time but uses the latest pinned
  upstream security release rather than an archived legacy binary image.
- The VRSCTEST profile may take substantial first-run time to download parameters and
  synchronize; that does not affect core readiness.
- Issue #19 still owns application audit records and the transactional outbox. This ADR
  does not authorize provenance jobs or writes.
