# Development foundation

**Status:** Issues #8, #12, and #9 foundation. No civic feature, public account service,
Verus write, or production backing service is operational.

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
| `pnpm generate:contracts` | Generate TypeScript from the foundation OpenAPI and JSON Schema inputs |
| `pnpm format:check` | Check formatting without writing files |
| `pnpm lint` | Run ESLint and workspace-boundary enforcement |
| `pnpm typecheck` | Strictly type-check every workspace |
| `pnpm test` | Run unit, contract, privacy/redaction, and tooling tests |
| `pnpm test:integration` | Run synthetic authentication/session integration tests |
| `pnpm test:security` | Run abuse, recovery, authorization, gates, and No Social Credit tests |
| `pnpm infra:up` | Generate local secrets and start the core PostgreSQL/queue/storage/mail/API/worker stack |
| `pnpm infra:smoke` | Exercise migrations, retry/DLQ, storage isolation, and Verus-off health |
| `pnpm infra:down` | Stop the local stack while preserving named volumes and generated secrets |
| `pnpm build` | Build packages, server workers, native bundles, and web surfaces |
| `pnpm check:contracts` | Reject uncommitted generated-contract drift |
| `pnpm check:dependencies` | Fail on high or critical production dependency advisories |
| `pnpm check:licenses` | Reject unknown or unapproved production dependency licences |
| `pnpm check:secrets` | Scan source for high-confidence credential/key patterns |
| `pnpm check` | Run the complete local CI-equivalent foundation suite |

The core workspace build and test commands require no database, queue, object storage,
mail catcher, Verus node, wallet, identity, key, external endpoint, or real civic record.
Issue #9 integration checks are deliberately separate and documented in
`docs/LOCAL_INFRASTRUCTURE.md`.

Issue #12 authentication tests use only synthetic verifier/delivery ports and in-memory
stores. Every account and privileged-access gate remains false in `.env.example` and the
Dokploy Compose foundation.

The initial Expo toolchain currently reports one moderate advisory in the transitive
`xcode -> uuid@7.0.3` native-project generator path. RMR does not call that UUID API or
ship it as application civic behavior. CI blocks high/critical advisories and GitHub
dependency review while the Expo upstream path is monitored; no untested major-version
override is applied.

## Applications

- `apps/mobile`: Expo development-client placeholder for iOS and Android.
- `apps/web`: responsive public-app placeholder and generated-client consumer.
- `apps/portal`: representative portal placeholder.
- `apps/admin`: administration/moderation placeholder.
- `apps/api`: built-in Node HTTP adapter exposing only `GET /api/v1/health`.
- `apps/worker`: no-job worker process proving the worker build boundary.

Start local placeholder surfaces with `pnpm dev:web`, `pnpm dev:api`, or
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
compilation requires the supported Android SDK/JDK environment. CI generates each native
project on its corresponding runner. Store signing, credentials, push, secure storage,
wallet links, and release builds are not configured by issue #8.

## DCO commits

Every contribution commit must use the configured contributor identity:

```bash
git commit -s -m "Describe the change"
```

CI checks every pull-request commit for a valid `Signed-off-by:` trailer.
