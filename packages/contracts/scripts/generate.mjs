import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compileFromFile } from 'json-schema-to-typescript';
import Ajv2020 from 'ajv/dist/2020.js';
import standaloneCode from 'ajv/dist/standalone/index.js';
import addFormats from 'ajv-formats';
import openapiTS, { astToString } from 'openapi-typescript';

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedDirectory = path.join(packageDirectory, 'src', 'generated');
const schemaDefinitions = [
  ['api-error', 'api-error.schema.json', 'API_ERROR_SCHEMA'],
  ['audit-event', 'audit-event.schema.json', 'AUDIT_EVENT_SCHEMA'],
  ['authentication', 'authentication.schema.json', 'AUTHENTICATION_SCHEMA'],
  ['civic-signal-briefing', 'civic-signal-briefing.schema.json', 'CIVIC_SIGNAL_BRIEFING_SCHEMA'],
  ['coverage-report', 'coverage-report.schema.json', 'COVERAGE_REPORT_SCHEMA'],
  ['feature-gates', 'feature-gates.schema.json', 'FEATURE_GATES_SCHEMA'],
  ['health-status', 'health-status.schema.json', 'HEALTH_STATUS_SCHEMA'],
  ['jurisdiction-registry', 'jurisdiction-registry.schema.json', 'JURISDICTION_REGISTRY_SCHEMA'],
  [
    'methodology-indicator-result',
    'methodology-indicator-result.schema.json',
    'METHODOLOGY_INDICATOR_RESULT_SCHEMA',
  ],
  [
    'methodology-release-gate',
    'methodology-release-gate.schema.json',
    'METHODOLOGY_RELEASE_GATE_SCHEMA',
  ],
  [
    'mobile-compatibility-status',
    'mobile-compatibility-status.schema.json',
    'MOBILE_COMPATIBILITY_STATUS_SCHEMA',
  ],
  [
    'infrastructure-services',
    'infrastructure-services.schema.json',
    'INFRASTRUCTURE_SERVICES_SCHEMA',
  ],
  ['outbox-event', 'outbox-event.schema.json', 'OUTBOX_EVENT_SCHEMA'],
  [
    'public-role-profile-list',
    'public-role-profile-list.schema.json',
    'PUBLIC_ROLE_PROFILE_LIST_SCHEMA',
  ],
  ['public-role-profile', 'public-role-profile.schema.json', 'PUBLIC_ROLE_PROFILE_SCHEMA'],
  [
    'public-role-profile-timeline',
    'public-role-profile-timeline.schema.json',
    'PUBLIC_ROLE_PROFILE_TIMELINE_SCHEMA',
  ],
  ['public-role-registry', 'public-role-registry.schema.json', 'PUBLIC_ROLE_REGISTRY_SCHEMA'],
  [
    'representation-ambiguity-selection',
    'representation-ambiguity-selection.schema.json',
    'REPRESENTATION_AMBIGUITY_SELECTION_SCHEMA',
  ],
  [
    'representation-capabilities',
    'representation-capabilities.schema.json',
    'REPRESENTATION_CAPABILITIES_SCHEMA',
  ],
  [
    'representation-resolution-request',
    'representation-resolution-request.schema.json',
    'REPRESENTATION_RESOLUTION_REQUEST_SCHEMA',
  ],
  [
    'representation-resolution',
    'representation-resolution.schema.json',
    'REPRESENTATION_RESOLUTION_SCHEMA',
  ],
  [
    'saved-broad-jurisdiction',
    'saved-broad-jurisdiction.schema.json',
    'SAVED_BROAD_JURISDICTION_SCHEMA',
  ],
  ['security-domain-policy', 'security-domain-policy.schema.json', 'SECURITY_DOMAIN_POLICY_SCHEMA'],
  [
    'source-connector-capability',
    'source-connector-capability.schema.json',
    'SOURCE_CONNECTOR_CAPABILITY_SCHEMA',
  ],
  [
    'source-coverage-snapshot',
    'source-coverage-snapshot.schema.json',
    'SOURCE_COVERAGE_SNAPSHOT_SCHEMA',
  ],
  [
    'representative-signal-command',
    'representative-signal-command.schema.json',
    'REPRESENTATIVE_SIGNAL_COMMAND_SCHEMA',
  ],
];
const fixtureDefinitions = [
  ['SYNTHETIC_COVERAGE_REPORT', 'coverage-report.synthetic.json'],
  ['SYNTHETIC_HEALTH_READY', 'health.ready.json'],
  ['SYNTHETIC_MOBILE_COMPATIBILITY_READY', 'mobile-compatibility.ready.json'],
  ['SYNTHETIC_JURISDICTIONS', 'jurisdictions.synthetic.json'],
  ['SYNTHETIC_METHODOLOGY_INDICATOR', 'methodology-indicator.synthetic.json'],
  ['SYNTHETIC_METHODOLOGY_RELEASE_GATE', 'methodology-release-gate.synthetic.json'],
  ['SYNTHETIC_PUBLIC_ROLE_PROFILE', 'public-role-profile.synthetic.json'],
  ['SYNTHETIC_PUBLIC_ROLE_REGISTRY', 'public-role-registry.synthetic.json'],
  ['SYNTHETIC_REPRESENTATION_CAPABILITIES', 'representation-capabilities.synthetic.json'],
  ['SYNTHETIC_CA_REPRESENTATION_RESOLUTION', 'representation-resolution-ca.synthetic.json'],
  ['SYNTHETIC_SAVED_BROAD_JURISDICTION', 'saved-broad-jurisdiction.synthetic.json'],
  ['SYNTHETIC_SECURITY_DOMAIN_POLICY', 'security-domain-policy.synthetic.json'],
  ['SYNTHETIC_CA_SOURCE_CONNECTOR', 'source-connector-ca.synthetic.json'],
  ['SYNTHETIC_US_SOURCE_CONNECTOR', 'source-connector-us.synthetic.json'],
  ['SYNTHETIC_SOURCE_COVERAGE', 'source-coverage.synthetic.json'],
  ['SYNTHETIC_NOT_FOUND', 'not-found.json'],
];

async function jsonSource(directory, filename) {
  return JSON.parse(await readFile(path.join(packageDirectory, directory, filename), 'utf8'));
}

const schemaValues = Object.fromEntries(
  await Promise.all(
    schemaDefinitions.map(async ([, filename, constant]) => [
      constant,
      await jsonSource('schemas', filename),
    ]),
  ),
);
const schemaDocuments = schemaDefinitions.map(
  ([, , constant]) =>
    `export const ${constant} = ${JSON.stringify(schemaValues[constant], null, 2)} as const;`,
);
const fixtureDocuments = await Promise.all(
  fixtureDefinitions.map(
    async ([constant, filename]) =>
      `export const ${constant} = ${JSON.stringify(await jsonSource('fixtures', filename), null, 2)} as const;`,
  ),
);

function standaloneValidators(boundary) {
  const ajv = new Ajv2020({
    allErrors: true,
    code: { esm: true, source: true },
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
  const profileSchema = schemaValues.PUBLIC_ROLE_PROFILE_SCHEMA;
  ajv.addSchema(profileSchema);
  const profileSchemaId = profileSchema.$id;
  const schemaIds = {
    apiError: schemaValues.API_ERROR_SCHEMA.$id,
    healthStatus: schemaValues.HEALTH_STATUS_SCHEMA.$id,
    jurisdictionRegistry: schemaValues.JURISDICTION_REGISTRY_SCHEMA.$id,
    mobileCompatibility: schemaValues.MOBILE_COMPATIBILITY_STATUS_SCHEMA.$id,
    profileAppeals: 'urn:rmr:validator:profile-appeals',
    profileCorrections: 'urn:rmr:validator:profile-corrections',
    profileCoverage: 'urn:rmr:validator:profile-coverage',
    profileDisputes: 'urn:rmr:validator:profile-disputes',
    profileResponses: 'urn:rmr:validator:profile-responses',
    profileSources: 'urn:rmr:validator:profile-sources',
    publicRoleProfile: profileSchemaId,
    publicRoleProfileList: schemaValues.PUBLIC_ROLE_PROFILE_LIST_SCHEMA.$id,
    publicRoleProfileTimeline: schemaValues.PUBLIC_ROLE_PROFILE_TIMELINE_SCHEMA.$id,
    publicRoleRegistry: schemaValues.PUBLIC_ROLE_REGISTRY_SCHEMA.$id,
    representationAmbiguitySelection: schemaValues.REPRESENTATION_AMBIGUITY_SELECTION_SCHEMA.$id,
    representationCapabilities: schemaValues.REPRESENTATION_CAPABILITIES_SCHEMA.$id,
    representationResolution: schemaValues.REPRESENTATION_RESOLUTION_SCHEMA.$id,
    representationResolutionRequest: schemaValues.REPRESENTATION_RESOLUTION_REQUEST_SCHEMA.$id,
    savedBroadJurisdiction: schemaValues.SAVED_BROAD_JURISDICTION_SCHEMA.$id,
    sourceConnector: schemaValues.SOURCE_CONNECTOR_CAPABILITY_SCHEMA.$id,
    sourceCoverage: schemaValues.SOURCE_COVERAGE_SNAPSHOT_SCHEMA.$id,
  };
  for (const schema of [
    schemaValues.API_ERROR_SCHEMA,
    schemaValues.HEALTH_STATUS_SCHEMA,
    schemaValues.JURISDICTION_REGISTRY_SCHEMA,
    schemaValues.MOBILE_COMPATIBILITY_STATUS_SCHEMA,
    schemaValues.PUBLIC_ROLE_PROFILE_LIST_SCHEMA,
    schemaValues.PUBLIC_ROLE_PROFILE_TIMELINE_SCHEMA,
    schemaValues.PUBLIC_ROLE_REGISTRY_SCHEMA,
    schemaValues.REPRESENTATION_AMBIGUITY_SELECTION_SCHEMA,
    schemaValues.REPRESENTATION_CAPABILITIES_SCHEMA,
    schemaValues.REPRESENTATION_RESOLUTION_REQUEST_SCHEMA,
    schemaValues.REPRESENTATION_RESOLUTION_SCHEMA,
    schemaValues.SAVED_BROAD_JURISDICTION_SCHEMA,
    schemaValues.SOURCE_CONNECTOR_CAPABILITY_SCHEMA,
    schemaValues.SOURCE_COVERAGE_SNAPSHOT_SCHEMA,
  ]) {
    ajv.addSchema(schema);
  }
  for (const [name, ref] of [
    ['profileAppeals', `${profileSchemaId}#/$defs/appealSection`],
    ['profileCorrections', `${profileSchemaId}#/$defs/correctionSection`],
    ['profileCoverage', `${profileSchemaId}#/$defs/coverageSection`],
    ['profileDisputes', `${profileSchemaId}#/$defs/disputeSection`],
    ['profileResponses', `${profileSchemaId}#/$defs/responseSection`],
    ['profileSources', `${profileSchemaId}#/$defs/sourceSection`],
  ]) {
    ajv.addSchema({ $id: schemaIds[name], $ref: ref });
  }
  const dependencies = new Map();
  const validators = standaloneCode(ajv, schemaIds).replace(
    /require\("([^"]+)"\)/g,
    (_match, specifier) => {
      if (!dependencies.has(specifier)) {
        dependencies.set(specifier, `runtimeDependency${dependencies.size}`);
      }
      return dependencies.get(specifier);
    },
  );
  const imports = [...dependencies.entries()]
    .map(([specifier, identifier]) => {
      const namespace = `${identifier}Namespace`;
      return `import * as ${namespace} from '${specifier}.js';\nconst ${identifier} = ${namespace}['module.exports'] ?? (typeof ${namespace}.default === 'object' && ${namespace}.default !== null ? ${namespace}.default : ${namespace});`;
    })
    .join('\n');
  return `/* Generated standalone ${boundary} validators. Do not edit directly. */\n/* eslint-disable */\n// @ts-nocheck\n${imports}\n${validators}\n`;
}

const outputs = [
  {
    path: path.join(generatedDirectory, 'openapi.ts'),
    value: `${astToString(
      await openapiTS(pathToFileURL(path.join(packageDirectory, 'openapi', 'v1.yaml')), {
        alphabetize: true,
      }),
    ).replaceAll('\r\n', '\n')}`,
  },
  ...(await Promise.all(
    schemaDefinitions.map(async ([outputName, filename]) => ({
      path: path.join(generatedDirectory, `${outputName}.ts`),
      value: (
        await compileFromFile(path.join(packageDirectory, 'schemas', filename), {
          bannerComment: `/* Generated from ${filename}. Do not edit directly. */`,
          style: { singleQuote: true, trailingComma: 'all' },
        })
      ).replaceAll('\r\n', '\n'),
    })),
  )),
  {
    path: path.join(generatedDirectory, 'schema-documents.ts'),
    value: `/* Generated JSON Schema documents. Do not edit directly. */\n\n${schemaDocuments.join('\n\n')}\n`,
  },
  {
    path: path.join(generatedDirectory, 'contract-fixtures.ts'),
    value: `/* Generated synthetic contract fixtures. Do not edit directly. */\n\n${fixtureDocuments.join('\n\n')}\n`,
  },
  {
    path: path.join(generatedDirectory, 'client-validators.ts'),
    value: standaloneValidators('client'),
  },
  {
    path: path.join(generatedDirectory, 'server-validators.ts'),
    value: standaloneValidators('server'),
  },
];

if (process.argv.includes('--check')) {
  const stale = [];
  for (const output of outputs) {
    try {
      if ((await readFile(output.path, 'utf8')).replaceAll('\r\n', '\n') !== output.value) {
        stale.push(path.relative(packageDirectory, output.path));
      }
    } catch {
      stale.push(path.relative(packageDirectory, output.path));
    }
  }
  if (stale.length > 0) {
    console.error(`Generated contracts are stale or missing:\n${stale.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('Generated OpenAPI, JSON Schema types, validators, and fixtures are current.');
  }
} else {
  await mkdir(generatedDirectory, { recursive: true });
  for (const output of outputs) await writeFile(output.path, output.value, 'utf8');
  console.log('Generated OpenAPI, JSON Schema types, validators, and fixtures.');
}
