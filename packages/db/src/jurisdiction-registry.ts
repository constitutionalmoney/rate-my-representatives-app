import type { CountryCode } from '@rmr/domain';

import type { SqlExecutor } from './audit-outbox.js';

const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export interface RegistryDatabaseQuery {
  readonly asOf: string;
  readonly countryCode?: CountryCode;
  readonly includeHistorical?: boolean;
}

export interface RegistryAttributionRow extends Record<string, unknown> {
  readonly assertion_id: string;
  readonly source_reference: string;
  readonly observed_at: string;
  readonly freshness_state: string;
  readonly coverage_state: string;
  readonly conflict_state: string;
  readonly supersedes_assertion_id: string | null;
}

export interface RegistryDatabaseReadModel {
  readonly jurisdictionVersions: readonly RegistryAttributionRow[];
  readonly jurisdictionRelationships: readonly RegistryAttributionRow[];
  readonly districtVersions: readonly RegistryAttributionRow[];
  readonly districtBoundaries: readonly RegistryAttributionRow[];
  readonly districtJurisdictionRelationships: readonly RegistryAttributionRow[];
  readonly districtLineage: readonly RegistryAttributionRow[];
  readonly publicBodyVersions: readonly RegistryAttributionRow[];
  readonly bodyJurisdictionRelationships: readonly RegistryAttributionRow[];
  readonly officeVersions: readonly RegistryAttributionRow[];
  readonly externalIdentifiers: readonly RegistryAttributionRow[];
  readonly gaps: readonly RegistryAttributionRow[];
}

const effectiveFilter = `
  ($3::boolean OR (effective_from <= $1::timestamptz AND (effective_to IS NULL OR effective_to > $1::timestamptz)))
`;

const queries = Object.freeze({
  jurisdictionVersions: `
    SELECT * FROM rmr_registry.public_jurisdiction_version
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY jurisdiction_id, effective_from
  `,
  jurisdictionRelationships: `
    SELECT * FROM rmr_registry.public_jurisdiction_relationship
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY subject_jurisdiction_id, kind, effective_from
  `,
  districtVersions: `
    SELECT * FROM rmr_registry.public_district_version
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY district_id, effective_from
  `,
  districtBoundaries: `
    SELECT * FROM rmr_registry.public_district_boundary_version
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY district_id, effective_from
  `,
  districtJurisdictionRelationships: `
    SELECT * FROM rmr_registry.public_district_jurisdiction_relationship
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY district_id, kind, effective_from
  `,
  districtLineage: `
    SELECT * FROM rmr_registry.public_district_lineage
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY district_id, effective_from
  `,
  publicBodyVersions: `
    SELECT * FROM rmr_registry.public_body_read
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY public_body_id, effective_from
  `,
  bodyJurisdictionRelationships: `
    SELECT * FROM rmr_registry.public_body_jurisdiction_relationship
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY public_body_id, kind, effective_from
  `,
  officeVersions: `
    SELECT * FROM rmr_registry.public_office_version
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY office_id, effective_from
  `,
  externalIdentifiers: `
    SELECT * FROM rmr_registry.public_external_identifier
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY entity_kind, entity_id, effective_from
  `,
  gaps: `
    SELECT * FROM rmr_registry.public_gap_view
    WHERE ${effectiveFilter}
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY entity_kind, entity_id, gap_id
  `,
});

export class JurisdictionRegistryRepository {
  constructor(private readonly database: SqlExecutor) {}

  async read(query: RegistryDatabaseQuery): Promise<RegistryDatabaseReadModel> {
    if (!ISO_TIMESTAMP_PATTERN.test(query.asOf) || !Number.isFinite(Date.parse(query.asOf)))
      throw new Error('asOf must be an ISO-8601 timestamp.');
    const parameters = [
      query.asOf,
      query.countryCode ?? null,
      query.includeHistorical === true,
    ] as const;
    const results = await Promise.all(
      Object.entries(queries).map(
        async ([name, sql]) =>
          [
            name,
            (await this.database.query<RegistryAttributionRow>(sql, parameters)).rows,
          ] as const,
      ),
    );
    return Object.fromEntries(results) as unknown as RegistryDatabaseReadModel;
  }
}
