import {
  createWebClient,
  readApiHealth,
  readJurisdictionRegistry,
  type HealthStatus,
  type JurisdictionRegistry,
} from '@rmr/contracts';

export async function readFoundationHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createWebClient(baseUrl, fetchImplementation));
}

export async function readWebJurisdictionRegistry(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<JurisdictionRegistry> {
  return readJurisdictionRegistry(createWebClient(baseUrl, fetchImplementation));
}
