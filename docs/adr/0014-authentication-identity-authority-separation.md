# ADR 0014: Separate Authentication, Identity, Authority, and Attestation

- **Status:** Accepted
- **Date:** 2026-08-09
- **Issue:** [#3](https://github.com/constitutionalmoney/rate-my-representatives-app/issues/3)
- **Requirements:** FR-AUTH-001 through FR-AUTH-007 and FR-VID-001 through FR-VID-007

## Context

RMR needs anonymous public access, local accounts, scoped human and service roles,
representative/staff authority, optional VerusID proof, human attestations, jurisdiction
eligibility, and privileged operations. These facts have different issuers, lifetimes,
revocation paths, evidence, and privacy risks.

Treating them as one verification ladder would let stronger authentication create
authority, let a VerusID imply humanity or office, let an attestation imply locality or
truth, or turn security state into a citizen reputation score. The current codebase has a
synthetic deny-by-default security core and native storage/link boundaries, but no hosted
account, claim, attestation, eligibility, or wallet workflow.

The representative identity strategy also changed after issue #50: initial directory
identities and activity publication are administrator-controlled under issues #80–#83.
Representative-controlled identity updates are not authorized by the initial model.

## Decision

Adopt [`docs/AUTH_AND_IDENTITY.md`](../AUTH_AND_IDENTITY.md) as the canonical policy.

1. Model authentication method/assurance, actor role, VerusID control, human attestation,
   jurisdiction eligibility, representative authority, and privileged-session state as
   independent facts.
2. Allow anonymous public reads; require passkey or verified email for future basic
   accounts; require a separate phishing-resistant session for moderator/admin actions.
3. Use revocable rotating server sessions and platform Keychain/Keystore storage; forbid
   tokens and private state in URLs, logs, analytics, crash reports, and public caches.
4. Make representative claims and staff delegation application-local, reviewed,
   effective-dated, expiring, revocable, appealable, and fully usable without Verus.
5. Treat optional VerusID proof as current control of an immutable i-address for one
   challenge only. It cannot establish humanity, locality, office, eligibility, or truth.
6. Require signed, session-bound, expiring, single-use `GenericRequest` /
   `GenericResponse` flows with exact audience, network, nonce, signer, response,
   identity-state, recovery/revocation, and compatibility checks before linking.
7. Keep `IdentityUpdateRequest` separate from login. The superseded representative-
   controlled flow remains unauthorized unless a new governance issue approves it.
8. Consume only minimum status through a `HumanAttestationProvider`; never import raw
   provider identity evidence. Attestation and eligibility remain separate.
9. Require purpose-specific consent, conflict checks, local review/appeal, privacy-
   minimized audit, and false-by-default feature gates.
10. Reject any use of account, authentication, role, attestation, eligibility, security,
    abuse, or private civic state as a generalized citizen score or reputation.

Issue #3 changes documentation and regression tests only. It adds no runtime route,
persistence, provider, credential, wallet operation, Verus dependency, or chain write.

## Consequences

- Public browsing and representative authorization have no mandatory Verus dependency.
- Each future workflow must prove its own permission facts instead of inheriting a
  generalized trust tier.
- Recovery of one fact does not silently restore another; expiry and revocation are
  evaluated independently.
- Public role, account identity, private participation, moderation, signer, and public
  provenance domains remain separately authorized and retained.
- Downstream issues need more explicit schemas, state machines, expiry/revocation logic,
  appeal paths, and tests, but authorization decisions become reviewable and fail closed.

## Rejected alternatives

### One verified-user ladder

Rejected because the model would conflate authentication, humanity, eligibility,
authority, and privilege and create both authorization errors and social-credit risk.

### Require Verus for representative claims or accounts

Rejected because the canonical RMR record and application-local due process must work
during wallet, signer, RPC, provider, or chain outage.

### Let a provider send raw identity evidence to RMR

Rejected because the application needs a minimum status result, not a duplicate KYC or
identity-document store.

### Preserve the issue #50 representative-controlled update model

Rejected for the initial implementation because issues #80–#83 establish RMR-managed
directory identities. Any later custody handoff needs fresh governance and release
evidence.

## Follow-up

- Issues #62, #31, and #38 implement claims/delegation, optional Verus proof, and the
  attestation provider boundary respectively.
- Issues #80–#83 govern the separate RMR-managed representative Verus path.
- Every owning issue must keep sensitive gates false until its contracts, migrations,
  privacy/security tests, operational evidence, and release approvals exist.
