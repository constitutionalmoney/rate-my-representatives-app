/* Generated from public-role-profile-list.schema.json. Do not edit directly. */

export type Id = string;

export interface PublicRoleProfileList {
  schemaVersion: 'public-role-profile-list.v1';
  dataMode: 'synthetic';
  generatedAt: string;
  filters: {
    countryCode: ('CA' | 'US') | null;
    contextKind: ('office_term' | 'candidacy') | null;
  };
  items: ProfileSummary[];
  page: {
    limit: 50;
    nextCursor: null;
  };
}
export interface ProfileSummary {
  profileId: Id;
  personId: Id;
  displayName: string;
  countryCode: 'CA' | 'US';
  governmentLevel: 'federal' | 'provincial' | 'territorial' | 'state' | 'municipal' | 'local' | 'special';
  officeTitle: string;
  districtLabel: string | null;
  roleStatus:
    | 'current'
    | 'former'
    | 'acting'
    | 'appointed'
    | 'elected'
    | 'declared'
    | 'withdrawn'
    | 'disqualified'
    | 'historical';
  context: {
    kind: 'office_term' | 'candidacy';
    officeTermId: Id | null;
    candidacyId: Id | null;
  };
  availability: 'available' | 'not_available' | 'unsupported' | 'stale' | 'coverage_gap';
  recordVersion: number;
  updatedAt: string;
}
