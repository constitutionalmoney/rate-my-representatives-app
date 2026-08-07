import {
  createPortalClient,
  readApiHealth,
  readJurisdictionRegistry,
  type HealthStatus,
  type JurisdictionRegistry,
} from '@rmr/contracts';

export function readPortalHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createPortalClient(baseUrl, fetchImplementation));
}

export function readPortalJurisdictionRegistry(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<JurisdictionRegistry> {
  return readJurisdictionRegistry(createPortalClient(baseUrl, fetchImplementation));
}
