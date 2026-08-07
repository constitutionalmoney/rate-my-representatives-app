import process from 'node:process';
import { fileURLToPath } from 'node:url';

function requireMatch(value, pattern, label) {
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new Error(`${label} is missing or invalid.`);
  }
  return value;
}

export function renderAppleAssociation(input) {
  const teamId = requireMatch(input.teamId, /^[A-Z0-9]{10}$/u, 'Apple team ID');
  const bundleId = requireMatch(
    input.bundleId,
    /^[a-zA-Z][a-zA-Z0-9.-]{2,254}$/u,
    'iOS bundle identifier',
  );
  return `${JSON.stringify(
    {
      applinks: {
        apps: [],
        details: [{ appID: `${teamId}.${bundleId}`, paths: ['/app/*'] }],
      },
    },
    null,
    2,
  )}\n`;
}

export function renderAndroidAssociation(input) {
  const packageName = requireMatch(
    input.packageName,
    /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/u,
    'Android package name',
  );
  if (!Array.isArray(input.sha256Fingerprints) || input.sha256Fingerprints.length < 1) {
    throw new Error('At least one Android signing fingerprint is required.');
  }
  const fingerprints = input.sha256Fingerprints.map((value) =>
    requireMatch(
      value,
      /^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/u,
      'Android SHA-256 signing fingerprint',
    ),
  );
  return `${JSON.stringify(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: packageName,
          sha256_cert_fingerprints: fingerprints,
        },
      },
    ],
    null,
    2,
  )}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const platform = process.argv[2];
  if (platform === 'apple') {
    process.stdout.write(
      renderAppleAssociation({
        bundleId: process.env.RMR_IOS_BUNDLE_ID,
        teamId: process.env.RMR_IOS_TEAM_ID,
      }),
    );
  } else if (platform === 'android') {
    process.stdout.write(
      renderAndroidAssociation({
        packageName: process.env.RMR_ANDROID_PACKAGE,
        sha256Fingerprints: (process.env.RMR_ANDROID_SHA256_CERT_FINGERPRINTS ?? '')
          .split(',')
          .filter(Boolean),
      }),
    );
  } else {
    process.stderr.write('Usage: node scripts/render-mobile-associations.mjs <apple|android>\n');
    process.exitCode = 64;
  }
}
