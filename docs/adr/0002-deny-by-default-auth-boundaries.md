# ADR 0002: Deny-by-default authentication and actor boundaries

- **Status:** Accepted for issue #12
- **Date:** 2026-08-06
- **Scope:** Typed security core; no production account launch

## Context

The application needs anonymous public reads, passkey and verified-email accounts,
device-aware sessions, human and service actors, scoped roles, and optional high-risk
capabilities. PostgreSQL, the full OpenAPI surface, native account UI, Verus flows, and
durable audit infrastructure are scheduled separately.

Combining authentication strength, identity evidence, actor role, eligibility, authority,
or attestation into one ladder would create authorization errors and social-credit risk.

## Decision

1. Model authentication method, assurance, actor type, role grants, scope, effective dates,
   and privileged-session state separately.
2. Permit anonymous public queries while every unrecognized route/action denies.
3. Represent human-intent commands with a human-only actor type and repeat the prohibition
   at runtime for service credentials.
4. Use provider ports for passkey, verified-email, recovery, and lifecycle behavior; use
   only synthetic in-memory stores in issue #12 tests.
5. Store only session-token hashes, rotate tokens, revoke on replay, and require a separate
   short phishing-resistant session for privilege.
6. Keep every high-risk gate false by default, reject unsafe dependency combinations, and
   emit a privacy-minimized decision to an audit sink on each gate evaluation.
7. Generate authentication and feature-gate types from JSON Schema without expanding the
   minimal HTTP OpenAPI surface owned by issue #60.
8. Emit no public account-security projection and reject account/abuse/attestation/role
   state as a generalized citizen-score input.

## Consequences

- The core compiles and tests without Verus or infrastructure services.
- Production credential verification, persistence, email delivery, lifecycle processing,
  and durable audit are impossible until explicit adapters are supplied and gates pass.
- Role grants cannot compensate for missing authentication assurance or service-token
  scope.
- A future route must pass both route and domain checks and, when applicable, an audited
  feature gate.

## Rollback

Issue #12 writes no database or external identity state. Reverting its commits removes
the typed policies, schemas, and synthetic tests without a data migration.
