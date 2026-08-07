import {
  createPortalClient,
  readApiHealth,
  readJurisdictionAvailability,
  type ApiError,
  type HealthStatus,
} from '@rmr/contracts';

export function readPortalHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createPortalClient(baseUrl, fetchImplementation));
}

export function readPortalJurisdictionAvailability(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<ApiError> {
  return readJurisdictionAvailability(createPortalClient(baseUrl, fetchImplementation));
}
