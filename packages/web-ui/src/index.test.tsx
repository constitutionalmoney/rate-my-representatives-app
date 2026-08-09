import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  createContractMockFetch,
  createWebClient,
  readPublicProfile,
  readPublicProfiles,
} from '@rmr/contracts';

import {
  FoundationPage,
  RepresentativeCardView,
  RepresentativeIntentPreview,
  SourcedRecordView,
} from './index.js';

describe('FoundationPage', () => {
  it('renders one labeled main surface and an honest status message', () => {
    const html = renderToStaticMarkup(
      <FoundationPage description="Synthetic placeholder." surface="Public web" />,
    );

    expect(html).toContain('<main');
    expect(html).toContain('aria-labelledby="foundation-title"');
    expect(html).toContain('role="status"');
    expect(html).toContain('not operational');
  });
});

describe('read-only discovery surfaces', () => {
  it('renders a mobile-first card with explicit source and no-write labels', async () => {
    const list = await readPublicProfiles(
      createWebClient('http://127.0.0.1:3000', createContractMockFetch()),
      { countryCode: 'CA' },
    );
    const card = list.items[0];
    if (card === undefined) throw new Error('Expected a synthetic profile card.');
    const html = renderToStaticMarkup(
      <RepresentativeCardView
        card={card}
        onConcern={() => undefined}
        onOpenRecord={() => undefined}
        onSkip={() => undefined}
        onSupport={() => undefined}
        position={1}
        total={1}
      />,
    );
    expect(html).toContain('Support preview');
    expect(html).toContain('Skip — no judgment');
    expect(html).toContain('Party / affiliation');
    expect(html).toContain('Not available in reviewed sources');
    expect(html).not.toMatch(/composite score|overall score|\b\d+(?:\.\d+)?\s*\/\s*100/iu);
  });

  it('does not render a signal confirmation or submission control', async () => {
    const list = await readPublicProfiles(
      createWebClient('http://127.0.0.1:3000', createContractMockFetch()),
      { countryCode: 'CA' },
    );
    const card = list.items[0];
    if (card === undefined) throw new Error('Expected a synthetic profile card.');
    const html = renderToStaticMarkup(
      <RepresentativeIntentPreview
        card={card}
        intent="support"
        onCancel={() => undefined}
        onContinueWithoutSaving={() => undefined}
      />,
    );
    expect(html).toContain('Nothing has been submitted');
    expect(html).toContain('Continue without saving');
    expect(html).not.toMatch(/confirm support|submit signal/iu);
  });

  it('keeps source, coverage, methodology, and provenance boundaries visible', async () => {
    const client = createWebClient('http://127.0.0.1:3000', createContractMockFetch());
    const list = await readPublicProfiles(client, { countryCode: 'CA' });
    const profile = await readPublicProfile(client, list.items[0]?.profileId ?? '');
    const html = renderToStaticMarkup(
      <SourcedRecordView cachedAt={null} onBack={() => undefined} profile={profile} />,
    );
    expect(html).toContain('Sources and reproducibility metadata');
    expect(html).toContain('coverage gap, not misconduct');
    expect(html).toContain('Not included or calculated');
    expect(html).toContain('Public browsing has no Verus dependency');
  });
});
