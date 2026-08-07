import {
  createMobileClient,
  readApiHealth,
  readJurisdictionRegistry,
  readMobileCompatibility,
  readPeople,
  readPublicProfile,
  readPublicProfiles,
  type HealthStatus,
  type JurisdictionRegistry,
  type MobileCompatibilityStatus,
  type PublicRoleRegistry,
  type PublicRoleProfile,
  type PublicRoleProfileList,
} from '@rmr/contracts';

export function readMobileHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createMobileClient(baseUrl, fetchImplementation));
}

export function readMobilePeople(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleRegistry> {
  return readPeople(createMobileClient(baseUrl, fetchImplementation));
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

export function readMobilePublicProfiles(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleProfileList> {
  return readPublicProfiles(createMobileClient(baseUrl, fetchImplementation));
}

export function readMobilePublicProfile(
  baseUrl: string,
  profileId: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleProfile> {
  return readPublicProfile(createMobileClient(baseUrl, fetchImplementation), profileId);
}
