import {
  createAdminClient,
  readApiHealth,
  readJurisdictionRegistry,
  readPeople,
  type HealthStatus,
  type JurisdictionRegistry,
  type PublicRoleRegistry,
} from '@rmr/contracts';

export function readAdminHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createAdminClient(baseUrl, fetchImplementation));
}

export function readAdminPeople(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleRegistry> {
  return readPeople(createAdminClient(baseUrl, fetchImplementation));
}

export function readAdminJurisdictionRegistry(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<JurisdictionRegistry> {
  return readJurisdictionRegistry(createAdminClient(baseUrl, fetchImplementation));
}
