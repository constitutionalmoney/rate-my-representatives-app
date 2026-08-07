import createClient from 'openapi-fetch';

import type { ApiError as ApiErrorSchema } from './generated/api-error.js';
import type { HealthStatus as HealthStatusSchema } from './generated/health-status.js';
import type { JurisdictionRegistry as JurisdictionRegistrySchema } from './generated/jurisdiction-registry.js';
import type { MobileCompatibilityStatus as MobileCompatibilityStatusSchema } from './generated/mobile-compatibility-status.js';
import type { paths } from './generated/openapi.js';
import {
  parseHealthStatus,
  parseJurisdictionRegistry,
  parseMobileCompatibilityStatus,
} from './validators.js';

export type ApiError = ApiErrorSchema;
export type HealthStatus = HealthStatusSchema;
export type JurisdictionRegistry = JurisdictionRegistrySchema;
export type MobileCompatibilityStatus = MobileCompatibilityStatusSchema;
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
