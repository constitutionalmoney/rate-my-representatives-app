import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { describe, expect, it } from 'vitest';

import {
  renderAndroidAssociation,
  renderAppleAssociation,
} from '../../scripts/render-mobile-associations.mjs';
import { createMobileSbom } from '../../scripts/mobile-sbom.mjs';
import {
  evaluateMobileBundleBudget,
  mobileBundleBudget,
} from '../../scripts/check-mobile-bundle-budget.mjs';

const root = process.cwd();

describe('native mobile delivery foundation', () => {
  it('renders strict Apple and Android association documents from external public signing IDs', () => {
    expect(
      JSON.parse(
        renderAppleAssociation({
          bundleId: 'com.ratemyrepresentatives.app.staging',
          teamId: 'ABCDE12345',
        }),
      ),
    ).toEqual({
      applinks: {
        apps: [],
        details: [
          {
            appID: 'ABCDE12345.com.ratemyrepresentatives.app.staging',
            paths: ['/app/*'],
          },
        ],
      },
    });
    expect(
      JSON.parse(
        renderAndroidAssociation({
          packageName: 'com.ratemyrepresentatives.app.staging',
          sha256Fingerprints: [Array.from({ length: 32 }, () => 'AA').join(':')],
        }),
      )[0],
    ).toMatchObject({ target: { namespace: 'android_app' } });
    expect(() =>
      renderAndroidAssociation({
        packageName: 'com.ratemyrepresentatives.app',
        sha256Fingerprints: ['not-a-fingerprint'],
      }),
    ).toThrow('fingerprint');
  });

  it('pins secure native dependencies and keeps release secrets external', async () => {
    const packageDocument = JSON.parse(
      await readFile(path.join(root, 'apps', 'mobile', 'package.json'), 'utf8'),
    );
    expect(packageDocument.dependencies).toMatchObject({
      'expo-notifications': '57.0.9',
      'expo-secure-store': '57.0.1',
    });
    const eas = await readFile(path.join(root, 'apps', 'mobile', 'eas.json'), 'utf8');
    expect(eas).toContain('RMR_MOBILE_ENV');
    expect(eas).not.toMatch(/token|password|private.?key|keystore/iu);
  });

  it('produces a deterministic production dependency SBOM', () => {
    const sbom = createMobileSbom([
      {
        dependencies: {
          'expo-secure-store': {
            version: '57.0.1',
            dependencies: { expo: { version: '57.0.11' } },
          },
        },
      },
    ]);
    expect(sbom).toMatchObject({ bomFormat: 'CycloneDX', specVersion: '1.5' });
    expect(sbom.components).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'expo-secure-store' })]),
    );
  });

  it('enforces the native JavaScript and packaged-asset budgets', () => {
    expect(
      evaluateMobileBundleBudget([
        { bytes: mobileBundleBudget.maximumBundleBytes, path: 'android/app.hbc' },
        { bytes: 1024, path: 'assets/icon.png' },
      ]),
    ).toMatchObject({ bundleCount: 1, fileCount: 2 });
    expect(() =>
      evaluateMobileBundleBudget([
        { bytes: mobileBundleBudget.maximumBundleBytes + 1, path: 'ios/app.js' },
      ]),
    ).toThrow('exceeds budget');
  });

  it('keeps representative identity/provenance execution out of the native boundary', async () => {
    const config = await readFile(path.join(root, 'apps', 'mobile', 'app.config.ts'), 'utf8');
    expect(config).toContain('representativeVerusIdProvisioningEnabled: false');
    expect(config).toContain('representativeActivityVdxfWritesEnabled: false');
    expect(config).not.toMatch(/updateidentity|getidentitycontent|RPC_PASSWORD/iu);
  });

  it('keeps the visible foundation scalable, live-announced, and free of gesture-only controls', async () => {
    const app = await readFile(path.join(root, 'apps', 'mobile', 'App.tsx'), 'utf8');
    expect(app).toContain('allowFontScaling');
    expect(app).toContain('accessibilityLiveRegion="polite"');
    expect(app).not.toMatch(/PanResponder|Swipeable/iu);
  });
});
