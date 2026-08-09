import {
  continueRepresentationAmbiguity,
  createMobileClient,
  readApiHealth,
  readJurisdictionRegistry,
  readRepresentationCapabilities,
  readMobileCompatibility,
  readPeople,
  readPublicProfile,
  readPublicProfiles,
  resolveRepresentationOnce,
  type HealthStatus,
  type JurisdictionRegistry,
  type MobileCompatibilityStatus,
  type PublicRoleRegistry,
  type PublicRoleProfile,
  type PublicRoleProfileList,
  type PublicRoleProfileListQuery,
  type RepresentationCapabilities,
  type RepresentationResolution,
  type RepresentationResolutionRequest,
  type RepresentationAmbiguitySelection,
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

export function readMobileRepresentationCapabilities(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<RepresentationCapabilities> {
  return readRepresentationCapabilities(createMobileClient(baseUrl, fetchImplementation));
}

export function resolveMobileRepresentation(
  baseUrl: string,
  request: RepresentationResolutionRequest,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<RepresentationResolution> {
  return resolveRepresentationOnce(createMobileClient(baseUrl, fetchImplementation), request);
}

export function continueMobileRepresentationAmbiguity(
  baseUrl: string,
  request: RepresentationAmbiguitySelection,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<RepresentationResolution> {
  return continueRepresentationAmbiguity(createMobileClient(baseUrl, fetchImplementation), request);
}

export function readMobileCompatibilityPolicy(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<MobileCompatibilityStatus> {
  return readMobileCompatibility(createMobileClient(baseUrl, fetchImplementation));
}

export function readMobilePublicProfiles(
  baseUrl: string,
  query: PublicRoleProfileListQuery = {},
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleProfileList> {
  return readPublicProfiles(createMobileClient(baseUrl, fetchImplementation), query);
}

export function readMobilePublicProfile(
  baseUrl: string,
  profileId: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleProfile> {
  return readPublicProfile(createMobileClient(baseUrl, fetchImplementation), profileId);
}
