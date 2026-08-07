# Effective-dated jurisdiction registry

**Status:** Issue #49 implemented with synthetic Canada and United States fixtures only

## Scope and boundaries

The registry is the canonical structural model for four separate public entity families:

| Family | Stable identity | Effective-dated facts |
|---|---|---|
| Jurisdiction | `jurisdictionId` | name, slug, kind, status |
| Electoral or special district | `districtId` | name, slug, kind, status, boundary reference/digest |
| Public body | `publicBodyId` | name, slug, kind, status |
| Office | `officeId` | name, slug, body, optional district, selection method, operational state |

An ID survives a rename or external-identifier change. A material successor, such as a
new district after redistricting, receives its own ID and an explicit lineage edge.
Jurisdictions, districts, bodies, offices, external identifiers, and public gap records
all carry half-open effective periods: `effectiveFrom <= at < effectiveTo`. A null end
means the version is open-ended; it does not mean the fact can never change.

The registry does not contain people, office terms, candidacies, source retrievals, or
location-resolution results. It never implies legal residence, citizenship, voting
eligibility, candidacy eligibility, or official authority for a person. Those require
separate policy and evidence in later issues.

## Graph model

Jurisdiction structure is a graph, not one universal parent tree. Effective-dated edges
can express `contained_by`, `administered_by`, `overlaps`, `represented_by`, and
`successor_of`. A municipality may be connected to both a province/state and a regional
or county structure. Special districts can overlap municipal boundaries. Containment
cycles are rejected in both the TypeScript validator and PostgreSQL constraint trigger.

District-to-jurisdiction, body-to-jurisdiction, and district-lineage edges are separate
tables and types. This prevents these concepts from being silently collapsed:

- a geographic or administrative jurisdiction;
- an electoral district;
- a public body that governs or serves an area;
- an office within that body; and
- a future person, term, or candidacy associated with an office.

There is no reserve currency, treasury identity, jurisdictional parent VerusID,
Mirror-State object, sub-ID hierarchy, or blockchain-derived parent in this model.
PostgreSQL remains canonical and the core registry needs no Verus process.

## Synthetic fixtures

The Canada fixture includes a province, regional district, municipality with two
effective names under one stable ID, an amalgamated/successor municipality pair,
federal and provincial electoral district history, and elected/appointed/vacant office
states. The United States fixture includes state, county, municipality,
unincorporated-area, and overlapping special-district structures plus legislature,
county-board, and special-board offices. All names, IDs, geometries, sources, and events
are fictional.

Geometry is not embedded in the read model. A boundary version stores an opaque
`synthetic://` object reference and SHA-256 digest so shape data can be versioned without
making object storage the canonical entity store. Issue #49 does not resolve coordinates
or addresses against those boundaries.

## Attribution, coverage, and conflict

Every asserted version or relationship includes:

- an immutable assertion ID and synthetic source reference;
- observation time and optional superseded assertion;
- freshness: current, stale, unknown, or unavailable;
- coverage: supported, partial, gap, or unsupported; and
- conflict: clear, conflicting, or unsupported.

Public gap records are effective-dated and attach to exactly one registry entity.
Gaps and conflicts remain visible in public views and the API; they are not converted to
positive claims or silently filled. Issue #55 will own source retrieval/ingestion and can
attach reviewed source records later without rewriting this registry history.

## Read API

`GET /api/v1/jurisdictions` returns `jurisdiction-registry.v1` and supports:

| Query | Meaning |
|---|---|
| `asOf` | ISO 8601 timestamp; defaults to the deterministic fixture timestamp |
| `countryCode` | `CA` or `US` |
| `jurisdictionId` | Stable opaque ID for connected graph context |
| `includeHistorical` | `true` returns all versions/edges; default `false` returns the as-of slice |

Every response has `dataMode: synthetic`, a terminal `page.nextCursor`, and an explicit
`deferredFamilies` list. Unsupported or duplicate query parameters return a privacy-safe
typed validation error. The generated clients for mobile, web, portal, admin, worker,
and the public SDK all consume the same OpenAPI and JSON Schema definitions.

## PostgreSQL and operations

Migration `0003_jurisdiction_registry.sql` creates the `rmr_registry` schema, effective
range exclusions, graph integrity trigger, immutable assertion store, and security-barrier
public views. `rmr_registry_reader` can select only the allowlisted public views, not base
tables. Local seed `0002_synthetic_jurisdiction_registry.sql` is idempotent.

Run the in-memory/unit suite without Docker or Verus:

```bash
pnpm test:unit
pnpm test:contract
```

Run migration, constraint, seed, public-view, and Verus-off acceptance checks with:

```bash
pnpm infra:up
pnpm infra:smoke
pnpm infra:down
```

Applied migration files are checksummed and must not be edited after deployment. Use a
new forward migration for corrections. In disposable local/CI environments only,
`pnpm infra:reset` removes this Compose project's volumes after its explicit guard and
then allows a clean migration replay. No production rollback procedure or production
civic dataset is introduced by issue #49.
