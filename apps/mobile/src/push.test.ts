import { describe, expect, it, vi } from 'vitest';

import { mobileEnvironments } from '../mobile-environments';
import {
  parseSafePushPayload,
  pushDeliveryCategories,
  registerPushNotifications,
  rotatePushRegistration,
  shouldPresentPush,
  unregisterPushNotifications,
  type PushBackendPort,
  type PushPlatformPort,
} from './push';

function ports(input?: {
  physical?: boolean;
  permission?: 'denied' | 'granted' | 'undetermined';
  token?: string;
}) {
  const register = vi.fn(async () => ({ registrationId: 'push-registration:synthetic:1' }));
  const backend: PushBackendPort = {
    register,
    unregister: vi.fn(async () => undefined),
  };
  const platform: PushPlatformPort = {
    getPermissionStatus: vi.fn(async () => input?.permission ?? 'granted'),
    getToken: vi.fn(async () => input?.token ?? 'ExponentPushToken[synthetic_token_0001]'),
    isPhysicalDevice: () => input?.physical ?? true,
    requestPermission: vi.fn(async () => 'granted' as const),
    unregister: vi.fn(async () => undefined),
  };
  return { backend, platform, register };
}

describe('privacy-minimized push foundation', () => {
  it('registers only after consent on a configured physical device', async () => {
    const configured = ports();
    await expect(
      registerPushNotifications({
        backend: configured.backend,
        consented: true,
        environment: mobileEnvironments.pilot,
        platform: configured.platform,
        projectId: 'synthetic-project-id',
      }),
    ).resolves.toEqual({ registered: true, registrationId: 'push-registration:synthetic:1' });
    expect(configured.register).toHaveBeenCalledWith({
      environment: 'pilot',
      token: 'ExponentPushToken[synthetic_token_0001]',
    });

    const noConsent = ports();
    await expect(
      registerPushNotifications({
        backend: noConsent.backend,
        consented: false,
        environment: mobileEnvironments.pilot,
        platform: noConsent.platform,
        projectId: 'synthetic-project-id',
      }),
    ).resolves.toEqual({ registered: false, reason: 'consent_required' });
    expect(noConsent.register).not.toHaveBeenCalled();
  });

  it('blocks simulator, unconfigured, denied, malformed, and environment-mismatched states', async () => {
    const simulator = ports({ physical: false });
    await expect(
      registerPushNotifications({
        backend: simulator.backend,
        consented: true,
        environment: mobileEnvironments.staging,
        platform: simulator.platform,
        projectId: 'synthetic-project-id',
      }),
    ).resolves.toEqual({ registered: false, reason: 'simulator' });
    const unconfigured = ports();
    await expect(
      registerPushNotifications({
        backend: unconfigured.backend,
        consented: true,
        environment: mobileEnvironments.staging,
        platform: unconfigured.platform,
        projectId: null,
      }),
    ).resolves.toEqual({ registered: false, reason: 'project_unconfigured' });
    const denied = ports({ permission: 'denied' });
    await expect(
      registerPushNotifications({
        backend: denied.backend,
        consented: true,
        environment: mobileEnvironments.staging,
        platform: denied.platform,
        projectId: 'synthetic-project-id',
      }),
    ).resolves.toEqual({ registered: false, reason: 'permission_denied' });
    const malformed = ports({ token: 'not-a-provider-token' });
    await expect(
      registerPushNotifications({
        backend: malformed.backend,
        consented: true,
        environment: mobileEnvironments.staging,
        platform: malformed.platform,
        projectId: 'synthetic-project-id',
      }),
    ).rejects.toThrow('invalid token');
    expect(() =>
      parseSafePushPayload(
        {
          environment: 'production',
          eventId: 'event:1',
          politicalSummary: 'must not be present',
          route: '/app/profiles/profile:1',
        },
        mobileEnvironments.staging,
      ),
    ).toThrow('disallowed');
  });

  it('uses minimal allowlisted routes, quiet hours, private previews, and unsubscribe', async () => {
    expect(pushDeliveryCategories).toEqual({
      publicProfileUpdate: {
        categoryId: 'rmr.public_profile_update.v1',
        channelId: 'rmr-public-updates-v1',
      },
      serviceNotice: {
        categoryId: 'rmr.service_notice.v1',
        channelId: 'rmr-service-notices-v1',
      },
    });
    expect(
      parseSafePushPayload(
        {
          environment: 'staging',
          eventId: 'event:synthetic:1',
          route: '/app/profiles/profile:ca:synthetic',
        },
        mobileEnvironments.staging,
      ),
    ).toMatchObject({ route: { kind: 'profile', profileId: 'profile:ca:synthetic' } });
    expect(
      shouldPresentPush({
        nowMinutes: 23 * 60,
        previewsEnabled: true,
        quietHours: { endMinutes: 7 * 60, startMinutes: 22 * 60 },
      }),
    ).toEqual({ present: false, showPreview: false });
    expect(
      shouldPresentPush({ nowMinutes: 12 * 60, previewsEnabled: false, quietHours: null }),
    ).toEqual({ present: true, showPreview: false });
    expect(() =>
      shouldPresentPush({ nowMinutes: 24 * 60, previewsEnabled: false, quietHours: null }),
    ).toThrow('invalid');
    const configured = ports();
    await unregisterPushNotifications({
      backend: configured.backend,
      platform: configured.platform,
      registrationId: 'push-registration:synthetic:1',
    });
    expect(configured.backend.unregister).toHaveBeenCalledOnce();
    expect(configured.platform.unregister).toHaveBeenCalledOnce();
  });

  it('replaces rotated provider registrations and removes the prior opaque registration', async () => {
    const configured = ports();
    await expect(
      rotatePushRegistration({
        backend: configured.backend,
        consented: true,
        environment: mobileEnvironments.pilot,
        platform: configured.platform,
        previousRegistrationId: 'push-registration:synthetic:old',
        projectId: 'synthetic-project-id',
      }),
    ).resolves.toEqual({ registered: true, registrationId: 'push-registration:synthetic:1' });
    expect(configured.backend.unregister).toHaveBeenCalledWith('push-registration:synthetic:old');
  });
});
