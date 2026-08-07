import { spawnSync } from 'node:child_process';
import process from 'node:process';

const environments = ['development', 'staging', 'pilot', 'production'];
const configurations = [];
const pnpmScript = process.env.npm_execpath;

for (const environment of environments) {
  const command = pnpmScript === undefined ? 'pnpm' : process.execPath;
  const arguments_ =
    pnpmScript === undefined
      ? ['--filter', '@rmr/mobile', 'exec', 'expo', 'config', '--type', 'public', '--json']
      : [
          pnpmScript,
          '--filter',
          '@rmr/mobile',
          'exec',
          'expo',
          'config',
          '--type',
          'public',
          '--json',
        ];
  const result = spawnSync(command, arguments_, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, RMR_MOBILE_ENV: environment },
    shell: pnpmScript === undefined && process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  const jsonLine = result.stdout.split(/\r?\n/u).find((line) => line.trimStart().startsWith('{'));
  if (jsonLine === undefined) throw new Error(`Expo did not return JSON for ${environment}.`);
  configurations.push(JSON.parse(jsonLine));
}

for (const [field, values] of [
  ['iOS bundle identifier', configurations.map((config) => config.ios?.bundleIdentifier)],
  ['Android package', configurations.map((config) => config.android?.package)],
  ['app-link host', configurations.map((config) => config.extra?.appLinkHost)],
  ['scheme', configurations.map((config) => config.scheme)],
]) {
  if (
    values.some((value) => typeof value !== 'string') ||
    new Set(values).size !== environments.length
  ) {
    throw new Error(`${field} is not isolated across all mobile environments.`);
  }
}

for (const config of configurations) {
  const extra = config.extra ?? {};
  if (
    extra.verusIdentityUpdateEnabled !== false ||
    extra.representativeVerusIdProvisioningEnabled !== false ||
    extra.representativeActivityVdxfWritesEnabled !== false ||
    extra.verusWallet?.enabled !== false ||
    extra.verusWallet?.pinnedAndroidPackage !==
      'org.autonomoussoftwarefoundation.verusmobile.android' ||
    extra.verusWallet?.pinnedAndroidVersion !== 'unverified' ||
    config.android?.allowBackup !== false ||
    config.updates?.enabled !== false
  ) {
    throw new Error(`Unsafe mobile configuration detected for ${String(extra.mobileEnvironment)}.`);
  }
}

const production = configurations.find(
  (config) => config.extra?.mobileEnvironment === 'production',
);
if (production?.extra?.verusNetwork !== 'disabled') {
  throw new Error('Production mobile configuration must not select a Verus network.');
}

process.stdout.write(
  'All mobile environment configurations are isolated and high-risk gates are false.\n',
);
