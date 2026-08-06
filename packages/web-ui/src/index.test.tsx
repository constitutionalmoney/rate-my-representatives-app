import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FoundationPage } from './index.js';

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
