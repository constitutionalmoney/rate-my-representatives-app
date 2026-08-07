export {
  createAdminClient,
  createMobileClient,
  createPortalClient,
  createPublicSdkClient,
  createRmrClient,
  createWebClient,
  createWorkerClient,
  OFFICIAL_CLIENT_SURFACES,
  readApiHealth,
  readJurisdictionAvailability,
  readMobileCompatibility,
} from './client.js';
export { createContractMockFetch } from './mock.js';
export {
  ContractValidationError,
  parseApiError,
  parseHealthStatus,
  parseMobileCompatibilityStatus,
} from './validators.js';
export { LOCAL_INFRASTRUCTURE_CONTRACT } from './infrastructure.js';
export type {
  ApiError,
  HealthStatus,
  MobileCompatibilityStatus,
  OfficialClientSurface,
  RmrApiClient,
} from './client.js';
export type { ApiError as ApiErrorSchema } from './generated/api-error.js';
export type { HealthStatus as HealthStatusSchema } from './generated/health-status.js';
export type { MobileCompatibilityStatus as MobileCompatibilityStatusSchema } from './generated/mobile-compatibility-status.js';
export type {
  AuthenticatedSession as AuthenticatedSessionSchema,
  AuthenticationContract,
  GenericAuthenticationStart as GenericAuthenticationStartSchema,
  PasskeyAuthenticationStart as PasskeyAuthenticationStartSchema,
  RoleGrant as RoleGrantSchema,
  SessionSummary as SessionSummarySchema,
} from './generated/authentication.js';
export type { FeatureGatesContract } from './generated/feature-gates.js';
export type { CivicSignalBriefing } from './generated/civic-signal-briefing.js';
export type { InfrastructureServicesContract } from './generated/infrastructure-services.js';
export type { AuditEvent } from './generated/audit-event.js';
export type { OutboxEvent } from './generated/outbox-event.js';
export type { RepresentativeSignalCommand } from './generated/representative-signal-command.js';
export type { components, operations, paths } from './generated/openapi.js';
