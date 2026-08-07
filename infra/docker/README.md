# Container foundation

The repository-root `compose.yaml` builds the public web placeholder and API for an
application-only Dokploy deployment. It deliberately contains no PostgreSQL, queue,
object storage, mail catcher, worker, or Verus service. Those backing services and the
optional VRSCTEST profile belong to issue #9.

The production Compose file exposes ports only to its container network. Use Dokploy's
Domains tab to route the `web` service on container port `8080`. For a local smoke test,
add the local override:

```bash
docker compose -f compose.yaml -f compose.local.yaml up --build
```

Then read `http://127.0.0.1:8080/` and `http://127.0.0.1:8080/api/v1/health`.
See `docs/DEPLOY_DOKPLOY.md` for deployment and safety details.
