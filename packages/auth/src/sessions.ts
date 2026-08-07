import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

import type {
  AuthenticatedSession,
  AuthenticationAssurance,
  AuthenticationMethod,
  DeviceDescriptor,
  SessionSummary,
} from './contracts.js';

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_PRIVILEGED_SESSION_TTL_SECONDS = 60 * 15;

interface StoredSession {
  readonly accountId: string;
  readonly assurance: AuthenticationAssurance;
  readonly authenticationMethod: AuthenticationMethod;
  readonly createdAt: string;
  readonly device: DeviceDescriptor;
  readonly expiresAt: string;
  readonly privileged: boolean;
  readonly sessionId: string;
  currentTokenHash: string;
  lastRotatedAt: string;
  previousTokenHash: string | undefined;
  revokedAt: string | undefined;
  revocationReason: SessionRevocationReason | undefined;
}

export type SessionRevocationReason =
  | 'account-deletion'
  | 'credential-recovery'
  | 'device-mismatch'
  | 'expired'
  | 'replay-detected'
  | 'revoke-all'
  | 'sign-out'
  | 'user-revoked';

export interface SessionStore {
  get(sessionId: string): StoredSession | undefined;
  listForAccount(accountId: string): readonly StoredSession[];
  save(session: StoredSession): void;
}

function cloneSession(session: StoredSession): StoredSession {
  return { ...session, device: { ...session.device } };
}

export class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, StoredSession>();

  get(sessionId: string): StoredSession | undefined {
    const session = this.sessions.get(sessionId);
    return session ? cloneSession(session) : undefined;
  }

  listForAccount(accountId: string): readonly StoredSession[] {
    return [...this.sessions.values()]
      .filter((session) => session.accountId === accountId)
      .map((session) => cloneSession(session));
  }

  save(session: StoredSession): void {
    this.sessions.set(session.sessionId, cloneSession(session));
  }
}

export class SessionAuthenticationError extends Error {
  readonly code = 'AUTHENTICATION_FAILED';

  constructor() {
    super('Authentication could not be completed.');
    this.name = 'SessionAuthenticationError';
  }
}

export class SessionReplayDetectedError extends SessionAuthenticationError {
  override readonly name = 'SessionReplayDetectedError';
}

export interface CreateSessionInput {
  readonly accountId: string;
  readonly assurance: AuthenticationAssurance;
  readonly authenticationMethod: AuthenticationMethod;
  readonly device: DeviceDescriptor;
  readonly ttlSeconds?: number;
}

export interface CreatePrivilegedSessionInput {
  readonly accountId: string;
  readonly assurance: 'phishing_resistant';
  readonly authenticationMethod: 'passkey';
  readonly device: DeviceDescriptor;
  readonly ttlSeconds?: number;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function hashesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function createToken(sessionId: string): string {
  return `${sessionId}.${randomBytes(32).toString('base64url')}`;
}

function tokenSessionId(token: string): string | undefined {
  const separator = token.indexOf('.');
  if (separator < 1 || separator === token.length - 1) return undefined;
  return token.slice(0, separator);
}

function toSummary(session: StoredSession, currentSessionId: string): SessionSummary {
  return Object.freeze({
    assurance: session.assurance,
    authenticationMethod: session.authenticationMethod,
    createdAt: session.createdAt,
    current: session.sessionId === currentSessionId,
    device: Object.freeze({ ...session.device }),
    expiresAt: session.expiresAt,
    lastRotatedAt: session.lastRotatedAt,
    privileged: session.privileged,
    revokedAt: session.revokedAt ?? null,
    sessionId: session.sessionId,
  });
}

export class SessionService {
  constructor(
    private readonly store: SessionStore,
    private readonly now: () => Date = () => new Date(),
    private readonly createId: () => string = () => randomUUID(),
  ) {}

  create(input: CreateSessionInput): AuthenticatedSession {
    return this.createRecord(input, false);
  }

  createPrivileged(input: CreatePrivilegedSessionInput): AuthenticatedSession {
    return this.createRecord(input, true);
  }

  private createRecord(
    input: CreateSessionInput | CreatePrivilegedSessionInput,
    privileged: boolean,
  ): AuthenticatedSession {
    const ttlSeconds = input.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS;
    if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1) throw new SessionAuthenticationError();
    if (privileged && ttlSeconds > MAX_PRIVILEGED_SESSION_TTL_SECONDS) {
      throw new SessionAuthenticationError();
    }

    const sessionId = this.createId();
    const token = createToken(sessionId);
    const createdAt = this.now();
    const record: StoredSession = {
      accountId: input.accountId,
      assurance: input.assurance,
      authenticationMethod: input.authenticationMethod,
      createdAt: createdAt.toISOString(),
      currentTokenHash: hashToken(token),
      device: Object.freeze({ ...input.device }),
      expiresAt: new Date(createdAt.getTime() + ttlSeconds * 1000).toISOString(),
      lastRotatedAt: createdAt.toISOString(),
      previousTokenHash: undefined,
      privileged,
      revokedAt: undefined,
      revocationReason: undefined,
      sessionId,
    };
    this.store.save(record);

    return Object.freeze({
      accountId: input.accountId,
      session: toSummary(record, sessionId),
      sessionToken: token,
    });
  }

  rotate(token: string, deviceId: string): AuthenticatedSession {
    const sessionId = tokenSessionId(token);
    const record = sessionId ? this.store.get(sessionId) : undefined;
    if (!record || record.revokedAt) throw new SessionAuthenticationError();

    const now = this.now();
    if (Date.parse(record.expiresAt) <= now.getTime()) {
      this.revokeRecord(record, 'expired', now);
      throw new SessionAuthenticationError();
    }

    const presentedHash = hashToken(token);
    if (record.previousTokenHash && hashesMatch(presentedHash, record.previousTokenHash)) {
      this.revokeRecord(record, 'replay-detected', now);
      throw new SessionReplayDetectedError();
    }
    if (!hashesMatch(presentedHash, record.currentTokenHash)) {
      throw new SessionAuthenticationError();
    }
    if (record.device.deviceId !== deviceId) {
      this.revokeRecord(record, 'device-mismatch', now);
      throw new SessionAuthenticationError();
    }

    const rotatedToken = createToken(record.sessionId);
    record.previousTokenHash = record.currentTokenHash;
    record.currentTokenHash = hashToken(rotatedToken);
    record.lastRotatedAt = now.toISOString();
    this.store.save(record);

    return Object.freeze({
      accountId: record.accountId,
      session: toSummary(record, record.sessionId),
      sessionToken: rotatedToken,
    });
  }

  list(accountId: string, currentSessionId: string): readonly SessionSummary[] {
    return Object.freeze(
      [...this.store.listForAccount(accountId)]
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map((session) => toSummary(session, currentSessionId)),
    );
  }

  revokeOne(accountId: string, sessionId: string, reason: SessionRevocationReason): void {
    const record = this.store.get(sessionId);
    if (!record || record.accountId !== accountId || record.revokedAt) return;
    this.revokeRecord(record, reason, this.now());
  }

  revokeAll(accountId: string, reason: SessionRevocationReason, exceptSessionId?: string): number {
    let revoked = 0;
    for (const record of this.store.listForAccount(accountId)) {
      if (record.revokedAt || record.sessionId === exceptSessionId) continue;
      this.revokeRecord(record, reason, this.now());
      revoked += 1;
    }
    return revoked;
  }

  private revokeRecord(record: StoredSession, reason: SessionRevocationReason, at: Date): void {
    record.revokedAt = at.toISOString();
    record.revocationReason = reason;
    this.store.save(record);
  }
}
