import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Linking } from 'react-native';

import type { PushPlatformPort } from './push';
import type { SecureStoragePort } from './secure-storage';
import { containsUnsafeControlCharacter } from './text-safety';

export const expoSecureStorage: SecureStoragePort = Object.freeze({
  deleteItemAsync: (key) => SecureStore.deleteItemAsync(key),
  getItemAsync: (key) => SecureStore.getItemAsync(key),
  setItemAsync: (key, value) =>
    SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
});

export const expoPushPlatform: PushPlatformPort = Object.freeze({
  getPermissionStatus: async () => {
    const result = await Notifications.getPermissionsAsync();
    return result.status;
  },
  getToken: async (projectId) => {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  },
  isPhysicalDevice: () => Device.isDevice,
  requestPermission: async () => {
    const result = await Notifications.requestPermissionsAsync();
    return result.status === 'granted' ? 'granted' : 'denied';
  },
  unregister: () => Notifications.unregisterForNotificationsAsync(),
});

export async function openValidatedWalletUrl(url: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Wallet URL was not validated.');
  }
  if (
    parsed.protocol !== 'verus:' ||
    parsed.hostname !== 'request' ||
    parsed.username.length > 0 ||
    parsed.password.length > 0 ||
    parsed.hash.length > 0 ||
    parsed.search.length > 0 ||
    !/^\/[A-Za-z0-9_-]{16,4096}$/u.test(parsed.pathname) ||
    containsUnsafeControlCharacter(url)
  ) {
    throw new Error('Wallet URL was not validated.');
  }
  if (!(await Linking.canOpenURL(url))) return false;
  await Linking.openURL(url);
  return true;
}
