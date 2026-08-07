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
  '/api/v1/representation',
  '/api/v1/people',
  '/api/v1/offices',
  '/api/v1/office-terms',
  '/api/v1/elections',
  '/api/v1/candidacies',
  '/api/v1/sources',
  '/api/v1/claims',
  '/api/v1/coverage',
  '/api/v1/methodologies',
  '/api/v1/auth',
  '/api/v1/account',
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
  'Proposed registry status slice is missing.',
);
assert(operationIds.size === 3, 'Issue #60 must not make another route operation callable.');

const publicForbidden = new Set([
  'accountid',
  'address',
  'identityevidence',
  'moderatornotes',
  'preciselocation',
  'privatekey',
  'representativesignal',
  'seedphrase',
  'sessiontoken',
  'signerrpc',
  'wif',
]);
for (const filename of [
  'api-error.schema.json',
  'health-status.schema.json',
  'mobile-compatibility-status.schema.json',
]) {
  for (const key of propertyKeys(schemas.get(filename))) {
    assert(
      !publicForbidden.has(normalizedKey(key)),
      `${filename} exposes prohibited public field ${key}.`,
    );
  }
}

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
  ['health.ready.json', 'health-status.schema.json'],
  ['mobile-compatibility.ready.json', 'mobile-compatibility-status.schema.json'],
  ['jurisdictions.proposed.json', 'api-error.schema.json'],
  ['not-found.json', 'api-error.schema.json'],
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
