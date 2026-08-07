# Continuous integration foundation

CI runs with read-only repository permissions unless a specific GitHub check requires
additional read access.

## Required checks

- formatting, ESLint, strict type checking, unit/contract/integration/security tests, and
  boundary tests;
- generated OpenAPI/JSON Schema drift;
- server and web build matrix;
- iOS and Android Expo prebuild matrix on platform-appropriate runners;
- dependency review, high/critical production advisory audit, and production licence allowlist;
- local-pattern and Gitleaks secret scanning; and
- DCO sign-off for every pull-request commit.

An ephemeral core-infrastructure job also starts PostgreSQL, RabbitMQ, isolated object
storage, Mailpit, API, and worker; runs live migration/seed, retry/DLQ, policy, and
Verus-off health smoke checks; and always tears down without selecting VRSCTEST. Issue
#19 extends that job with transactional audit/outbox rollback, immutability, lease,
retry/dead-letter/replay, idempotent delivery, role, and safe-metrics checks.

The CI environment contains only synthetic foundation behavior. It does not receive
database credentials, wallet material, Verus RPC access, production endpoints, or civic
data. A successful check does not make an application feature operational.

Issue #12 security checks cover one-time authentication challenges, session rotation and
replay revocation, recovery, scoped roles, route/domain authorization, privileged-session
requirements, secure client storage policy, audited feature gates, privacy redaction, and
No Social Credit prohibitions.
