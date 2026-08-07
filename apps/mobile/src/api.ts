import {
  createMobileClient,
  readApiHealth,
  readJurisdictionAvailability,
  readMobileCompatibility,
  type ApiError,
  type HealthStatus,
  type MobileCompatibilityStatus,
} from '@rmr/contracts';

export function readMobileHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createMobileClient(baseUrl, fetchImplementation));
}

export function readMobileJurisdictionAvailability(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<ApiError> {
  return readJurisdictionAvailability(createMobileClient(baseUrl, fetchImplementation));
}

export function readMobileCompatibilityPolicy(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<MobileCompatibilityStatus> {
  return readMobileCompatibility(createMobileClient(baseUrl, fetchImplementation));
}
