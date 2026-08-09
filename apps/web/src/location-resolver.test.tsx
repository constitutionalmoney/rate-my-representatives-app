import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LocationResolver } from './location-resolver';

describe('web location resolver accessibility', () => {
  it('renders labeled manual entry, country choice, privacy copy, and visible recovery', () => {
    const html = renderToStaticMarkup(
      <LocationResolver apiOrigin="http://127.0.0.1:3000" onBrowseCountry={() => undefined} />,
    );
    expect(html).toContain('aria-labelledby="location-resolver-title"');
    expect(html).toContain('type="radio"');
    expect(html).toContain('id="precise-location-once"');
    expect(html).toContain('Browse by country instead');
    expect(html).toContain('never saved, logged, queued, sent to AI, or sent to Verus');
    expect(html).toContain('does not determine residence, citizenship, or voting eligibility');
    expect(html).not.toMatch(/swipe|drag/iu);
  });
});
