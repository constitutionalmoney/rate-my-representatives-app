# Continuous integration foundation

CI runs with read-only repository permissions unless a specific GitHub check requires
additional read access.

## Required checks

- formatting, ESLint, strict type checking, unit/contract/integration/security tests, and
  boundary tests;
- generated OpenAPI/JSON Schema drift, structural validation, and parent-contract
  compatibility;
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

A separate Dokploy application-Compose job validates `compose.yaml`, applies the local
port-only override, builds the API and public web images from the repository, waits for
health checks, and verifies the health, mobile-compatibility, and proposed jurisdiction
responses through the public reverse proxy. It always tears the stack down.

The CI environment contains only synthetic foundation behavior. It does not receive
database credentials, wallet material, Verus RPC access, production endpoints, or civic
data. A successful check does not make an application feature operational.

Issue #12 security checks cover one-time authentication challenges, session rotation and
replay revocation, recovery, scoped roles, route/domain authorization, privileged-session
requirements, secure client storage policy, audited feature gates, privacy redaction, and
No Social Credit prohibitions.

Issue #60 adds OpenAPI 3.1 parsing, JSON Schema/fixture validation, required per-operation
policy metadata, human-intent privacy assertions, generated-client checks across all six
consumer surfaces, additive-client/strict-server runtime validation, an isolated mock
smoke, and a breaking-change regression check. CI fetches the parent commit only for
contract comparison; it does not contact a production API.
