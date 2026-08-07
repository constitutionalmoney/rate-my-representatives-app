# Mobile compatibility matrix

This file records redacted native compatibility evidence. It must never contain a wallet
profile password, seed phrase, private key, WIF, wallet file, RPC credential, private civic
data, or production identifier.

## Android synthetic transport — 2026-08-07

| Component | Pinned value |
|---|---|
| Device | Android Studio Pixel 9 AVD (`sdk_gphone64_x86_64`) |
| OS | Android 15, API 35, x86_64 |
| Display | 1080 by 2424 at 420 dpi |
| Verus wallet | `VerusWallet-1.1.0-5.apk` |
| Android package | `com.verusmobile` |
| Version | `1.1.0-5` (`versionCode` 1010005) |
| APK SHA-256 | `08D1D9FDA4AC7E3346912F1EDC91924981823FA3EBC37A9412D1BAFE95E5E5E7` |
| Network boundary | VRSCTEST-only synthetic transport; no wallet network request |
| Request library | None; deliberately non-signable synthetic envelope |
| Verus daemon | Not used |

The emulator also contained legacy Verus Mobile `1.0.34` under the distinct package
`org.autonomoussoftwarefoundation.verusmobile.android`. It was excluded from this test.
No profile credential, address, key, balance, or wallet content from either package was
recorded or used.

### Results

| Test | Result | Evidence boundary |
|---|---|---|
| APK digest and installed package/version read-back | Pass | Local APK hash and Android package manager agree with the pinned inventory |
| `verus:` intent resolution | Pass | Android resolves the browsable intent to `com.verusmobile/.MainActivity` |
| Synthetic `verus://request/...` launch | Pass | Pinned wallet becomes the top resumed activity |
| Malformed/no-key envelope handling | Pass, fails closed | Wallet reports an unrecognized or incompatible generic-request protocol version |
| Key, identity, transaction, RPC, or chain use | Not attempted | The envelope contains no valid request, signature, identity, address, amount, or operation |
| RMR exact return and bounded synthetic polling | Pending harness-enabled RMR artifact | Must be completed before this matrix entry is final |

The malformed-envelope result proves only Android scheme ownership, app launch, and
fail-closed parsing. It does not prove signed `GenericRequest`/`GenericResponse`
compatibility, wallet approval, identity control, authentication, or a Verus write. Those
remain disabled and belong to issue #31.

## iOS

No iOS Verus Mobile device result is recorded. CI compiles an unsigned iOS simulator app,
but signed-request wallet compatibility remains a separate issue #31 release gate.
