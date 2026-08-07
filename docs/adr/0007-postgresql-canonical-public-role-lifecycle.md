# ADR 0007: PostgreSQL-canonical public-role lifecycle

**Status:** Accepted for issue #59

## Decision

Model people, office terms, elections, candidacies, identifiers, and reviewed person
resolution as separate effective-dated PostgreSQL records. Keep structural offices in
the issue #49 registry. Expose read-only synthetic API operations and generated clients.

Lifecycle transitions and person-resolution evidence are append-only and
source-attributed. Public serializers omit reviewer references and private notes. A won
candidacy has no automatic term effect. Optional external identity references are inert
and cannot become canonical facts or authorization.

## Consequences

The civic graph works and tests without Verus. Similar names cannot be resolved by name
alone. Appointment, election, acting, interim, current, former, vacant, and historical
states remain distinguishable. Source ingestion, public conduct, participation,
identity proof/update, provenance writes, and scoring require later decisions.
