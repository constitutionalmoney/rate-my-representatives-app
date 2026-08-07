import { describe, expect, it } from 'vitest';

import {
  clearSensitiveLocalState,
  protectedStorageKeys,
  storeProtectedSession,
  type ProtectedStorageKey,
  type SecureStoragePort,
} from './secure-storage';

function memoryStorage(failOnSet?: ProtectedStorageKey, failOnDelete?: ProtectedStorageKey) {
  const values = new Map<ProtectedStorageKey, string>();
  const port: SecureStoragePort = {
    deleteItemAsync: async (key) => {
      if (key === failOnDelete) throw new Error('synthetic secure delete failure');
      values.delete(key);
    },
    getItemAsync: async (key) => values.get(key) ?? null,
    setItemAsync: async (key, value) => {
      if (key === failOnSet) throw new Error('synthetic secure storage failure');
      values.set(key, value);
    },
  };
  return { port, values };
}

describe('Keychain/Keystore-backed session lifecycle contract', () => {
  it('stores only allowlisted protected session keys', async () => {
    const storage = memoryStorage();
    await storeProtectedSession(storage.port, {
      refreshMaterial: 'synthetic-refresh-material-0001',
      sessionReference: 'synthetic-session-reference-0001',
    });
    expect([...storage.values.keys()].sort()).toEqual([
      'rmr.session.reference.v1',
      'rmr.session.refresh.v1',
    ]);
  });

  it.each([
    'sign_out',
    'revoke_all',
    'account_deleted',
    'compromise_response',
    'environment_switch',
  ] as const)('clears every protected key on %s', async (reason) => {
    const storage = memoryStorage();
    for (const key of protectedStorageKeys) storage.values.set(key, `synthetic-${key}-value`);
    const result = await clearSensitiveLocalState(storage.port, reason);
    expect(result.clearedKeys).toEqual(protectedStorageKeys);
    expect(storage.values.size).toBe(0);
  });

  it('rolls back a partial session write', async () => {
    const storage = memoryStorage('rmr.session.reference.v1');
    await expect(
      storeProtectedSession(storage.port, {
        refreshMaterial: 'synthetic-refresh-material-0001',
        sessionReference: 'synthetic-session-reference-0001',
      }),
    ).rejects.toThrow('synthetic secure storage failure');
    expect(storage.values.size).toBe(0);
  });

  it('attempts every protected deletion before reporting a cleanup failure', async () => {
    const storage = memoryStorage(undefined, 'rmr.session.refresh.v1');
    for (const key of protectedStorageKeys) storage.values.set(key, `synthetic-${key}-value`);
    await expect(clearSensitiveLocalState(storage.port, 'compromise_response')).rejects.toThrow(
      'could not be cleared',
    );
    expect([...storage.values.keys()]).toEqual(['rmr.session.refresh.v1']);
  });
});
