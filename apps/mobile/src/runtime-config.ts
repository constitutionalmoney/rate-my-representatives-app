import { mobileEnvironments, type MobileEnvironmentName } from '../mobile-environments';

export type MobileRuntimeConfig = Readonly<{
  apiContractVersion: 'v1';
  apiOrigin: string;
  appLinkHost: string;
  crashReporting: 'redacted-noop';
  mobileEnvironment: MobileEnvironmentName;
  productStatus: 'read-only-discovery-pilot';
  pushProjectId: string | null;
  releaseChannel: MobileEnvironmentName;
  representativeActivityVdxfWritesEnabled: false;
  representativeVerusIdProvisioningEnabled: false;
  verusIdentityUpdateEnabled: false;
  verusNetwork: 'VRSCTEST' | 'disabled';
  verusWallet: Readonly<{
    enabled: boolean;
    pinnedAndroidPackage: 'com.verusmobile';
    pinnedAndroidVersion: '1.1.0-5';
    scheme: 'verus';
  }>;
}>;

const environments = new Set<MobileEnvironmentName>([
  'development',
  'staging',
  'pilot',
  'production',
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Mobile runtime configuration is missing ${key}.`);
  }
  return value;
}

export function parseMobileRuntimeConfig(value: unknown): MobileRuntimeConfig {
  if (!isObject(value)) throw new Error('Mobile runtime configuration is unavailable.');
  const environment = requireString(value, 'mobileEnvironment');
  if (!environments.has(environment as MobileEnvironmentName)) {
    throw new Error('Mobile runtime environment is not allowlisted.');
  }
  const apiOrigin = requireString(value, 'apiOrigin');
  let parsedApiOrigin: URL;
  try {
    parsedApiOrigin = new URL(apiOrigin);
  } catch {
    throw new Error('Mobile API origin is unsafe for this environment.');
  }
  if (
    !(
      parsedApiOrigin.protocol === 'https:' ||
      (environment === 'development' &&
        parsedApiOrigin.protocol === 'http:' &&
        ['127.0.0.1', 'localhost'].includes(parsedApiOrigin.hostname))
    ) ||
    parsedApiOrigin.username.length > 0 ||
    parsedApiOrigin.password.length > 0 ||
    parsedApiOrigin.pathname !== '/' ||
    parsedApiOrigin.search.length > 0 ||
    parsedApiOrigin.hash.length > 0 ||
    (environment !== 'development' && parsedApiOrigin.port.length > 0)
  ) {
    throw new Error('Mobile API origin is unsafe for this environment.');
  }
  const appLinkHost = requireString(value, 'appLinkHost');
  if (!/^[a-z0-9.-]+$/u.test(appLinkHost)) {
    throw new Error('Mobile app-link host is invalid.');
  }
  if (!isObject(value.verusWallet)) {
    throw new Error('Mobile wallet configuration is unavailable.');
  }
  const verusNetwork = requireString(value, 'verusNetwork');
  if (verusNetwork !== 'VRSCTEST' && verusNetwork !== 'disabled') {
    throw new Error('Mobile Verus network is not allowed.');
  }
  if (
    value.apiContractVersion !== 'v1' ||
    value.crashReporting !== 'redacted-noop' ||
    value.productStatus !== 'read-only-discovery-pilot' ||
    value.releaseChannel !== environment ||
    value.representativeActivityVdxfWritesEnabled !== false ||
    value.representativeVerusIdProvisioningEnabled !== false ||
    value.verusIdentityUpdateEnabled !== false ||
    typeof value.verusWallet.enabled !== 'boolean' ||
    value.verusWallet.pinnedAndroidPackage !== 'com.verusmobile' ||
    value.verusWallet.pinnedAndroidVersion !== '1.1.0-5' ||
    value.verusWallet.scheme !== 'verus' ||
    (value.pushProjectId !== null &&
      value.pushProjectId !== undefined &&
      typeof value.pushProjectId !== 'string')
  ) {
    throw new Error('Mobile runtime safety configuration is invalid.');
  }
  const expectedEnvironment = mobileEnvironments[environment as MobileEnvironmentName];
  if (
    apiOrigin !== expectedEnvironment.apiOrigin ||
    appLinkHost !== expectedEnvironment.appLinkHost ||
    value.releaseChannel !== expectedEnvironment.releaseChannel ||
    verusNetwork !== expectedEnvironment.verusNetwork
  ) {
    throw new Error('Mobile runtime environment fields do not match the selected lane.');
  }
  if (value.verusWallet.enabled && (environment === 'production' || verusNetwork !== 'VRSCTEST')) {
    throw new Error('Mobile wallet harness is restricted to non-production VRSCTEST builds.');
  }
  return Object.freeze({
    apiContractVersion: 'v1',
    apiOrigin,
    appLinkHost,
    crashReporting: 'redacted-noop',
    mobileEnvironment: environment as MobileEnvironmentName,
    productStatus: 'read-only-discovery-pilot',
    pushProjectId: value.pushProjectId ?? null,
    releaseChannel: environment as MobileEnvironmentName,
    representativeActivityVdxfWritesEnabled: false,
    representativeVerusIdProvisioningEnabled: false,
    verusIdentityUpdateEnabled: false,
    verusNetwork,
    verusWallet: Object.freeze({
      enabled: value.verusWallet.enabled,
      pinnedAndroidPackage: 'com.verusmobile',
      pinnedAndroidVersion: '1.1.0-5',
      scheme: 'verus',
    }),
  });
}
