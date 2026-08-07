import {
  createMobileClient,
  readApiHealth,
  readJurisdictionRegistry,
  readMobileCompatibility,
  type HealthStatus,
  type JurisdictionRegistry,
  type MobileCompatibilityStatus,
} from '@rmr/contracts';

export function readMobileHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createMobileClient(baseUrl, fetchImplementation));
}

export function readMobileJurisdictionRegistry(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<JurisdictionRegistry> {
  return readJurisdictionRegistry(createMobileClient(baseUrl, fetchImplementation));
}

export function readMobileCompatibilityPolicy(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<MobileCompatibilityStatus> {
  return readMobileCompatibility(createMobileClient(baseUrl, fetchImplementation));
}
