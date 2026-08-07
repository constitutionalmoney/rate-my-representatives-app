import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const clientApps = new Set(['mobile', 'web', 'portal', 'admin']);
const uiPackages = new Set(['mobile-ui', 'web-ui']);
const privateServerPackages = new Set([
  '@rmr/db',
  '@rmr/connectors',
  '@rmr/provenance',
  '@rmr/verus',
]);
const serverApps = new Set(['@rmr/api', '@rmr/worker']);
const sourcePattern = /\b(?:from\s+|import\s*\(\s*)['"](@rmr\/[^/'"]+)/g;

async function workspaceEntries(parent) {
  const directory = path.join(root, parent);
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ parent, name: entry.name }));
}

async function sourceFiles(directory) {
  const output = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await sourceFiles(target)));
    } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      output.push(target);
    }
  }
  return output;
}

function forbiddenFor(entry) {
  if (entry.parent === 'apps' && clientApps.has(entry.name)) {
    return new Set([...privateServerPackages, ...serverApps]);
  }
  if (entry.parent === 'packages' && uiPackages.has(entry.name)) {
    return new Set([...privateServerPackages, ...serverApps]);
  }
  return new Set();
}

const violations = [];
for (const entry of [
  ...(await workspaceEntries('apps')),
  ...(await workspaceEntries('packages')),
]) {
  const packageDirectory = path.join(root, entry.parent, entry.name);
  const manifest = JSON.parse(await readFile(path.join(packageDirectory, 'package.json'), 'utf8'));
  const forbidden = forbiddenFor(entry);
  const declared = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies,
  };
  for (const dependency of Object.keys(declared)) {
    if (forbidden.has(dependency)) {
      violations.push(`${manifest.name} declares forbidden dependency ${dependency}`);
    }
  }

  const sourceDirectory = path.join(packageDirectory, 'src');
  for (const file of await sourceFiles(sourceDirectory)) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(sourcePattern)) {
      const dependency = match[1];
      if (dependency && forbidden.has(dependency)) {
        violations.push(`${path.relative(root, file)} imports forbidden package ${dependency}`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`Workspace dependency boundary violations:\n${violations.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Workspace dependency boundaries are valid.');
}
