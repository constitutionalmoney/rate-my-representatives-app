# No Social Credit policy and enforcement baseline

**Version:** `no-social-credit-policy.v1`
**Status:** Issue #57 repository enforcement foundation; synthetic data only; release blocked.

This policy is a product, architecture, data, analytics, AI, mobile, and governance
invariant. It does not enable accounts, participation, analytics export, advertising,
runtime AI, representative scoring, attestations, cross-product sharing, Verus, provenance,
VRSCTEST, mainnet, or a participatory pilot. No feature flag can override this policy.

## Covenant

> No social credit scores shall be created with this technology by Civic Ledger AI Ltd.
> or Checks and Balances Committee Ltd., or in any implementation that either company
> develops, operates, governs, or licenses.

The prohibition applies to explicit values and to equivalent behavior under another name.
A label such as trust, risk, quality, eligibility, reputation, integrity, influence, or
engagement does not make a generalized citizen judgment permissible.

## Scope and distinction

The protected subject is a citizen, participant, account holder, visitor, contributor,
representative acting as a private person, or any person inferred from device or activity.
Protected inputs include account security, identity/attestation, location, private civic
activity, moderation/abuse state, notification subscriptions, browsing behavior,
cross-product activity, and AI-inferred traits.

Source-backed assessment of a public-role record is different. A versioned method may
evaluate one public office, term, duty, or candidacy using allowlisted public-role and public
source records. Citizen attributes cannot enter that method. A public-role result cannot be
repurposed as a citizen value and is still subject to the separate methodology release gate.

## Prohibited outcomes and uses

The application must never create, infer, store, expose, purchase, sell, license, export,
or use:

- generalized citizen reputation, civic worth, trustworthiness, risk, or eligibility;
- loyalty, conformity, ideology, political, association, or lawful-speech profiles;
- a rank or prediction about a person's character, beliefs, or future civic behavior;
- public individual participation, signals, ratings, evidence, subscriptions, or browsing;
- commercial or advertising targeting based on civic or political activity;
- housing, employment, credit, insurance, mobility, benefit, service, or other unrelated
  access decisions based on civic activity or narrow application state;
- portable or cross-context account, attestation, eligibility, moderation, abuse, or
  participation state;
- a combined value derived from multiple purpose-limited states;
- silent linkage with Checks and Balances, Civic Ledger AI, Constitutional Money, or any
  other product to form a citizen profile;
- AI-inferred citizen traits or automated exercises of human civic intent; or
- citizen data as an input to public-role scoring or methodology.

These are hard denials, not false-by-default experiments. A configuration switch, operator
role, consent checkbox, contract amendment, customer request, or AI provider cannot turn
them on. A material proposal that conflicts with the Covenant must be rejected, not gated.

## Purpose-limited state register

A narrow state is permitted only for one named application purpose. It remains private,
non-portable, non-combinable, inaccessible for unrelated decisions, and subject to a reason
and review right. Production retention periods and operational rights handling remain
blocked on issues #23 and #45.

| State | Exact purpose | Allowed data | Allowed principals | Reason / review |
|---|---|---|---|---|
| Authentication status | Establish or end one application session | Account security | Account service, security auditor | Generic external reason; access/correction |
| Attestation status | Evaluate one separately approved attestation requirement | Identity attestation | Identity service, security auditor | Purpose-specific reason; access/correction/appeal |
| Action eligibility | Authorize one defined action under one versioned method | Identity attestation, jurisdiction location | Identity and participation services, security auditor | Purpose-specific reason; access/correction/appeal |
| Rate limit | Limit one route family for abuse and availability | Account security, moderation/abuse | Account and moderation services, security auditor | Generic external reason; access/correction/appeal |
| Evidence submission | Track one submission through due process | Private civic activity, moderation/abuse | Moderation service, security auditor | Purpose-specific reason; access/correction/appeal |
| Moderation decision | Decide one case under one policy version | Moderation/abuse | Moderation service, security auditor | Purpose-specific reason; access/correction/appeal |
| Representative authorization | Authorize one scoped representative/staff action | Account security | Account and moderation services, security auditor | Purpose-specific reason; access/correction/appeal |
| Security incident | Contain and review one incident | Account security, moderation/abuse | Account service, security auditor | Generic external reason; access/correction/appeal |
| Account compromise | Recover and protect one compromised account | Account security | Account service, security auditor | Generic external reason; access/correction/appeal |

The canonical exact-purpose strings, retention-class placeholders, and principal lists live
in `packages/domain/src/no-social-credit.ts` and the generated policy contract. New state
kinds require privacy/security review, this register, a contract change, and proving tests.

## Enforcement by surface

### Database and domain boundaries

PostgreSQL separates account, identity, participation, moderation, public registry,
provenance, signer, and audit domains. The public API runtime has no account, identity, or
participation schema access. Smoke tests reject generalized citizen-score columns and views.
Future aggregate queries require an approved suppression/differencing method before access.

### Schemas, APIs, events, and exports

Public JSON Schemas use positive allowlists and reject private civic and identity fields.
Contract validation and static scans reject generalized citizen-value fields. Audit/outbox
payload guards recursively reject private civic inputs and generalized profile outputs.
There is no general citizen export or cross-product export path in this foundation.

Representatives, staff, and public readers receive no individual civic activity. A route or
serializer that would reveal it must fail closed even when a caller is authenticated.

### Analytics and observability

Analytics is a positive allowlist for coarse operational quality only. It cannot carry a
stable citizen identifier, representative choice, browsing history, political attribute,
narrow state, or cross-product key. Logs, traces, metrics, crash reports, session replay,
support bundles, and debugging metadata recursively redact sensitive keys and reject
generalized-profile-shaped fields.

Small-cell, repeated-query, cohort-intersection, longitudinal, and auxiliary-data attacks can
re-identify aggregates. No participatory aggregate is approved until issues #37 and #43
define and test suppression, differencing, and release review. Until then, publish no such
aggregate.

### AI and agents

AI and agent code cannot infer citizen traits, create generalized values, combine narrow
states, exercise human civic intent, or include citizen data in public-role methodology.
Runtime AI remains disabled. A future AI provider review must cover prompts, outputs,
retention, training use, sub-processors, human review, adversarial tests, and deletion.

### Mobile clients

Push, crash, and telemetry payloads use minimum data and reject protected keys. Native and
web clients do not receive privileged datasets and cannot connect directly to Verus RPC.
The current mobile wallet harness is disabled and unrelated to this policy foundation.

### Cross-product and commercial use

RMR data cannot be silently joined to another product's identity, behavior, payment,
marketing, or civic records. A shared corporate relationship, common authentication
provider, customer instruction, or separately hosted service is not authorization. No
commercial targeting profile, audience segment, data-broker feed, or targeted civic ad is
permitted.

## Required impact assessment

Every pull request, RFC, and feature request must answer all nine fields:

1. **Citizen data:** classes collected, derived, received, or exposed.
2. **Purpose:** one specific application purpose and why each input is necessary.
3. **Ranking or prediction:** whether a person is ranked, predicted, classified, or inferred.
4. **Access:** actors, services, roles, serializers, and public/private boundaries.
5. **Retention:** lifecycle, deletion, backup, legal hold, and unresolved duration.
6. **Reason and appeal:** external reason, access/correction, objection, appeal, and review.
7. **Cross-product use:** joins, providers, common identifiers, exports, or commercial use.
8. **Unrelated access effect:** any effect outside the exact application action.
9. **Proving tests:** negative, schema, SQL, analytics, AI/agent, mobile, and release evidence.

`None` is acceptable only with a concrete explanation. Missing or ambiguous answers block
review. Reviewers must inspect semantics and data flows, not only field names.

## Rights, reasons, review, and reporting

Purpose-limited states require an understandable reason appropriate to the abuse and privacy
risk. People must have a route to request access and correction; states affecting an action,
moderation, evidence, authorization, or security response require appeal/review where safe.
Production workflows, deadlines, identity verification, deletion exceptions, and the final
public contact are not approved by issue #57 and remain follow-on policy work.

Report a suspected violation privately through the route in
[`SECURITY.md`](../SECURITY.md#report-privately). Do not post personal data, exploit detail,
or an unpatched data flow in a public issue. A suspected No Social Credit path is a
security/privacy incident. Preserve redacted evidence, stop the affected computation,
disable the narrowest unsafe path, protect safe public reads, and involve privacy/security
owners before restoration.

The public policy is this document. It intentionally does not invent a production contact,
response deadline, legal conclusion, or completed rights process.

## Release gate

The generated `no-social-credit-policy.v1` fixture is `blocked`. It does not authorize a
participatory pilot. Approval requires all of the following to be independently evidenced:

- database joins and storage;
- public serializers and authorization;
- events and exports;
- analytics and aggregate differencing;
- AI/agent behavior;
- mobile telemetry;
- cross-product controls;
- public-role methodology separation;
- rights and reporting; and
- independent review.

Every evidence category must be `approved` with a reference, all blockers must be closed,
a named owner must be assigned, and production legal/privacy review must be approved. A
schema-valid approval record is necessary but not sufficient: governance and external facts
must be verified. Repository CI proves only the synthetic enforcement foundation.

## Unresolved production blockers

- Production legal/privacy review and jurisdiction-specific obligations.
- Concrete retention, deletion, objection, correction, and appeal workflows (#23/#45).
- Aggregate suppression and differencing method plus adversarial evidence (#37/#43).
- Production AI, analytics, telemetry, provider, and sub-processor reviews (#18/#20/#58).
- Complete cross-product data-flow inventory and independent enforcement review.
- Named privacy, security, incident, and release owners with tested runbooks.

Until those decisions are complete, accounts, participation, individual civic activity,
participatory analytics, AI analysis, commercial use, and public aggregates remain outside
this issue's operational scope.

## Change control and evidence

ADR 0018 records the decision. Canonical inputs are the domain policy, JSON Schema, and
synthetic fixture; generated TypeScript is committed and drift-checked. CI runs unit,
contract, integration, static, privacy/redaction, and live database smoke tests. Changes to
hard prohibitions require rejection if they weaken the Covenant. Changes to a narrow state
require an RFC, privacy/security review, versioned contract update, and negative tests.

This version supplies foundation evidence only. It provides no production assurance and
makes no claim that a hosted deployment, real data, native device flow, AI provider,
aggregate, or independent review has passed.
