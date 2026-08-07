export { createRmrClient } from './client.js';
export { LOCAL_INFRASTRUCTURE_CONTRACT } from './infrastructure.js';
export type { HealthStatus } from './client.js';
export type { HealthStatus as HealthStatusSchema } from './generated/health-status.js';
export type {
  AuthenticatedSession as AuthenticatedSessionSchema,
  AuthenticationContract,
  GenericAuthenticationStart as GenericAuthenticationStartSchema,
  PasskeyAuthenticationStart as PasskeyAuthenticationStartSchema,
  RoleGrant as RoleGrantSchema,
  SessionSummary as SessionSummarySchema,
} from './generated/authentication.js';
export type { FeatureGatesContract } from './generated/feature-gates.js';
export type { InfrastructureServicesContract } from './generated/infrastructure-services.js';
export type { AuditEvent } from './generated/audit-event.js';
export type { OutboxEvent } from './generated/outbox-event.js';
export type { components, operations, paths } from './generated/openapi.js';
