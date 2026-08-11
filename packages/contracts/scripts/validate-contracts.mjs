import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const openapiPath = path.join(packageDirectory, 'openapi', 'v1.yaml');
const schemaDirectory = path.join(packageDirectory, 'schemas');
const fixtureDirectory = path.join(packageDirectory, 'fixtures');
const httpMethods = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);
const requiredMetadata = [
  'featureStatus',
  'allowedActors',
  'requiredScopes',
  'authentication',
  'recentPresence',
  'privacyClassification',
  'fieldPrivacy',
  'publicSerializer',
  'privateSerializer',
  'idempotency',
  'concurrency',
  'rateLimitClass',
  'errorCodes',
  'auditEffect',
  'outboxEffect',
  'pagination',
  'filters',
  'sort',
  'cache',
  'versionPolicy',
  'sourceMetadata',
];
const initialRouteFamilies = [
  '/api/v1/jurisdictions',
  '/api/v1/representation/capabilities',
  '/api/v1/representation/resolve',
  '/api/v1/representation/resolve/ambiguity',
  '/api/v1/people',
  '/api/v1/offices',
  '/api/v1/office-terms',
  '/api/v1/elections',
  '/api/v1/candidacies',
  '/api/v1/profiles',
  '/api/v1/profiles/{profileId}',
  '/api/v1/profiles/{profileId}/timeline',
  '/api/v1/profiles/{profileId}/sources',
  '/api/v1/profiles/{profileId}/coverage',
  '/api/v1/profiles/{profileId}/responses',
  '/api/v1/profiles/{profileId}/disputes',
  '/api/v1/profiles/{profileId}/corrections',
  '/api/v1/profiles/{profileId}/appeals',
  '/api/v1/sources',
  '/api/v1/claims',
  '/api/v1/coverage',
  '/api/v1/methodologies',
  '/api/v1/auth',
  '/api/v1/account',
  '/api/v1/account/broad-jurisdiction',
  '/api/v1/account/broad-jurisdiction/{preferenceId}',
  '/api/v1/representative-claims',
  '/api/v1/staff-delegations',
  '/api/v1/representative-signals',
  '/api/v1/category-ratings',
  '/api/v1/community-context',
  '/api/v1/evidence',
  '/api/v1/responses',
  '/api/v1/disputes',
  '/api/v1/corrections',
  '/api/v1/appeals',
  '/api/v1/civic-signal',
  '/api/v1/notifications',
  '/api/v1/verus',
  '/api/v1/provenance',
  '/api/v1/health',
  '/api/v1/health/mobile',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizedKey(key) {
  return key.toLowerCase().replaceAll(/[^a-z]/g, '');
}

function propertyKeys(schema, output = []) {
  if (schema === null || typeof schema !== 'object') return output;
  if (schema.properties && typeof schema.properties === 'object') {
    output.push(...Object.keys(schema.properties));
  }
  for (const value of Object.values(schema)) propertyKeys(value, output);
  return output;
}

const schemaFiles = (await readdir(schemaDirectory))
  .filter((filename) => filename.endsWith('.schema.json'))
  .sort();
const schemas = new Map();
const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true, strict: true });
addFormats(ajv);
ajv.addVocabulary([
  'x-rmr-agent-access',
  'x-rmr-allowed-actors',
  'x-rmr-feature-status',
  'x-rmr-human-intent',
]);

for (const filename of schemaFiles) {
  const schema = JSON.parse(await readFile(path.join(schemaDirectory, filename), 'utf8'));
  assert(ajv.validateSchema(schema), `${filename} is not valid JSON Schema: ${ajv.errorsText()}`);
  ajv.addSchema(schema);
  schemas.set(filename, schema);
}

const api = await SwaggerParser.validate(openapiPath);
for (const pathname of initialRouteFamilies) {
  assert(api.paths?.[pathname], `Initial route family is missing: ${pathname}`);
}

const operationIds = new Set();
for (const [pathname, pathItem] of Object.entries(api.paths ?? {})) {
  const operations = Object.entries(pathItem).filter(([method]) => httpMethods.has(method));
  if (operations.length === 0) {
    assert(
      ['proposed', 'disabled'].includes(pathItem['x-rmr-feature-status']),
      `${pathname} has no operation and must declare a proposed/disabled path status.`,
    );
  }
  for (const [method, operation] of operations) {
    assert(operation.operationId, `${method.toUpperCase()} ${pathname} has no operationId.`);
    assert(
      !operationIds.has(operation.operationId),
      `Duplicate operationId: ${operation.operationId}`,
    );
    operationIds.add(operation.operationId);
    assert(
      operation.deprecated === false,
      `${operation.operationId} must declare deprecation state.`,
    );
    const metadata = operation['x-rmr-contract'];
    assert(
      metadata && typeof metadata === 'object',
      `${operation.operationId} has no x-rmr-contract.`,
    );
    for (const key of requiredMetadata) {
      assert(
        Object.hasOwn(metadata, key),
        `${operation.operationId} is missing contract metadata: ${key}`,
      );
    }
    assert(
      Array.isArray(metadata.allowedActors),
      `${operation.operationId} actors must be an array.`,
    );
    assert(
      Array.isArray(metadata.requiredScopes),
      `${operation.operationId} scopes must be an array.`,
    );
    assert(Array.isArray(metadata.errorCodes), `${operation.operationId} errors must be an array.`);
    assert(
      operation.responses && Object.keys(operation.responses).length > 0,
      `${operation.operationId} has no responses.`,
    );
  }
}

assert(operationIds.has('getApiHealth'), 'Operational health operation is missing.');
assert(
  operationIds.has('getMobileCompatibility'),
  'Native mobile contract compatibility operation is missing.',
);
assert(
  operationIds.has('getJurisdictionAvailability'),
  'Operational jurisdiction registry slice is missing.',
);
assert(
  api.paths['/api/v1/jurisdictions'].get['x-rmr-contract'].featureStatus === 'operational',
  'Jurisdiction registry operation must be operational.',
);
assert(
  api.paths['/api/v1/jurisdictions'].get.responses['200'],
  'Jurisdiction registry must publish its successful read response.',
);
for (const operationId of [
  'getPeopleRegistry',
  'getOfficeTermRegistry',
  'getElectionRegistry',
  'getCandidacyRegistry',
]) {
  assert(operationIds.has(operationId), `Issue #59 operation is missing: ${operationId}.`);
}
for (const operationId of [
  'listPublicRoleProfiles',
  'getPublicRoleProfile',
  'getPublicRoleProfileTimeline',
  'getPublicRoleProfileSources',
  'getPublicRoleProfileCoverage',
  'getPublicRoleProfileResponses',
  'getPublicRoleProfileDisputes',
  'getPublicRoleProfileCorrections',
  'getPublicRoleProfileAppeals',
]) {
  assert(operationIds.has(operationId), `Issue #11 operation is missing: ${operationId}.`);
}
for (const operationId of [
  'getRepresentationCapabilities',
  'resolveRepresentationOnce',
  'selectRepresentationAmbiguity',
  'getSavedBroadJurisdiction',
  'saveBroadJurisdiction',
  'updateBroadJurisdiction',
  'deleteBroadJurisdiction',
]) {
  assert(operationIds.has(operationId), `Issue #29 operation is missing: ${operationId}.`);
}
assert(
  operationIds.size === 23,
  'Implemented v1 slices must expose exactly twenty-three operations.',
);

const publicForbidden = new Set([
  'accountid',
  'address',
  'attestationstatus',
  'citizenid',
  'identityevidence',
  'individualcivicactivity',
  'moderatornotes',
  'participantid',
  'preciselocation',
  'privatecivicactivity',
  'privatekey',
  'representativesignal',
  'seedphrase',
  'sessiontoken',
  'signerrpc',
  'subscription',
  'wif',
]);
for (const filename of [
  'api-error.schema.json',
  'coverage-report.schema.json',
  'health-status.schema.json',
  'jurisdiction-registry.schema.json',
  'methodology-indicator-result.schema.json',
  'methodology-release-gate.schema.json',
  'mobile-compatibility-status.schema.json',
  'public-role-profile.schema.json',
  'public-role-registry.schema.json',
  'representation-capabilities.schema.json',
  'representation-resolution.schema.json',
  'saved-broad-jurisdiction.schema.json',
]) {
  for (const key of propertyKeys(schemas.get(filename))) {
    assert(
      !publicForbidden.has(normalizedKey(key)),
      `${filename} exposes prohibited public field ${key}.`,
    );
  }
}

const publicProfile = schemas.get('public-role-profile.schema.json');
assert(
  publicProfile.$defs.methodMetadata.properties.compositeScoreIncluded.const === false,
  'Public profiles must explicitly exclude a composite score.',
);
assert(
  publicProfile.$defs.methodMetadata.properties.signalAggregateIncluded.const === false,
  'Public profiles must explicitly exclude representative-signal aggregates.',
);

const civicSignal = schemas.get('civic-signal-briefing.schema.json');
const representativeSignal = schemas.get('representative-signal-command.schema.json');
assert(
  civicSignal.properties.kind.const === 'civic_signal_briefing',
  'Civic Signal kind is invalid.',
);
assert(
  !Object.hasOwn(civicSignal.properties, 'judgment'),
  'Civic Signal cannot contain human judgment.',
);
assert(
  representativeSignal.properties.kind.const === 'representative_signal_command',
  'Representative signal kind is invalid.',
);
assert(
  representativeSignal['x-rmr-agent-access'] === 'forbidden',
  'Agent signal access must be forbidden.',
);
assert(
  !representativeSignal['x-rmr-allowed-actors'].includes('agent'),
  'An agent cannot be an allowed representative-signal actor.',
);

const fixtureSchemas = new Map([
  ['coverage-report.synthetic.json', 'coverage-report.schema.json'],
  ['health.ready.json', 'health-status.schema.json'],
  ['mobile-compatibility.ready.json', 'mobile-compatibility-status.schema.json'],
  ['jurisdictions.proposed.json', 'api-error.schema.json'],
  ['jurisdictions.synthetic.json', 'jurisdiction-registry.schema.json'],
  ['methodology-indicator.synthetic.json', 'methodology-indicator-result.schema.json'],
  ['methodology-release-gate.synthetic.json', 'methodology-release-gate.schema.json'],
  ['moderation-decision.synthetic.json', 'moderation-decision.schema.json'],
  ['no-social-credit-policy.synthetic.json', 'no-social-credit-policy.schema.json'],
  ['not-found.json', 'api-error.schema.json'],
  ['public-role-profile.synthetic.json', 'public-role-profile.schema.json'],
  ['public-role-registry.synthetic.json', 'public-role-registry.schema.json'],
  ['representation-capabilities.synthetic.json', 'representation-capabilities.schema.json'],
  ['representation-resolution-ca.synthetic.json', 'representation-resolution.schema.json'],
  ['saved-broad-jurisdiction.synthetic.json', 'saved-broad-jurisdiction.schema.json'],
  ['security-domain-policy.synthetic.json', 'security-domain-policy.schema.json'],
  ['source-connector-ca.synthetic.json', 'source-connector-capability.schema.json'],
  ['source-connector-us.synthetic.json', 'source-connector-capability.schema.json'],
  ['source-coverage.synthetic.json', 'source-coverage-snapshot.schema.json'],
  ['threat-control-catalog.synthetic.json', 'threat-control-catalog.schema.json'],
]);
for (const [fixtureName, schemaName] of fixtureSchemas) {
  const fixture = JSON.parse(await readFile(path.join(fixtureDirectory, fixtureName), 'utf8'));
  const schema = schemas.get(schemaName);
  const validate = ajv.getSchema(schema.$id);
  assert(
    validate?.(fixture),
    `${fixtureName} violates ${schemaName}: ${ajv.errorsText(validate?.errors)}`,
  );
}

console.log(
  `Validated OpenAPI 3.1, ${schemaFiles.length} JSON Schemas, operation policy metadata, privacy boundaries, and synthetic fixtures.`,
);
