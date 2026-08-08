import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export function createMobileSbom(roots) {
  const components = new Map();

  function collect(dependencies) {
    if (dependencies === undefined) return;
    for (const [name, dependency] of Object.entries(dependencies)) {
      if (typeof dependency.version === 'string') {
        components.set(`${name}@${dependency.version}`, {
          type: 'library',
          name,
          version: dependency.version,
          purl: `pkg:npm/${encodeURIComponent(name)}@${encodeURIComponent(dependency.version)}`,
        });
      }
      collect(dependency.dependencies);
    }
  }

  for (const root of roots) collect(root.dependencies);

  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    version: 1,
    metadata: {
      component: { name: '@rmr/mobile', type: 'application', version: '0.0.0-foundation' },
    },
    components: [...components.values()].sort((left, right) =>
      `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`),
    ),
  };
}

function readProductionDependencyTree() {
  const pnpmScript = process.env.npm_execpath;
  const command = pnpmScript === undefined ? 'pnpm' : process.execPath;
  const arguments_ =
    pnpmScript === undefined
      ? ['--filter', '@rmr/mobile', 'list', '--prod', '--json', '--depth', 'Infinity']
      : [pnpmScript, '--filter', '@rmr/mobile', 'list', '--prod', '--json', '--depth', 'Infinity'];
  const result = spawnSync(command, arguments_, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: pnpmScript === undefined && process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Unable to read mobile dependency tree.');
  }
  return JSON.parse(result.stdout);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.stdout.write(
      `${JSON.stringify(createMobileSbom(readProductionDependencyTree()), null, 2)}\n`,
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
