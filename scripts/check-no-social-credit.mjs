import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const schemasDirectory = path.join(root, 'packages', 'contracts', 'schemas');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalize(value) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
}

function propertyKeys(value, output = []) {
  if (value === null || typeof value !== 'object') return output;
  if (value.properties && typeof value.properties === 'object') {
    output.push(...Object.keys(value.properties));
  }
  for (const nested of Object.values(value)) propertyKeys(nested, output);
  return output;
}

const forbiddenGeneralizedFields = [
  'citizenScore',
  'civicReputation',
  'ideologyProfile',
  'ideologyScore',
  'loyaltyScore',
  'politicalProfile',
  'reputationScore',
  'socialCredit',
  'trustworthinessScore',
  'citizenRiskScore',
].map(normalize);

const schemaFiles = (await readdir(schemasDirectory)).filter((file) =>
  file.endsWith('.schema.json'),
);
for (const file of schemaFiles) {
  if (file === 'no-social-credit-policy.schema.json') continue;
  const schema = JSON.parse(await readFile(path.join(schemasDirectory, file), 'utf8'));
  for (const key of propertyKeys(schema)) {
    assert(
      !forbiddenGeneralizedFields.includes(normalize(key)),
      `${file} defines prohibited generalized citizen field ${key}.`,
    );
  }
}

const migrationsDirectory = path.join(root, 'packages', 'db', 'migrations');
for (const file of (await readdir(migrationsDirectory)).filter((name) => name.endsWith('.sql'))) {
  const sql = await readFile(path.join(migrationsDirectory, file), 'utf8');
  const ddlIdentifiers = [
    ...sql.matchAll(
      /(?:column|table|view|materialized\s+view)\s+(?:if\s+not\s+exists\s+)?([a-zA-Z0-9_."]+)/gi,
    ),
  ].map((match) => normalize(match[1] ?? ''));
  for (const identifier of ddlIdentifiers) {
    assert(
      !forbiddenGeneralizedFields.some((forbidden) => identifier.includes(forbidden)),
      `${file} materializes prohibited generalized citizen state ${identifier}.`,
    );
  }
}

const requiredAssessmentFields = [
  'citizen data',
  'purpose',
  'ranking or prediction',
  'access',
  'retention',
  'reason and appeal',
  'cross-product use',
  'unrelated access effect',
  'proving tests',
];
for (const file of [
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/rfc.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
]) {
  const contents = (await readFile(path.join(root, file), 'utf8')).toLowerCase();
  assert(contents.includes('no social credit impact assessment'), `${file} lacks the assessment.`);
  for (const field of requiredAssessmentFields) {
    assert(contents.includes(field), `${file} lacks required assessment field: ${field}.`);
  }
}

const environment = await readFile(path.join(root, '.env.example'), 'utf8');
for (const name of [
  'REPRESENTATIVE_SIGNALS_ENABLED',
  'AI_RESEARCH_ENABLED',
  'VERUS_ID_LINKING_ENABLED',
  'VERUS_IDENTITY_UPDATE_ENABLED',
  'PROVENANCE_WRITES_ENABLED',
  'COMPOSITE_SCORE_ENABLED',
]) {
  assert(new RegExp(`^${name}=false$`, 'm').test(environment), `${name} must remain false.`);
}

console.log(
  `No Social Credit scan passed for ${schemaFiles.length} schemas, database DDL identifiers, templates, and high-risk defaults.`,
);
