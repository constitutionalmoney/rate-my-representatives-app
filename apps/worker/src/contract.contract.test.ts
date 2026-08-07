import { describe, expect, it } from 'vitest';

import { createContractMockFetch } from '@rmr/contracts';

import { readWorkerApiHealth } from './contract.js';

describe('worker generated-client wiring', () => {
  it('validates the versioned health contract with synthetic data', async () => {
    await expect(
      readWorkerApiHealth('http://127.0.0.1:3000', createContractMockFetch()),
    ).resolves.toMatchObject({ status: 'ready' });
  });
});
