# Mobile infrastructure foundation

Expo continuous native generation is configured in `apps/mobile`. The templates in this
directory produce the Apple Universal Link and Android App Link documents for one exact
environment. Render them with `scripts/render-mobile-associations.mjs`; do not substitute
values in the tracked templates or reuse signing identifiers between environments.

Store signing, push credentials, Apple team IDs, Android certificate fingerprints, and
distribution access remain in protected platform/EAS environments. The tracked EAS
profiles select separate app IDs and remote credential records but contain no credential.

See `docs/NATIVE_MOBILE.md` and `docs/runbooks/MOBILE_RELEASE.md`. Association-file
publication, signed builds, device compatibility evidence, and store release require
their explicit release gates. The representative VerusID signer/RPC path is server-only
and must never be added here.
