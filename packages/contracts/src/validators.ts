import type { ErrorObject } from 'ajv';

import type { ApiError } from './generated/api-error.js';
import type { HealthStatus } from './generated/health-status.js';
import type { JurisdictionRegistry } from './generated/jurisdiction-registry.js';
import type { MobileCompatibilityStatus } from './generated/mobile-compatibility-status.js';
import type { PublicRoleProfileList } from './generated/public-role-profile-list.js';
import type {
  AppealSection,
  CorrectionSection,
  CoverageSection,
  DisputeSection,
  PublicRoleProfile,
  ResponseSection,
  SourceSection,
} from './generated/public-role-profile.js';
import type { PublicRoleProfileTimeline } from './generated/public-role-profile-timeline.js';
import type { PublicRoleRegistry } from './generated/public-role-registry.js';
import type { RepresentationAmbiguitySelection } from './generated/representation-ambiguity-selection.js';
import type { RepresentationCapabilities } from './generated/representation-capabilities.js';
import type { RepresentationResolutionRequest } from './generated/representation-resolution-request.js';
import type { RepresentationResolution } from './generated/representation-resolution.js';
import type { SavedBroadJurisdiction } from './generated/saved-broad-jurisdiction.js';
import type { SourceConnectorCapabilityV1 } from './generated/source-connector-capability.js';
import type { SourceCoverageSnapshotV1 } from './generated/source-coverage-snapshot.js';
import * as clientValidators from './generated/client-validators.js';
import * as serverValidators from './generated/server-validators.js';

export type ContractBoundary = 'client' | 'server';

export class ContractValidationError extends Error {
  readonly code = 'CONTRACT_VALIDATION_FAILED';
  readonly issues: readonly string[];

  constructor(schemaName: string, errors: readonly ErrorObject[] | null | undefined) {
    const issues = (errors ?? []).map((error) => `${error.instancePath || '/'}:${error.keyword}`);
    super(`${schemaName} did not satisfy its v1 contract.`);
    this.name = 'ContractValidationError';
    this.issues = Object.freeze(issues);
  }
}

type ContractValidator = ((value: unknown) => boolean) & {
  readonly errors?: readonly ErrorObject[] | null;
};

function jsonClone(value: unknown): unknown {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value)) as unknown;
}

function parseContract<T>(
  schemaName: string,
  validator: ContractValidator,
  value: unknown,
  clone: boolean,
): T {
  const candidate = clone ? jsonClone(value) : value;
  if (!validator(candidate)) throw new ContractValidationError(schemaName, validator.errors);
  return candidate as T;
}

export function parseHealthStatus(
  value: unknown,
  boundary: ContractBoundary = 'client',
): HealthStatus {
  return parseContract<HealthStatus>(
    'HealthStatus',
    boundary === 'client' ? clientValidators.healthStatus : serverValidators.healthStatus,
    value,
    boundary === 'client',
  );
}

export function parseApiError(value: unknown, boundary: ContractBoundary = 'client'): ApiError {
  return parseContract<ApiError>(
    'ApiError',
    boundary === 'client' ? clientValidators.apiError : serverValidators.apiError,
    value,
    boundary === 'client',
  );
}

export function parseJurisdictionRegistry(
  value: unknown,
  boundary: ContractBoundary = 'client',
): JurisdictionRegistry {
  return parseContract<JurisdictionRegistry>(
    'JurisdictionRegistry',
    boundary === 'client'
      ? clientValidators.jurisdictionRegistry
      : serverValidators.jurisdictionRegistry,
    value,
    boundary === 'client',
  );
}

export function parseMobileCompatibilityStatus(
  value: unknown,
  boundary: ContractBoundary = 'client',
): MobileCompatibilityStatus {
  return parseContract<MobileCompatibilityStatus>(
    'MobileCompatibilityStatus',
    boundary === 'client'
      ? clientValidators.mobileCompatibility
      : serverValidators.mobileCompatibility,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleRegistry(
  value: unknown,
  boundary: ContractBoundary = 'client',
): PublicRoleRegistry {
  return parseContract<PublicRoleRegistry>(
    'PublicRoleRegistry',
    boundary === 'client'
      ? clientValidators.publicRoleRegistry
      : serverValidators.publicRoleRegistry,
    value,
    boundary === 'client',
  );
}

export function parseRepresentationCapabilities(
  value: unknown,
  boundary: ContractBoundary = 'client',
): RepresentationCapabilities {
  return parseContract<RepresentationCapabilities>(
    'RepresentationCapabilities',
    boundary === 'client'
      ? clientValidators.representationCapabilities
      : serverValidators.representationCapabilities,
    value,
    boundary === 'client',
  );
}

export function parseRepresentationResolutionRequest(
  value: unknown,
  boundary: ContractBoundary = 'server',
): RepresentationResolutionRequest {
  return parseContract<RepresentationResolutionRequest>(
    'RepresentationResolutionRequest',
    boundary === 'client'
      ? clientValidators.representationResolutionRequest
      : serverValidators.representationResolutionRequest,
    value,
    boundary === 'client',
  );
}

export function parseRepresentationAmbiguitySelection(
  value: unknown,
  boundary: ContractBoundary = 'server',
): RepresentationAmbiguitySelection {
  return parseContract<RepresentationAmbiguitySelection>(
    'RepresentationAmbiguitySelection',
    boundary === 'client'
      ? clientValidators.representationAmbiguitySelection
      : serverValidators.representationAmbiguitySelection,
    value,
    boundary === 'client',
  );
}

export function parseRepresentationResolution(
  value: unknown,
  boundary: ContractBoundary = 'client',
): RepresentationResolution {
  return parseContract<RepresentationResolution>(
    'RepresentationResolution',
    boundary === 'client'
      ? clientValidators.representationResolution
      : serverValidators.representationResolution,
    value,
    boundary === 'client',
  );
}

export function parseSavedBroadJurisdiction(
  value: unknown,
  boundary: ContractBoundary = 'client',
): SavedBroadJurisdiction {
  return parseContract<SavedBroadJurisdiction>(
    'SavedBroadJurisdiction',
    boundary === 'client'
      ? clientValidators.savedBroadJurisdiction
      : serverValidators.savedBroadJurisdiction,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleProfile(
  value: unknown,
  boundary: ContractBoundary = 'client',
): PublicRoleProfile {
  return parseContract<PublicRoleProfile>(
    'PublicRoleProfile',
    boundary === 'client' ? clientValidators.publicRoleProfile : serverValidators.publicRoleProfile,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleProfileList(
  value: unknown,
  boundary: ContractBoundary = 'client',
): PublicRoleProfileList {
  return parseContract<PublicRoleProfileList>(
    'PublicRoleProfileList',
    boundary === 'client'
      ? clientValidators.publicRoleProfileList
      : serverValidators.publicRoleProfileList,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleProfileTimeline(
  value: unknown,
  boundary: ContractBoundary = 'client',
): PublicRoleProfileTimeline {
  return parseContract<PublicRoleProfileTimeline>(
    'PublicRoleProfileTimeline',
    boundary === 'client'
      ? clientValidators.publicRoleProfileTimeline
      : serverValidators.publicRoleProfileTimeline,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleProfileSources(
  value: unknown,
  boundary: ContractBoundary = 'client',
): SourceSection {
  return parseContract<SourceSection>(
    'PublicRoleProfileSources',
    boundary === 'client' ? clientValidators.profileSources : serverValidators.profileSources,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleProfileCoverage(
  value: unknown,
  boundary: ContractBoundary = 'client',
): CoverageSection {
  return parseContract<CoverageSection>(
    'PublicRoleProfileCoverage',
    boundary === 'client' ? clientValidators.profileCoverage : serverValidators.profileCoverage,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleProfileResponses(
  value: unknown,
  boundary: ContractBoundary = 'client',
): ResponseSection {
  return parseContract<ResponseSection>(
    'PublicRoleProfileResponses',
    boundary === 'client' ? clientValidators.profileResponses : serverValidators.profileResponses,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleProfileDisputes(
  value: unknown,
  boundary: ContractBoundary = 'client',
): DisputeSection {
  return parseContract<DisputeSection>(
    'PublicRoleProfileDisputes',
    boundary === 'client' ? clientValidators.profileDisputes : serverValidators.profileDisputes,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleProfileCorrections(
  value: unknown,
  boundary: ContractBoundary = 'client',
): CorrectionSection {
  return parseContract<CorrectionSection>(
    'PublicRoleProfileCorrections',
    boundary === 'client'
      ? clientValidators.profileCorrections
      : serverValidators.profileCorrections,
    value,
    boundary === 'client',
  );
}

export function parsePublicRoleProfileAppeals(
  value: unknown,
  boundary: ContractBoundary = 'client',
): AppealSection {
  return parseContract<AppealSection>(
    'PublicRoleProfileAppeals',
    boundary === 'client' ? clientValidators.profileAppeals : serverValidators.profileAppeals,
    value,
    boundary === 'client',
  );
}

export function parseSourceConnectorCapability(
  value: unknown,
  boundary: ContractBoundary = 'client',
): SourceConnectorCapabilityV1 {
  return parseContract<SourceConnectorCapabilityV1>(
    'SourceConnectorCapabilityV1',
    boundary === 'client' ? clientValidators.sourceConnector : serverValidators.sourceConnector,
    value,
    boundary === 'client',
  );
}

export function parseSourceCoverageSnapshot(
  value: unknown,
  boundary: ContractBoundary = 'client',
): SourceCoverageSnapshotV1 {
  return parseContract<SourceCoverageSnapshotV1>(
    'SourceCoverageSnapshotV1',
    boundary === 'client' ? clientValidators.sourceCoverage : serverValidators.sourceCoverage,
    value,
    boundary === 'client',
  );
}
