import {
  createAdminClient,
  readApiHealth,
  readJurisdictionAvailability,
  type ApiError,
  type HealthStatus,
} from '@rmr/contracts';

export function readAdminHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createAdminClient(baseUrl, fetchImplementation));
}

export function readAdminJurisdictionAvailability(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<ApiError> {
  return readJurisdictionAvailability(createAdminClient(baseUrl, fetchImplementation));
}
