import { describe, expect, it } from 'vitest';

import { publicProfileIdFromPath, resolveWebApiOrigin } from './runtime.js';

describe('web discovery runtime safety', () => {
  it('uses same-origin public API routing and permits explicit loopback development', () => {
    expect(resolveWebApiOrigin('https://app.ratemyrepresentatives.com')).toBe(
      'https://app.ratemyrepresentatives.com',
    );
    expect(resolveWebApiOrigin('http://127.0.0.1:5173', 'http://127.0.0.1:3000')).toBe(
      'http://127.0.0.1:3000',
    );
    expect(() =>
      resolveWebApiOrigin('https://app.ratemyrepresentatives.com', 'https://evil.example'),
    ).toThrow('not allowed');
  });

  it('accepts only one allowlisted opaque profile identifier from the app route', () => {
    expect(
      publicProfileIdFromPath('/app/profiles/profile%3Aca%3Aavery-quill%3Amaple-member%3A2024'),
    ).toBe('profile:ca:avery-quill:maple-member:2024');
    expect(publicProfileIdFromPath('/app/profiles/x/extra')).toBeNull();
    expect(publicProfileIdFromPath('/app/profiles/%0Aunsafe')).toBeNull();
  });
});
