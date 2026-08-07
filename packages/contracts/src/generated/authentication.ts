/* Generated from authentication.schema.json. Do not edit directly. */

export type RoleScope =
  | {
      kind: 'global';
    }
  | {
      jurisdictionId: string;
      kind: 'jurisdiction';
    }
  | {
      kind: 'office_term';
      officeTermId: string;
    };

export interface AuthenticationContract {
  authenticatedSession: AuthenticatedSession;
  genericStart: GenericAuthenticationStart;
  passkeyStart: PasskeyAuthenticationStart;
  roleGrant: RoleGrant;
}
export interface AuthenticatedSession {
  accountId: string;
  session: SessionSummary;
  sessionToken: string;
}
export interface SessionSummary {
  assurance: 'basic' | 'phishing_resistant';
  authenticationMethod: 'passkey' | 'verified_email';
  createdAt: string;
  current: boolean;
  device: DeviceDescriptor;
  expiresAt: string;
  lastRotatedAt: string;
  privileged: boolean;
  revokedAt: string | null;
  sessionId: string;
}
export interface DeviceDescriptor {
  deviceId: string;
  label: string;
  platform: 'ios' | 'android' | 'web';
}
export interface GenericAuthenticationStart {
  expiresAt: string;
  message: string;
  requestId: string;
  status: 'pending';
}
export interface PasskeyAuthenticationStart {
  challenge: string;
  expiresAt: string;
  requestId: string;
  status: 'pending';
}
export interface RoleGrant {
  actorId: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  grantId: string;
  revokedAt: string | null;
  role:
    | 'participant'
    | 'evidence_contributor'
    | 'representative_candidate'
    | 'authorized_staff'
    | 'moderator_reviewer'
    | 'administrator'
    | 'civic_agent';
  scope: RoleScope;
}
