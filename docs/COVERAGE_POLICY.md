# Coverage, Freshness, and Pilot Support Policy

**Policy version:** `coverage-policy.v1`

**Report schema:** `coverage-report.v1`

**Status:** Approved repository policy; synthetic evidence only

**Applies to:** Canada and the United States

**Owner:** Data stewardship

## Purpose

Rate My Representatives (RMR) must say what its civic record covers, how recently that
record was checked, and where it is incomplete. A discovered record is not evidence that
the expected universe is complete. Missing, stale, conflicting, failed, quarantined, or
unavailable data is a coverage condition and never evidence of misconduct, support,
concern, eligibility, or any other judgment about a person.

This policy defines the reproducible measurements and release gates for jurisdictions,
offices, people, terms, candidacies, sources, profiles, and material claims. Issue #7
defines the policy and versioned report contract. Issue #21 owns publication of a live
coverage report. No production geography is approved by this document.

## Non-negotiable boundaries

- PostgreSQL remains the canonical application record.
- Country, jurisdiction, district, public body, office, person, office term, election,
  candidacy, profile, source, and claim remain separate entities.
- Jurisdiction nesting is a civic graph. It never depends on a treasury, reserve,
  blockchain, or jurisdictional parent identity.
- Only approved public-source metadata and public aggregate counts may enter a coverage
  report. Raw location, account activity, representative signals, category ratings,
  browsing history, device identifiers, moderation notes, identity evidence, keys, and
  wallet data are excluded.
- No denominator may be inferred solely from the records RMR happened to discover.
- Missing data is never converted to zero, a negative outcome, or a misconduct inference.
  The machine-readable meaning is always `coverage_gap_not_misconduct`.
- Engagement, time in app, swipe volume, and the negativity of participant choices are
  not coverage or pilot-success metrics.
- Provenance is optional and false-by-default. It may describe only an approved public
  report or its public manifest after a separate public-approval decision. Raw user
  activity is never provenance input. Issue #7 performs no provenance or chain write.

## Measurement unit and declared universe

Every report declares an `asOf` instant and a half-open effective interval
`[validFrom, validTo)`. Its scope lists countries, jurisdiction IDs, levels, record
families, and the approved inventory source used to establish each expected denominator.
Changing the scope, inventory source, effective interval, or method version creates a new
report; it never silently rewrites an old one.

An **expected item** is an entity or claim that the approved inventory says should exist
within the declared scope and interval. An **observed item** is a canonical reviewed
record matched to exactly one expected item. Unexpected discoveries are reported
separately and do not increase either numerator or denominator until the inventory is
reviewed and versioned.

When a denominator is zero or cannot be established, the percentage is `null` and the
support state is `not_applicable` or `unsupported`. It is never reported as 100%.

## Status vocabulary

### Support state

| State | Meaning |
|---|---|
| `supported` | Every applicable release gate for the object and scope passes. |
| `partial` | Some reviewed public data is useful, but at least one non-critical gate or optional family is incomplete and visibly disclosed. |
| `gap` | An expected item or required dimension is missing, stale beyond its limit, conflicting, failed, quarantined, or unavailable. |
| `unsupported` | RMR has no approved denominator or cannot meet a critical gate. |
| `not_applicable` | The dimension does not apply to the declared scope; no percentage is calculated. |

Support is evaluated independently for every jurisdiction level and record family. A
supported province does not make its municipalities supported, and a supported current
office inventory does not imply historical candidacy coverage.

### Source and connector state

`available`, `stale`, `missing`, `retracted`, and `unavailable` retain the meanings in
the source-ingestion contract. Public connector health uses `healthy`, `degraded`,
`stale`, `failed`, or `unavailable`. A successful HTTP response does not make a source
fresh if parsing, matching, review, or publication remains incomplete.

Each authoritative source declares:

- source class and publishing authority;
- connector and data-steward owners;
- access terms, licence, attribution text, retention, and redistribution rights;
- covered geographies, levels, entity families, and identifiers;
- retrieval time, source publication time when provided, last successful check, and the
  approved freshness limit;
- checkpoint, immutable retrieval hash, parser/method version, code revision, and review
  status; and
- current failures, conflicts, quarantine state, and public gap references.

No live source may enter a supported pilot without a reviewed rights record. Publicly
accessible data is not assumed to be licensed for storage or redistribution.

### Authoritative source priority

Source classes are evaluated in this order, subject to jurisdiction-specific law and
documented access rights:

1. election authority, legislature, council, government gazette, boundary authority, or
   other legally designated publisher;
2. the public body's official roster, clerk, or returning officer;
3. a public official's official page for contact/context fields the publisher controls;
4. a reviewed secondary source only to identify a gap or conflict, never to silently
   override a higher class.

Conflicting authoritative records remain visible. A reviewer may select the canonical
application version only with recorded evidence and a correction path; selection does
not erase the conflict.

## Reproducible dimensions and formulas

All counts use distinct stable IDs after reviewed matching. Each metric records its
numerator, denominator, percentage, threshold, support state, method version, and gap
IDs. Percentages are rounded to two decimals only after division.

For any applicable set `E` of expected items and qualifying reviewed subset `Q`:

```text
coverage_percent = round(100 * |Q| / |E|, 2) when |E| > 0; otherwise null
gap_count = |E| - |Q|
```

The required dimensions are:

| Dimension | Denominator | Qualifying numerator |
|---|---|---|
| Structural registry | Expected jurisdictions, districts, public bodies, and offices, reported separately | Records with approved identifiers, graph relationships, effective dates, and applicable boundary version |
| Person/role lifecycle | Expected active people, office terms, elections, and candidacies, reported separately | Reviewed records linked without conflating person, office, term, election, or candidacy |
| Profile coverage | Expected public-role contexts eligible under the declared pilot | Published reviewed profiles with a qualifying primary source, complete core fields, visible freshness, and no unresolved critical identity conflict |
| Material-claim source coverage | Material claims included in public profiles | Claims linked to at least one reviewed source, freshness state, supporting/challenging evidence links, method version, and correction route |
| Gap disclosure | Known missing, stale, failed, conflicting, quarantined, retracted, and unavailable conditions | Conditions with a stable public gap ID, affected scope, status, first/last observed times, and plain-language explanation |
| Correction/supersession | Accepted corrections due by the report `asOf` time | Corrections reflected in the current canonical/public snapshot and linked to the superseded version |
| Representative match | Approved validation cases with known effective date and expected office contexts | Cases returning the exact expected representatives and no extra representative |

Freshness is measured against each source's approved limit:

```text
age = asOf - max(sourcePublishedAt when trustworthy, lastSuccessfulRetrievalAt)
freshness = current when age <= approvedFreshnessLimit; otherwise stale
current_percent = round(100 * current_count / freshness_denominator, 2)
```

`unknown` is used when no trustworthy publication or retrieval time exists;
`unavailable` is used when the source cannot be checked. Neither counts as current.
Reports publish the full `current`, `stale`, `unknown`, and `unavailable` distribution,
not only the percentage.

Connector success is operational evidence, not source completeness:

```text
connector_success_percent = round(100 * successful_completed_runs / scheduled_runs, 2)
```

Cancelled or skipped runs stay in the denominator unless the schedule itself was
versioned before the run was due. A completed run that failed retrieval, parsing,
validation, checkpointing, or review handoff is not successful.

## Minimum support gates

### Material claim

A material claim is `supported` only when its source-metadata coverage is 100%, the
source is within its approved freshness limit or visibly marked stale, conflicts and
challenging evidence are linked, and a correction route exists. A missing source does
not create a negative claim; the claim is withheld or labeled unsupported.

### Profile

A profile is `supported` only when:

- person, office, term or candidacy context, jurisdiction, and effective dates are
  separately identified;
- at least one qualifying authoritative source supports the role context;
- material-claim source coverage is 100%;
- all known gaps, stale states, disputes, and corrections are visible; and
- no critical person, office, term, or candidacy conflict is unresolved.

Optional record families may be `partial` if the gap is visible. A profile never receives
a score, penalty, or adverse label because optional data is absent.

### Jurisdiction and jurisdiction level

A jurisdiction level is `supported` only when its approved expected inventory exists and
structural-registry coverage is 100% for jurisdictions, districts, public bodies, and
offices applicable to that level. Current office-term/person linkage must also be 100%
for records represented as current. Unsupported child levels remain explicitly
unsupported; parent coverage never rolls down automatically.

### Aggregates, briefings, and indicators

No aggregate, Civic Signal briefing, or indicator may be described as supported until
its own approved method declares its eligible population, exclusions, minimum cell size,
freshness limit, correction behavior, and suppression rules. Inputs must pass this
policy, gaps must remain visible, and missing values must never become zero or negative.
For its declared eligible input set, support requires 100% denominator declaration,
100% material-claim source-metadata coverage, 100% known-gap disclosure, 100% current
critical sources, at least 95% current non-critical source checks, and 100% accepted
correction/supersession coverage. Representative lookup inputs must also meet the pilot
match threshold. A result that cannot meet every applicable threshold is withheld or
labeled partial/unsupported with its exclusions; it is never silently reweighted.

Issue #7 approves no representative-signal aggregate, category rating, composite score,
or Representative Accountability Score.

## Pilot selection and exit thresholds

A proposed pilot geography must have a named data steward, at least one authoritative
inventory source, reviewed licence/terms, stable identifiers, an achievable source
refresh cadence, meaningful Canada/U.S. graph-shape coverage, correction contacts, and
enough validation cases to test nesting, overlaps, effective dates, renames, vacancies,
and similar-name ambiguity. Selection is based on correctness and stewardship readiness,
not political composition, app engagement, or expected sentiment.

A pilot may be called **supported** only when all of these are true for the declared
scope and `asOf` time:

1. structural-registry coverage is 100% for every included jurisdiction level;
2. current person/office/term or applicable candidacy linkage is 100%;
3. profile coverage is 100% for the expected eligible current public-role contexts;
4. material-claim source-metadata coverage is 100%;
5. critical identity/office/term sources are 100% current, and at least 95% of all other
   included source checks are current, with every remainder visibly labeled;
6. public gap disclosure is 100% for known gaps and conflicts;
7. representative matching is 100% on boundary/effective-date/adversarial fixtures, at
   least 99% on an approved blind validation set, and has zero known severe mismatches;
8. every critical connector completed its latest scheduled run, with no unresolved
   critical outage, failed checkpoint, or quarantined critical record;
9. accepted correction/supersession coverage is 100%, with no unresolved critical
   correction beyond the published response target; and
10. methodology version, generated time, code revision, licence inventory, report hash,
    known errors, correction history, and release decision are public.

If the pilot is too broad to meet these thresholds, its declared scope must be reduced
before release rather than lowering or hiding the denominator. Threshold changes require
a new policy version and changelog entry; they do not retroactively alter old reports.

## Failures, retry, quarantine, and incidents

Retrieval and processing use bounded retries and the source-specific runbook. Exhausted
retries create a quarantine/dead-letter record and a public gap without advancing the
last successful checkpoint. Critical incidents include wrong-person/office linkage,
silent denominator loss, publication without required source rights, undisclosed stale
data, private-data exposure, and a correction that mutates history.

Critical incidents block `supported`, trigger the security/incident process, preserve
evidence, and require a versioned correction or report retraction. Service restoration
does not erase the incident or prior gap interval.

## Corrections, backfills, snapshots, and changelog

- Corrections and backfills append new canonical versions linked to the superseded
  version; historical snapshots remain reproducible.
- A backfill is labeled separately from a fact known at the original snapshot time.
- Accepted corrections record received, accepted, due, and reflected times plus affected
  report/profile IDs.
- Every public report is immutable, content-hashed, and retained with its schema, policy,
  method, source inventory, code revision, and generated time.
- The public changelog states added/removed scope, denominator changes, source changes,
  method changes, known errors, corrections, supersessions, and report retractions.
- A corrected report points to the report it supersedes; consumers can still inspect the
  prior report and why it changed.

## Public coverage report contract

The generated JSON Schema is
[`packages/contracts/schemas/coverage-report.schema.json`](../packages/contracts/schemas/coverage-report.schema.json)
and the non-production example is
[`packages/contracts/fixtures/coverage-report.synthetic.json`](../packages/contracts/fixtures/coverage-report.synthetic.json).
Each report contains:

- supported/partial/gap/unsupported jurisdictions and levels;
- authoritative source inventory with owner, rights, licence, attribution, freshness,
  and last-check metadata;
- expected and observed entity counts;
- profile and material-claim coverage plus the other required dimensions;
- freshness distribution and connector failures;
- visible gaps and known errors;
- methodology/policy/schema version, generated time, `asOf`, code revision, and hash;
- corrections, supersessions, snapshots, and changelog entries; and
- optional public-report provenance state, which remains `not_anchored` unless a later
  separately approved feature verifies a public anchor.

The schema is generated into TypeScript and validated in CI, but issue #7 adds no API
operation, scheduled publisher, automatic publication, database migration, live source,
Verus dependency, or provenance write.

## Governance and review

Data stewardship owns inventories, source classification, rights review, freshness
limits, correction targets, and support decisions. Engineering owns deterministic
measurement and reproducibility. Security/privacy review owns prohibited-data checks.
Changing formulas, required fields, status meaning, or thresholds requires a new policy
and schema version, migration notes, fixture updates, tests, and a public changelog entry.

Pilot success is evaluated by match correctness, declared-universe coverage, freshness,
visible failures, and correction quality. It is not evaluated by engagement, retention,
time in app, swipe direction, or sentiment.
