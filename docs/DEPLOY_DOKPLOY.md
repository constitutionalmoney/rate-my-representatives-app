# Dokploy deployment foundation

Issue #8 provides an application-only Docker Compose deployment for a future Dokploy
server. It builds from the GitHub repository and contains two services:

- `web`: the public static web placeholder and same-origin `/api/` reverse proxy;
- `api`: the internal synthetic health API.

This is not a production civic release. It exposes only deterministic synthetic
jurisdiction-registry data and has no real representative/person data, persistent
storage, queue, source ingestion, account flow, scoring, Verus dependency, or mainnet
capability. Portal and admin placeholders are intentionally not published.

## Dokploy setup

1. Create a **Docker Compose** service in Dokploy.
2. Select the connected GitHub repository and the branch intended for that environment.
3. Set **Compose Path** to `./compose.yaml`.
4. Prefer an isolated deployment. Do not add manual Traefik labels or a fixed host port.
5. In **Domains**, route the public hostname to service `web`, container port `8080`.
6. Preview the resolved Compose configuration, deploy, and confirm both `/healthz` and
   `/api/v1/health` return successfully through the public hostname. The
   `/api/v1/health/mobile` compatibility response and the synthetic
   `/api/v1/jurisdictions` registry should also return `200`.

Dokploy automatically deploys pushes only for the branch selected for the service. A
production service should therefore track a reviewed protected branch, not a feature
branch. Dokploy's native Domains feature adds the routing labels during deployment, so
the repository does not embed a server-specific domain or certificate configuration.

Official references:

- [Docker Compose configuration](https://docs.dokploy.com/docs/core/docker-compose)
- [Docker Compose domains](https://docs.dokploy.com/docs/core/docker-compose/domains)
- [GitHub repository connection](https://docs.dokploy.com/docs/core/github)

## Safe defaults

Every high-risk capability is explicitly `false` in `compose.yaml`; Verus is absent.
The API binds all container interfaces only because its port remains internal to the
Compose network. The public web container is the sole domain target and proxies the
foundation API under `/api/`.

Do not add secrets to the Compose file or repository. Future environment values belong
in Dokploy's environment controls, referenced individually from Compose. Issue #9's
`compose.infrastructure.yaml` is intentionally a synthetic local/CI stack; do not select
it as the Dokploy Compose path. A future hosted release must use reviewed managed or
production-hardened backing services, backups, secrets, and release gates while retaining
`compose.yaml` as the GitHub-sourced application entry point.

## Local smoke test

Docker is optional for normal workspace checks. When Docker is available, use the local
port override:

```bash
docker compose -f compose.yaml -f compose.local.yaml up --build
```

Verify:

```bash
curl --fail http://127.0.0.1:8080/healthz
curl --fail http://127.0.0.1:8080/api/v1/health
curl --fail http://127.0.0.1:8080/api/v1/health/mobile
curl --fail http://127.0.0.1:8080/api/v1/jurisdictions
```

Stop the isolated local stack with:

```bash
docker compose -f compose.yaml -f compose.local.yaml down
```
