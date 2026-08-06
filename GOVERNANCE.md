# Project Governance

## 1. Scope

This document governs the official `constitutionalmoney/rate-my-representatives-app` repository and official Rate My Representatives releases.

Rate My Representatives is an open-source project stewarded by **Checks and Balances Committee Ltd.** The source code is available under Apache-2.0, but the official repository, product roadmap, release process, hosted services, trademarks, and designation of official deployments remain under the stewardship described here.

## 2. Steward

Checks and Balances Committee Ltd. is responsible for:

- appointing and removing maintainers;
- accepting or declining proposed changes;
- approving release scope and release gates;
- protecting project trademarks and official-status designations;
- deciding whether optional Verus, Checks and Balances Protocol, AI, scoring, or other high-impact features may be enabled;
- maintaining the No Social Credit Covenant as a project invariant;
- authorizing changes to repository licensing or governance; and
- operating or designating official hosted services.

Open-source permission to use or fork the code does not grant authority to speak for the official project or operate an official deployment.

## 3. Maintainers

Maintainers are appointed in writing by the steward. Maintainers may review pull requests, triage issues, manage releases within delegated authority, and enforce contribution and conduct policies.

Maintainer status does not by itself create employment, compensation, equity, committee membership, fiduciary status, or authority outside the delegated repository role.

A maintainer must disclose material conflicts of interest. A conflicted maintainer must not be the sole approver of a change affecting the conflict.

## 4. Decision classes

### Routine implementation decisions

Routine changes may be approved through ordinary pull-request review when they:

- implement an accepted issue;
- preserve documented product boundaries;
- pass tests and security checks;
- do not alter public methodology, privacy commitments, identity semantics, release gates, or governance; and
- do not introduce an incompatible public API or data migration without a documented plan.

### Request for Comments decisions

An RFC is required for changes that materially affect:

- public-role identity semantics;
- representative-signal or category-rating rules;
- Civic Signal monitoring behavior;
- eligibility or verified-human requirements;
- moderation, dispute, correction, response, or appeal rights;
- Light Mathematics methodology or any public indicator;
- the No Social Credit Covenant or its enforcement;
- VerusID, VDXF, Verus Mobile, on-chain publication, or identity-update behavior;
- collection, retention, disclosure, or deletion of sensitive data;
- public API compatibility;
- security boundaries;
- official subdomains or trust roots; or
- a mainnet deployment decision.

An RFC must state the problem, alternatives, data and privacy impact, threat-model impact, migration path, tests, rollback plan, and unresolved questions. Public discussion informs the decision; it does not replace the steward's responsibility to decide.

### Reserved decisions

The following require express approval by Checks and Balances Committee Ltd.:

- changing the repository licence;
- changing project governance;
- granting official deployment, certification, or brand status;
- enabling a Representative Accountability Score;
- enabling mainnet writes;
- enabling an identity-update flow that asks a representative or participant to publish data to a VerusID;
- entering a commercial, grant, regulatory, or data-sharing commitment on behalf of the project; and
- changing the No Social Credit Covenant.

## 5. Inbound contributions

Accepted contributions are licensed under Apache-2.0. Contributors retain their copyright unless a separate signed written assignment applies.

Every commit must carry a DCO sign-off:

```text
Signed-off-by: Name <email@example.com>
```

The sign-off certifies the statements in `DCO.txt`. It is not a copyright assignment.

## 6. Release governance

Every release must identify:

- the exact source revision;
- enabled and disabled feature flags;
- database and API compatibility;
- applicable methodology and policy versions;
- known coverage gaps;
- security and privacy review status;
- mobile platform and wallet compatibility where applicable;
- rollback and incident procedures; and
- whether any Verus feature is disabled, VRSCTEST-only, or approved for mainnet.

A feature is not operational merely because its code was merged. It becomes operational only through an approved release whose gates have passed.

## 7. Corrections and historical integrity

Documentation, public methods, and public records should be corrected through explicit versioning and visible supersession where silent replacement would mislead users. Provenance can prove a commitment to bytes; it cannot make a factual claim true or eliminate correction rights.

## 8. Forks and official status

Forks are permitted by Apache-2.0. A fork must use distinct branding and may not imply sponsorship, endorsement, certification, affiliation, official committee status, or operation by Checks and Balances Committee Ltd. without written permission.

## 9. Amendments

This governance document may be amended by Checks and Balances Committee Ltd. Amendments apply prospectively to official project governance and do not revoke rights already granted under Apache-2.0 for released repository content.
