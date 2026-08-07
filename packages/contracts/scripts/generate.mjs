import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compileFromFile } from 'json-schema-to-typescript';
import openapiTS, { astToString } from 'openapi-typescript';

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedDirectory = path.join(packageDirectory, 'src', 'generated');
const schemaDefinitions = [
  ['api-error', 'api-error.schema.json', 'API_ERROR_SCHEMA'],
  ['audit-event', 'audit-event.schema.json', 'AUDIT_EVENT_SCHEMA'],
  ['authentication', 'authentication.schema.json', 'AUTHENTICATION_SCHEMA'],
  ['civic-signal-briefing', 'civic-signal-briefing.schema.json', 'CIVIC_SIGNAL_BRIEFING_SCHEMA'],
  ['feature-gates', 'feature-gates.schema.json', 'FEATURE_GATES_SCHEMA'],
  ['health-status', 'health-status.schema.json', 'HEALTH_STATUS_SCHEMA'],
  ['jurisdiction-registry', 'jurisdiction-registry.schema.json', 'JURISDICTION_REGISTRY_SCHEMA'],
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
    'representative-signal-command',
    'representative-signal-command.schema.json',
    'REPRESENTATIVE_SIGNAL_COMMAND_SCHEMA',
  ],
];
const fixtureDefinitions = [
  ['SYNTHETIC_HEALTH_READY', 'health.ready.json'],
  ['SYNTHETIC_MOBILE_COMPATIBILITY_READY', 'mobile-compatibility.ready.json'],
  ['SYNTHETIC_JURISDICTIONS', 'jurisdictions.synthetic.json'],
  ['SYNTHETIC_NOT_FOUND', 'not-found.json'],
];

async function jsonSource(directory, filename) {
  return JSON.parse(await readFile(path.join(packageDirectory, directory, filename), 'utf8'));
}

const schemaDocuments = await Promise.all(
  schemaDefinitions.map(
    async ([, filename, constant]) =>
      `export const ${constant} = ${JSON.stringify(await jsonSource('schemas', filename), null, 2)} as const;`,
  ),
);
const fixtureDocuments = await Promise.all(
  fixtureDefinitions.map(
    async ([constant, filename]) =>
      `export const ${constant} = ${JSON.stringify(await jsonSource('fixtures', filename), null, 2)} as const;`,
  ),
);

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
