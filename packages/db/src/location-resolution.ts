import type { SavedBroadJurisdiction } from '@rmr/domain';

import type { SqlExecutor } from './audit-outbox.js';

export interface BroadJurisdictionMutationMetadata {
  readonly accountId: string;
  readonly commandSha256: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly idempotencyKeySha256: string;
  readonly occurredAt: string;
  readonly requestId: string;
}

interface SavedBroadJurisdictionRow extends Record<string, unknown> {
  readonly country_code: 'CA' | 'US';
  readonly created_at: string;
  readonly jurisdiction_id: string;
  readonly jurisdiction_kind: 'country' | 'province' | 'state' | 'territory';
  readonly label: string;
  readonly preference_id: string;
  readonly updated_at: string;
}

function toDomain(row: SavedBroadJurisdictionRow): SavedBroadJurisdiction {
  return Object.freeze({
    countryCode: row.country_code,
    createdAt: row.created_at,
    jurisdictionId: row.jurisdiction_id,
    jurisdictionKind: row.jurisdiction_kind,
    label: row.label,
    preferenceId: row.preference_id,
    schemaVersion: 'saved-broad-jurisdiction.v1',
    updatedAt: row.updated_at,
  });
}

export class BroadJurisdictionPreferenceRepository {
  constructor(private readonly database: SqlExecutor) {}

  async read(accountId: string): Promise<SavedBroadJurisdiction | null> {
    const result = await this.database.query<SavedBroadJurisdictionRow>(
      `SELECT preference_id, country_code, jurisdiction_id, jurisdiction_kind, label,
              created_at::text, updated_at::text
       FROM rmr_account.saved_broad_jurisdiction
       WHERE account_id = $1`,
      [accountId],
    );
    return result.rows[0] ? toDomain(result.rows[0]) : null;
  }

  async put(
    preference: SavedBroadJurisdiction,
    metadata: BroadJurisdictionMutationMetadata,
  ): Promise<SavedBroadJurisdiction> {
    const result = await this.database.query<SavedBroadJurisdictionRow>(
      `SELECT preference_id, country_code, jurisdiction_id, jurisdiction_kind, label,
              created_at::text, updated_at::text
       FROM rmr_account.put_broad_jurisdiction(
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::timestamptz
       )`,
      [
        metadata.accountId,
        preference.preferenceId,
        preference.countryCode,
        preference.jurisdictionId,
        preference.jurisdictionKind,
        preference.label,
        metadata.idempotencyKeySha256,
        metadata.commandSha256,
        metadata.eventId,
        metadata.requestId,
        metadata.correlationId,
        metadata.occurredAt,
      ],
    );
    const row = result.rows[0];
    if (!row) throw new Error('Broad jurisdiction write returned no record.');
    return toDomain(row);
  }

  async delete(
    preferenceId: string,
    metadata: BroadJurisdictionMutationMetadata,
  ): Promise<boolean> {
    const result = await this.database.query<{ readonly deleted: boolean }>(
      `SELECT rmr_account.delete_broad_jurisdiction(
         $1, $2, $3, $4, $5, $6, $7, $8::timestamptz
       ) AS deleted`,
      [
        metadata.accountId,
        preferenceId,
        metadata.idempotencyKeySha256,
        metadata.commandSha256,
        metadata.eventId,
        metadata.requestId,
        metadata.correlationId,
        metadata.occurredAt,
      ],
    );
    return result.rows[0]?.deleted === true;
  }
}
