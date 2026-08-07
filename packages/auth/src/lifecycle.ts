import type { FeatureFlagName, FeatureGateEvaluator } from '@rmr/config';

import type { SessionService } from './sessions.js';

export type AccountLifecycleOperation = 'access' | 'correction' | 'deletion' | 'export';

export interface AccountLifecyclePort {
  execute(input: {
    readonly accountId: string;
    readonly operation: AccountLifecycleOperation;
  }): Promise<Readonly<{ status: 'accepted' }>>;
}

const FEATURE_BY_OPERATION: Readonly<Record<AccountLifecycleOperation, FeatureFlagName>> =
  Object.freeze({
    access: 'ACCOUNT_DATA_ACCESS_ENABLED',
    correction: 'ACCOUNT_CORRECTION_ENABLED',
    deletion: 'ACCOUNT_DELETION_ENABLED',
    export: 'ACCOUNT_EXPORT_ENABLED',
  });

export class AccountLifecycleService {
  constructor(
    private readonly featureGates: FeatureGateEvaluator,
    private readonly port: AccountLifecyclePort,
    private readonly sessions: SessionService,
  ) {}

  async request(
    accountId: string,
    operation: AccountLifecycleOperation,
  ): Promise<Readonly<{ status: 'accepted' }>> {
    this.featureGates.assertEnabled(FEATURE_BY_OPERATION[operation], {
      boundary: 'domain',
      operation: `account-${operation}`,
    });
    const result = await this.port.execute({ accountId, operation });
    if (operation === 'deletion') {
      this.sessions.revokeAll(accountId, 'account-deletion');
    }
    return result;
  }
}
