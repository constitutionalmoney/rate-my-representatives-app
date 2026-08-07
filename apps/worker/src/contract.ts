import { createWorkerClient, readApiHealth, type HealthStatus } from '@rmr/contracts';

export function readWorkerApiHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  return readApiHealth(createWorkerClient(baseUrl, fetchImplementation));
}
