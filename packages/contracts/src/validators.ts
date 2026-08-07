import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import type { ApiError } from './generated/api-error.js';
import type { HealthStatus } from './generated/health-status.js';
import type { JurisdictionRegistry } from './generated/jurisdiction-registry.js';
import type { MobileCompatibilityStatus } from './generated/mobile-compatibility-status.js';
import type { PublicRoleRegistry } from './generated/public-role-registry.js';
import {
  API_ERROR_SCHEMA,
  HEALTH_STATUS_SCHEMA,
  JURISDICTION_REGISTRY_SCHEMA,
  MOBILE_COMPATIBILITY_STATUS_SCHEMA,
  PUBLIC_ROLE_REGISTRY_SCHEMA,
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
const serverPublicRoleRegistry = serverAjv.compile(PUBLIC_ROLE_REGISTRY_SCHEMA);
const clientPublicRoleRegistry = clientAjv.compile(PUBLIC_ROLE_REGISTRY_SCHEMA);
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
