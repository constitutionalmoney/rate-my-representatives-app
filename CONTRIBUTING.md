# Contributing to Rate My Representatives

Thank you for helping build public-accountability infrastructure that remains source-based, correctable, privacy-preserving, accessible, and resistant to synthetic participation.

## Before contributing

Read:

- `README.md`
- `docs/PRD.md`
- `docs/ROADMAP.md`
- `GOVERNANCE.md`
- `SECURITY.md`
- `docs/NO_SOCIAL_CREDIT.md`
- `DCO.txt`
- `AI_CONTRIBUTIONS.md`

Open or claim an issue before beginning substantial work. For architecture, identity, methodology, privacy, scoring, moderation, public API, Verus, or on-chain changes, use the RFC path described in `GOVERNANCE.md`.

## Contribution licence and sign-off

Repository content is distributed under Apache-2.0 except where a file identifies another licence.

Contributors retain copyright in their contributions unless a separate signed written assignment applies. By submitting an accepted contribution, the contributor licenses it under Apache-2.0.

Every commit must include:

```text
Signed-off-by: Your Name <your.email@example.com>
```

Use:

```bash
git commit -s -m "Describe the change"
```

The sign-off certifies the Developer Certificate of Origin 1.1 in `DCO.txt`. It is not a copyright assignment.

## Product invariants

A contribution must not violate these rules:

1. PostgreSQL and approved source records remain canonical; Verus is optional identity and provenance infrastructure.
2. Public browsing must not require a VerusID.
3. Public-role identity is an application record; a Verus reference is optional.
4. Civic Signal means monitoring, briefing, notification, and source alerts.
5. A representative signal is a separately confirmed human `support` or `concern` judgment.
6. Skip creates no signal. Withdrawal is explicit and auditable.
7. Representative signals, category ratings, comments, evidence, official responses, and AI analysis are different record types.
8. Identity or attestation status affects authorization and labeling; it does not make a claim true.
9. AI cannot vote, rate, sign, impersonate a person, manufacture civic opinion, or publish a disputed allegation without accountable human review.
10. No citizen social-credit score or generalized civic reputation score may be created.
11. No private key, seed phrase, WIF, wallet file, identity dossier, precise address, private representative signal, or private evidence may enter source control, public issues, logs, analytics, or on-chain content.
12. Provenance proves commitment to bytes, not truth.
13. Corrections remain visible where silent replacement would mislead.
14. Public profiles must continue to work when AI, Verus, wallet, notification, or source dependencies are degraded.
15. No composite Representative Accountability Score may launch before the approved Light Mathematics methodology and all release gates exist.

## Development expectations

### Keep changes narrow

Each pull request should implement one coherent issue or RFC. Large changes should be decomposed into reviewable contracts, domain rules, migrations, services, clients, and tests.

### Foundation commands

Use the pinned Node.js and pnpm versions from `.node-version` and `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm check
```

Use `pnpm generate:contracts` after changing OpenAPI or JSON Schema inputs. Generated
files are committed and `pnpm check:contracts` rejects drift. Native projects use Expo
continuous native generation; run `pnpm mobile:prebuild:ios` on macOS or
`pnpm mobile:prebuild:android` with the corresponding native toolchain.

### Domain logic first

Put state machines, invariants, and authorization decisions in shared domain packages. Route handlers and UI components must not invent alternative rules.

### Contracts before clients

For API changes:

1. update the OpenAPI or JSON Schema contract;
2. update generated types or clients;
3. implement the server behavior;
4. implement native and web clients; and
5. add contract and integration tests.

### Mobile and accessibility

Every gesture needs a visible equivalent. Test iOS and Android with screen readers, dynamic type/font scaling, switch control, reduced motion, keyboard or hardware input where applicable, and no-drag operation. The web interface must meet WCAG 2.2 AA.

### Privacy

Use data minimization and separate security domains. Do not log request bodies for precise-location, authentication, wallet callback, identity, evidence, signal, moderation, or administrative routes. Add redaction tests rather than relying on developer discipline.

Complete the nine-field No Social Credit impact assessment required by
[`docs/NO_SOCIAL_CREDIT.md`](./docs/NO_SOCIAL_CREDIT.md). No feature flag, consent flow,
customer request, or operator role can override a hard prohibition.

### Sources and evidence

A material public claim requires an attributable source, retrieval state, freshness, coverage state, and correction path. Do not copy copyrighted material beyond what the project is permitted to store or display. Record source licences and terms where relevant.

### Verus development

- Use VRSCTEST before any mainnet decision.
- Pin the exact daemon, Verus Mobile, `verusid-ts-client`, and primitives versions used in a test matrix.
- Do not assume a development-branch request type is supported by released mobile wallets.
- Never expose authenticated RPC publicly.
- Keep signing material outside general API and client processes.
- Make writes asynchronous, idempotent, size-checked, confirmation-aware, and read back from chain.
- An `IdentityUpdateRequest` must be optional, show the complete public payload and fee, and pass explicit governance, privacy, compatibility, and rollback gates.

## Pull-request checklist

A pull request should state:

- linked issue or RFC;
- user-visible and operational effect;
- affected entities and state transitions;
- security and privacy impact;
- migration and rollback plan;
- mobile, web, API, worker, or Verus compatibility impact;
- tests added or changed;
- documentation changed; and
- feature flags and release gates.

Before review:

- [ ] Commits are DCO-signed.
- [ ] Formatting, type checking, unit tests, contract tests, and relevant integration tests pass.
- [ ] No secrets or personal information are present.
- [ ] Database migrations are reversible or have a documented recovery path.
- [ ] Logs and analytics are reviewed for sensitive fields.
- [ ] UI changes have accessible non-gesture controls.
- [ ] Public claims and feature-status language are accurate.
- [ ] Third-party licences and notices are recorded.
- [ ] AI-assisted work complies with `AI_CONTRIBUTIONS.md`.

## Security reports

Do not open a public issue for a vulnerability, leaked credential, identity attack, privacy bypass, wallet exploit, or active abuse technique. Follow `SECURITY.md`.

## Conduct

Be specific, evidence-based, and respectful. Disagreement with a policy, political position, representative, institution, or contributor is not a licence for harassment, dehumanization, doxxing, threats, or partisan enforcement of project rules.
