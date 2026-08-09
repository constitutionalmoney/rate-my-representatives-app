# Development foundation

**Status:** Issues #8, #12, #9, #19, #60, #49, #59, #55, #11, and #61 foundation.
Effective-dated jurisdiction/public-role reads, internal source-candidate ingestion, and
reviewed source-backed profile reads are operational with synthetic data only. No public
account service, automatic publication, Verus write, participation, scoring, or
production civic data is operational.

## Prerequisites

- Node.js `24.19.0` (the pinned Node 24 LTS release in `.node-version`)
- pnpm `11.20.0` (pinned by `packageManager` and `engines` in `package.json`)
- Git with contributor name and email configured for DCO sign-off

If pnpm is not already available, enable the package-manager shim supplied by the pinned
Node release and activate the declared pnpm version. The workspace itself installs with
one command:

```bash
pnpm install --frozen-lockfile
```

Do not use `npm install` or commit another package-manager lockfile.

## Root commands

| Command | Purpose |
|---|---|
| `pnpm generate:contracts` | Generate TypeScript, schema documents, and fixtures from canonical v1 inputs |
| `pnpm format:check` | Check formatting without writing files |
| `pnpm lint` | Run ESLint and workspace-boundary enforcement |
| `pnpm typecheck` | Strictly type-check every workspace |
| `pnpm test` | Run unit, contract, privacy/redaction, and tooling tests |
| `pnpm test:integration` | Run synthetic authentication/session, infrastructure, audit/outbox, registry, source-ingestion, and public-profile integration tests |
| `pnpm test:security` | Run abuse, recovery, authorization, gates, source-retrieval, and No Social Credit tests |
| `pnpm infra:up` | Generate local secrets and start the core PostgreSQL/queue/storage/mail/API/worker stack |
| `pnpm infra:smoke` | Exercise migrations, jurisdiction/public-role/source/profile constraints, retry/DLQ, storage isolation, and Verus-off health |
| `pnpm infra:down` | Stop the local stack while preserving named volumes and generated secrets |
| `pnpm build` | Build packages, server workers, native bundles, and web surfaces |
| `pnpm check:contracts` | Reject generated drift and validate OpenAPI, schemas, fixtures, and policy metadata |
| `pnpm check:api-compat` | Reject unapproved breaking changes relative to the parent contract |
| `pnpm --filter @rmr/contracts mock` | Run the loopback-only synthetic v1 mock server |
| `pnpm check:dependencies` | Fail on high or critical production dependency advisories |
| `pnpm check:licenses` | Reject unknown or unapproved production dependency licences |
| `pnpm check:secrets` | Scan source for high-confidence credential/key patterns |
| `pnpm mobile:config:check` | Validate isolated native environments and false-by-default high-risk gates |
| `pnpm mobile:bundle-budget` | Check generated native/web JavaScript and static-asset size budgets |
| `pnpm mobile:sbom` | Emit the production mobile CycloneDX dependency SBOM |
| `pnpm check` | Run the complete local CI-equivalent foundation suite |

The core workspace build and test commands require no database, queue, object storage,
mail catcher, Verus node, wallet, identity, key, external endpoint, or real civic record.
Issue #9 integration checks are deliberately separate and documented in
`docs/LOCAL_INFRASTRUCTURE.md`.

Issue #12 authentication tests use only synthetic verifier/delivery ports and in-memory
stores. Every account and privileged-access gate remains false in `.env.example` and the
Dokploy Compose foundation.

Issue #55 connector tests inject a synthetic resolver and transport. They make no live
network request. The production connector execution path rejects all production
capabilities, and `SOURCE_INGESTION_ENABLED` is false in local and Dokploy examples.

Issue #11 tests use only in-memory synthetic profile projections and the generated
mock client unless `pnpm infra:smoke` is run. The API exposes no write route. Profile
responses remain available with Verus stopped and all high-risk flags false.

The initial Expo toolchain currently reports one moderate advisory in the transitive
`xcode -> uuid@7.0.3` native-project generator path. RMR does not call that UUID API or
ship it as application civic behavior. CI blocks high/critical advisories and GitHub
dependency review while the Expo upstream path is monitored; no untested major-version
override is applied.

## Applications

- `apps/mobile`: Expo iOS/Android read-only discovery pilot using the generated API client.
- `apps/web`: responsive read-only discovery PWA and generated-client consumer.
- `apps/portal`: representative portal placeholder.
- `apps/admin`: administration/moderation placeholder.
- `apps/api`: built-in Node HTTP adapter exposing health plus typed, read-only synthetic
  jurisdiction, public-role registry, and source-backed public-profile reads.
- `apps/worker`: no-job worker process proving the worker build boundary.

Start local application surfaces with `pnpm dev:web`, `pnpm dev:api`, or
`pnpm dev:mobile`. No public or production hostname is configured.

## Native development builds

The repository uses Expo continuous native generation. Native `ios/` and `android/`
directories are generated, ignored artifacts rather than hand-maintained source in this
foundation issue.

```bash
pnpm mobile:prebuild:ios
pnpm mobile:prebuild:android
```

iOS native compilation requires a supported macOS/Xcode environment. Android native
compilation requires the supported Android SDK/JDK environment. CI regenerates and
compiles unsigned development applications on the corresponding runners. Secure storage,
strict app links, private push boundaries, version compatibility, and a disabled
VRSCTEST-only wallet transport harness are configured by issue #61. Real signing and push
credentials remain in protected platform/EAS stores; no production release is authorized.

See [the native mobile guide](./NATIVE_MOBILE.md) and
[mobile release runbook](./runbooks/MOBILE_RELEASE.md).

## DCO commits

Every contribution commit must use the configured contributor identity:

```bash
git commit -s -m "Describe the change"
```

CI checks every pull-request commit for a valid `Signed-off-by:` trailer.
