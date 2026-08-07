import {
  createWorkerClient,
  readApiHealth,
  readPeople,
  type HealthStatus,
  type PublicRoleRegistry,
} from '@rmr/contracts';

export function readWorkerApiHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createWorkerClient(baseUrl, fetchImplementation));
}

export function readWorkerPeople(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<PublicRoleRegistry> {
  return readPeople(createWorkerClient(baseUrl, fetchImplementation));
}
