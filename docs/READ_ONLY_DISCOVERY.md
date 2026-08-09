# Read-only representative discovery

**Status:** Issue #30 synthetic vertical slice. This is not production representative
coverage and does not enable participation.

## Product boundary

The native iOS/Android client and responsive web/PWA use the generated
`@rmr/contracts` client to read only:

- `GET /api/v1/profiles?countryCode=CA|US`; and
- `GET /api/v1/profiles/{profileId}`.

`packages/discovery` owns the shared finite-deck state and validated public-cache
repository. API order is preserved; there is no ranking, recommendation, randomization,
location inference, or composite score. The current country picker is deliberately a
country-only synthetic fallback until issue #29 supplies an approved minimized
jurisdiction resolver. No address or precise location is requested, stored, logged, or
sent to analytics.

The card makes person, office, district, office term, and candidacy separate. It displays
only API fields. Because the issue #11 contract has no approved image or affiliation
field, the UI says those values are unavailable instead of inventing them. Coverage and
freshness are visible and missing coverage is labeled as a gap, never misconduct.

## Interaction semantics

The deck is finite and ends in an explicit completion state. An empty filtered response
produces an explicit coverage-gap state.

- **Support preview** and **Concern preview** exist only in component memory. There is no
  confirmation or submission command until issue #37 is implemented.
- **Return to card** abandons the preview without retaining an action.
- **Continue without saving** clears the preview and advances without retaining an
  action, event, aggregate input, or identifier.
- **Skip — no judgment** advances without a signal, analytics choice event, or hidden
  inference.
- **Open sourced record** reads the versioned public detail contract.

The repository contains no signal-write route, scoring route, ingestion command, Verus
client, provenance writer, or authenticated dependency for this experience. Every
high-risk Compose and native feature flag remains false by default.

## Public detail

The record view keeps these sections separate:

1. person, office, district, office term/candidacy, and election context;
2. official identifiers and contacts;
3. reviewed claims and supporting/challenging evidence references;
4. source coverage, freshness, conflicts, and explicit gaps;
5. source retrieval and reproducibility metadata;
6. responses, disputes, corrections, and appeals; and
7. publication, profile, coverage, score, AI, signal-aggregate, and provenance methods.

The method section explicitly says a composite score is not included or calculated,
signals are not aggregated, AI content is absent, and public browsing has no Verus
dependency. Synthetic fixture URIs are labels rather than launch targets; only HTTP(S)
source/contact URLs can open externally.

## Offline and recovery

Native uses an Expo cache file and web uses one namespaced local-storage value. If
browser storage is unavailable, web falls back to process memory. The shared repository:

- validates cached values through the generated public-profile contract;
- accepts public profile fields only;
- stores no representative intent, private choice, precise location, account, or token;
- caps the serialized cache at 2 MiB;
- expires entries after seven days;
- caps a network attempt at eight seconds; and
- fails with an explicit unavailable state when no current public copy exists.

The production service worker handles same-origin GET requests only. It caches the app
shell and public profile GET responses only when the API marks them `public`; it ignores
all other API paths, authenticated requests, and every write method. Deep-link navigation
falls back to the cached shell after a successful prior load. `sw.js` is served with
`no-store` by the Dokploy Nginx image so updates are revalidated.

## Accessibility and quality

Native and web expose visible Support preview, Concern preview, Skip, and Open sourced
record controls. Native swipe shortcuts are optional, can be disabled with a switch, and
are disabled automatically while a screen reader is active. Text scaling is enabled,
actions meet a minimum 48-point native target, headings receive screen-reader focus when
the card changes, Android hardware Back exits detail/preview states, and no animation is
required for meaning. Web provides semantic headings, focus-visible controls, responsive
layouts, and a reduced-motion media query.

Release evidence must keep automated, browser, native build, emulator, VoiceOver, and
TalkBack results distinct. CI builds unsigned Android and iOS development artifacts;
device evidence is recorded in `docs/MOBILE_COMPATIBILITY_MATRIX.md`.

## Analytics boundary

Allowed future quality event names are limited to deck load latency, deck errors,
accessibility errors, and deck completion. This slice does not install an analytics SDK
or emit those events. Card choices, skips, support/concern previews, precise location,
political profiling, and session replay are forbidden.

## Verification

Automated verification covers generated-client GET wiring, finite-deck and abandoned
interaction semantics, cache validation/expiry/bounds, PWA routing, safe deep-link
parsing, no-write/no-score boundaries, responsive rendering, and accessible labels.
The Dokploy Compose smoke reads the home page, deep-link fallback, manifest, worker,
health, registry, and synthetic profile routes with every high-risk feature disabled.
