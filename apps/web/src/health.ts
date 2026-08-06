import { createRmrClient } from '@rmr/contracts';
import type { HealthStatus } from '@rmr/contracts';

export async function readFoundationHealth(
  baseUrl: string,
  fetchImplementation?: typeof globalThis.fetch,
): Promise<HealthStatus> {
  const client = createRmrClient(baseUrl, fetchImplementation);
  const { data, error } = await client.GET('/api/v1/health');
  if (error || !data) throw new Error('Foundation health request failed.');
  return data;
}
