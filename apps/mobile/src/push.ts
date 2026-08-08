import { parseNativeLink, type NativeRoute } from './links';
import type { MobileEnvironment } from '../mobile-environments';

export type PushPlatformPort = Readonly<{
  getPermissionStatus(): Promise<'denied' | 'granted' | 'undetermined'>;
  getToken(projectId: string): Promise<string>;
  isPhysicalDevice(): boolean;
  requestPermission(): Promise<'denied' | 'granted'>;
  unregister(): Promise<void>;
}>;

export type PushBackendPort = Readonly<{
  register(
    input: Readonly<{ environment: string; token: string }>,
  ): Promise<{ registrationId: string }>;
  unregister(registrationId: string): Promise<void>;
}>;

export type PushRegistrationResult =
  | Readonly<{ registered: true; registrationId: string }>
  | Readonly<{
      registered: false;
      reason: 'consent_required' | 'permission_denied' | 'project_unconfigured' | 'simulator';
    }>;

export const pushDeliveryCategories = Object.freeze({
  publicProfileUpdate: Object.freeze({
    categoryId: 'rmr.public_profile_update.v1',
    channelId: 'rmr-public-updates-v1',
  }),
  serviceNotice: Object.freeze({
    categoryId: 'rmr.service_notice.v1',
    channelId: 'rmr-service-notices-v1',
  }),
});

export async function registerPushNotifications(input: {
  backend: PushBackendPort;
  consented: boolean;
  environment: MobileEnvironment;
  platform: PushPlatformPort;
  projectId: string | null;
}): Promise<PushRegistrationResult> {
  if (!input.consented) return { registered: false, reason: 'consent_required' };
  if (!input.platform.isPhysicalDevice()) return { registered: false, reason: 'simulator' };
  if (input.projectId === null || input.projectId.length === 0) {
    return { registered: false, reason: 'project_unconfigured' };
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{7,127}$/u.test(input.projectId)) {
    throw new Error('Push project identifier is invalid.');
  }
  let permission = await input.platform.getPermissionStatus();
  if (permission === 'undetermined') permission = await input.platform.requestPermission();
  if (permission !== 'granted') return { registered: false, reason: 'permission_denied' };
  const token = await input.platform.getToken(input.projectId);
  if (!/^(?:Expo|Exponent)PushToken\[[A-Za-z0-9_-]{8,256}\]$/u.test(token)) {
    throw new Error('Push provider returned an invalid token.');
  }
  const registration = await input.backend.register({
    environment: input.environment.name,
    token,
  });
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/u.test(registration.registrationId)) {
    throw new Error('Push backend returned an invalid opaque registration identifier.');
  }
  return { registered: true, registrationId: registration.registrationId };
}

export async function unregisterPushNotifications(input: {
  backend: PushBackendPort;
  platform: PushPlatformPort;
  registrationId: string;
}): Promise<void> {
  try {
    await input.backend.unregister(input.registrationId);
  } finally {
    await input.platform.unregister();
  }
}

export async function rotatePushRegistration(input: {
  backend: PushBackendPort;
  consented: boolean;
  environment: MobileEnvironment;
  platform: PushPlatformPort;
  previousRegistrationId: string;
  projectId: string | null;
}): Promise<PushRegistrationResult> {
  const replacement = await registerPushNotifications(input);
  if (replacement.registered && replacement.registrationId !== input.previousRegistrationId) {
    await input.backend.unregister(input.previousRegistrationId);
  }
  return replacement;
}

export type SafePushPayload = Readonly<{
  environment: MobileEnvironment['name'];
  eventId: string;
  route: NativeRoute;
}>;

export function parseSafePushPayload(
  value: unknown,
  environment: MobileEnvironment,
): SafePushPayload {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Push payload is invalid.');
  }
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).sort().join(',') !== 'environment,eventId,route' ||
    record.environment !== environment.name ||
    typeof record.eventId !== 'string' ||
    !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/u.test(record.eventId) ||
    typeof record.route !== 'string' ||
    !record.route.startsWith('/app/')
  ) {
    throw new Error('Push payload contains disallowed or mismatched fields.');
  }
  const link = parseNativeLink(`https://${environment.appLinkHost}${record.route}`, environment);
  if (!link.accepted) throw new Error('Push route is not allowlisted.');
  return Object.freeze({
    environment: environment.name,
    eventId: record.eventId,
    route: link.route,
  });
}

export function shouldPresentPush(input: {
  nowMinutes: number;
  quietHours: Readonly<{ endMinutes: number; startMinutes: number }> | null;
  previewsEnabled: boolean;
}): Readonly<{ present: boolean; showPreview: boolean }> {
  if (
    !Number.isInteger(input.nowMinutes) ||
    input.nowMinutes < 0 ||
    input.nowMinutes >= 24 * 60 ||
    (input.quietHours !== null &&
      (!Number.isInteger(input.quietHours.startMinutes) ||
        !Number.isInteger(input.quietHours.endMinutes) ||
        input.quietHours.startMinutes < 0 ||
        input.quietHours.startMinutes >= 24 * 60 ||
        input.quietHours.endMinutes < 0 ||
        input.quietHours.endMinutes >= 24 * 60))
  ) {
    throw new Error('Push quiet-hours policy is invalid.');
  }
  const inQuietHours =
    input.quietHours !== null &&
    (input.quietHours.startMinutes <= input.quietHours.endMinutes
      ? input.nowMinutes >= input.quietHours.startMinutes &&
        input.nowMinutes < input.quietHours.endMinutes
      : input.nowMinutes >= input.quietHours.startMinutes ||
        input.nowMinutes < input.quietHours.endMinutes);
  return Object.freeze({
    present: !inQuietHours,
    showPreview: !inQuietHours && input.previewsEnabled,
  });
}
