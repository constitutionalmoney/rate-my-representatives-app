# Local and CI infrastructure

## Source-ingestion persistence

Migration `0005_official_source_ingestion.sql` and local seed
`0004_synthetic_source_ingestion.sql` add two synthetic connector capabilities,
retrieval/run/checkpoint metadata, review candidates, matching/transformation history,
and explicit coverage gaps. No raw response bytes or real civic records are seeded.

`pnpm infra:smoke` verifies that the seed publishes nothing automatically, a source
process cannot approve, private fields fail closed, a reviewer can append an approved
record plus a superseding correction, audit/outbox records correlate, history rejects
updates, and Verus remains off. Reset/replay rules are documented in
`docs/runbooks/SOURCE_INGESTION.md`.

**Status:** Issue #9 infrastructure plus issue #55 synthetic source persistence. Local/CI
data only. This is not a production deployment recipe and it enables no public source,
civic, identity, scoring, provenance, or Verus write feature.

## Core stack

Docker Desktop or another Compose-compatible Docker engine is required. From the
repository root, one command generates untracked random local secret files, builds the
application containers, applies checksummed migrations and synthetic seeds, creates
queue and object-storage policy topology, then waits for healthy services:

```bash
pnpm infra:up
```

The command starts only:

- PostgreSQL 17 with a migration ledger plus infrastructure, jurisdiction, and
  public-role synthetic seed markers;
- RabbitMQ with durable primary, retry, and dead-letter queues;
- S3-compatible object storage built from the pinned upstream MinIO source release;
- isolated `rmr-public`, `rmr-quarantine`, and `rmr-private` buckets;
- Mailpit as a local-only email catcher; and
- the API and idle worker foundations, both with every high-risk flag false.

All published development ports bind to `127.0.0.1`. Core service traffic uses an
internal Docker network. Generated credentials live under `.local/infra/secrets`, are
ignored by Git, are mounted as Compose secrets, and are not printed by the manager.

Run the live acceptance smoke after startup:

```bash
pnpm infra:smoke
```

It proves all synthetic seed markers exist; effective-dated jurisdiction overlap and
containment-cycle rejection; stable rename/external-ID history; public-view isolation;
Canada/United States graph fixtures and public coverage/conflict gaps; state/audit/outbox atomicity; audit immutability and privacy
rejection; lease, retry, dead-letter, replay, duplicate-delivery, and safe-metrics
behavior; a synthetic RabbitMQ message returns from retry and reaches its dead-letter
queue; only `approved-manifests/*` is anonymously public; quarantine/private objects are
denied; Mailpit is ready; and API/worker health remains ready with no Verus container
running. It also verifies separate person/term/election/candidacy records, lifecycle
transition guards, non-name person resolution, non-authoritative external references,
public-view privacy, and won-candidacy/term separation. The PostgreSQL acceptance drills
roll back their temporary synthetic rows.

## Object-storage boundaries

| Principal/path | Allowed | Explicitly unavailable |
|---|---|---|
| anonymous | read `rmr-public/approved-manifests/*` | drafts, quarantine, private |
| `rmr-api` | list/read approved public manifests | quarantine, private, public writes |
| `rmr-quarantine-worker` | list/read/write/delete quarantine | public and private |
| `rmr-private-worker` | list/read/write/delete private | public and quarantine |

The local buckets and principals are infrastructure preparation only. No source ingestion
or public manifest workflow is implemented by this issue.

## Optional VRSCTEST profile

Before starting it, verify the current approved Verus daemon release from the official
release source and update the configured version/evidence if policy changed. The example
currently pins `v1.2.16-1`, downloads the official CLI archive, and verifies the GitHub
release SHA-256 during the image build.

```bash
pnpm infra:verus:up
```

This explicitly selects the `verus` Compose profile. The first run downloads Zcash
parameters into a named volume and may take time. `VERUS_NETWORK=VRSCTEST` is enforced by
the entrypoint. Authenticated RPC has no host port, is reachable only on the internal
`verus-rpc` network, and accepts only localhost plus that fixed private subnet. The API is
not attached to that network.

The wallet-request and provenance signer containers are intentional stubs. They contain
no wallet, identity, address, key, seed, WIF, signing capability, or write path. Their
health route reports `signing: disabled`; every other request fails with 503. Starting
the profile does not change any feature flag.

## Stop, reset, export, and recovery

Stop containers while preserving data and generated local credentials:

```bash
pnpm infra:down
```

List the named volumes before any maintenance:

```bash
docker volume ls --filter label=com.docker.compose.project=rate-my-representatives-local
```

Create explicit local exports in a directory outside source control. Examples below use
`./.local/infra/exports`:

```bash
mkdir -p .local/infra/exports
docker compose -f compose.infrastructure.yaml exec -T postgres pg_dump -U rmr -d rmr --clean --if-exists --no-owner > .local/infra/exports/rmr.sql
docker compose -f compose.infrastructure.yaml exec -T rabbitmq rabbitmqctl export_definitions /tmp/rabbitmq-definitions.json
docker compose -f compose.infrastructure.yaml cp rabbitmq:/tmp/rabbitmq-definitions.json .local/infra/exports/rabbitmq-definitions.json
```

Object data can be exported through the S3-compatible API using a reviewed client and
the generated principal appropriate for each bucket. Do not collapse public, quarantine,
and private credentials into one application credential. An export is not a verified
backup until a restore drill checks migration state, object policies, queue topology,
and the synthetic smoke suite.

Clean reset is intentionally destructive only to this Compose project's containers,
named volumes, and `.local/infra` generated credentials:

```bash
pnpm infra:reset
```

The manager resolves and verifies the local path and requires
`--confirm-local-reset` internally before issuing `docker compose down --volumes`.
Production backup, retention, encryption, restore, and disaster-recovery policy remains
a separate deployment/release responsibility.

## CI and troubleshooting

CI runs `infra:config`, `infra:up`, and `infra:smoke` as an ephemeral core job, then
always stops it. It never selects the `verus` profile. Local Compose configuration can
be checked without starting services:

```bash
pnpm infra:config
```

If a one-shot `migrations`, `queue-init`, or `object-storage-init` service fails, inspect
its sanitized container log, fix the configuration, and run `pnpm infra:up` again. A
changed migration checksum fails closed; add a new migration instead of editing one that
has already been applied.
