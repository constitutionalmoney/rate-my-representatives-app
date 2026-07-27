# rate-my-representatives-app

The application behind **Rate My Representatives**.

- Public app URL: `https://app.ratemyrepresentatives.com`
- Marketing site: `https://ratemyrepresentatives.com`

## What this repository is

This repository contains the civic-accountability platform:

- accounts and authorization
- jurisdiction matching
- representative profiles
- data ingestion and source freshness
- verified civic signals
- evidence submission and moderation
- representative responses, corrections, and appeals
- methodology execution
- Verus/VDXF provenance integrations
- application privacy and security controls

The marketing site, waitlist, and public feature-status pages live in the separate [`rate-my-representatives`](https://github.com/constitutionalmoney/rate-my-representatives) repository. The two repositories do not share a production database.

## Product vision

Help people identify who represents them, understand the sourced public record, contribute verified civic feedback and evidence, and see how that record changes over time.

## Product principles

- Source beside every material claim
- People, offices, and terms are separate records
- Public browsing does not require identity disclosure
- Consequential participation requires verified-human status
- AI assists research; it does not impersonate a citizen
- Integrity is not the same as truth
- Disputes and corrections remain visible
- Location collection is minimized
- Coverage gaps are published
- No score launches before its method does

## Repository structure

```
apps/
  web/          Public and authenticated application
  api/          Authorization and domain API
  worker/       Ingestion, moderation, notifications, anchoring
packages/
  domain/       Core entities and state machines
  db/           Schema and migrations
  auth/         Accounts, roles, attestations, permissions
  methodology/  Indicators, versions, coverage calculations
  connectors/   Government-data and source adapters
  provenance/   Verus/VDXF anchoring and verification
  ui/           Shared application components
docs/
  prd.md        Product Requirements Document
  data-model.md
  auth.md
  methodology.md
  moderation.md
  threat-model.md
  coverage-policy.md
infra/
  docker/
  deployment/
```

## Technology choices

- PostgreSQL as the canonical application database
- Object storage for quarantined files and permitted source snapshots
- A queue for ingestion, moderation, and anchoring jobs
- Append-only audit events
- Transactional outbox for Verus/VDXF publication
- OpenAPI or another versioned API contract
- Docker-based local and deployment workflows
- Feature flags for identity, scoring, AI, and blockchain integrations

## Release phases

1. Specification and governance — complete data model, pilot-jurisdiction selection, auth, moderation, correction policy, methodology, threat model, and legal review.
2. Read-only pilot — representative matching, profiles, sources, freshness, coverage gaps, and public corrections. No citizen scoring.
3. Verified civic signals — human verification, support/concern signals, privacy thresholds, abuse detection, versioned aggregation.
4. Evidence and due process — submissions, moderator tooling, representative responses, disputes, appeals, audit history.
5. Provenance and assisted analysis — testnet anchoring, VDXF records, AI-assisted research, transparent coverage indicators.
6. Scoring decision — composite score only if justified and approved.

## Release gates

The pilot should not open until:

- Pilot coverage report is public
- Privacy and terms receive legal review
- Moderation and correction procedures are staffed
- Threat model and security review are complete
- Backup restoration is tested
- Administrative accounts require strong authentication
- WCAG 2.2 AA review passes
- No planned capability is labeled operational
- Every material profile claim has a source and freshness state
- AI and blockchain failures degrade safely
- There are no unlabeled live scores

## Documentation

- [docs/prd.md](./docs/prd.md)
- [docs/data-model.md](./docs/data-model.md)
- [docs/auth.md](./docs/auth.md)
- [docs/methodology.md](./docs/methodology.md)
- [docs/moderation.md](./docs/moderation.md)
- [docs/threat-model.md](./docs/threat-model.md)
- [docs/coverage-policy.md](./docs/coverage-policy.md)

## Local quick start

(TBD — add Docker Compose, environment variables, and seed commands once the initial architecture is in place.)

## License

TBD — pending project governance decision.
