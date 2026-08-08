# Mobile compatibility matrix

This file records redacted native compatibility evidence. It must never contain a wallet
profile password, seed phrase, private key, WIF, wallet file, RPC credential, private civic
data, address inventory, balance, JWT, or production identifier.

## Android synthetic transport — Pixel 9 Audit

| Component | Pinned value |
|---|---|
| Device | Android Studio AVD `Pixel_9_Audit` (`sdk_gphone16k_x86_64`) |
| OS | Android 17, API 37, x86_64 16 KiB image |
| Display | 1080 by 2424 at 420 dpi |
| Verus wallet | Verus Mobile |
| Android package | `com.verusmobile` |
| Version | `1.1.0-5` (`versionCode` 1010005) |
| SDK declaration | minimum SDK 24; target SDK 35 |
| Installed base APK SHA-256 | `5F7852B0620B1889AE9699A6ED864461A3641BA44A3B0E1731CF03491074A76C` |
| Wallet scheme resolution | `verus:` resolves to `com.verusmobile/.MainActivity` |
| Network boundary | VRSCTEST-only synthetic transport; no wallet network request |
| Request library | None; deliberately non-signable synthetic envelope |
| Verus daemon | Not used by issue #61's transport test |

The alternative package `org.autonomoussoftwarefoundation.verusmobile.android` version
`1.0.34` is not an RMR target. No wallet profile credential, address, identity, key,
balance, or wallet content was read, recorded, or used for this inventory.

### Issue #61 device results

| Test | Status |
|---|---|
| Installed package/version/SDK read-back | Pass |
| Installed base APK digest | Pass |
| `verus:` scheme resolves to pinned package | Pass |
| Explicit no-key synthetic launch from RMR development app | Pending harness artifact |
| Malformed/no-key request fails closed without a write | Pending harness artifact |
| Exact environment callback returns to RMR | Pending harness artifact |
| Bounded synthetic polling reaches a terminal state | Pending harness artifact |
| Wrong challenge, wrong environment, expiry, and replay remain rejected | Automated tests pass; device spot-check pending |

The issue #61 test never creates a valid `GenericRequest`, wallet signature, identity link,
authentication session, transaction, RPC request, or chain write. Signed
`LoginConsentResponse` compatibility belongs to issue #31.

## RMR VRSCTEST authentication service

The RMR-branded `verusid-auth` service is being established at
`https://auth.checksandbalances.services`. It is not issue #61's synthetic transport
dependency. Issue #31 must verify its health, VRSCTEST network, request-signing identity,
RMR relying-party audience and callback, WebSocket delivery, JWT issuer/audience, expiry,
replay handling, rate limits, availability, and key-rotation contract before use.

The authentication signer has no representative VerusID provisioning, representative
identity-update, provenance anchoring, or `contentmultimap` publication authority. Those
retain separate server-side signer roles and false-by-default feature gates.

## iOS

CI compiles an unsigned iOS simulator app. No signed Verus Mobile request is exercised by
issue #61; signed-request iOS wallet compatibility remains an issue #31 release gate.
