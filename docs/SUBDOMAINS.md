# Rate My Representatives — Subdomain and Deployment Plan

**Apex domain:** `ratemyrepresentatives.com`  
**Status:** Recommended production namespace; DNS and services are not asserted to be live

## 1. Design rules

- The marketing site and civic application remain separate deployments and databases.
- Public, participant, representative, moderator, developer, wallet-callback, verifier, and status trust boundaries use distinct hosts.
- Do not expose internal queues, databases, object storage, dashboards, signers, or Verus RPC through public DNS.
- Use HTTPS everywhere, HSTS after validation, restrictive CORS, host allowlists, and environment-specific origins.
- Do not use wildcard cookies across all subdomains.
- Native clients use versioned API hosts and verified Universal Links / Android App Links.

## 2. Recommended public hosts

| Host | Purpose | Authentication | Data class | Launch phase |
|---|---|---|---|---|
| `ratemyrepresentatives.com` | Multi-page product explanation, prelaunch status, early access, public legal pages | Public/admin for marketing only | Marketing/waitlist | Existing separate site |
| `www.ratemyrepresentatives.com` | Redirect to apex | Public | None | Immediate |
| `app.ratemyrepresentatives.com` | Responsive public web app and installed-PWA fallback | Public + participant sessions | Public profiles and scoped account data | Read-only pilot onward |
| `api.ratemyrepresentatives.com` | Versioned API for native, web, portal, admin, and approved integrators | Route-specific | All application domains through policy | Foundation |
| `connect.ratemyrepresentatives.com` | Universal/App Links, wallet request landing, QR handoff, HTTPS callback and return flow | Signed challenge/result | Short-lived wallet and linking state | Verus pilot |
| `portal.ratemyrepresentatives.com` | Representative/candidate and staff profile claims, responses, correction requests | Strong authentication | Representative authorization and drafts | Account phase |
| `admin.ratemyrepresentatives.com` | Moderation and administrative console | Phishing-resistant MFA, restricted network/risk policy | Sensitive moderation and operations | Evidence phase |
| `verify.ratemyrepresentatives.com` | Human-readable provenance manifests, signatures, hashes, txids, and readback verification | Public | Approved public provenance only | Provenance phase |
| `docs.ratemyrepresentatives.com` | OpenAPI, schemas, SDK guides, `auth.md`, methods, developer status | Public | Public technical documentation | Foundation/SDK phase |
| `status.ratemyrepresentatives.com` | Uptime, incidents, dependency degradation, scheduled maintenance | Public; separate status-provider admin | Operational status only | Before pilot |
| `static.ratemyrepresentatives.com` | Versioned approved public assets when a dedicated asset host is justified | Public | Public immutable assets | Optional |

## 3. Native application identifiers

Recommended identifiers, subject to ownership and app-store availability:

```text
iOS bundle ID:      com.ratemyrepresentatives.app
Android package:    com.ratemyrepresentatives.app
URL/app-link host:  connect.ratemyrepresentatives.com
API audience:       https://api.ratemyrepresentatives.com
```

Use separate identifiers for development, staging, and production, for example:

```text
com.ratemyrepresentatives.app.dev
com.ratemyrepresentatives.app.staging
com.ratemyrepresentatives.app
```

Do not allow a development build to accept production wallet callbacks or production push credentials.

## 4. Host-specific responsibilities

### Apex marketing site

Owns:

- public vision and product explanation;
- early-access signup;
- public status and “not operational” disclosures;
- prelaunch privacy and legal pages;
- links into the application and repository.

Must not own:

- representative records;
- accounts or authentication;
- precise location;
- evidence;
- representative signals or ratings;
- moderation;
- Verus callbacks; or
- application provenance.

The marketing and application databases remain separate. Any invitation crossing the boundary uses a narrow API or expiring signed link.

### `app`

- Public profile and record browsing.
- Desktop/mobile-web card deck.
- Participant account, Civic Signal inbox, settings, and participation fallback.
- No moderator or raw representative-claim evidence routes.
- Cookie scope limited to the host or a deliberately narrow shared auth design.

### `api`

- One canonical external API host.
- Version under `/api/v1` rather than creating `v1.api` hostnames.
- CORS allowlist for official origins and native-app rules.
- Separate rate limits and authorization by route and actor.
- Request-body logging disabled on sensitive routes.
- OpenAPI contract published to `docs`.

### `connect`

This host exists to make wallet and native handoff explicit and auditable.

Recommended routes:

```text
/.well-known/apple-app-site-association
/.well-known/assetlinks.json
/verus/request/{publicChallengeId}
/verus/callback
/verus/result/{publicChallengeId}
/mobile/open/{route}
/mobile/fallback/{route}
```

Rules:

- never put secrets, private civic data, or identity evidence in a URL;
- validate the target app and environment;
- allowlist return routes;
- do not become an open redirect;
- use short-lived server state;
- set a strict CSP on fallback pages;
- rate-limit callback and result polling;
- separate testnet and production signing identities/configuration.

### `portal`

- Profile claim and authorization review status.
- Staff delegation.
- Official responses and correction requests.
- Optional VerusID link, signature, and identity-update ceremony.
- No moderator decision controls.

### `admin`

- Reviewer queue and source inspection.
- Disputes, corrections, appeals, and conflicts.
- Methodology/policy version administration within delegated authority.
- Audit and incident views.
- Prefer conditional access, device posture, IP/risk controls, and separate privileged sessions.
- Never share a participant session cookie.

### `verify`

- Public canonical manifest bytes or links.
- Digest, schema, methodology, provenance identity i-address, VDXF key, network, txid, block context, confirmation state, decoded public envelope, match result, and supersession.
- No private account, signal, attestation, evidence, abuse, or moderator data.

### `docs`

Recommended paths:

```text
/openapi/v1/openapi.yaml
/schemas/
/sdk/typescript/
/guides/mobile/
/guides/verus-mobile/
/guides/provenance/
/methodologies/
/policies/
/auth.md
/.well-known/auth.md
/status
```

Every page identifies whether the capability is operational, testnet-only, proposed, or disabled.

### `status`

Keep status infrastructure administratively separate from the principal application so an application outage can still be reported. Do not publish secrets, internal hostnames, private queues, or attack detail.

## 5. Internal-only services

Use private DNS/service discovery, not public subdomains, for:

```text
postgres
queue
object-storage-private
source-fetcher
ai-worker
notification-worker
aggregate-worker
verus-rpc
verus-auth-signer
verus-provenance-signer
verus-anchor-worker
search
observability
backup
```

An internal service may have an operator-only endpoint through a secure access proxy, but it must not be discoverable as an unauthenticated public application.

## 6. Environment naming

Prefer separate zones or clearly segmented hosts:

```text
dev.ratemyrepresentatives.internal        internal development
staging-app.ratemyrepresentatives.com     optional restricted staging UI
staging-api.ratemyrepresentatives.com     restricted staging API
staging-connect.ratemyrepresentatives.com VRSCTEST wallet callback
```

Do not index staging. Require authentication or network restriction. Never use production personal information in lower environments.

For public testnet demonstrations, use conspicuous labeling and separate credentials. Avoid a hostname that users could confuse with production.

## 7. DNS and certificate controls

- Use DNSSEC where operationally supported.
- Use CAA records restricting certificate authorities.
- Automate certificate issuance and expiry alerts.
- Protect registrar and DNS accounts with hardware-backed MFA and role separation.
- Monitor certificate transparency for unexpected certificates.
- Avoid broad wildcard certificates for high-risk hosts when host-specific certificates improve containment.
- Document takeover prevention for decommissioned SaaS/CNAME targets.

## 8. Browser security

Per host:

- strict transport security after testing;
- CSP appropriate to the surface;
- `frame-ancestors` restrictions;
- secure, HttpOnly, SameSite cookies;
- no wildcard `Access-Control-Allow-Origin` on authenticated APIs;
- CSRF protection for cookie-authenticated writes;
- referrer policy that does not leak route state;
- permissions policy minimizing camera, microphone, location, and sensors;
- anti-cache controls for sensitive pages;
- no third-party session replay on civic, identity, wallet, representative, or moderation screens.

## 9. Email hosts

Recommended role addresses must be created and monitored before publishing them. Do not document an address that does not exist.

Potential roles:

```text
security@
privacy@
legal@
support@
representatives@
moderation@
opensource@
```

Configure SPF, DKIM, DMARC, inbound retention, access control, escalation, and incident procedures.

## 10. Rollout order

1. Keep apex marketing site separate.
2. Establish `api`, `app`, and `docs` in non-production.
3. Configure native identifiers and `connect` link-association files.
4. Add `portal` with accounts and representative claims.
5. Add `status` before inviting pilot users.
6. Add `admin` before evidence publication.
7. Add `verify` before any public provenance claim.
8. Enable wallet callbacks only after pinned device tests.
9. Enable production/mainnet hosts only through an approved release.

## 11. Recommended minimum at public read-only pilot

Required:

```text
ratemyrepresentatives.com
app.ratemyrepresentatives.com
api.ratemyrepresentatives.com
docs.ratemyrepresentatives.com
status.ratemyrepresentatives.com
```

Add `connect` only if an enabled mobile/wallet flow needs it. Add `portal`, `admin`, and `verify` when their corresponding workflows are staffed and reviewed.
