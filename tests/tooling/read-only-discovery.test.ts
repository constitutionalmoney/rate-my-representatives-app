import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { describe, expect, it } from 'vitest';

import {
  DISCOVERY_PRIVACY_BOUNDARY,
  PUBLIC_DISCOVERY_CACHE_MAX_AGE_MILLISECONDS,
  PUBLIC_DISCOVERY_REQUEST_BUDGET_MILLISECONDS,
} from '../../packages/discovery/src/index.js';

const root = process.cwd();

async function workspaceFile(...segments: string[]): Promise<string> {
  return readFile(path.join(root, ...segments), 'utf8');
}

describe('issue #30 read-only discovery boundary', () => {
  it('keeps every civic, scoring, tracking, and precise-location path disabled', () => {
    expect(DISCOVERY_PRIVACY_BOUNDARY).toEqual({
      analyticsFields: [
        'deck_load_latency',
        'deck_error',
        'accessibility_error',
        'deck_completion',
      ],
      cardChoiceAnalyticsAllowed: false,
      compositeScoreEnabled: false,
      preciseLocationAccepted: false,
      representativeSignalWritesEnabled: false,
      sessionReplayAllowed: false,
    });
  });

  it('bounds the validated public cache and request latency', () => {
    expect(PUBLIC_DISCOVERY_REQUEST_BUDGET_MILLISECONDS).toBe(8_000);
    expect(PUBLIC_DISCOVERY_CACHE_MAX_AGE_MILLISECONDS).toBe(7 * 24 * 60 * 60 * 1_000);
  });

  it('offers native no-drag controls and screen-reader-safe gesture behavior', async () => {
    const nativeScreen = await workspaceFile('apps', 'mobile', 'src', 'discovery-screen.tsx');
    expect(nativeScreen).toContain('Support preview');
    expect(nativeScreen).toContain('Concern preview');
    expect(nativeScreen).toContain('Skip — no judgment');
    expect(nativeScreen).toContain('Open sourced record');
    expect(nativeScreen).toContain('screenReaderChanged');
    expect(nativeScreen).toContain('setGesturesEnabled(false)');
    expect(nativeScreen).toContain('allowFontScaling');
  });

  it('ships a public-only PWA worker with no write interception or private API caching', async () => {
    const serviceWorker = await workspaceFile('apps', 'web', 'public', 'sw.js');
    expect(serviceWorker).toContain("request.method !== 'GET'");
    expect(serviceWorker).toContain("request.headers.has('authorization')");
    expect(serviceWorker).toContain("cacheControl.includes('public')");
    expect(serviceWorker).not.toMatch(/\/signals|\/participation|\/auth/iu);
  });

  it('does not add a signal command, scoring route, source ingestion, or Verus dependency', async () => {
    const discoveryFiles = [
      await workspaceFile('packages', 'discovery', 'src', 'deck.ts'),
      await workspaceFile('packages', 'discovery', 'src', 'repository.ts'),
      await workspaceFile('apps', 'web', 'src', 'App.tsx'),
      await workspaceFile('apps', 'mobile', 'src', 'discovery-screen.tsx'),
    ].join('\n');
    expect(discoveryFiles).not.toMatch(/RepresentativeSignalCommand|createSignal|submitSignal/iu);
    expect(discoveryFiles).not.toMatch(/updateidentity|getidentitycontent|contentmultimap/iu);
    expect(discoveryFiles).not.toMatch(/\b(?:POST|PUT|PATCH|DELETE)\b/iu);
  });
});
