import {
  continueRepresentationAmbiguity,
  createWebClient,
  readApiHealth,
  readJurisdictionRegistry,
  readRepresentationCapabilities,
  readPeople,
  readPublicProfile,
  readPublicProfiles,
  resolveRepresentationOnce,
  type HealthStatus,
  type JurisdictionRegistry,
  type PublicRoleRegistry,
  type PublicRoleProfile,
  type PublicRoleProfileList,
  type PublicRoleProfileListQuery,
  type RepresentationCapabilities,
  type RepresentationResolution,
  type RepresentationResolutionRequest,
  type RepresentationAmbiguitySelection,
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

export function readWebRepresentationCapabilities(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<RepresentationCapabilities> {
  return readRepresentationCapabilities(createWebClient(baseUrl, fetchImplementation));
}

export function resolveWebRepresentation(
  baseUrl: string,
  request: RepresentationResolutionRequest,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<RepresentationResolution> {
  return resolveRepresentationOnce(createWebClient(baseUrl, fetchImplementation), request);
}

export function continueWebRepresentationAmbiguity(
  baseUrl: string,
  request: RepresentationAmbiguitySelection,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<RepresentationResolution> {
  return continueRepresentationAmbiguity(createWebClient(baseUrl, fetchImplementation), request);
}

export async function readWebPublicProfiles(
  baseUrl: string,
  query: PublicRoleProfileListQuery = {},
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleProfileList> {
  return readPublicProfiles(createWebClient(baseUrl, fetchImplementation), query);
}

export async function readWebPublicProfile(
  baseUrl: string,
  profileId: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleProfile> {
  return readPublicProfile(createWebClient(baseUrl, fetchImplementation), profileId);
}
