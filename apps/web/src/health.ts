import {
  createWebClient,
  readApiHealth,
  readJurisdictionRegistry,
  readPeople,
  type HealthStatus,
  type JurisdictionRegistry,
  type PublicRoleRegistry,
} from '@rmr/contracts';

export async function readFoundationHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createWebClient(baseUrl, fetchImplementation));
}

export async function readWebPeople(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleRegistry> {
  return readPeople(createWebClient(baseUrl, fetchImplementation));
}

export async function readWebJurisdictionRegistry(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<JurisdictionRegistry> {
  return readJurisdictionRegistry(createWebClient(baseUrl, fetchImplementation));
}
