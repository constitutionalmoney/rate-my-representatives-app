export type RedactedCrashRecord = Readonly<{
  appBuild: number;
  appVersion: string;
  code: 'native_boundary_error';
  environment: string;
  errorType: string;
  occurredAt: string;
  platform: 'android' | 'ios' | 'web';
  routeKind: 'foundation' | 'notifications' | 'profile' | 'wallet_result';
}>;

export function createRedactedCrashRecord(input: {
  appBuild: number;
  appVersion: string;
  environment: string;
  error: unknown;
  occurredAt: string;
  platform: 'android' | 'ios' | 'web';
  routeKind: RedactedCrashRecord['routeKind'];
}): RedactedCrashRecord {
  const errorType =
    input.error instanceof Error && /^[A-Za-z][A-Za-z0-9]{0,63}$/u.test(input.error.name)
      ? input.error.name
      : 'UnknownError';
  if (!Number.isInteger(input.appBuild) || input.appBuild < 1) {
    throw new Error('Crash record app build is invalid.');
  }
  if (!Number.isFinite(Date.parse(input.occurredAt))) {
    throw new Error('Crash record timestamp is invalid.');
  }
  return Object.freeze({
    appBuild: input.appBuild,
    appVersion: input.appVersion,
    code: 'native_boundary_error',
    environment: input.environment,
    errorType,
    occurredAt: input.occurredAt,
    platform: input.platform,
    routeKind: input.routeKind,
  });
}
