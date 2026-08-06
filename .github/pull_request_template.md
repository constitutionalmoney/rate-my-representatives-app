## Issue and requirements

Closes #

PRD requirement IDs:

- FR-

Accepted RFC/ADR, if applicable:

## What changed

Describe the smallest complete behavior implemented by this pull request.

## Product and status effect

Select one and explain:

- [ ] Documentation/governance only
- [ ] Internal foundation; no user-visible capability
- [ ] Disabled feature behind a false-by-default flag
- [ ] VRSCTEST-only experiment
- [ ] Pilot capability subject to release gates
- [ ] Existing operational capability change

This pull request does **not** make a planned feature operational by itself.

## Terminology and product boundaries

Confirm the change preserves applicable distinctions:

- [ ] Civic Signal means monitoring/briefings; representative signals mean human support/concern judgments.
- [ ] Skip creates no representative signal.
- [ ] Person, office, district, term, election, and candidacy remain separate.
- [ ] Public-role identity exists without Verus.
- [ ] Evidence, category ratings, community context, official responses, AI analysis, indicators, and representative signals remain separate.
- [ ] No composite Representative Accountability Score is exposed while disabled.
- [ ] Mirror-State/Direct Republic/treasury/reserve/AxeTax work is not introduced as a core dependency.

Explain any non-applicable item or approved exception:

## Architecture and data

Describe:

- entities/state machines changed;
- database migrations and constraints;
- OpenAPI/JSON Schema changes;
- generated clients;
- audit and outbox events;
- feature flags;
- public/private serializers;
- rebuild/migration/rollback behavior.

## Security and privacy

Describe:

- actors, authentication, authorization, and recent-presence checks;
- data classification and retention;
- logging/analytics/crash-report redaction;
- abuse/threat cases considered;
- source/SSRF/file risks, if applicable;
- No Social Credit impact assessment;
- whether precise location, political opinions, identity/attestation, private civic activity, representative authorization, or moderation data is affected.

Checklist:

- [ ] No secret, private key, WIF, seed phrase, wallet file, credential, production token, or real private test data is included.
- [ ] No precise location, individual signal/rating, identity evidence, private staff evidence, moderator note, or private correspondence leaks to public APIs, telemetry, fixtures, or provenance.
- [ ] No generalized citizen reputation, loyalty, ideology, eligibility, or social-credit value is introduced.
- [ ] Security-sensitive details were not placed in a public issue.

## Mobile and accessibility

Platforms affected:

- [ ] iOS
- [ ] Android
- [ ] Responsive web/PWA
- [ ] Representative portal
- [ ] Admin console
- [ ] None

Describe device/OS coverage, deep/app links, secure storage, push behavior, offline/degraded state, and performance impact.

Checklist:

- [ ] Gesture actions have visible equivalents.
- [ ] VoiceOver/TalkBack/keyboard/dynamic type or font scaling/reduced motion were tested as applicable.
- [ ] Errors, status changes, confirmations, charts, and source/provenance state are accessible.
- [ ] Sensitive screens do not use unsafe session replay or telemetry.

## Verus impact

Select all that apply:

- [ ] None
- [ ] Optional VerusID proof of control
- [ ] Verus Mobile request/response
- [ ] Representative-controlled IdentityUpdateRequest
- [ ] VDXF namespace/schema
- [ ] Server-controlled provenance
- [ ] RPC/node/signer operations
- [ ] Public verifier

For any Verus impact, state:

- network (`VRSCTEST` unless separately approved);
- exact daemon, Verus Mobile iOS/Android, client, primitives, and schema versions tested;
- current-approved-release check;
- identity/key custody boundary;
- payload public-field allowlist and size preflight;
- idempotency/reconciliation;
- confirmation/reorganization/readback behavior;
- decline/cancel/timeout/revocation/recovery behavior;
- feature flag and rollback.

Checklist:

- [ ] Native/browser clients never connect directly to authenticated RPC.
- [ ] The application never receives a user's private key or seed.
- [ ] Any identity update is optional and not required for profile existence or correction.
- [ ] No unconfirmed/mismatched chain state is labeled verified.
- [ ] Provenance is not represented as factual truth.
- [ ] Mainnet writes are impossible unless separately approved.

## Sources, third-party rights, and AI assistance

List new dependencies, datasets, APIs, media, copied/adapted material, and their exact licences/terms/attribution.

AI-assisted development disclosure, if material:

- tool/model family:
- portions affected:
- source/licence review performed:
- human verification and tests:
- unresolved uncertainty:

Checklist:

- [ ] `THIRD_PARTY_NOTICES.md` / `DATA_LICENSE.md` inventory is updated where required.
- [ ] No fabricated source, quote, representative, office, approval, or test result is presented as real.
- [ ] Runtime AI cannot submit human civic intent or official authority.

## Tests and evidence

Commands run and results:

```text

```

Evidence added:

- [ ] Unit tests
- [ ] Database/constraint tests
- [ ] Contract/generated-client tests
- [ ] Integration/E2E tests
- [ ] Native iOS tests
- [ ] Native Android tests
- [ ] Accessibility tests
- [ ] Privacy/redaction/No Social Credit tests
- [ ] Security/abuse tests
- [ ] VRSCTEST/Verus Mobile/provenance tests
- [ ] Backup/recovery or migration tests
- [ ] Manual review evidence

## Migration, rollout, and rollback

Describe database/data migration, feature cohort, release gates, monitoring, stop conditions, rollback, and correction/supersession behavior.

## Known limitations and follow-up

List unresolved limitations honestly and link follow-up issues.

## Contributor checklist

- [ ] Commits include DCO `Signed-off-by` lines.
- [ ] The change is tied to an issue/RFC and remains within scope.
- [ ] Formatting, linting, type checking, tests, contract checks, licence checks, dependency review, and secret scanning pass.
- [ ] Documentation and operational/testnet/disabled status language are accurate.
- [ ] The repository remains buildable without optional Verus services unless the tested task explicitly requires the optional profile.
