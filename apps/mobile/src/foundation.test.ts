import { describe, expect, it } from 'vitest';

import { mobileFoundationCopy, mobileFoundationTokens } from '@rmr/mobile-ui';

describe('native foundation', () => {
  it('ships accessible text copy without participation or release claims', () => {
    expect(mobileFoundationCopy.heading).toBe('Rate My Representatives');
    expect(mobileFoundationCopy.status).toContain('not operational');
    expect(mobileFoundationTokens.spacing.medium).toBeGreaterThanOrEqual(20);
  });
});
