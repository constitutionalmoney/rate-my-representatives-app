export interface ServiceWorkerPort {
  readonly register: (scriptURL: string, options?: RegistrationOptions) => Promise<unknown>;
}

export async function registerPublicDiscoveryWorker(
  port: ServiceWorkerPort | undefined,
  production: boolean,
): Promise<'registered' | 'unavailable'> {
  if (!production || port === undefined) return 'unavailable';
  try {
    await port.register('/sw.js', { scope: '/', updateViaCache: 'none' });
    return 'registered';
  } catch {
    return 'unavailable';
  }
}
