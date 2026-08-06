# Continuous integration foundation

CI runs with read-only repository permissions unless a specific GitHub check requires
additional read access.

## Required checks

- formatting, ESLint, strict type checking, unit/contract tests, and boundary tests;
- generated OpenAPI/JSON Schema drift;
- server and web build matrix;
- iOS and Android Expo prebuild matrix on platform-appropriate runners;
- dependency review, high/critical production advisory audit, and production licence allowlist;
- local-pattern and Gitleaks secret scanning; and
- DCO sign-off for every pull-request commit.

The CI environment contains only synthetic foundation behavior. It does not receive
database credentials, wallet material, Verus RPC access, production endpoints, or civic
data. A successful check does not make an application feature operational.
