import {
  createAdminClient,
  readApiHealth,
  readJurisdictionRegistry,
  type HealthStatus,
  type JurisdictionRegistry,
} from '@rmr/contracts';

export function readAdminHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createAdminClient(baseUrl, fetchImplementation));
}

export function readAdminJurisdictionRegistry(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<JurisdictionRegistry> {
  return readJurisdictionRegistry(createAdminClient(baseUrl, fetchImplementation));
}
