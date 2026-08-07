import createClient from 'openapi-fetch';

import type { ApiError as ApiErrorSchema } from './generated/api-error.js';
import type { HealthStatus as HealthStatusSchema } from './generated/health-status.js';
import type { JurisdictionRegistry as JurisdictionRegistrySchema } from './generated/jurisdiction-registry.js';
import type { MobileCompatibilityStatus as MobileCompatibilityStatusSchema } from './generated/mobile-compatibility-status.js';
import type { PublicRoleProfileList as PublicRoleProfileListSchema } from './generated/public-role-profile-list.js';
import type {
  AppealSection as PublicRoleProfileAppealsSchema,
  CorrectionSection as PublicRoleProfileCorrectionsSchema,
  CoverageSection as PublicRoleProfileCoverageSchema,
  DisputeSection as PublicRoleProfileDisputesSchema,
  PublicRoleProfile as PublicRoleProfileSchema,
  ResponseSection as PublicRoleProfileResponsesSchema,
  SourceSection as PublicRoleProfileSourcesSchema,
} from './generated/public-role-profile.js';
import type { PublicRoleProfileTimeline as PublicRoleProfileTimelineSchema } from './generated/public-role-profile-timeline.js';
import type { PublicRoleRegistry as PublicRoleRegistrySchema } from './generated/public-role-registry.js';
import type { paths } from './generated/openapi.js';
import {
  parseHealthStatus,
  parseJurisdictionRegistry,
  parseMobileCompatibilityStatus,
  parsePublicRoleProfile,
  parsePublicRoleProfileAppeals,
  parsePublicRoleProfileCorrections,
  parsePublicRoleProfileCoverage,
  parsePublicRoleProfileDisputes,
  parsePublicRoleProfileList,
  parsePublicRoleProfileResponses,
  parsePublicRoleProfileSources,
  parsePublicRoleProfileTimeline,
  parsePublicRoleRegistry,
} from './validators.js';

export type ApiError = ApiErrorSchema;
export type HealthStatus = HealthStatusSchema;
export type JurisdictionRegistry = JurisdictionRegistrySchema;
export type MobileCompatibilityStatus = MobileCompatibilityStatusSchema;
export type PublicRoleProfile = PublicRoleProfileSchema;
export type PublicRoleProfileAppeals = PublicRoleProfileAppealsSchema;
export type PublicRoleProfileCorrections = PublicRoleProfileCorrectionsSchema;
export type PublicRoleProfileCoverage = PublicRoleProfileCoverageSchema;
export type PublicRoleProfileDisputes = PublicRoleProfileDisputesSchema;
export type PublicRoleProfileList = PublicRoleProfileListSchema;
export type PublicRoleProfileResponses = PublicRoleProfileResponsesSchema;
export type PublicRoleProfileSources = PublicRoleProfileSourcesSchema;
export type PublicRoleProfileTimeline = PublicRoleProfileTimelineSchema;
export type PublicRoleRegistry = PublicRoleRegistrySchema;
export interface PublicRoleRegistryQuery {
  readonly asOf?: string;
  readonly countryCode?: 'CA' | 'US';
  readonly includeHistorical?: boolean;
  readonly personId?: string;
  readonly officeTermId?: string;
  readonly electionId?: string;
  readonly candidacyId?: string;
}
export interface JurisdictionRegistryQuery {
  readonly asOf?: string;
  readonly countryCode?: 'CA' | 'US';
  readonly jurisdictionId?: string;
  readonly includeHistorical?: boolean;
}
export interface PublicRoleProfileListQuery {
  readonly countryCode?: 'CA' | 'US';
  readonly contextKind?: 'office_term' | 'candidacy';
}
export interface PublicRoleProfileTimelineQuery {
  readonly cursor?: string;
  readonly kind?:
    | 'office_term_transition'
    | 'candidacy_transition'
    | 'source_refresh'
    | 'correction'
    | 'response'
    | 'dispute'
    | 'appeal';
  readonly limit?: number;
}
export const OFFICIAL_CLIENT_SURFACES = [
  'mobile',
  'web',
  'portal',
  'admin',
  'worker',
  'public-sdk',
] as const;
export type OfficialClientSurface = (typeof OFFICIAL_CLIENT_SURFACES)[number];

function createOfficialClient(
  surface: OfficialClientSurface,
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
) {
  return createClient<paths>({
    baseUrl,
    headers: { 'x-rmr-client-surface': surface },
    ...(fetchImplementation ? { fetch: fetchImplementation } : {}),
  });
}

export type RmrApiClient = ReturnType<typeof createOfficialClient>;

export function createMobileClient(baseUrl: string, fetchImplementation?: typeof globalThis.fetch) {
  return createOfficialClient('mobile', baseUrl, fetchImplementation);
}

export function createWebClient(baseUrl: string, fetchImplementation?: typeof globalThis.fetch) {
  return createOfficialClient('web', baseUrl, fetchImplementation);
}

export function createPortalClient(baseUrl: string, fetchImplementation?: typeof globalThis.fetch) {
  return createOfficialClient('portal', baseUrl, fetchImplementation);
}

export function createAdminClient(baseUrl: string, fetchImplementation?: typeof globalThis.fetch) {
  return createOfficialClient('admin', baseUrl, fetchImplementation);
}

export function createWorkerClient(baseUrl: string, fetchImplementation?: typeof globalThis.fetch) {
  return createOfficialClient('worker', baseUrl, fetchImplementation);
}

export function createPublicSdkClient(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
) {
  return createOfficialClient('public-sdk', baseUrl, fetchImplementation);
}

export function createRmrClient(baseUrl: string, fetchImplementation?: typeof globalThis.fetch) {
  return createPublicSdkClient(baseUrl, fetchImplementation);
}

export async function readApiHealth(client: RmrApiClient): Promise<HealthStatus> {
  const { data, error } = await client.GET('/api/v1/health');
  if (error || data === undefined) throw new Error('API health request failed.');
  return parseHealthStatus(data);
}

export async function readJurisdictionRegistry(
  client: RmrApiClient,
  query: JurisdictionRegistryQuery = {},
): Promise<JurisdictionRegistry> {
  const { data, error } = await client.GET('/api/v1/jurisdictions', {
    params: { query },
  });
  if (error || data === undefined) throw new Error('Jurisdiction registry request failed.');
  return parseJurisdictionRegistry(data);
}

/** @deprecated Use readJurisdictionRegistry. */
export async function readJurisdictionAvailability(
  client: RmrApiClient,
): Promise<JurisdictionRegistry> {
  return readJurisdictionRegistry(client);
}

export async function readMobileCompatibility(
  client: RmrApiClient,
): Promise<MobileCompatibilityStatus> {
  const { data, error } = await client.GET('/api/v1/health/mobile');
  if (error || data === undefined) throw new Error('Mobile compatibility request failed.');
  return parseMobileCompatibilityStatus(data);
}

export async function readPeople(
  client: RmrApiClient,
  query: Pick<
    PublicRoleRegistryQuery,
    'asOf' | 'countryCode' | 'includeHistorical' | 'personId'
  > = {},
): Promise<PublicRoleRegistry> {
  const { data, error } = await client.GET('/api/v1/people', { params: { query } });
  if (error || data === undefined) throw new Error('People registry request failed.');
  return parsePublicRoleRegistry(data);
}

export async function readOfficeTerms(
  client: RmrApiClient,
  query: Pick<
    PublicRoleRegistryQuery,
    'asOf' | 'countryCode' | 'includeHistorical' | 'officeTermId'
  > = {},
): Promise<PublicRoleRegistry> {
  const { data, error } = await client.GET('/api/v1/office-terms', { params: { query } });
  if (error || data === undefined) throw new Error('Office-term registry request failed.');
  return parsePublicRoleRegistry(data);
}

export async function readElections(
  client: RmrApiClient,
  query: Pick<
    PublicRoleRegistryQuery,
    'asOf' | 'countryCode' | 'includeHistorical' | 'electionId'
  > = {},
): Promise<PublicRoleRegistry> {
  const { data, error } = await client.GET('/api/v1/elections', { params: { query } });
  if (error || data === undefined) throw new Error('Election registry request failed.');
  return parsePublicRoleRegistry(data);
}

export async function readCandidacies(
  client: RmrApiClient,
  query: Pick<
    PublicRoleRegistryQuery,
    'asOf' | 'countryCode' | 'includeHistorical' | 'candidacyId'
  > = {},
): Promise<PublicRoleRegistry> {
  const { data, error } = await client.GET('/api/v1/candidacies', { params: { query } });
  if (error || data === undefined) throw new Error('Candidacy registry request failed.');
  return parsePublicRoleRegistry(data);
}

export async function readPublicProfiles(
  client: RmrApiClient,
  query: PublicRoleProfileListQuery = {},
): Promise<PublicRoleProfileList> {
  const { data, error } = await client.GET('/api/v1/profiles', { params: { query } });
  if (error || data === undefined) throw new Error('Public profile list request failed.');
  return parsePublicRoleProfileList(data);
}

export async function readPublicProfile(
  client: RmrApiClient,
  profileId: string,
): Promise<PublicRoleProfile> {
  const { data, error } = await client.GET('/api/v1/profiles/{profileId}', {
    params: { path: { profileId } },
  });
  if (error || data === undefined) throw new Error('Public profile request failed.');
  return parsePublicRoleProfile(data);
}

export async function readPublicProfileTimeline(
  client: RmrApiClient,
  profileId: string,
  query: PublicRoleProfileTimelineQuery = {},
): Promise<PublicRoleProfileTimeline> {
  const { data, error } = await client.GET('/api/v1/profiles/{profileId}/timeline', {
    params: { path: { profileId }, query },
  });
  if (error || data === undefined) throw new Error('Public profile timeline request failed.');
  return parsePublicRoleProfileTimeline(data);
}

export async function readPublicProfileSources(
  client: RmrApiClient,
  profileId: string,
): Promise<PublicRoleProfileSources> {
  const { data, error } = await client.GET('/api/v1/profiles/{profileId}/sources', {
    params: { path: { profileId } },
  });
  if (error || data === undefined) throw new Error('Public profile sources request failed.');
  return parsePublicRoleProfileSources(data);
}

export async function readPublicProfileCoverage(
  client: RmrApiClient,
  profileId: string,
): Promise<PublicRoleProfileCoverage> {
  const { data, error } = await client.GET('/api/v1/profiles/{profileId}/coverage', {
    params: { path: { profileId } },
  });
  if (error || data === undefined) throw new Error('Public profile coverage request failed.');
  return parsePublicRoleProfileCoverage(data);
}

export async function readPublicProfileResponses(
  client: RmrApiClient,
  profileId: string,
): Promise<PublicRoleProfileResponses> {
  const { data, error } = await client.GET('/api/v1/profiles/{profileId}/responses', {
    params: { path: { profileId } },
  });
  if (error || data === undefined) throw new Error('Public profile responses request failed.');
  return parsePublicRoleProfileResponses(data);
}

export async function readPublicProfileDisputes(
  client: RmrApiClient,
  profileId: string,
): Promise<PublicRoleProfileDisputes> {
  const { data, error } = await client.GET('/api/v1/profiles/{profileId}/disputes', {
    params: { path: { profileId } },
  });
  if (error || data === undefined) throw new Error('Public profile disputes request failed.');
  return parsePublicRoleProfileDisputes(data);
}

export async function readPublicProfileCorrections(
  client: RmrApiClient,
  profileId: string,
): Promise<PublicRoleProfileCorrections> {
  const { data, error } = await client.GET('/api/v1/profiles/{profileId}/corrections', {
    params: { path: { profileId } },
  });
  if (error || data === undefined) throw new Error('Public profile corrections request failed.');
  return parsePublicRoleProfileCorrections(data);
}

export async function readPublicProfileAppeals(
  client: RmrApiClient,
  profileId: string,
): Promise<PublicRoleProfileAppeals> {
  const { data, error } = await client.GET('/api/v1/profiles/{profileId}/appeals', {
    params: { path: { profileId } },
  });
  if (error || data === undefined) throw new Error('Public profile appeals request failed.');
  return parsePublicRoleProfileAppeals(data);
}
