export const FEATURE_FLAG_NAMES = [
  'NATIVE_PARTICIPATION_ENABLED',
  'CIVIC_SIGNAL_ENABLED',
  'REPRESENTATIVE_SIGNALS_ENABLED',
  'CATEGORY_RATINGS_ENABLED',
  'COMMUNITY_CONTEXT_ENABLED',
  'EVIDENCE_SUBMISSION_ENABLED',
  'AI_RESEARCH_ENABLED',
  'VERUS_AUTH_ENABLED',
  'REPRESENTATIVE_VERUS_CLAIMS_ENABLED',
  'VERUS_IDENTITY_UPDATE_ENABLED',
  'CBC_ATTESTATION_ENABLED',
  'VERUS_ANCHORING_ENABLED',
  'COMPOSITE_SCORE_ENABLED',
] as const;

export type FeatureFlagName = (typeof FEATURE_FLAG_NAMES)[number];
export type FeatureFlags = Readonly<Record<FeatureFlagName, boolean>>;
export type RuntimeEnvironment = 'development' | 'test' | 'production';

export interface RuntimeConfig {
  readonly environment: RuntimeEnvironment;
  readonly featureFlags: FeatureFlags;
  readonly port: number;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = Object.freeze(
  Object.fromEntries(FEATURE_FLAG_NAMES.map((name) => [name, false])) as Record<
    FeatureFlagName,
    boolean
  >,
);

function parseBoolean(name: FeatureFlagName, value: string | undefined): boolean {
  if (value === undefined || value === '') return false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${name} must be exactly "true" or "false".`);
}

function parseEnvironment(value: string | undefined): RuntimeEnvironment {
  const environment = value ?? 'development';
  if (environment === 'development' || environment === 'test' || environment === 'production') {
    return environment;
  }
  throw new Error('NODE_ENV must be development, test, or production.');
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? '3000');
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer from 1 through 65535.');
  }
  return port;
}

export function loadFeatureFlags(
  environment: Readonly<Record<string, string | undefined>> = {},
): FeatureFlags {
  return Object.freeze(
    Object.fromEntries(
      FEATURE_FLAG_NAMES.map((name) => [name, parseBoolean(name, environment[name])]),
    ) as Record<FeatureFlagName, boolean>,
  );
}

export function loadRuntimeConfig(
  environment: Readonly<Record<string, string | undefined>> = {},
): RuntimeConfig {
  return Object.freeze({
    environment: parseEnvironment(environment.NODE_ENV),
    featureFlags: loadFeatureFlags(environment),
    port: parsePort(environment.PORT),
  });
}
