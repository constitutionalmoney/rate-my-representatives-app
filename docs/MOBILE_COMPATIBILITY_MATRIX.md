# Mobile compatibility matrix

This file records redacted native compatibility evidence. It must never contain a wallet
profile password, seed phrase, private key, WIF, wallet file, RPC credential, private civic
data, address inventory, balance, or production identifier.

## Android Google Play target — pending Pixel 10

| Component | Required value |
|---|---|
| Device | Android Studio Pixel 10 AVD; exact model/runtime read-back pending |
| OS and SDK | Latest installed Android Studio image; exact versions pending |
| Verus wallet source | Google Play Store |
| Android package | `org.autonomoussoftwarefoundation.verusmobile.android` |
| Version and version code | Pending Play Store installation and package-manager read-back |
| Manifest link schemes | Pending installed-package inspection |
| APK/app-bundle digest | Not locally available for a Play-managed install |
| Network boundary | VRSCTEST only |
| Request library | None for issue #61's deliberately non-signable synthetic envelope |
| Verus daemon | Not used by issue #61's transport test |

A Pixel 9 image previously exposed Google Play wallet version `1.0.34`, but the image and
wallet were not current enough to establish the supported version. A separately sideloaded
`com.verusmobile` application is rejected as the compatibility target and is not part of
the RMR configuration.

### Required issue #61 device results

| Test | Status |
|---|---|
| Installed package and exact Play Store version read-back | Pending |
| Declared wallet scheme resolution | Pending |
| Explicit no-key synthetic launch from the RMR development app | Pending |
| Malformed/no-key request fails closed without a write | Pending |
| Exact environment callback returns to RMR | Pending |
| Bounded synthetic polling reaches a terminal state | Pending |
| Wrong challenge, wrong environment, expiry, and replay remain rejected | Automated tests pass; device spot-check pending |

The issue #61 test never creates a valid `GenericRequest`, wallet signature, identity link,
authentication session, transaction, RPC request, or chain write. Signed
`LoginConsentResponse` compatibility belongs to issue #31.

## External VRSCTEST authentication service candidate

`https://auth.constitution.money/health` reports `verusid-auth` version `1.0.0`, VRSCTEST,
and configured chain/signing identity state as of 2026-08-07. Issue #31 may reuse this
service after its RMR relying-party audience, callback, WebSocket delivery, JWT issuer and
audience, expiry, replay handling, rate limits, availability, and key-rotation contract are
documented and tested.

The service's `CONSTITUTION` request-signing identity is an authentication boundary only.
It does not authorize representative VerusID provisioning, representative identity
updates, provenance anchoring, or `contentmultimap` publication. Those retain separate
server-side signer roles and feature gates.

## iOS

No iOS Verus Mobile device result is recorded. CI compiles an unsigned iOS simulator app,
but signed-request wallet compatibility remains a separate issue #31 release gate.
