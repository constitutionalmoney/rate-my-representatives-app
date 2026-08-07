import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compileFromFile } from 'json-schema-to-typescript';
import openapiTS, { astToString } from 'openapi-typescript';

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedDirectory = path.join(packageDirectory, 'src', 'generated');
const outputs = [
  {
    path: path.join(generatedDirectory, 'openapi.ts'),
    value: `${astToString(
      await openapiTS(pathToFileURL(path.join(packageDirectory, 'openapi.yaml')), {
        alphabetize: true,
      }),
    ).replaceAll('\r\n', '\n')}`,
  },
  {
    path: path.join(generatedDirectory, 'health-status.ts'),
    value: (
      await compileFromFile(path.join(packageDirectory, 'schemas', 'health-status.schema.json'), {
        bannerComment: '/* Generated from health-status.schema.json. Do not edit directly. */',
        style: { singleQuote: true, trailingComma: 'all' },
      })
    ).replaceAll('\r\n', '\n'),
  },
  {
    path: path.join(generatedDirectory, 'authentication.ts'),
    value: (
      await compileFromFile(path.join(packageDirectory, 'schemas', 'authentication.schema.json'), {
        bannerComment: '/* Generated from authentication.schema.json. Do not edit directly. */',
        style: { singleQuote: true, trailingComma: 'all' },
      })
    ).replaceAll('\r\n', '\n'),
  },
  {
    path: path.join(generatedDirectory, 'feature-gates.ts'),
    value: (
      await compileFromFile(path.join(packageDirectory, 'schemas', 'feature-gates.schema.json'), {
        bannerComment: '/* Generated from feature-gates.schema.json. Do not edit directly. */',
        style: { singleQuote: true, trailingComma: 'all' },
      })
    ).replaceAll('\r\n', '\n'),
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
    console.log('Generated OpenAPI and JSON Schema types are current.');
  }
} else {
  await mkdir(generatedDirectory, { recursive: true });
  for (const output of outputs) await writeFile(output.path, output.value, 'utf8');
  console.log('Generated OpenAPI and JSON Schema types.');
}
