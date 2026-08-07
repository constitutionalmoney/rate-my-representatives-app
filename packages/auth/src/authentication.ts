import { randomBytes, randomUUID } from 'node:crypto';

import type { FeatureGateEvaluator } from '@rmr/config';

import {
  GENERIC_EMAIL_START_MESSAGE,
  GENERIC_RECOVERY_START_MESSAGE,
  type AuthenticatedSession,
  type DeviceDescriptor,
  type GenericAuthenticationStart,
  type PasskeyAuthenticationStart,
  type RecoveryCompletion,
} from './contracts.js';
import type { SessionService } from './sessions.js';

type ChallengeMethod = 'passkey' | 'recovery' | 'verified_email';

interface AuthenticationChallenge {
  readonly challenge: string;
  readonly expiresAt: string;
  readonly method: ChallengeMethod;
  readonly requestId: string;
  consumedAt: string | undefined;
}

export interface AuthenticationChallengeStore {
  consume(
    requestId: string,
    method: ChallengeMethod,
    at: Date,
  ): AuthenticationChallenge | undefined;
  save(challenge: AuthenticationChallenge): void;
}

function cloneChallenge(challenge: AuthenticationChallenge): AuthenticationChallenge {
  return { ...challenge };
}

export class InMemoryAuthenticationChallengeStore implements AuthenticationChallengeStore {
  private readonly challenges = new Map<string, AuthenticationChallenge>();

  consume(
    requestId: string,
    method: ChallengeMethod,
    at: Date,
  ): AuthenticationChallenge | undefined {
    const stored = this.challenges.get(requestId);
    if (
      !stored ||
      stored.method !== method ||
      stored.consumedAt ||
      Date.parse(stored.expiresAt) <= at.getTime()
    ) {
      return undefined;
    }
    stored.consumedAt = at.toISOString();
    this.challenges.set(requestId, stored);
    return cloneChallenge(stored);
  }

  save(challenge: AuthenticationChallenge): void {
    this.challenges.set(challenge.requestId, cloneChallenge(challenge));
  }
}

export interface PasskeyAssertionVerifier {
  verify(input: {
    readonly assertion: unknown;
    readonly expectedAudience: string;
    readonly expectedChallenge: string;
    readonly expectedOrigin: string;
    readonly requestId: string;
    readonly userVerification: 'required';
  }): Promise<Readonly<{ accountId: string }> | undefined>;
}

export interface PasskeyRelyingPartyPolicy {
  readonly audience: string;
  readonly origin: string;
  readonly userVerification: 'required';
}

export interface VerifiedEmailTokenVerifier {
  verify(input: {
    readonly requestId: string;
    readonly token: string;
  }): Promise<Readonly<{ accountId: string }> | undefined>;
}

export interface RecoveryTokenVerifier {
  verify(input: {
    readonly requestId: string;
    readonly token: string;
  }): Promise<Readonly<{ accountId: string }> | undefined>;
}

export interface VerifiedEmailDelivery {
  requestSignIn(input: {
    readonly email: string;
    readonly expiresAt: string;
    readonly requestId: string;
  }): Promise<void>;
}

export interface RecoveryDelivery {
  requestRecovery(input: {
    readonly identifier: string;
    readonly expiresAt: string;
    readonly requestId: string;
  }): Promise<void>;
}

export class AuthenticationFailedError extends Error {
  readonly code = 'AUTHENTICATION_FAILED';

  constructor() {
    super('Authentication could not be completed.');
    this.name = 'AuthenticationFailedError';
  }
}

export interface AuthenticationServiceDependencies {
  readonly challenges: AuthenticationChallengeStore;
  readonly emailDelivery: VerifiedEmailDelivery;
  readonly emailVerifier: VerifiedEmailTokenVerifier;
  readonly featureGates: FeatureGateEvaluator;
  readonly passkeyPolicy: PasskeyRelyingPartyPolicy;
  readonly passkeyVerifier: PasskeyAssertionVerifier;
  readonly recoveryDelivery: RecoveryDelivery;
  readonly recoveryVerifier: RecoveryTokenVerifier;
  readonly sessions: SessionService;
}

export class AuthenticationService {
  constructor(
    private readonly dependencies: AuthenticationServiceDependencies,
    private readonly now: () => Date = () => new Date(),
    private readonly createId: () => string = () => randomUUID(),
    private readonly createChallenge: () => string = () => randomBytes(32).toString('base64url'),
    private readonly ttlMilliseconds = 10 * 60 * 1000,
  ) {}

  beginPasskey(): PasskeyAuthenticationStart {
    this.dependencies.featureGates.assertEnabled('PASSKEY_AUTH_ENABLED', {
      boundary: 'domain',
      operation: 'begin-passkey-authentication',
    });
    const challenge = this.newChallenge('passkey');
    return Object.freeze({
      challenge: challenge.challenge,
      expiresAt: challenge.expiresAt,
      requestId: challenge.requestId,
      status: 'pending',
    });
  }

  async completePasskey(
    requestId: string,
    assertion: unknown,
    device: DeviceDescriptor,
  ): Promise<AuthenticatedSession> {
    this.dependencies.featureGates.assertEnabled('PASSKEY_AUTH_ENABLED', {
      boundary: 'domain',
      operation: 'complete-passkey-authentication',
    });
    const challenge = this.dependencies.challenges.consume(requestId, 'passkey', this.now());
    if (!challenge) throw new AuthenticationFailedError();
    const verified = await this.dependencies.passkeyVerifier.verify({
      assertion,
      expectedAudience: this.dependencies.passkeyPolicy.audience,
      expectedChallenge: challenge.challenge,
      expectedOrigin: this.dependencies.passkeyPolicy.origin,
      requestId,
      userVerification: this.dependencies.passkeyPolicy.userVerification,
    });
    if (!verified) throw new AuthenticationFailedError();
    return this.dependencies.sessions.create({
      accountId: verified.accountId,
      assurance: 'phishing_resistant',
      authenticationMethod: 'passkey',
      device,
    });
  }

  async beginVerifiedEmail(email: string): Promise<GenericAuthenticationStart> {
    this.dependencies.featureGates.assertEnabled('VERIFIED_EMAIL_AUTH_ENABLED', {
      boundary: 'domain',
      operation: 'begin-verified-email-authentication',
    });
    const challenge = this.newChallenge('verified_email');
    try {
      await this.dependencies.emailDelivery.requestSignIn({
        email,
        expiresAt: challenge.expiresAt,
        requestId: challenge.requestId,
      });
    } catch {
      // Delivery and account-existence failures intentionally share the public response.
    }
    return Object.freeze({
      expiresAt: challenge.expiresAt,
      message: GENERIC_EMAIL_START_MESSAGE,
      requestId: challenge.requestId,
      status: 'pending',
    });
  }

  async completeVerifiedEmail(
    requestId: string,
    token: string,
    device: DeviceDescriptor,
  ): Promise<AuthenticatedSession> {
    this.dependencies.featureGates.assertEnabled('VERIFIED_EMAIL_AUTH_ENABLED', {
      boundary: 'domain',
      operation: 'complete-verified-email-authentication',
    });
    const challenge = this.dependencies.challenges.consume(requestId, 'verified_email', this.now());
    if (!challenge) throw new AuthenticationFailedError();
    const verified = await this.dependencies.emailVerifier.verify({ requestId, token });
    if (!verified) throw new AuthenticationFailedError();
    return this.dependencies.sessions.create({
      accountId: verified.accountId,
      assurance: 'basic',
      authenticationMethod: 'verified_email',
      device,
    });
  }

  async beginRecovery(identifier: string): Promise<GenericAuthenticationStart> {
    this.dependencies.featureGates.assertEnabled('ACCOUNT_RECOVERY_ENABLED', {
      boundary: 'domain',
      operation: 'begin-credential-recovery',
    });
    const challenge = this.newChallenge('recovery');
    try {
      await this.dependencies.recoveryDelivery.requestRecovery({
        expiresAt: challenge.expiresAt,
        identifier,
        requestId: challenge.requestId,
      });
    } catch {
      // Recovery availability and account existence are intentionally not disclosed.
    }
    return Object.freeze({
      expiresAt: challenge.expiresAt,
      message: GENERIC_RECOVERY_START_MESSAGE,
      requestId: challenge.requestId,
      status: 'pending',
    });
  }

  async completeRecovery(requestId: string, token: string): Promise<RecoveryCompletion> {
    this.dependencies.featureGates.assertEnabled('ACCOUNT_RECOVERY_ENABLED', {
      boundary: 'domain',
      operation: 'complete-credential-recovery',
    });
    const challenge = this.dependencies.challenges.consume(requestId, 'recovery', this.now());
    if (!challenge) throw new AuthenticationFailedError();
    const verified = await this.dependencies.recoveryVerifier.verify({ requestId, token });
    if (!verified) throw new AuthenticationFailedError();
    this.dependencies.sessions.revokeAll(verified.accountId, 'credential-recovery');
    return Object.freeze({ status: 'recovery_verified' });
  }

  private newChallenge(method: ChallengeMethod): AuthenticationChallenge {
    const requestId = this.createId();
    const challenge: AuthenticationChallenge = {
      challenge: this.createChallenge(),
      consumedAt: undefined,
      expiresAt: new Date(this.now().getTime() + this.ttlMilliseconds).toISOString(),
      method,
      requestId,
    };
    this.dependencies.challenges.save(challenge);
    return challenge;
  }
}
