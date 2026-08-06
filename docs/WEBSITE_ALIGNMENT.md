# Website, Guide, and Application Alignment

**Status:** Canonical reconciliation record  
**Last updated:** 2026-08-05

## 1. Sources reconciled

This document reconciles:

- the current multi-page `ratemyrepresentatives.com` product site;
- the Rate My Representatives Verus Development Guide, version 1.0;
- the repository README and issues that existed before this rewrite; and
- the accompanying website/app/guide audit.

The live website expresses the current public product vision. The Verus guide remains the technical baseline for PostgreSQL, privacy, moderation, VRSCTEST, outbox, idempotency, readback, and provenance-not-truth boundaries. Where the guide or old issues use older product terminology or add unrelated infrastructure, the decisions below control.

## 2. Mobile platform decision

### Previous source state

The guide proposed a responsive PWA first and an optional later native shell.

### Current product decision

Dedicated iOS and Android applications are now **first-class targets** because the product is explicitly mobile-first and needs reliable native push, app-link/deep-link handoff, secure storage, accessibility, and repeated Verus Mobile approval flows.

Responsive web remains required for public access, desktop use, accessibility, installed-PWA fallback, and users who do not install an app.

### Implementation implication

- Keep one versioned API and shared domain/contracts.
- Use React Native/Expo development builds as the starting hypothesis, not an irreversible dogma.
- Prove wallet handoff and accessibility before settling platform architecture.
- Do not wrap the marketing website and call it the native app.

## 3. Civic Signal terminology

### Conflict

The website uses **Civic Signal** for monitoring and briefings. The old guide and issues used “civic signal” for support/concern/no-current-judgment feedback.

### Decision

- **Civic Signal:** monitoring, briefing, notifications, source alerts, correction updates.
- **Representative signal:** a human `support` or `concern` judgment for one office term.
- Rename schema, API, code, analytics, and issue language accordingly.

Civic Signal cannot submit a representative signal or category rating.

## 4. Skip and withdrawal

### Conflict

The website presents `skip` as navigation. The old guide represented `no_current_judgment` as an active signal state.

### Decision

- Skip creates no signal, no public aggregate input, and no hidden event representing judgment.
- Leaving, cancelling, swiping past, timing out, or closing the application also creates no signal.
- A participant with an active signal can use an explicit **Withdraw judgment** action.
- Withdrawal appends an audit event and removes the active signal.

`no_current_judgment` is not an active representative-signal value.

## 5. Public-role digital ID versus VerusID

### Conflict

The website's “Digital ID for Politicians” describes a persistent public-role record. Several old issues moved toward Verus sub-IDs issued beneath jurisdictional reserve identities.

### Decision

The canonical politician identity is the application-native combination of:

- person;
- office;
- district/jurisdiction;
- term or candidacy;
- official identifiers;
- source-backed public actions;
- responses, disputes, and corrections; and
- optional external identity references.

VerusID is optional. No reserve, treasury, parent-ID, or sub-ID hierarchy is required to create or resolve a representative profile.

### Approved Verus use

- proof that a representative or authorized staff member controls a VerusID;
- signing an official response or correction request;
- optional, explicit public-role reference on a representative-controlled VerusID; and
- server-controlled provenance anchors for approved public manifests.

## 6. Politician identity updates through Verus Mobile

### Decision

Use `GenericRequest` / `GenericResponse` for optional proof-of-control after pinned iOS/Android testing.

Use `IdentityUpdateRequest` only for an explicit, optional, VRSCTEST-first public update controlled by the representative. The exact public payload and fee must be shown before approval. The update cannot be bundled with login, required for profile existence, or allowed to contain citizen data, private evidence, or unreviewed allegations.

RMR verifies signatures, network, current identity state, transaction result, and chain readback. Decline or failure leaves the application record intact.

## 7. Evidence eligibility

### Conflict

An old issue required verified-human status before any signal or evidence submission. The website allows the possibility of authenticated, unverified, and anonymous contributions if separately labeled.

### Decision

- Verified human plus jurisdiction eligibility is required for an **authenticated representative signal**.
- Evidence has a separate policy.
- Researchers, journalists, representatives, staff, basic accounts, and distinctly labeled public submitters may be eligible to submit evidence.
- Identity status affects attribution, rate limits, abuse controls, and review priority.
- Identity status does not make a claim true.

## 8. Category ratings and comments

### Gap

The website promises ratings and community contributions beyond quick support/concern, while the old backlog mainly covered signals and evidence.

### Decision

Add:

- versioned structured category ratings; and
- moderated community context/comments.

Keep them separate from:

- representative signals;
- evidence-derived indicators;
- official responses;
- AI analysis; and
- any future Representative Accountability Score.

Authenticated, unverified, and anonymous contributions remain separately labeled and aggregated.

## 9. Scoring and Light Mathematics

### Conflict

The website describes a future **Representative Accountability Score** and approximately ten factor families. The guide uses seven beta display categories and correctly says a composite score is not an assumed deliverable.

### Decision

- **Representative Accountability Score** is the only public product name for a possible composite score.
- **Light Mathematics Protocol** is the public, versioned methodology and governance protocol.
- The methodology must map website factor families to beta display categories rather than maintaining two silent taxonomies.
- Record analysis, community input, source coverage, confidence, AI role, and corrections remain separately inspectable.
- The composite score remains disabled until public method, bias/adversarial/correction testing, privacy/legal review, and reserved governance approval.
- The project may decide never to publish a composite score.

## 10. Six-step website experience

The rendered website describes six steps:

1. start where you live;
2. meet the people behind the offices;
3. swipe in seconds;
4. choose how you participate;
5. see how the result was built; and
6. watch the record change.

The application PRD uses this six-step public story. Older “seven-step” editorial language is superseded unless the website is intentionally changed through a separate content decision.

## 11. Mirror-State and Direct Republic

### Conflict

The website labels Mirror-State as proposed and Direct Republic as a long-term vision. Old issues made treasury identities, reserves, sub-ID hierarchies, and AxeTax part of the core application.

### Decision

- Mirror-State and Direct Republic may appear as clearly labeled non-normative vision context.
- RMR does not depend on a treasury, reserve currency, AxeTax, DEX, token, NFT, PBaaS chain, or jurisdictional Verus parent identity.
- Retain useful nested jurisdiction, effective-date, geometry, and public-memory capabilities independently.
- Move treasury/reserve and AxeTax work out of the core RMR backlog.

## 12. Verus version policy

The old guide contained a dated daemon example. The deployment rule is now:

- verify the current approved mandatory release from official sources before each environment and test cycle;
- parse versions correctly;
- disable writes on an unapproved, unsynced, or wrong-network node;
- record the exact tested release in deployment evidence.

As of this reconciliation, the dated documentation example is `v1.2.17-3`. The runtime policy supersedes the example when a newer mandatory release exists.

## 13. Website/application boundary

### Marketing site owns

- public product explanation;
- early-access signup;
- prelaunch legal/status pages;
- public feature-status and roadmap explanation.

### Application owns

- accounts and authorization;
- representative registry and jurisdiction resolution;
- public records and sources;
- Civic Signal;
- representative signals, ratings, context, and evidence;
- moderation and due process;
- methodology execution;
- native apps;
- Verus Mobile and provenance integration.

The databases remain separate. No marketing waitlist store is reused for civic records or accounts.

## 14. Issue tracker decisions

### Close as superseded or consolidated

- jurisdiction matching duplicate into the stronger resolver issue;
- duplicate representative-signal issue into the corrected confirmation/aggregation issue;
- duplicate evidence submission issue into the safe-ingestion/evidence issue;
- directory-only scaffold issue into the full monorepo scaffold;
- duplicate attestation-provider issue into one provider interface;
- anti-erasure provenance issue into provenance policy and enforcement;
- README rewrite issue as completed;
- treasury/reserve and AxeTax issues as outside core RMR scope.

### Retain but rewrite

- registry/data model;
- source-backed profile API;
- nested jurisdictions without treasury requirements;
- mobile card deck as native iOS/Android plus web;
- optional VerusID account link;
- representative identity update as post-authorization, opt-in, VRSCTEST-first;
- methodology as Light Mathematics;
- Mirror-State as non-normative future context;
- Verus sub-ID registry as deferred research only, never a dependency.

### Add

- Civic Signal subscriptions and briefings;
- official-source ingestion and freshness;
- No Social Credit enforcement tests;
- structured category ratings and moderated context;
- public-role identity and candidacy lifecycle;
- OpenAPI v1;
- native mobile platform/release foundation;
- representative claim and staff delegation;
- representative-controlled Verus Mobile identity update;
- app-store privacy, security, accessibility, and release readiness.

## 15. Final product boundary

The application database answers:

> What does the reviewed public record currently say, under which method, with which sources, participation labels, responses, disputes, and corrections?

Verus answers narrower questions:

> Did this identity approve this request, and can an independent verifier prove that this exact approved public manifest or optional public reference was committed by the stated identity at this point in chain history?

Keeping those questions separate is the controlling architecture decision.
