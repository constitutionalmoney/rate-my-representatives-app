export {
  createAdminClient,
  createMobileClient,
  createPortalClient,
  createPublicSdkClient,
  createRmrClient,
  createWebClient,
  createWorkerClient,
  continueRepresentationAmbiguity,
  deleteBroadJurisdiction,
  OFFICIAL_CLIENT_SURFACES,
  readApiHealth,
  readJurisdictionAvailability,
  readJurisdictionRegistry,
  readRepresentationCapabilities,
  readSavedBroadJurisdiction,
  readMobileCompatibility,
  readPeople,
  readOfficeTerms,
  readElections,
  readCandidacies,
  readPublicProfile,
  readPublicProfileAppeals,
  readPublicProfileCorrections,
  readPublicProfileCoverage,
  readPublicProfileDisputes,
  readPublicProfiles,
  readPublicProfileResponses,
  readPublicProfileSources,
  readPublicProfileTimeline,
  resolveRepresentationOnce,
  saveBroadJurisdiction,
  updateBroadJurisdiction,
} from './client.js';
export { createContractMockFetch } from './mock.js';
export {
  ContractValidationError,
  parseApiError,
  parseHealthStatus,
  parseJurisdictionRegistry,
  parseMobileCompatibilityStatus,
  parsePublicRoleProfile,
  parsePublicRoleProfileAppeals,
  parsePublicRoleProfileCorrections,
  parsePublicRoleProfileCoverage,
  parsePublicRoleProfileDisputes,
  parsePublicRoleProfileList,
  parsePublicRoleProfileResponses,
  parsePublicRoleProfileSources,
  parsePublicRoleProfileTimeline,
  parsePublicRoleRegistry,
  parseRepresentationAmbiguitySelection,
  parseRepresentationCapabilities,
  parseRepresentationResolution,
  parseRepresentationResolutionRequest,
  parseSavedBroadJurisdiction,
  parseSourceConnectorCapability,
  parseSourceCoverageSnapshot,
} from './validators.js';
export { LOCAL_INFRASTRUCTURE_CONTRACT } from './infrastructure.js';
export type {
  ApiError,
  HealthStatus,
  JurisdictionRegistry,
  JurisdictionRegistryQuery,
  MobileCompatibilityStatus,
  OfficialClientSurface,
  PublicRoleRegistry,
  PublicRoleRegistryQuery,
  PublicRoleProfile,
  PublicRoleProfileAppeals,
  PublicRoleProfileCorrections,
  PublicRoleProfileCoverage,
  PublicRoleProfileDisputes,
  PublicRoleProfileList,
  PublicRoleProfileListQuery,
  PublicRoleProfileResponses,
  PublicRoleProfileSources,
  PublicRoleProfileTimeline,
  PublicRoleProfileTimelineQuery,
  BroadJurisdictionPreferenceCommand,
  RepresentationAmbiguitySelection,
  RepresentationCapabilities,
  RepresentationResolution,
  RepresentationResolutionRequest,
  SavedBroadJurisdiction,
  RmrApiClient,
} from './client.js';
export type { ApiError as ApiErrorSchema } from './generated/api-error.js';
export type { HealthStatus as HealthStatusSchema } from './generated/health-status.js';
export type { JurisdictionRegistry as JurisdictionRegistrySchema } from './generated/jurisdiction-registry.js';
export type { MobileCompatibilityStatus as MobileCompatibilityStatusSchema } from './generated/mobile-compatibility-status.js';
export type { MethodologyIndicatorResultV1 } from './generated/methodology-indicator-result.js';
export type { MethodologyReleaseGateV1 } from './generated/methodology-release-gate.js';
export type { ModerationDecisionV1 } from './generated/moderation-decision.js';
export type { NoSocialCreditPolicyV1 } from './generated/no-social-credit-policy.js';
export type { ThreatControlCatalogV1 } from './generated/threat-control-catalog.js';
export type { PublicRoleRegistry as PublicRoleRegistrySchema } from './generated/public-role-registry.js';
export type { RepresentationAmbiguitySelection as RepresentationAmbiguitySelectionSchema } from './generated/representation-ambiguity-selection.js';
export type { RepresentationCapabilities as RepresentationCapabilitiesSchema } from './generated/representation-capabilities.js';
export type { RepresentationResolutionRequest as RepresentationResolutionRequestSchema } from './generated/representation-resolution-request.js';
export type { RepresentationResolution as RepresentationResolutionSchema } from './generated/representation-resolution.js';
export type { SavedBroadJurisdiction as SavedBroadJurisdictionSchema } from './generated/saved-broad-jurisdiction.js';
export type { PublicRoleProfileList as PublicRoleProfileListSchema } from './generated/public-role-profile-list.js';
export type {
  AppealSection as PublicRoleProfileAppealsSchema,
  CorrectionSection as PublicRoleProfileCorrectionsSchema,
  CoverageSection as PublicRoleProfileCoverageSchema,
  DisputeSection as PublicRoleProfileDisputesSchema,
  PublicRoleProfile as PublicRoleProfileSchema,
  ResponseSection as PublicRoleProfileResponsesSchema,
  SourceSection as PublicRoleProfileSourcesSchema,
} from './generated/public-role-profile.js';
export type { PublicRoleProfileTimeline as PublicRoleProfileTimelineSchema } from './generated/public-role-profile-timeline.js';
export type { SourceConnectorCapabilityV1 } from './generated/source-connector-capability.js';
export type { SourceCoverageSnapshotV1 } from './generated/source-coverage-snapshot.js';
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
export type { CoverageReportV1 } from './generated/coverage-report.js';
export type { InfrastructureServicesContract } from './generated/infrastructure-services.js';
export type { AuditEvent } from './generated/audit-event.js';
export type { OutboxEvent } from './generated/outbox-event.js';
export type { RepresentativeSignalCommand } from './generated/representative-signal-command.js';
export type { SecurityDomainPolicyV1 } from './generated/security-domain-policy.js';
export type { components, operations, paths } from './generated/openapi.js';
