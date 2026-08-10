# Identity and Verus Mobile Integration

**Status:** Design baseline; all wallet, provisioning, and publication flows disabled by default
**Network:** VRSCTEST before any mainnet decision  
**Last updated:** 2026-08-09

Application authentication, role, authority, attestation, eligibility, consent, and
recovery policy is canonicalized in
[`AUTH_AND_IDENTITY.md`](./AUTH_AND_IDENTITY.md). The initial representative directory
identity model is RMR-managed under issues #80–#83; issue #50's representative-controlled
update design is superseded and not authorized for initial implementation.

## 1. Identity layers

Rate My Representatives uses four separate concepts:

1. **Public-role identity:** the canonical RMR record for a person, office, district, term, candidacy, public conduct, sources, responses, disputes, and corrections.
2. **Application account:** authentication and authorization for a user of RMR.
3. **VerusID link:** optional proof that an application account controls a particular Verus identity i-address.
4. **Human/eligibility attestation:** a separately issued, time-limited status used for consequential participation.

None substitutes for another.

A public-role profile exists without a VerusID. A VerusID proves control of an identity, not automatically that the controller is a unique human, resident, voter, representative, staff member, or factual truth source.

## 2. Representative and staff authorization

### Application-first claim flow

1. Claimant authenticates with a passkey and strong account protections.
2. Claimant selects the correct person and office term.
3. Claimant declares whether they are the representative/candidate or authorized staff.
4. Claimant supplies only the approved authorization evidence.
5. A reviewer validates the evidence, conflicts, office term, scope, and expiry.
6. The system records `approved`, `rejected`, or `needs_more_information` with reason and appeal path.
7. Approved authorization permits scoped official responses and correction requests.
8. Authorization expires or is revoked independently of any VerusID.

### Verus enhancement

The claimant may optionally:

- link a controlled VerusID;
- sign an authorization or official response;
- approve a public reference on that VerusID; or
- use Verus Mobile as one factor in a profile-claim review.

RMR does not create or control a representative's private keys.

## 3. Verus Mobile compatibility rule

A request type is not production-supported merely because a class exists in a library or development branch.

Before enabling a flow, record:

| Component | Required record |
|---|---|
| Verus Mobile | exact iOS and Android released versions/builds |
| Verus daemon | exact approved release and network |
| `verusid-ts-client` | exact release or commit |
| TypeScript primitives | exact release or commit |
| Request schema | exact key/type and ordinal requirements |
| Transport | exact deep-link and QR form |
| Devices | tested OS/device matrix |
| Results | success, decline, expiry, replay, wrong-chain, recovery, callback tests |

The compatibility matrix is release evidence, not evergreen documentation.

## 4. GenericRequest authentication/proof-of-control

### Server challenge

Create at least 32 bytes of cryptographically secure randomness and bind it to:

- challenge ID;
- application account/session;
- relying-party identity and HTTPS origin;
- purpose (`link_verusid`, `representative_claim`, `sign_response`, or another allowlisted purpose);
- expected network;
- issued time;
- short expiry;
- nonce;
- requested identity constraints, if any;
- return/callback identifier; and
- request schema version.

Store the nonce hashed where practical. Claim it atomically exactly once.

### Signed request

The application request must be signed through a dedicated authentication/request signer role whose current identity state can be resolved. The RMR-branded VRSCTEST `verusid-auth` service is being established at `auth.checksandbalances.services`; issue #31 must validate its health, signer identity, RMR-specific audience, callback, JWT/WebSocket contract, expiry, replay handling, availability, and rotation boundary before use. Its signing material remains outside the general API and native clients.

The wallet must be able to show who is asking, what is requested, and why.

### Transport

- Same-device mobile: explicit `Open in Verus Mobile` action using the pinned supported `verus://` form.
- Desktop/web: QR containing only the signed request envelope.
- Fallback: copy/open instructions only when they do not expose sensitive state.
- Result recovery: polling endpoint keyed by an unguessable public challenge reference.

Never put private account data, political choices, evidence, or raw authorization material in the URL or QR.

### Callback verification

The public HTTPS callback must verify:

1. known request/challenge ID;
2. nonce and atomic unused state;
3. issued/expiry time;
4. expected audience/relying party;
5. expected network;
6. request signature and signer identity state;
7. response signature;
8. response identity i-address;
9. current identity state, revocation, and recovery changes;
10. purpose and requested detail type;
11. initiating account/session binding; and
12. schema/version compatibility.

The application then creates or updates its own local record. The wallet response is not a long-lived application session.

### Failure states

```text
created -> presented -> completed | declined | expired | cancelled
completed -> verified | rejected
rejected reasons:
  replay
  wrong_chain
  wrong_audience
  invalid_signature
  signer_revoked_or_changed
  identity_revoked_or_changed
  expired
  session_mismatch
  unsupported_schema
  callback_forgery
```

Every failure response shown to a user must avoid leaking whether another person's identity or account exists.

## 5. Superseded representative-controlled IdentityUpdateRequest design

> **Current decision:** Issue #50 is closed as superseded. Initial RMR-managed
> representative directory identities and approved activity publication are governed by
> issues #80–#83. Representatives do not control those directory identities or approve
> each activity write through Verus Mobile. The requirements below are retained only as
> safety constraints if a future custody-handoff or representative-controlled update is
> approved through a new governance issue.

### Purpose

If separately approved in the future, an identity update would be an optional way for a
representative-controlled VerusID to carry a small public reference. It is not
authentication, not the RMR database, not a requirement for profile creation, and not
proof that every linked claim is true.

### Initial allowlist

A v1 payload may contain only:

- schema/version;
- environment/network;
- RMR stable public profile ID and HTTPS URL;
- person display name as already public;
- office, district, and term/candidacy reference;
- claim type (`public_role_reference`, `official_response_reference`, `correction_reference`);
- effective and expiry dates where relevant;
- RMR review status;
- public response/correction manifest digest and URL where applicable;
- generated time;
- superseded reference; and
- privacy declaration indicating no private evidence.

It must not contain:

- citizen or participant identity;
- individual representative signals or ratings;
- home address, private contact information, KYC, identity documents, birth data not already lawfully public and required, or staff dossier;
- private keys or wallet metadata;
- unreviewed allegations;
- confidential correspondence or moderator notes;
- hidden tracking identifiers;
- inferred political traits; or
- a citizen score.

### User ceremony

Before the wallet is opened, the RMR interface must show:

- the identity to be updated;
- the network;
- why the update is being requested;
- every public field in human-readable form;
- the exact canonical payload or a view/download of it;
- the fact that blockchain data may be public and durable;
- the estimated fee and who pays it;
- the expiry of the request;
- the effect of approve, decline, timeout, and later correction;
- confirmation that the RMR profile exists without approval; and
- a distinct `Continue to Verus Mobile` control.

The wallet must present the request again. Approval cannot be bundled with login or acceptance of unrelated terms.

### Server verification and readback

After approval:

1. validate the signed result and request binding;
2. record transaction/operation identifier exactly as returned;
3. wait for the approved confirmation policy;
4. resolve the current identity;
5. read the content through the tested current/historical method;
6. decode and validate the payload;
7. compare exact digest to the approved canonical bytes;
8. mark `readback_verified` only on match; and
9. expose public status and supersession.

Never trust `{ "success": true }` from a client without chain and signature verification.

### Cancellation and correction

- Decline or expiry creates no identity update.
- A lost acknowledgement is reconciled before resubmission.
- A chain reorganization returns the update to a recoverable pending state.
- A corrected public-role reference creates a new version linked to the old one.
- The application never silently rewrites an already published on-chain payload.
- Revocation/recovery of the VerusID triggers revalidation of the application link and trust display.

## 6. VDXF namespace

Proposed project-owned names:

```text
ratemyrepresentatives::v1.identity.public_role_reference
ratemyrepresentatives::v1.identity.official_response_reference
ratemyrepresentatives::v1.identity.correction_reference
ratemyrepresentatives::v1.auth.request
ratemyrepresentatives::v1.auth.response
```

Before use:

1. approve namespace ownership/governance;
2. derive each key with `getvdxfid`;
3. store the derived i-address in versioned configuration;
4. publish the human-readable definition;
5. test `getidentity` and `getidentitycontent` on VRSCTEST;
6. test wallet rendering and update support on pinned iOS/Android builds;
7. keep `contentmultimap` values in array form;
8. preserve unrelated identity content through tested read-merge-write behavior; and
9. use compact payloads with a conservative size guard.

Unknown or wrong-namespace keys may not be wallet-compatible. No example i-address may be copied as if it were canonical.

## 7. Application and provenance identities

Maintain separate VRSCTEST signer roles for:

- signing RMR wallet requests through the reviewed `verusid-auth` service; and
- publishing RMR provenance anchors through an independently controlled identity.

The request signer may be accessed only through the reviewed
`auth.checksandbalances.services` contract; RMR must not import its keys or create a
duplicate signer. Request-signing authority does not grant provenance, representative
provisioning, identity-update, or `contentmultimap` authority.

Do not provision treasury, reserve, committee, auditor, or jurisdictional parent identities as core RMR requirements.

For each controlled identity document:

- friendly name and immutable i-address;
- purpose;
- primary authorities;
- minimum signatures;
- revocation and recovery authorities;
- signer inventory;
- funding policy;
- rotation and compromise procedure;
- testnet/mainnet separation;
- last successful readiness and recovery drill.

Signing material never appears in source, client bundles, ordinary `.env` files, general logs, or public CI.

## 8. Checks and Balances Protocol boundary

RMR consumes an approved provider response such as:

```json
{
  "status": "active",
  "issuer": "opaque or public issuer reference",
  "attestationType": "cbc.human.v1",
  "validFrom": "ISO-8601",
  "validUntil": "ISO-8601",
  "jurisdictionScopes": ["ca.bc.example"],
  "assuranceLevel": "approved value",
  "opaqueReference": "non-enumerable audit reference",
  "checkedAt": "ISO-8601"
}
```

RMR must not receive raw identity documents, utility bills, home-address dossiers, face images, committee notes, or private evidence packages.

A human attestation does not automatically prove locality, citizenship, voter eligibility, or the truth of a submission.

## 9. Privacy model

Public status may show that a representative-controlled VerusID is linked or that a public reference was read back. It must not show private challenge data, account identifiers, staff evidence, IP/device signals, or failed-attempt detail that enables targeting.

Citizen VerusID links and individual civic activity must not be joinable through public APIs or public provenance.

## 10. Threat model

The cross-system catalog, evidence status, safe-degradation rules, and incident ownership
are canonical in [`THREAT_MODEL.md`](./THREAT_MODEL.md). Optional account proof,
representative-controlled `IdentityUpdateRequest`, and RMR-managed representative identity
provisioning/activity publication remain three separately authorized threat surfaces.

Required tests include:

- replay and concurrent nonce claim;
- expired request;
- wrong session/account;
- wrong audience;
- wrong chain;
- wrong request signer;
- revoked/recovered request signer;
- revoked/recovered respondent identity;
- malformed detail ordering;
- QR substitution and phishing;
- open redirect or unsafe scheme;
- callback forgery;
- callback SSRF;
- unsupported mobile/library version;
- user approves a different payload than the server records;
- oversized identity update;
- unrelated identity content overwritten;
- duplicate submission after timeout;
- transaction reorganization;
- readback mismatch;
- accidental mainnet write;
- public payload contains disallowed personal data; and
- representative authority expires before completion.

## 11. Feature and environment gates

```text
VERUS_AUTH_ENABLED=false
REPRESENTATIVE_VERUS_CLAIMS_ENABLED=false
VERUS_IDENTITY_UPDATE_ENABLED=false
VERUS_NETWORK=VRSCTEST
```

Mainnet requires separate identity inventory, approved daemon version, wallet compatibility evidence, privacy and security review, governance approval, dry run without broadcast, release change record, and production signing controls.

## 12. Definition of done

A Verus Mobile flow is ready for a limited pilot only when:

- public profiles work without Verus;
- exact dependencies and wallet versions are pinned;
- iOS and Android tests pass;
- challenges are random, short-lived, session-bound, signed, and single-use;
- callbacks are HTTPS and cryptographically verified;
- no private key or seed reaches RMR;
- wrong-chain, replay, revocation, recovery, phishing, callback, and signer-compromise tests pass;
- identity update is optional and shows every public field and fee;
- allowlisted payload validation and privacy tests pass;
- chain readback verifies exact approved bytes;
- failures do not block or corrupt the canonical profile;
- feature flags and rollback work; and
- VRSCTEST evidence is attached to the release decision.
