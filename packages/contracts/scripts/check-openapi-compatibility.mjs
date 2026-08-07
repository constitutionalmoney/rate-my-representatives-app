import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(packageDirectory, '..', '..');
const canonicalPath = 'packages/contracts/openapi/v1.yaml';
const methods = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);

function operationMap(api) {
  const operations = new Map();
  for (const [pathname, pathItem] of Object.entries(api.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (methods.has(method)) operations.set(`${method.toUpperCase()} ${pathname}`, operation);
    }
  }
  return operations;
}

function compareSchema(previous, current, location, findings) {
  if (!previous || typeof previous !== 'object' || !current || typeof current !== 'object') return;
  if (
    previous.type !== undefined &&
    JSON.stringify(previous.type) !== JSON.stringify(current.type)
  ) {
    findings.push(`${location}:type-changed`);
  }
  if (previous.const !== undefined && previous.const !== current.const) {
    findings.push(`${location}:const-changed`);
  }
  if (Array.isArray(previous.enum)) {
    for (const value of previous.enum) {
      if (!current.enum?.includes(value))
        findings.push(`${location}:enum-value-removed:${String(value)}`);
    }
    for (const value of current.enum ?? []) {
      if (!previous.enum.includes(value))
        findings.push(`${location}:enum-value-added:${String(value)}`);
    }
  }
  const previousRequired = new Set(previous.required ?? []);
  const currentRequired = new Set(current.required ?? []);
  for (const field of current.required ?? []) {
    if (!previousRequired.has(field)) findings.push(`${location}:required-field-added:${field}`);
  }
  for (const field of previous.required ?? []) {
    if (!currentRequired.has(field)) findings.push(`${location}:required-field-removed:${field}`);
  }
  for (const [property, previousProperty] of Object.entries(previous.properties ?? {})) {
    const currentProperty = current.properties?.[property];
    if (!currentProperty) {
      findings.push(`${location}:property-removed:${property}`);
    } else {
      compareSchema(previousProperty, currentProperty, `${location}.${property}`, findings);
    }
  }
  if (previous.additionalProperties !== false && current.additionalProperties === false) {
    findings.push(`${location}:unknown-fields-now-rejected`);
  }
  if (previous.items && current.items)
    compareSchema(previous.items, current.items, `${location}[]`, findings);
}

export function findBreakingChanges(previous, current) {
  const findings = [];
  const previousOperations = operationMap(previous);
  const currentOperations = operationMap(current);
  for (const [key, oldOperation] of previousOperations) {
    const newOperation = currentOperations.get(key);
    if (!newOperation) {
      findings.push(`operation-removed:${key}`);
      continue;
    }
    if (oldOperation.operationId !== newOperation.operationId) {
      findings.push(`operation-id-changed:${key}`);
    }
    for (const status of Object.keys(oldOperation.responses ?? {})) {
      if (!newOperation.responses?.[status]) findings.push(`response-removed:${key}:${status}`);
    }
    const oldRequiredParameters = new Set(
      (oldOperation.parameters ?? [])
        .filter((parameter) => parameter.required)
        .map((parameter) => `${parameter.in}:${parameter.name}`),
    );
    for (const parameter of newOperation.parameters ?? []) {
      const identifier = `${parameter.in}:${parameter.name}`;
      if (parameter.required && !oldRequiredParameters.has(identifier)) {
        findings.push(`required-parameter-added:${key}:${identifier}`);
      }
    }
    if (!oldOperation.requestBody?.required && newOperation.requestBody?.required) {
      findings.push(`request-body-now-required:${key}`);
    }
    const oldSecurity = JSON.stringify(oldOperation.security ?? []);
    const newSecurity = JSON.stringify(newOperation.security ?? []);
    if (oldSecurity === '[]' && newSecurity !== '[]')
      findings.push(`authentication-strengthened:${key}`);
    if (
      oldOperation['x-rmr-contract']?.featureStatus === 'operational' &&
      newOperation['x-rmr-contract']?.featureStatus !== 'operational'
    ) {
      findings.push(`operational-feature-regressed:${key}`);
    }
  }
  return findings;
}

function git(arguments_) {
  return spawnSync('git', arguments_, { cwd: repositoryRoot, encoding: 'utf8' });
}

function gitFile(baseRef, filename) {
  const result = git(['show', `${baseRef}:${filename}`]);
  return result.status === 0 ? result.stdout : undefined;
}

function runSelfTest() {
  const previous = {
    paths: {
      '/v1/example': {
        get: {
          operationId: 'getExample',
          responses: { 200: { description: 'ok' } },
          security: [],
          'x-rmr-contract': { featureStatus: 'operational' },
        },
      },
    },
  };
  const removed = findBreakingChanges(previous, { paths: {} });
  if (!removed.includes('operation-removed:GET /v1/example')) {
    throw new Error('Compatibility self-test did not detect an operation removal.');
  }
  const schemaFindings = [];
  compareSchema(
    {
      type: 'object',
      required: ['oldField'],
      properties: { state: { enum: ['ready', 'degraded'] } },
    },
    {
      type: 'object',
      required: ['newField'],
      properties: { state: { enum: ['ready', 'future'] } },
    },
    'Synthetic',
    schemaFindings,
  );
  if (
    !schemaFindings.includes('Synthetic:required-field-added:newField') ||
    !schemaFindings.includes('Synthetic:required-field-removed:oldField') ||
    !schemaFindings.includes('Synthetic.state:enum-value-removed:degraded') ||
    !schemaFindings.includes('Synthetic.state:enum-value-added:future')
  ) {
    throw new Error('Compatibility self-test did not detect schema breaks.');
  }
}

runSelfTest();
const baseArgumentIndex = process.argv.indexOf('--base-ref');
let baseRef = baseArgumentIndex >= 0 ? process.argv[baseArgumentIndex + 1] : 'HEAD^';
if (!baseRef || /^0+$/.test(baseRef)) baseRef = 'HEAD^';
if (!/^[a-zA-Z0-9^~._/-]+$/.test(baseRef)) throw new Error('Unsafe Git base reference.');

const previousOpenApiSource = gitFile(baseRef, canonicalPath);
if (previousOpenApiSource === undefined) {
  console.log(
    'Initial canonical OpenAPI v1 baseline established; compatibility detector self-test passed.',
  );
  process.exit(0);
}

const currentOpenApi = parse(
  await readFile(path.join(packageDirectory, 'openapi', 'v1.yaml'), 'utf8'),
);
const findings = findBreakingChanges(parse(previousOpenApiSource), currentOpenApi);
const previousSchemas = git([
  'ls-tree',
  '-r',
  '--name-only',
  baseRef,
  'packages/contracts/schemas',
]);
if (previousSchemas.status !== 0)
  throw new Error(previousSchemas.stderr || 'Could not list base schemas.');
for (const filename of previousSchemas.stdout
  .split(/\r?\n/)
  .filter((name) => name.endsWith('.schema.json'))) {
  const relativeName = path.posix.relative('packages/contracts/schemas', filename);
  const currentFilename = path.join(packageDirectory, 'schemas', relativeName);
  let currentSchema;
  try {
    currentSchema = JSON.parse(await readFile(currentFilename, 'utf8'));
  } catch {
    findings.push(`schema-removed:${relativeName}`);
    continue;
  }
  const previousSchema = JSON.parse(gitFile(baseRef, filename));
  compareSchema(previousSchema, currentSchema, relativeName, findings);
}

const approvals = JSON.parse(
  await readFile(path.join(packageDirectory, 'compatibility-approvals.json'), 'utf8'),
).approvedBreaks;
const unapproved = findings.filter((finding) => !approvals.includes(finding));
if (unapproved.length > 0) {
  console.error(`Unapproved API compatibility breaks:\n${unapproved.join('\n')}`);
  process.exit(1);
}
console.log(
  findings.length > 0
    ? `All ${findings.length} detected compatibility changes have explicit approval.`
    : 'No breaking OpenAPI or JSON Schema changes detected.',
);
