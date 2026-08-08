import environmentDocument from './mobile-environments.json';

export const mobileEnvironmentNames = ['development', 'staging', 'pilot', 'production'] as const;

export type MobileEnvironmentName = (typeof mobileEnvironmentNames)[number];

export type MobileEnvironment = Readonly<{
  androidPackage: string;
  apiOrigin: string;
  appLinkHost: string;
  appName: string;
  iosBundleIdentifier: string;
  name: MobileEnvironmentName;
  releaseChannel: MobileEnvironmentName;
  scheme: string;
  verusNetwork: 'VRSCTEST' | 'disabled';
}>;

export const mobileEnvironments: Readonly<Record<MobileEnvironmentName, MobileEnvironment>> =
  Object.freeze(
    Object.fromEntries(
      mobileEnvironmentNames.map((name) => [name, Object.freeze(environmentDocument[name])]),
    ) as Record<MobileEnvironmentName, MobileEnvironment>,
  );

export function resolveMobileEnvironment(value: string | undefined): MobileEnvironment {
  const name = value ?? 'development';
  if (!mobileEnvironmentNames.includes(name as MobileEnvironmentName)) {
    throw new Error(`Unsupported RMR_MOBILE_ENV: ${name}`);
  }
  return mobileEnvironments[name as MobileEnvironmentName];
}
