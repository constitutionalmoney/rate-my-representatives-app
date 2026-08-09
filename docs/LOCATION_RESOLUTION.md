# Privacy-minimized jurisdiction resolution

**Status:** Issue #29 synthetic foundation; disabled by default

**Runtime gate:** `LOCATION_RESOLUTION_ENABLED=false`

## Scope and guarantees

The resolver answers which public jurisdictions, districts, office terms, and
candidacies apply to one submitted Canada or United States location at an effective
date. It does not establish residence, citizenship, voter registration, voter
eligibility, tax status, or entitlement to participate.

All checked data is synthetic. The Canada and United States adapters are separate
provider contracts with invented postal/address fixtures, jurisdiction trees, district
boundaries, office terms, candidacies, coverage gaps, and redistricting versions. The
core workspace builds and tests without Verus or an external geocoder.

## Request-scoped privacy flow

1. The user chooses Canada or the United States and manually enters the provider's
   minimum required input.
2. Web and native clients copy the value into the request and clear their input state
   before awaiting the result.
3. The API enforces content type, schema, a 1 KiB route limit, and a 64 KiB global
   transport limit. Errors never echo submitted data.
4. A country-specific normalizer rejects control, bidirectional-control, markup, and
   malformed input. The adapter receives the normalized value only in request memory.
5. The result contains public application/authoritative IDs, effective dates,
   provider/geometry/licence versions, coverage gaps, and legal non-determinations.
6. The input is discarded. It never enters PostgreSQL, object storage, cache, queue,
   outbox, audit, log, trace, analytics, crash reporting, AI, support export, or Verus.

Ambiguous results use a random opaque, single-use token stored for at most five minutes
in a bounded in-process store. The store retains only public candidate output, never the
submitted value. A restart or expiry safely requires a fresh request.

## Result and recovery states

The typed contract distinguishes `resolved`, `ambiguous`, `unsupported`, `conflicting`,
`stale`, and `provider_unavailable`. The UI displays the state and recovery action rather
than guessing. Ambiguity offers accessible buttons for public candidates; outage offers
retry; every state offers country browsing. Provider and geometry versions, effective
dates, licence, attribution, and coverage gaps remain visible.

Returned applicability spans every provider-declared scope: local, regional,
province/state, federal, and United States special jurisdictions. Each applicable result
links to a canonical office term and candidacy when the synthetic registry contains one;
otherwise it carries an explicit coverage gap. Effective-date tests demonstrate prior
and current boundary versions across a synthetic redistricting.

## Optional broad account preference

Precise resolution never saves anything automatically. With account data access enabled,
an authenticated human may explicitly save one canonical broad
preference: country, province, state, or territory. Municipality, district, boundary,
address, coordinate, postal code, provider query, and ambiguity token are not accepted.

PostgreSQL stores the preference under row-level account isolation. Security-definer
commands validate the canonical jurisdiction/version, hash idempotency keys, and append
payload-free audit events in the same transaction. Delete is explicit and idempotent.
No location-resolution table exists.

## Provider approval and third-party terms

The implemented adapters call no third party and use synthetic `CC0-1.0` fixtures. A
production provider requires a separate reviewed change covering provider terms,
geography/geometry licence and version, permitted transmission, subprocessors, data
residency, retention guarantees, deletion, outage behavior, rate limits, security review,
and a self-hosted or public-data alternative. A provider that retains, resells, trains on,
logs, or profiles submitted locations is not approved by this foundation.

## Operations, migration, and rollback

- Keep `LOCATION_RESOLUTION_ENABLED=false` in ordinary local, CI, Dokploy, and production
  configuration until a provider/geography release review approves otherwise.
- `GET /api/v1/representation/capabilities` remains available while disabled so clients
  can disclose the state and offer country browsing.
- Resolution is payload-free in observability. Analytics may record only country,
  provider ID, and coarse result status.
- Migration `0008_privacy_minimized_location_resolution.sql` adds only broad account
  preferences and hashed idempotency receipts. Run the infrastructure smoke from an
  empty database and an upgraded database before deployment.
- To stop operation, set the gate false. Do not roll back by dropping account rows or
  audit history. If schema correction is required, ship a forward migration preserving
  audit evidence and let users delete their saved broad preference through the command.

## Non-goals

Issue #29 does not add production providers, representative scoring, source ingestion,
Verus identities or updates, provenance writes, public-chain publication, AI location
processing, voter eligibility, automatic account saving, mainnet work, or real civic
records.
