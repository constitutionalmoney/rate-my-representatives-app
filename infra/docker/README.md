# Container foundation

The repository-root `compose.yaml` builds the responsive read-only discovery PWA and API
for an application-only Dokploy deployment. It deliberately contains no synthetic local
credentials or test backing services. The web container serves the PWA manifest and
service worker and proxies only application API requests to the internal API container.

The production Compose file exposes ports only to its container network. Use Dokploy's
Domains tab to route the `web` service on container port `8080`. For a local smoke test,
add the local override:

```bash
docker compose -f compose.yaml -f compose.local.yaml up --build
```

Then read `http://127.0.0.1:8080/`, `http://127.0.0.1:8080/manifest.webmanifest`, and
`http://127.0.0.1:8080/api/v1/health`.
See `docs/DEPLOY_DOKPLOY.md` for deployment and safety details.

Issue #9's separate `compose.infrastructure.yaml` supplies PostgreSQL, RabbitMQ,
source-built S3-compatible object storage, Mailpit, migrations, policy initialization,
API/worker development wiring, and an opt-in VRSCTEST profile. Use the guarded `pnpm
infra:*` commands and follow `docs/LOCAL_INFRASTRUCTURE.md`; do not deploy the local stack
as the Dokploy production configuration.
