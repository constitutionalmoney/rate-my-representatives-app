# Official-source ingestion foundation

**Status:** Issue #55 internal foundation; synthetic Canada and United States pilots only
**Public API:** Issue #11 exposes reviewed profile-scoped reads only
**Runtime gate:** `SOURCE_INGESTION_ENABLED=false` by default
**Verus dependency:** None

This foundation retrieves approved source material into immutable metadata, parses it in
the connector boundary, and stages normalized candidates for accountable human review.
It does not declare a candidate true, merge a person by name, or publish a material
record automatically. PostgreSQL remains canonical after a reviewer or administrator
approves a candidate.

## Connector declaration

Every connector implements `source-connector-capability.v1` and declares:

- publisher, authoritative scope, country, jurisdiction, and record families;
- access method, authentication class, approved HTTPS origin, rate policy, and robots
  handling;
- licence/terms URL, attribution, retention, redistribution, and snapshot rights;
- external identifier and effective-date semantics;
- cadence, expected freshness, stale threshold, pagination, and checkpoint version;
- parser and input schema versions;
- content-type, encoding, wire-size, decoded-size, expansion, timeout, and redirect
  limits;
- conflict, deletion, retraction, and outage behavior; and
- accountable owner and incident runbook.

Changing any material declaration requires a new immutable connector version and review.
Synthetic approval cannot authorize a production connector. Production execution is
rejected by the issue #55 pipeline even if a production capability object is supplied.

## Processing flow

```text
scheduled/manual request
  -> validate capability and execution mode
  -> load conditional checkpoint
  -> resolve and retrieve through the SSRF boundary
  -> record URL/status/headers/sizes/hash/rights/parser metadata
  -> parse and normalize candidates
  -> compare identifier plus context; never name alone
  -> quarantine conflicts, malformed records, and unavailable/retracted material
  -> stage all remaining material as pending_review
  -> human approve/reject/request correction
  -> append canonical reviewed version + audit + transactional outbox
  -> append reproducible coverage/freshness snapshot
```

Raw source bytes are not stored in PostgreSQL. Retrieval rows store SHA-256 and operational
metadata. An allowed snapshot can be represented only by an `approved://` or
`quarantine://` object reference under the declared rights; issue #55 pilots use
`not_stored`. Restricted input never becomes public output, an audit payload, or an
outbox payload.

## Synthetic pilot inventory

| Pilot | Scope | Terms and licence | Storage | Purpose |
|---|---|---|---|---|
| Canada | Synthetic person, office-term, correction records under `jurisdiction:ca:maple` | Reserved `.invalid` terms URL; CC0-1.0 synthetic fixture | Metadata/hash only; snapshot declaration is quarantine-only | Identifier-plus-office-context match and checkpoint flow |
| United States | Synthetic person, candidacy, election, correction records under `jurisdiction:us:example-state` | Reserved `.invalid` terms URL; CC0-1.0 synthetic fixture | Metadata/hash only; snapshot declaration is quarantine-only | Similar-name ambiguity and coverage-gap behavior |

These are approved test fixtures, not approved real publishers. Before any live connector
can be enabled, data stewardship must record the actual publisher authority, access
conditions, licence/terms, attribution, retention/redistribution rights, schema owner,
freshness expectation, and runbook review. A public official record is not exempt from
rights review merely because it is public.

## Matching and review

`name` is supporting context, never a merge key. A name-only candidate remains
`ambiguous`. A person can become a `candidate_match` only when an official identifier
matches one canonical person and at least one contextual hint is present. Multiple
matches or explicit source disagreement produce `conflict` and quarantine.

Only `reviewer` and `admin` actors can append `approved`, `rejected`,
`needs_correction`, or `superseded` transitions. The source process can append only
`pending_review` or `quarantined`. PostgreSQL checks this boundary and a trigger rejects
any canonical reviewed version without a matching human approval. Corrections create a
new candidate and reviewed-record version linked through `supersedes_version_id`; prior
rows cannot be updated or deleted.

## Availability, freshness, and coverage

The explicit availability states are `available`, `stale`, `missing`, `retracted`, and
`unavailable`. Anything other than `available` is quarantined instead of entering the
ordinary review queue. Outages retry within a bounded attempt count, then append both a
quarantine and dead-letter item without advancing the checkpoint.

Coverage groups deterministic candidate counts by country, jurisdiction, record type,
and availability. Canonically ordered input plus method version, code revision, and
generation time produces the snapshot hash. The required missing-data meaning is
`coverage_gap_not_misconduct`; missing records never imply negative conduct. Provenance
state is `not_anchored` because issue #55 performs no chain writes.

## Retrieval security

The retriever permits only the connector's approved HTTPS origin and rejects credentials,
fragments, unapproved redirects, empty/invalid DNS, private/link-local/metadata/multicast
addresses, and DNS rebinding. Each redirect is parsed and resolved again. It allowlists
content type and encoding, then enforces wire, decoded, decompression-ratio, redirect,
and timeout limits before parsing. Tests use RFC 5737 documentation addresses only for
reserved synthetic `.invalid` hosts; production capabilities cannot use them.

The transport and resolver are injected. Core build/test makes no network request and
needs no live official endpoint, database, Verus node, wallet, identity, or key.
Production egress isolation, hostile-document processing, source poisoning, rights, and
parser residual risks remain pilot blockers in [`THREAT_MODEL.md`](./THREAT_MODEL.md).

## AI boundary

No runtime AI is used by either pilot. Transformation history nevertheless requires an
AI-assisted step to record its process/model version, confidence, and mandatory human
review. AI output can only be a candidate draft; it can never match, approve, merge, or
publish a material factual record on its own.

## Scope and dependencies

Issue #55 deliberately does not implement contributor evidence (#39), representative
scoring, native UI, Verus identities or identity updates, provenance writes, or mainnet
work. Issue #11 now consumes only human-approved records through allowlisted,
profile-scoped reads; it does not change the ingestion runtime gate or add automatic
publication. The broader source access, freshness, public-gap, and pilot support policy
is now defined by issue #7 in [COVERAGE_POLICY.md](./COVERAGE_POLICY.md). The
security-domain program (#22) remains a governance dependency. Issue #55 implements the
smallest safe internal slice with explicit synthetic approvals and deny-by-default
runtime execution. Contributor evidence and public due process remain disabled and are governed
by [`MODERATION_AND_DUE_PROCESS.md`](./MODERATION_AND_DUE_PROCESS.md); source-candidate
approval is not evidence publication.

See [the runbook](./runbooks/SOURCE_INGESTION.md) and
[ADR 0008](./adr/0008-candidate-only-official-source-ingestion.md).
