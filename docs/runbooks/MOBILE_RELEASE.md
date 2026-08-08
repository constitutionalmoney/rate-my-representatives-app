# Mobile build and release runbook

This runbook creates development/release candidates. It does not authorize store
publication, production signing, mainnet, or any civic/Verus write feature.

## Local development build

Use the repository-pinned Node and pnpm versions, then:

```bash
pnpm install --frozen-lockfile
pnpm generate:contracts
pnpm mobile:config:check
RMR_MOBILE_ENV=development pnpm mobile:prebuild:android
RMR_MOBILE_ENV=development pnpm --filter @rmr/mobile android
```

On macOS, replace the last two commands with the iOS equivalents. Expo Go is not an
acceptable substitute for this development build.

To exercise only the no-real-key VRSCTEST transport harness in a development build, set
`RMR_VERUS_WALLET_HARNESS_ENABLED=true` before prebuild and compilation. The target is
pinned to package `com.verusmobile`, version `1.1.0-5`; changing either requires a reviewed
compatibility-matrix update. Never enable the harness for a production build. Do not paste
or export a seed, WIF, private key, wallet file, or RPC credential.

## Association documents

Apple team IDs and Android signing fingerprints are public release identifiers but are
supplied from the protected release environment so that each app lane remains isolated:

```bash
RMR_IOS_TEAM_ID=ABCDE12345 \
RMR_IOS_BUNDLE_ID=com.ratemyrepresentatives.app.staging \
node scripts/render-mobile-associations.mjs apple

RMR_ANDROID_PACKAGE=com.ratemyrepresentatives.app.staging \
RMR_ANDROID_SHA256_CERT_FINGERPRINTS=AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA \
node scripts/render-mobile-associations.mjs android
```

Publish the exact Apple document at `/.well-known/apple-app-site-association` and Android
document at `/.well-known/assetlinks.json` on that environment's app-link host. Serve
JSON over HTTPS without redirects, verify the rendered package/bundle ID, and test both
installed-app and web-fallback behavior. Never reuse a staging association in production.

## Candidate gates

1. Generate contracts and verify zero drift.
2. Verify the four public configurations are isolated and all high-risk gates are false.
3. Build unsigned iOS simulator and Android debug apps in CI.
4. Generate and retain the CycloneDX SBOM; pass dependency, licence, secret, and mobile
   configuration checks.
5. Set a valid semantic app version and monotonically increasing platform build numbers.
6. Verify `/api/v1/health/mobile` accepts the contract, app version, and build.
7. Render and deploy the correct association documents.
8. Run VoiceOver/TalkBack, dynamic-type, reduced-motion, switch/no-drag, cold/warm link,
   foreground polling, secure-cleanup, push privacy, offline/degraded, and crash-redaction
   tests on the approved matrix.
9. For a wallet-enabled non-production candidate, record exact OS/device, wallet APK/app
   version and digest, request-library version, VRSCTEST daemon version, link form, and
   success/decline/cancel/expiry/wrong-environment/polling results. Use an isolated test
   profile and no production keys. Append the redacted results to
   `docs/MOBILE_COMPATIBILITY_MATRIX.md`; never record a profile password, seed, private key,
   wallet file, private address inventory, or RPC credential.
10. Confirm release notes list every enabled, disabled, testnet-only, and unavailable
    capability.
11. Obtain protected-environment approval before a signed internal/pilot candidate.
12. Use a separate governance and store-release approval before production publication.

## Rollback, hotfix, and minimum version

- Server/API rollback must preserve the oldest contract version still advertised by the
  compatibility endpoint.
- Prefer a new signed build over an unreviewed over-the-air update; Expo updates are
  disabled in this foundation.
- A compromised build is blocked by raising its platform minimum build only after the
  replacement is available and the incident owner approves the user impact.
- The mobile client checks minimum policy at launch and on foreground return. A blocked
  client shows an update-required state and attempts no private action.
- Rotate affected signing/push credentials in their platform stores; never copy them into
  an issue, log, artifact, or repository file.
- Revoke device/session registrations and clear protected local state where relevant.
- Record rollback cause, affected versions, contract impact, credential actions, and
  disabled features in the release log.
