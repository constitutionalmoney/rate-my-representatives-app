# Native mobile foundation

**Status:** Read-only synthetic discovery pilot. No iOS or Android application is
published. All civic writes, representative VerusID provisioning, representative
activity publication, scoring, and mainnet behavior remain disabled.

## Environment isolation

| Environment | App suffix | Scheme | API | App-link host | Verus |
|---|---|---|---|---|---|
| development | `.dev` | `rmr-dev` | loopback | `.invalid` development host | VRSCTEST harness eligible, off by default |
| staging | `.staging` | `rmr-staging` | staging | staging connect host | VRSCTEST harness eligible, off by default |
| pilot | `.pilot` | `rmr-pilot` | pilot | pilot connect host | VRSCTEST harness eligible, off by default |
| production | none | `rmr` | production | `connect.ratemyrepresentatives.com` | disabled |

`apps/mobile/mobile-environments.ts` is the canonical public environment map.
`apps/mobile/app.config.ts` fails on unknown environments and emits all representative
identity/provenance gates as `false`. `RMR_VERUS_WALLET_HARNESS_ENABLED=true` is accepted
only for a non-production VRSCTEST development build. The Android wallet target is pinned
to package `com.verusmobile`, version `1.1.0-5`, as read back from the approved Pixel 9
Audit device. The harness does not enable authentication, identity updates, representative
identity provisioning, or provenance writes.

Signing certificates, provisioning profiles, keystores, Expo push project IDs, Apple team
IDs, and Android certificate fingerprints live in protected environment/platform stores.
They are not committed. Distinct package/bundle IDs ensure each lane resolves a distinct
credential record. Push project IDs are read only from the environment-specific names
`RMR_EXPO_PROJECT_ID_DEVELOPMENT`, `RMR_EXPO_PROJECT_ID_STAGING`,
`RMR_EXPO_PROJECT_ID_PILOT`, and `RMR_EXPO_PROJECT_ID_PRODUCTION`; there is no shared
fallback variable. Production release roles require protected-environment approval.

## Generated API and lifecycle

The installed app imports only the generated `@rmr/contracts` mobile client. It reads the
public API health and mobile compatibility endpoints at launch and whenever the app
returns to the foreground. The Discover area also reads the synthetic public profile list
and detail endpoints through that generated client. The compatibility decision rejects
unsupported contract versions, versions below `minimumAppVersion`, and builds below
`minimumBuildNumber`. Malformed versions fail closed.

The app accepts an initial link for cold launch and link events for warm/background
return. It never trusts linked or pushed profile text; it accepts an allowlisted opaque
reference and refetches current API state.

## Read-only discovery

The default Discover area provides the issue #30 country-only finite deck, explicit
coverage-gap/completion states, local unsubmitted support/concern previews, skip with no
retained judgment, and full sourced detail. The System area retains compatibility and the
disabled-by-default synthetic wallet harness status. The Find area provides issue #29's
accessible manual Canada/United States resolver and always-visible country-browse
fallback. It clears submitted input before awaiting the API and retains only public
match results in component memory. Issue #37 still owns representative-signal confirmation.

An Expo cache file stores only schema-validated public profile responses. Entries expire
after seven days, the serialized cache is limited to 2 MiB, and reads use an eight-second
network budget before a current public copy is considered. No preview, skip, account,
token, address, precise location, or private civic activity is stored. See
`READ_ONLY_DISCOVERY.md`.

## Links and wallet harness

RMR HTTPS links are restricted to the exact environment app-link host and `/app/*`.
Custom schemes are environment-specific. User info, ports, fragments, query parameters,
unknown routes, control characters, unsafe schemes, and mismatched hosts are rejected.

The wallet harness provides transport scaffolding for future issue #31:

1. show the exact expected RMR HTTPS origin;
2. require a current explicit user gesture;
3. require a short-lived public challenge reference and VRSCTEST;
4. open only the pinned `verus:` scheme;
5. fall back to an RMR-controlled HTTPS help route if the wallet is unavailable;
6. bind the return to the exact challenge reference; and
7. recover a terminal result through bounded polling.

When `RMR_VERUS_WALLET_HARNESS_ENABLED=true` is explicitly supplied to a non-production
development build, the native foundation screen exposes an accessible synthetic transport
control. It launches a deliberately non-signable public envelope, accepts only the exact
environment callback, and completes a deterministic bounded polling sequence. The control
is absent by default and cannot be enabled in production.

The harness uses synthetic envelopes in automated tests, never a key. It does not define
a `GenericRequest`, signature verification, callback API, identity update, or RPC call.
Those remain separately gated. RMR-managed representative VerusIDs are provisioned and
published by future isolated server workers (#80-#83), never by this client.

Pinned-device evidence is recorded in
[the mobile compatibility matrix](./MOBILE_COMPATIBILITY_MATRIX.md). A successful synthetic
transport test is not evidence that a signed `GenericRequest` or `GenericResponse` is
compatible; issue #31 owns that separate protocol matrix.

## Secure storage and privacy

Only refresh material, an opaque session reference, and an opaque device-registration
reference may use protected storage. The adapter uses `expo-secure-store`, device-only
Keychain accessibility, and Android Keystore-backed storage. Android backup is disabled.
Every protected key is deleted for sign-out, revoke-all, account deletion, compromise
response, and environment switch.

No precise address, private civic activity, wallet response, representative signer
material, or moderator content is cached. Issue #30 may cache only validated public
profile evidence/source fields already returned by the public API. Crash records retain
only allowlisted operational fields and error type; error messages are discarded.
Third-party session replay is forbidden.

## Push privacy

Push registration requires explicit consent, a physical device, a configured
environment project ID, and native permission. Tokens and backend registrations are
validated and opaque. Rotation creates the replacement before removing the prior
registration. Revocation and unsubscribe remove both backend and native registration.

Payloads contain exactly environment, opaque event ID, and allowlisted route. Quiet
hours, disabled previews, service/public-update categories, and no-payload-trust routing
are enforced in the client boundary. Political summaries, private signals, identity
evidence, and moderation content are rejected.

## Accessibility and quality

The baseline requires scalable text, screen-reader labels and announcements, reduced
motion, at least 44-by-44-point actions, non-biometric authentication fallback, and a
visible alternative to every gesture. Issue #30 native actions use at least 48-point
targets. Optional swipe shortcuts have visible equivalents, can be turned off, and are
disabled automatically while a screen reader is active. Card changes move accessibility
focus to the heading, and Android hardware Back exits detail and preview states.
VoiceOver, TalkBack, switch-control, contrast, and wallet review remain distinct entries
in the device matrix for every release candidate.

See [ADR 0010](./adr/0010-native-mobile-foundation.md) and the
[mobile release runbook](./runbooks/MOBILE_RELEASE.md).
