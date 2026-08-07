import createClient from 'openapi-fetch';

import type { ApiError as ApiErrorSchema } from './generated/api-error.js';
import type { HealthStatus as HealthStatusSchema } from './generated/health-status.js';
import type { JurisdictionRegistry as JurisdictionRegistrySchema } from './generated/jurisdiction-registry.js';
import type { MobileCompatibilityStatus as MobileCompatibilityStatusSchema } from './generated/mobile-compatibility-status.js';
import type { PublicRoleRegistry as PublicRoleRegistrySchema } from './generated/public-role-registry.js';
import type { paths } from './generated/openapi.js';
import {
  parseHealthStatus,
  parseJurisdictionRegistry,
  parseMobileCompatibilityStatus,
  parsePublicRoleRegistry,
} from './validators.js';

export type ApiError = ApiErrorSchema;
export type HealthStatus = HealthStatusSchema;
export type JurisdictionRegistry = JurisdictionRegistrySchema;
export type MobileCompatibilityStatus = MobileCompatibilityStatusSchema;
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
