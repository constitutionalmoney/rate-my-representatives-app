import { containsUnsafeControlCharacter } from './text-safety';

export const protectedStorageKeys = [
  'rmr.session.refresh.v1',
  'rmr.session.reference.v1',
  'rmr.device.registration.v1',
] as const;

export type ProtectedStorageKey = (typeof protectedStorageKeys)[number];

export type SecureStoragePort = Readonly<{
  deleteItemAsync(key: ProtectedStorageKey): Promise<void>;
  getItemAsync(key: ProtectedStorageKey): Promise<string | null>;
  setItemAsync(key: ProtectedStorageKey, value: string): Promise<void>;
}>;

export type SensitiveStateClearReason =
  'account_deleted' | 'compromise_response' | 'environment_switch' | 'revoke_all' | 'sign_out';

function validateProtectedValue(value: string): void {
  if (value.length < 16 || value.length > 4096 || containsUnsafeControlCharacter(value)) {
    throw new Error('Protected mobile value is invalid.');
  }
}

export async function storeProtectedSession(
  storage: SecureStoragePort,
  material: Readonly<{ refreshMaterial: string; sessionReference: string }>,
): Promise<void> {
  validateProtectedValue(material.refreshMaterial);
  validateProtectedValue(material.sessionReference);
  await storage.setItemAsync('rmr.session.refresh.v1', material.refreshMaterial);
  try {
    await storage.setItemAsync('rmr.session.reference.v1', material.sessionReference);
  } catch (error) {
    await storage.deleteItemAsync('rmr.session.refresh.v1');
    throw error;
  }
}

export async function clearSensitiveLocalState(
  storage: SecureStoragePort,
  reason: SensitiveStateClearReason,
): Promise<
  Readonly<{ clearedKeys: readonly ProtectedStorageKey[]; reason: SensitiveStateClearReason }>
> {
  const clearedKeys: ProtectedStorageKey[] = [];
  const failures: unknown[] = [];
  for (const key of protectedStorageKeys) {
    try {
      await storage.deleteItemAsync(key);
      clearedKeys.push(key);
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length > 0) {
    throw new AggregateError(failures, 'One or more protected mobile values could not be cleared.');
  }
  return Object.freeze({ clearedKeys: Object.freeze(clearedKeys), reason });
}
