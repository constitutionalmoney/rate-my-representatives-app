import {
  createPortalClient,
  readApiHealth,
  readJurisdictionRegistry,
  readPeople,
  type HealthStatus,
  type JurisdictionRegistry,
  type PublicRoleRegistry,
} from '@rmr/contracts';

export function readPortalHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createPortalClient(baseUrl, fetchImplementation));
}

export function readPortalPeople(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleRegistry> {
  return readPeople(createPortalClient(baseUrl, fetchImplementation));
}

export function readPortalJurisdictionRegistry(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<JurisdictionRegistry> {
  return readJurisdictionRegistry(createPortalClient(baseUrl, fetchImplementation));
}
