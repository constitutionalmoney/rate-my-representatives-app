# ADR 0010: React Native and Expo native application foundation

- Status: Accepted
- Date: 2026-08-07
- Issue: #61

## Context

Rate My Representatives needs dedicated iOS and Android clients with generated API
contracts, native secure storage, app links, push notifications, accessible interaction,
and a future same-device Verus Mobile handoff. A marketing-site WebView and Expo Go do
not exercise those native boundaries.

The repository already shares strict TypeScript contracts and mobile design tokens.
The candidate Android wallet artifact was inspected locally as inventory only:
`VerusWallet-1.1.0-5.apk`, package `com.verusmobile`, version `1.1.0-5`, minimum SDK 24,
target SDK 35, SHA-256
`08D1D9FDA4AC7E3346912F1EDC91924981823FA3EBC37A9412D1BAFE95E5E5E7`. Its manifest
registers the `verus` scheme. This confirms a candidate transport surface, not request
compatibility or wallet approval behavior. No device result or production-support claim
is inferred from manifest inspection.

## Decision

Use React Native 0.86 with Expo 57 development builds and continuous native generation.
Commit TypeScript configuration and plugins; regenerate `ios/` and `android/` in CI and
for each release rather than treating generated native projects as hand-edited source.
Use development builds—not Expo Go—for native integration testing.

The decision includes these boundaries:

- development, staging, pilot, and production have distinct bundle/package IDs, schemes,
  API origins, app-link hosts, release channels, and signing credential records;
- all generated clients consume the versioned `@rmr/contracts` API client;
- session material uses Keychain/Keystore-backed storage and an allowlist of keys;
- Universal/App Links are preferred for RMR callbacks; environment-specific custom
  schemes are accepted only for allowlisted internal routes;
- the no-real-key `verus:` launch/return/polling harness is disabled by default,
  VRSCTEST-only, non-production, and does not create or validate a Verus request;
- representative VerusID signer keys, RPC, provisioning, and `contentmultimap` writes
  never enter the mobile process;
- push is consent-first, uses an opaque registration, and accepts only minimal route and
  event payloads;
- crash records use an allowlist and never include exception messages or civic, identity,
  source, wallet, or moderation payloads;
- sensitive-screen session replay is prohibited; and
- updates are disabled until a separately reviewed over-the-air release policy exists.

Unsigned development apps compile in CI. Signing stays in protected platform/EAS
credential stores and never runs for untrusted pull requests. Production publication is
not authorized by this ADR.

## Evidence and requirements

| Concern | Foundation evidence |
|---|---|
| Wallet | Strict `verus:` authorization, exact callback binding, RMR HTTPS fallback, bounded polling, expiry/decline tests; device matrix still required before enabling |
| Links | AASA/assetlinks templates, environment-isolated hosts, malicious-link tests |
| Storage | `expo-secure-store`, device-only Keychain accessibility, Android backup disabled, complete cleanup tests |
| Push | Native adapter, consent/device/permission gates, token validation and rotation, quiet hours, private previews, categories, unsubscribe |
| Accessibility | Scalable text, live status announcements, 44-point action rule, reduced-motion/no-drag/session-replay policy |
| Lifecycle | initial-link and event-link handling plus foreground compatibility refresh and polling recovery |
| Release | isolated EAS profiles, remote credentials, unsigned CI compilation, version/build compatibility policy, rollback runbook |
| Security | secret/dependency/licence checks, generated configuration policy, privacy-safe crash envelope, CycloneDX SBOM |

Initial bundle budgets are 5 MiB per uncompressed JavaScript bundle and 20 MiB for
uncompressed packaged static assets. Pilot quality targets are a 3-second p75 cold start
on the approved mid-tier test device and at least 99.5% crash-free sessions. These are
release gates to measure, not measurements claimed by this foundation.

## Alternatives considered

- Expo Go: rejected as integration evidence because it does not prove the app's native
  plugins, identifiers, signing, links, or wallet handoff.
- Fully hand-maintained native projects now: rejected because no demonstrated native
  requirement yet outweighs continuous generation and the shared TypeScript surface.
- WebView wrapper: rejected because secure storage, push, app links, accessibility,
  lifecycle recovery, and wallet handoff are first-class native requirements.
- Separate Swift and Kotlin clients now: deferred because it doubles delivery and
  contract-maintenance cost before a platform-specific need has been demonstrated.

## Reconsideration triggers

Open a superseding ADR/RFC if pinned-device evidence shows that Expo prebuild cannot
support a required wallet callback, passkey/biometric control, accessibility behavior,
background task, security control, performance budget, or store rule. The RFC must
include affected screens/modules, a measured failure, migration cost, contract-sharing
impact, and staged rollback plan.

## Consequences

Native project regeneration must be deterministic and reviewed after SDK/plugin changes.
Real signing, push projects, association identifiers, store records, and device results
remain protected environment/release evidence. The core application continues to build
and test without Verus, credentials, or production data.
