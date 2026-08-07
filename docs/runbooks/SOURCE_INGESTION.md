# Official-source ingestion runbook

This runbook applies to issue #55's synthetic candidate pipeline. It does not authorize
production source access or public publication.

## Before a run

1. Confirm the connector ID/version and review reference match an immutable capability.
2. Confirm `dataMode` and approval state agree. Issue #55 permits `synthetic` plus
   `synthetic_approved` only.
3. Review the approved origin, rights, rate, size, encoding, timeout, freshness, and
   retention declarations.
4. Confirm the prior checkpoint and its history row. Never edit checkpoint history.
5. Keep `SOURCE_INGESTION_ENABLED=false` for ordinary core/Dokploy deployments. A future
   environment-specific enablement requires its own release review.

## Triage outcomes

| Outcome | Operator action |
|---|---|
| `completed` | Confirm retrieval hash/metadata, candidate count, checkpoint, and coverage row were committed together. |
| `not_modified` | Confirm the prior checkpoint remains current; do not fabricate a retrieval body or candidates. |
| `duplicate` | Confirm the idempotency key matches the prior run; do not append duplicate candidates. |
| `quarantined` | Inspect only safe failure metadata first; keep the checkpoint unchanged. |
| dead letter | Resolve the retriable outage, record the incident reference, and use a controlled replay run. |

## Security incidents

Treat private/link-local DNS results, peer-address mismatch, unexpected redirects,
content-type or encoding changes, decompression expansion, malformed schema, and terms
changes as fail-closed events. Suspend the connector version when compromise or rights
drift is plausible. Do not bypass the resolver/rebinding checks, raise size limits, or
copy a response into PostgreSQL to make a run pass.

Secrets, access tokens, raw response bodies, private fields, and moderator notes must not
be placed in logs, audit safe detail, outbox payloads, issues, or pull requests.

## Review and correction

Reviewers must inspect source attribution, effective date, identifier/context evidence,
conflict/availability state, and the complete allowlisted candidate payload. Name-only
records remain ambiguous. Source-process actors cannot approve.

A correction is a new candidate and human decision. Append a new reviewed-record version
with `supersedes_version_id`; never update or delete the prior version. The canonical
write, redacted audit event, and outbox event must share one PostgreSQL transaction.

## Replay and recovery

- Retry only failures classified retriable, within the bounded attempt policy.
- A dead-letter replay gets a new run ID and links back to the dead-letter item.
- Re-read the last durable checkpoint; never advance it for a quarantined or failed run.
- Conditional retrieval uses the stored ETag/Last-Modified values where declared.
- Backfills use `trigger_kind=replay`, a reviewed time range, and the same idempotency
  formula. Backfills do not weaken review or auto-publish rules.
- After recovery, regenerate coverage and compare the deterministic hash for identical
  code revision, method version, generation time, and candidate inputs.

## Verification

```bash
pnpm test:security
pnpm test:integration
pnpm infra:reset
pnpm infra:up
pnpm infra:smoke
```

The smoke suite confirms synthetic pilots, human-only approval, correction history,
audit/outbox pairing, prohibited-field rejection, append-only enforcement, explicit
coverage gaps, and a core stack with Verus disabled.
