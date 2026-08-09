# Authentication, roles, sessions, and feature-gate foundation

**Status:** Issue #12 security core; synthetic and disabled by default. No public account
service or civic write is operational.

**Requirements:** FR-AUTH-001 through FR-AUTH-007.

This document describes the implemented synthetic issue #12 core. The broader accepted
policy for identity, representative authority, attestations, eligibility, consent,
recovery, and optional wallet proof is
[`AUTH_AND_IDENTITY.md`](./AUTH_AND_IDENTITY.md). That policy does not make its planned
workflows operational.

## Security boundaries

The implementation keeps these concepts independent:

1. authentication method (`passkey` or `verified_email`);
2. authentication assurance (`basic` or `phishing_resistant`);
3. actor type (`anonymous`, `human`, or `service`);
4. one or more scoped, effective-dated role grants;
5. privileged-session state;
6. verified-human, attestation, jurisdiction eligibility, representative authority, and
   optional VerusID state, none of which issue #12 implements or infers.

Public reads remain anonymous. A Verus dependency is not present in `@rmr/auth`, and
Verus is never the sole basic-account path. Authentication records must remain separate
from public profiles and private civic activity when issue #9 adds persistence.

## Authentication contracts

`@rmr/auth` defines provider ports instead of implementing passkey cryptography, email
delivery, or recovery-token verification itself. A production adapter must use reviewed
WebAuthn and email providers and satisfy the committed generated schemas before a gate
can be enabled.

- Passkey requests use at least 32 random bytes, short expiry, server-created request IDs,
  discoverable credentials without account hints, one-time consumption, and a verifier
  that returns an opaque local account ID only after WebAuthn validation.
- Verified-email and recovery starts always return the same generic response shape. A
  delivery or unknown-account result is not exposed to the caller.
- Completion errors use one `AUTHENTICATION_FAILED` contract for unknown accounts,
  invalid tokens/assertions, expired requests, consumed requests, and replay.
- Recovery completion revokes every existing account session before credential rebinding.

The in-memory challenge and session stores exist for deterministic tests only. They are
not production persistence and must not be used by a hosted service.

## Session policy

Sessions are server-created, device-aware, hashed at rest, revocable, and rotated. The
caller cannot select a session ID. Only a token hash is stored; the presented token is
returned once to the authenticated client. A successful rotation replaces the current
token and retains the prior hash only for replay detection. Reusing the prior token
revokes the session family.

The service supports session history, revoke-one, revoke-all, sign-out, credential-
recovery revocation, deletion revocation, expiry, and device-mismatch handling. Session
records use an opaque device ID, a user-visible label, and platform—not raw fingerprinting
or precise location.

Privileged sessions are separate, short-lived sessions. They require a passkey,
`phishing_resistant` assurance, and a maximum 15-minute lifetime. A moderator or
administrator role grant alone is insufficient.

For web clients, the session policy requires a `__Host-` cookie with `Secure`, `HttpOnly`,
`Path=/`, no `Domain`, and `SameSite=Lax`. State-changing cookie-authenticated requests
also require exact-origin validation and a session-bound synchronizer CSRF token. Session
replay recording and third-party analytics are forbidden on authentication, civic-intent,
wallet, representative, and moderation screens.

For native clients, session material may be written only through an adapter declaring
iOS Keychain or Android Keystore protection. Plain application storage is rejected. On
sign-out, deletion, device-compromise response, or session revocation, the secure vault
and every private client cache must be cleared. No native account UI is enabled yet.

## Actor roles

An actor can hold multiple grants. Every grant has a scope, effective start, optional end,
and independent revocation time.

| Role | Actor type | Baseline boundary |
|---|---|---|
| Participant | Human | Human participation only when its specific gate and eligibility policy later allow it |
| Evidence contributor | Human or explicitly scoped service | Submit review-bound evidence/context; never establishes truth |
| Representative/candidate | Human | Scoped official actions for an approved office term; claim workflow remains disabled |
| Authorized staff | Human | Delegated office-term scope and effective dates; cannot exceed the grant |
| Moderator/reviewer | Human | Separate phishing-resistant privileged session plus active grant |
| Administrator | Human | Separate phishing-resistant privileged session plus active grant |
| Civic Agent/service | Service | Declared review-draft scopes only |

The `HumanIntentCommand` type requires a `HumanActorContext`. At runtime, any service
credential is rejected from representative signals, category ratings, comments as a
person, official responses, and wallet approvals even if a mistaken role grant exists.
Route authorization and domain authorization both deny by default.

## Feature gates

All 24 gates are typed, strict-boolean, audited on evaluation, and false when absent.
They cover:

- passkey, verified-email, recovery, account access/export/correction/deletion, and
  privileged access;
- participation, representative signals, category ratings, community context, evidence,
  Civic Signal, and AI research;
- optional VerusID linking/proof, application-local and Verus-supported representative
  claims, identity updates, CBC attestation, provenance writes, VRSCTEST anchoring, and
  composite scoring.

Unsafe dependency combinations fail configuration loading: a Verus identity update
requires application-local representative claims and VerusID linking; a Verus-supported
representative claim requires both; anchoring requires provenance writes. Enabling a gate
is necessary but never sufficient for release. Verus proof requires VerusID linking, and
composite scoring additionally requires category ratings and community context. The
evaluator emits a privacy-minimized allow/deny record to a required sink. Issue #19 will
supply durable audit/outbox storage;
issue #12 does not pretend an in-memory test sink is a production audit log.

## Account lifecycle

Access, export, correction, and deletion have typed service ports and separate false-by-
default gates. Deletion also revokes all sessions after the lifecycle adapter accepts the
request. Production adapters, retention behavior, and transactional persistence belong
with issue #9 and later privacy/legal review.

Every future lookup involving email, VerusID, representative claims, or attestations must
use generic enumeration-resistant responses. Issue #12 implements that behavior for the
email and recovery paths and leaves the unimplemented classes disabled.

## No Social Credit enforcement

The public account-security projection is structurally empty. Tests reject account state,
abuse state, attestation state, authentication tier, or role grants as generalized citizen-
score inputs and reject citizen reputation, loyalty, conformity, trustworthiness, or civic
rank outputs. Security and abuse controls remain purpose-limited access decisions.

## Contract and route status

Committed JSON Schemas generate authentication, session, role-grant, and feature-gate
TypeScript types. Route policies declare authorization and gate requirements, but issue
#12 does not expose those planned authentication endpoints through the minimal issue #8
HTTP handler. Issue #60 owns the complete OpenAPI v1 surface and generated clients.

Tests use `.invalid` addresses, opaque synthetic IDs, fake verifier ports, and no external
service. They cover unit, generated-contract, integration, abuse, recovery, session,
route/domain authorization, secure-storage policy, CSRF, redaction, and No Social Credit
behavior.
