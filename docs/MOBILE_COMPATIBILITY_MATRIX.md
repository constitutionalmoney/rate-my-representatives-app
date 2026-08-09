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
| RMR development artifact | Foundation CI run `31278349175`, Android job `93155477705`, commit `f326c85e4bbaafac29945ed5788092f4d896358e` |
| RMR debug APK SHA-256 | `C45040CA58DFD5DC7CBF5A106F1C876E6C22B91C801FF9E8014414944C307AA0` |

The alternative package `org.autonomoussoftwarefoundation.verusmobile.android` version
`1.0.34` is not an RMR target. No wallet profile credential, address, identity, key,
balance, or wallet content was read, recorded, or used for this inventory.

### Issue #61 device results

| Test | Status |
|---|---|
| Installed package/version/SDK read-back | Pass |
| Installed base APK digest | Pass |
| `verus:` scheme resolves to pinned package | Pass |
| Explicit no-key synthetic launch from RMR development app | Pass; opened `com.verusmobile/.MainActivity` |
| Malformed/no-key request fails closed without a write | Pass; wallet reported an incompatible generic-request protocol version |
| Exact environment callback returns to RMR | Pass; exact public challenge reference was correlated |
| Bounded synthetic polling reaches a terminal state | Pass; two-attempt synthetic poll ended `declined` |
| Wrong challenge | Pass; callback route opened but correlation failed and the request remained pending |
| Wrong environment | Pass; `rmr-staging:` could not resolve into the development package |
| Replay | Pass; replay after completion caused no second polling transition |
| Expiry | Automated expiry tests pass; no five-minute device wait was used as protocol evidence |

The issue #61 test never creates a valid `GenericRequest`, wallet signature, identity link,
authentication session, transaction, RPC request, or chain write. Signed
`LoginConsentResponse` compatibility belongs to issue #31.

The device flow used only the deliberately malformed public URL
`verus://request/synthetic-public-envelope`. Verus Mobile failed it closed with
`Unrecognized or incompatible generic request protocol version`. The test did not inspect
or use a wallet profile, address, balance, identity, credential, or network response.

## Issue #30 read-only discovery — Pixel 9 Audit

| Component | Tested value |
|---|---|
| RMR package | `com.ratemyrepresentatives.app.dev` |
| RMR version | `0.1.0` (`versionCode` 1; minimum SDK 24; target SDK 36) |
| Device-targeted APK | x86_64 debug build, 64,234,659 bytes |
| APK SHA-256 | `55C731F74CAFF764046DC8AAC7F41CAB53A7EC590621EAB30084FFF5F7330F2C` |
| Native alignment | 17 x86_64 libraries and 51 ELF LOAD segments; every applicable segment is at least 16 KiB aligned |
| Packaging checks | APK Signature Scheme v2 and `zipalign -c -P 16 -v 4` pass |
| Data boundary | Synthetic public records only; no wallet, identity, private location, signal, or chain data used |

### Device results

| Test | Status |
|---|---|
| Canada and United States country-only finite decks | Pass |
| Person, office, district, and office-term entities remain distinct | Pass |
| Support and Concern open an unsaved local preview | Pass; no submission or confirmation path exists |
| Skip and finite-deck completion retain no judgment | Pass |
| Full sourced-record detail and correction/method fields | Pass |
| Custom-scheme profile deep link | Pass |
| Validated public cache with API unavailable | Pass; explicit offline-copy notice shown after process restart |
| 150% Android font scale | Pass; country controls and all card actions remained reachable without horizontal clipping |
| Minimum action target size | Pass; visible card actions measured 146 Android pixels high on the 420 dpi AVD |
| TalkBack service and touch exploration | Pass; service bound on-device and all primary actions exposed descriptive accessibility nodes |
| Drag-free alternative | Pass; every gesture action has a button and keyboard/D-pad country activation succeeded |
| Swipe shortcut safety with TalkBack | Pass; `Enable swipe shortcuts` changed from checked to unchecked when TalkBack became active |
| Reduced-motion system setting | Pass; the read-only flow remained usable with all three Android animation scales set to zero |
| Optional dependency boundary | Pass; public browsing ran with Verus and every high-risk feature gate disabled |

The Android test changed only temporary RMR development state. Font, animation, TalkBack,
accessibility-service, notification-permission, ADB reverse, and staged-APK state were restored
after the run. The installed `com.verusmobile` package remained untouched, and no wallet content
or credential was inspected.

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

Issue #30 also exports the iOS bundle and verifies shared discovery state, public-cache rules,
deep-link parsing, accessibility labels, scalable text, and drag-free controls in automated
tests. A signed iOS device, VoiceOver rotor, and physical-device Dynamic Type run were not
available from the Windows development host and remain iOS release gates.
