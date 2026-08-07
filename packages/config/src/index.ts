export const FEATURE_FLAG_DEFINITIONS = {
  PASSKEY_AUTH_ENABLED: 'Passkey account authentication',
  VERIFIED_EMAIL_AUTH_ENABLED: 'Verified-email account authentication',
  ACCOUNT_RECOVERY_ENABLED: 'Credential recovery',
  ACCOUNT_DATA_ACCESS_ENABLED: 'Private account data access',
  ACCOUNT_EXPORT_ENABLED: 'Private account data export',
  ACCOUNT_CORRECTION_ENABLED: 'Account data correction',
  ACCOUNT_DELETION_ENABLED: 'Account deletion workflow',
  PRIVILEGED_ACCESS_ENABLED: 'Moderator and administrator sessions',
  NATIVE_PARTICIPATION_ENABLED: 'Native human participation',
  CIVIC_SIGNAL_ENABLED: 'Civic Signal monitoring and briefings',
  REPRESENTATIVE_SIGNALS_ENABLED: 'Human representative signals',
  CATEGORY_RATINGS_ENABLED: 'Human category ratings',
  COMMUNITY_CONTEXT_ENABLED: 'Moderated community context',
  EVIDENCE_SUBMISSION_ENABLED: 'Evidence submission',
  AI_RESEARCH_ENABLED: 'AI-assisted research drafts',
  VERUS_ID_LINKING_ENABLED: 'Optional VerusID account linking',
  VERUS_AUTH_ENABLED: 'Optional Verus proof-of-control authentication',
  REPRESENTATIVE_CLAIMS_ENABLED: 'Application-local representative claims',
  REPRESENTATIVE_VERUS_CLAIMS_ENABLED: 'Optional Verus-supported representative claims',
  VERUS_IDENTITY_UPDATE_ENABLED: 'Representative-controlled Verus identity updates',
  CBC_ATTESTATION_ENABLED: 'Checks and Balances Protocol attestation',
  PROVENANCE_WRITES_ENABLED: 'Public provenance manifest writes',
  VERUS_ANCHORING_ENABLED: 'VRSCTEST provenance anchoring',
  COMPOSITE_SCORE_ENABLED: 'Representative Accountability Score publication',
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAG_DEFINITIONS;
export type FeatureFlags = Readonly<Record<FeatureFlagName, boolean>>;
export type RuntimeEnvironment = 'development' | 'test' | 'production';

export const FEATURE_FLAG_NAMES = Object.freeze(
  Object.keys(FEATURE_FLAG_DEFINITIONS) as FeatureFlagName[],
);

export interface RuntimeConfig {
  readonly environment: RuntimeEnvironment;
  readonly featureFlags: FeatureFlags;
  readonly host: string;
  readonly port: number;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = Object.freeze(
  Object.fromEntries(FEATURE_FLAG_NAMES.map((name) => [name, false])) as Record<
    FeatureFlagName,
    boolean
  >,
);

const FEATURE_DEPENDENCIES: Readonly<Partial<Record<FeatureFlagName, readonly FeatureFlagName[]>>> =
  Object.freeze({
    COMPOSITE_SCORE_ENABLED: ['CATEGORY_RATINGS_ENABLED', 'COMMUNITY_CONTEXT_ENABLED'],
    REPRESENTATIVE_VERUS_CLAIMS_ENABLED: [
      'REPRESENTATIVE_CLAIMS_ENABLED',
      'VERUS_ID_LINKING_ENABLED',
    ],
    VERUS_IDENTITY_UPDATE_ENABLED: ['REPRESENTATIVE_CLAIMS_ENABLED', 'VERUS_ID_LINKING_ENABLED'],
    VERUS_ANCHORING_ENABLED: ['PROVENANCE_WRITES_ENABLED'],
    VERUS_AUTH_ENABLED: ['VERUS_ID_LINKING_ENABLED'],
  });

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

function parseHost(value: string | undefined): string {
  const host = value ?? '127.0.0.1';
  if (host === '127.0.0.1' || host === '0.0.0.0') return host;
  throw new Error('HOST must be 127.0.0.1 or 0.0.0.0.');
}

function validateFeatureDependencies(flags: FeatureFlags): void {
  for (const [name, dependencies] of Object.entries(FEATURE_DEPENDENCIES) as Array<
    [FeatureFlagName, readonly FeatureFlagName[]]
  >) {
    if (!flags[name]) continue;
    const missing = dependencies.filter((dependency) => !flags[dependency]);
    if (missing.length > 0) {
      throw new Error(`${name} requires enabled feature gates: ${missing.join(', ')}.`);
    }
  }
}

export function loadFeatureFlags(
  environment: Readonly<Record<string, string | undefined>> = {},
): FeatureFlags {
  const flags = Object.freeze(
    Object.fromEntries(
      FEATURE_FLAG_NAMES.map((name) => [name, parseBoolean(name, environment[name])]),
    ) as Record<FeatureFlagName, boolean>,
  );
  validateFeatureDependencies(flags);
  return flags;
}

export function loadRuntimeConfig(
  environment: Readonly<Record<string, string | undefined>> = {},
): RuntimeConfig {
  return Object.freeze({
    environment: parseEnvironment(environment.NODE_ENV),
    featureFlags: loadFeatureFlags(environment),
    host: parseHost(environment.HOST),
    port: parsePort(environment.PORT),
  });
}

export type FeatureGateBoundary = 'route' | 'domain' | 'worker';

export interface FeatureGateAuditRecord {
  readonly boundary: FeatureGateBoundary;
  readonly decision: 'allow' | 'deny';
  readonly evaluatedAt: string;
  readonly feature: FeatureFlagName;
  readonly operation: string;
  readonly reason: 'explicitly-enabled' | 'disabled-by-default';
}

export interface FeatureGateAuditSink {
  record(entry: FeatureGateAuditRecord): void;
}

export interface FeatureGateEvaluationContext {
  readonly boundary: FeatureGateBoundary;
  readonly operation: string;
}

export class FeatureGateDeniedError extends Error {
  readonly code = 'FEATURE_DISABLED';

  constructor(readonly feature: FeatureFlagName) {
    super('This capability is not available.');
    this.name = 'FeatureGateDeniedError';
  }
}

export class FeatureGateEvaluator {
  constructor(
    private readonly flags: FeatureFlags,
    private readonly audit: FeatureGateAuditSink,
    private readonly now: () => Date = () => new Date(),
  ) {}

  evaluate(feature: FeatureFlagName, context: FeatureGateEvaluationContext): boolean {
    const allowed = this.flags[feature] === true;
    this.audit.record(
      Object.freeze({
        boundary: context.boundary,
        decision: allowed ? 'allow' : 'deny',
        evaluatedAt: this.now().toISOString(),
        feature,
        operation: context.operation,
        reason: allowed ? 'explicitly-enabled' : 'disabled-by-default',
      }),
    );
    return allowed;
  }

  assertEnabled(feature: FeatureFlagName, context: FeatureGateEvaluationContext): void {
    if (!this.evaluate(feature, context)) throw new FeatureGateDeniedError(feature);
  }
}
