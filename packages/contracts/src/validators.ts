import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

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
import type { SourceConnectorCapabilityV1 } from './generated/source-connector-capability.js';
import type { SourceCoverageSnapshotV1 } from './generated/source-coverage-snapshot.js';
import {
  API_ERROR_SCHEMA,
  HEALTH_STATUS_SCHEMA,
  JURISDICTION_REGISTRY_SCHEMA,
  MOBILE_COMPATIBILITY_STATUS_SCHEMA,
  PUBLIC_ROLE_PROFILE_LIST_SCHEMA,
  PUBLIC_ROLE_PROFILE_SCHEMA,
  PUBLIC_ROLE_PROFILE_TIMELINE_SCHEMA,
  PUBLIC_ROLE_REGISTRY_SCHEMA,
  SOURCE_CONNECTOR_CAPABILITY_SCHEMA,
  SOURCE_COVERAGE_SNAPSHOT_SCHEMA,
} from './generated/schema-documents.js';

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

function createAjv(boundary: ContractBoundary): Ajv2020 {
  const ajv = new Ajv2020({
    allErrors: true,
    coerceTypes: false,
    removeAdditional: boundary === 'client' ? 'all' : false,
    strict: true,
  });
  addFormats(ajv);
  ajv.addVocabulary([
    'x-rmr-agent-access',
    'x-rmr-allowed-actors',
    'x-rmr-feature-status',
    'x-rmr-human-intent',
  ]);
  return ajv;
}

const serverAjv = createAjv('server');
const clientAjv = createAjv('client');
const serverHealth = serverAjv.compile(HEALTH_STATUS_SCHEMA);
const clientHealth = clientAjv.compile(HEALTH_STATUS_SCHEMA);
const serverJurisdictionRegistry = serverAjv.compile(JURISDICTION_REGISTRY_SCHEMA);
const clientJurisdictionRegistry = clientAjv.compile(JURISDICTION_REGISTRY_SCHEMA);
const serverMobileCompatibility = serverAjv.compile(MOBILE_COMPATIBILITY_STATUS_SCHEMA);
const clientMobileCompatibility = clientAjv.compile(MOBILE_COMPATIBILITY_STATUS_SCHEMA);
const serverPublicRoleProfile = serverAjv.compile(PUBLIC_ROLE_PROFILE_SCHEMA);
const clientPublicRoleProfile = clientAjv.compile(PUBLIC_ROLE_PROFILE_SCHEMA);
const serverPublicRoleProfileList = serverAjv.compile(PUBLIC_ROLE_PROFILE_LIST_SCHEMA);
const clientPublicRoleProfileList = clientAjv.compile(PUBLIC_ROLE_PROFILE_LIST_SCHEMA);
const serverPublicRoleProfileTimeline = serverAjv.compile(PUBLIC_ROLE_PROFILE_TIMELINE_SCHEMA);
const clientPublicRoleProfileTimeline = clientAjv.compile(PUBLIC_ROLE_PROFILE_TIMELINE_SCHEMA);
const profileSchemaId = PUBLIC_ROLE_PROFILE_SCHEMA.$id;
const serverProfileSections = {
  appeals: serverAjv.compile({ $ref: `${profileSchemaId}#/$defs/appealSection` }),
  corrections: serverAjv.compile({ $ref: `${profileSchemaId}#/$defs/correctionSection` }),
  coverage: serverAjv.compile({ $ref: `${profileSchemaId}#/$defs/coverageSection` }),
  disputes: serverAjv.compile({ $ref: `${profileSchemaId}#/$defs/disputeSection` }),
  responses: serverAjv.compile({ $ref: `${profileSchemaId}#/$defs/responseSection` }),
  sources: serverAjv.compile({ $ref: `${profileSchemaId}#/$defs/sourceSection` }),
};
const clientProfileSections = {
  appeals: clientAjv.compile({ $ref: `${profileSchemaId}#/$defs/appealSection` }),
  corrections: clientAjv.compile({ $ref: `${profileSchemaId}#/$defs/correctionSection` }),
  coverage: clientAjv.compile({ $ref: `${profileSchemaId}#/$defs/coverageSection` }),
  disputes: clientAjv.compile({ $ref: `${profileSchemaId}#/$defs/disputeSection` }),
  responses: clientAjv.compile({ $ref: `${profileSchemaId}#/$defs/responseSection` }),
  sources: clientAjv.compile({ $ref: `${profileSchemaId}#/$defs/sourceSection` }),
};
const serverPublicRoleRegistry = serverAjv.compile(PUBLIC_ROLE_REGISTRY_SCHEMA);
const clientPublicRoleRegistry = clientAjv.compile(PUBLIC_ROLE_REGISTRY_SCHEMA);
const serverSourceConnector = serverAjv.compile(SOURCE_CONNECTOR_CAPABILITY_SCHEMA);
const clientSourceConnector = clientAjv.compile(SOURCE_CONNECTOR_CAPABILITY_SCHEMA);
const serverSourceCoverage = serverAjv.compile(SOURCE_COVERAGE_SNAPSHOT_SCHEMA);
const clientSourceCoverage = clientAjv.compile(SOURCE_COVERAGE_SNAPSHOT_SCHEMA);
const serverError = serverAjv.compile(API_ERROR_SCHEMA);
const clientError = clientAjv.compile(API_ERROR_SCHEMA);

function jsonClone(value: unknown): unknown {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value)) as unknown;
}

function parseContract<T>(
  schemaName: string,
  validator: ValidateFunction,
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
    boundary === 'client' ? clientHealth : serverHealth,
    value,
    boundary === 'client',
  );
}

export function parseApiError(value: unknown, boundary: ContractBoundary = 'client'): ApiError {
  return parseContract<ApiError>(
    'ApiError',
    boundary === 'client' ? clientError : serverError,
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
    boundary === 'client' ? clientJurisdictionRegistry : serverJurisdictionRegistry,
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
    boundary === 'client' ? clientMobileCompatibility : serverMobileCompatibility,
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
    boundary === 'client' ? clientPublicRoleRegistry : serverPublicRoleRegistry,
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
    boundary === 'client' ? clientPublicRoleProfile : serverPublicRoleProfile,
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
    boundary === 'client' ? clientPublicRoleProfileList : serverPublicRoleProfileList,
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
    boundary === 'client' ? clientPublicRoleProfileTimeline : serverPublicRoleProfileTimeline,
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
    boundary === 'client' ? clientProfileSections.sources : serverProfileSections.sources,
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
    boundary === 'client' ? clientProfileSections.coverage : serverProfileSections.coverage,
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
    boundary === 'client' ? clientProfileSections.responses : serverProfileSections.responses,
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
    boundary === 'client' ? clientProfileSections.disputes : serverProfileSections.disputes,
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
    boundary === 'client' ? clientProfileSections.corrections : serverProfileSections.corrections,
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
    boundary === 'client' ? clientProfileSections.appeals : serverProfileSections.appeals,
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
    boundary === 'client' ? clientSourceConnector : serverSourceConnector,
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
    boundary === 'client' ? clientSourceCoverage : serverSourceCoverage,
    value,
    boundary === 'client',
  );
}
