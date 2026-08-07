export const AUTHENTICATION_METHODS = ['passkey', 'verified_email'] as const;
export type AuthenticationMethod = (typeof AUTHENTICATION_METHODS)[number];
export type AuthenticationAssurance = 'basic' | 'phishing_resistant';
export type DevicePlatform = 'ios' | 'android' | 'web';

export interface DeviceDescriptor {
  readonly deviceId: string;
  readonly label: string;
  readonly platform: DevicePlatform;
}

export interface PasskeyAuthenticationStart {
  readonly challenge: string;
  readonly expiresAt: string;
  readonly requestId: string;
  readonly status: 'pending';
}

export interface GenericAuthenticationStart {
  readonly expiresAt: string;
  readonly message: string;
  readonly requestId: string;
  readonly status: 'pending';
}

export interface SessionSummary {
  readonly assurance: AuthenticationAssurance;
  readonly authenticationMethod: AuthenticationMethod;
  readonly createdAt: string;
  readonly current: boolean;
  readonly device: DeviceDescriptor;
  readonly expiresAt: string;
  readonly lastRotatedAt: string;
  readonly privileged: boolean;
  readonly revokedAt: string | null;
  readonly sessionId: string;
}

export interface AuthenticatedSession {
  readonly accountId: string;
  readonly session: SessionSummary;
  readonly sessionToken: string;
}

export interface RecoveryCompletion {
  readonly status: 'recovery_verified';
}

export const GENERIC_EMAIL_START_MESSAGE =
  'If the account can use verified email, sign-in instructions will be sent.';
export const GENERIC_RECOVERY_START_MESSAGE =
  'If recovery is available, instructions will be sent.';
