import { describe, expect, it } from 'vitest';

import { LOCAL_INFRASTRUCTURE_CONTRACT } from './infrastructure.js';

describe('issue #9 generated infrastructure contract', () => {
  it('keeps Verus opt-in, testnet-only, and write-disabled', () => {
    expect(LOCAL_INFRASTRUCTURE_CONTRACT.optionalProfiles.verus).toMatchObject({
      enabledByDefault: false,
      network: 'VRSCTEST',
      writesEnabled: false,
    });
    expect(LOCAL_INFRASTRUCTURE_CONTRACT.coreServices).not.toContain('verus-node');
  });
});
