import type { CountryCode } from '@rmr/domain';

import type { SqlExecutor } from './audit-outbox.js';

const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export interface PublicRoleDatabaseQuery {
  readonly asOf: string;
  readonly countryCode?: CountryCode;
  readonly includeHistorical?: boolean;
}

export interface PublicRoleDatabaseRow extends Record<string, unknown> {
  readonly assertion_id?: string;
  readonly source_reference?: string;
}

export interface PublicRoleDatabaseReadModel {
  readonly people: readonly PublicRoleDatabaseRow[];
  readonly officeTerms: readonly PublicRoleDatabaseRow[];
  readonly officeTermTransitions: readonly PublicRoleDatabaseRow[];
  readonly officeTermRelationships: readonly PublicRoleDatabaseRow[];
  readonly officeTermContacts: readonly PublicRoleDatabaseRow[];
  readonly elections: readonly PublicRoleDatabaseRow[];
  readonly candidacies: readonly PublicRoleDatabaseRow[];
  readonly candidacyTransitions: readonly PublicRoleDatabaseRow[];
  readonly officialIdentifiers: readonly PublicRoleDatabaseRow[];
  readonly personResolutions: readonly PublicRoleDatabaseRow[];
  readonly personResolutionEvidence: readonly PublicRoleDatabaseRow[];
  readonly externalIdentityReferences: readonly PublicRoleDatabaseRow[];
}

const queries = Object.freeze({
  people: `SELECT * FROM rmr_registry.public_person_name
    WHERE ($3::boolean OR (effective_from <= $1::timestamptz AND (effective_to IS NULL OR effective_to > $1::timestamptz)))
    ORDER BY person_id, effective_from`,
  officeTerms: `SELECT * FROM rmr_registry.public_office_term
    WHERE ($2::text IS NULL OR country_code = $2::text) ORDER BY office_term_id`,
  officeTermTransitions: `SELECT transition.* FROM rmr_registry.public_office_term_transition transition
    JOIN rmr_registry.public_office_term term USING (office_term_id)
    WHERE transition.effective_at <= $1::timestamptz AND ($2::text IS NULL OR term.country_code = $2::text)
    ORDER BY transition.office_term_id, transition.effective_at`,
  officeTermRelationships: `SELECT relationship.* FROM rmr_registry.public_office_term_relationship relationship
    JOIN rmr_registry.public_office_term term USING (office_term_id)
    WHERE ($3::boolean OR (relationship.effective_from <= $1::timestamptz AND (relationship.effective_to IS NULL OR relationship.effective_to > $1::timestamptz)))
      AND ($2::text IS NULL OR term.country_code = $2::text)
    ORDER BY relationship.relationship_id`,
  officeTermContacts: `SELECT contact.* FROM rmr_registry.public_office_term_contact contact
    JOIN rmr_registry.public_office_term term USING (office_term_id)
    WHERE ($3::boolean OR (contact.effective_from <= $1::timestamptz AND (contact.effective_to IS NULL OR contact.effective_to > $1::timestamptz)))
      AND ($2::text IS NULL OR term.country_code = $2::text)
    ORDER BY contact.contact_id`,
  elections: `SELECT * FROM rmr_registry.public_election_version
    WHERE ($3::boolean OR (effective_from <= $1::timestamptz AND (effective_to IS NULL OR effective_to > $1::timestamptz)))
      AND ($2::text IS NULL OR country_code = $2::text)
    ORDER BY election_id, effective_from`,
  candidacies: `SELECT * FROM rmr_registry.public_candidacy
    WHERE ($2::text IS NULL OR country_code = $2::text) ORDER BY candidacy_id`,
  candidacyTransitions: `SELECT transition.* FROM rmr_registry.public_candidacy_transition transition
    JOIN rmr_registry.public_candidacy candidacy USING (candidacy_id)
    WHERE transition.effective_at <= $1::timestamptz AND ($2::text IS NULL OR candidacy.country_code = $2::text)
    ORDER BY transition.candidacy_id, transition.effective_at`,
  officialIdentifiers: `SELECT * FROM rmr_registry.public_role_identifier
    WHERE ($3::boolean OR (effective_from <= $1::timestamptz AND (effective_to IS NULL OR effective_to > $1::timestamptz)))
    ORDER BY entity_kind, entity_id`,
  personResolutions: `SELECT * FROM rmr_registry.public_person_resolution
    WHERE effective_at <= $1::timestamptz ORDER BY effective_at, decision_id`,
  personResolutionEvidence: `SELECT evidence.* FROM rmr_registry.public_person_resolution_evidence evidence
    JOIN rmr_registry.public_person_resolution decision USING (decision_id)
    WHERE decision.effective_at <= $1::timestamptz ORDER BY evidence.decision_id, evidence.evidence_id`,
  externalIdentityReferences: `SELECT * FROM rmr_registry.public_external_identity_reference
    WHERE ($3::boolean OR (effective_from <= $1::timestamptz AND (effective_to IS NULL OR effective_to > $1::timestamptz)))
    ORDER BY person_id, external_identity_reference_id`,
});

export class PublicRoleRegistryRepository {
  constructor(private readonly database: SqlExecutor) {}

  async read(query: PublicRoleDatabaseQuery): Promise<PublicRoleDatabaseReadModel> {
    if (!ISO_TIMESTAMP_PATTERN.test(query.asOf) || !Number.isFinite(Date.parse(query.asOf))) {
      throw new Error('asOf must be an ISO-8601 timestamp.');
    }
    const parameters = [
      query.asOf,
      query.countryCode ?? null,
      query.includeHistorical === true,
    ] as const;
    const results = await Promise.all(
      Object.entries(queries).map(async ([name, sql]) => [
        name,
        (await this.database.query<PublicRoleDatabaseRow>(sql, parameters)).rows,
      ]),
    );
    return Object.fromEntries(results) as unknown as PublicRoleDatabaseReadModel;
  }
}
