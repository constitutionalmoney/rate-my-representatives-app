import { describe, expect, it } from 'vitest';

import {
  assertPublicExportSafe,
  authorizeSecurityDomainAccess,
  SECURITY_DOMAINS,
  validateClassificationPreservingRestore,
  type ClassificationPreservingBackupManifest,
  type DomainAccessDecision,
} from './security-domains.js';

describe('security-domain access policy', () => {
  it('defines all eight issue #22 domains and denies unlisted cross-domain access', () => {
    expect(SECURITY_DOMAINS).toHaveLength(8);
    const events: DomainAccessDecision[] = [];
    const decision = authorizeSecurityDomainAccess(
      {
        principal: 'public_api',
        sourceDomain: 'public_registry',
        targetDomain: 'private_civic_activity',
        operation: 'read',
        correlationId: 'correlation:synthetic:deny',
      },
      (event) => events.push(event),
      '2026-08-09T12:00:00Z',
    );
    expect(decision).toMatchObject({ decision: 'deny', reason: 'default_deny' });
    expect(events).toEqual([decision]);
    expect(JSON.stringify(decision)).not.toMatch(/subject|payload|signal|address/i);
  });

  it('allows only explicit public serialization and keeps signer access isolated', () => {
    const sink = () => undefined;
    expect(
      authorizeSecurityDomainAccess(
        {
          principal: 'public_api',
          targetDomain: 'public_registry',
          operation: 'public_serialize',
          correlationId: 'correlation:synthetic:public',
        },
        sink,
      ).decision,
    ).toBe('allow');
    expect(
      authorizeSecurityDomainAccess(
        {
          principal: 'core_worker',
          targetDomain: 'verus_signing_rpc',
          operation: 'read',
          correlationId: 'correlation:synthetic:signer-deny',
        },
        sink,
      ).decision,
    ).toBe('deny');
    expect(
      authorizeSecurityDomainAccess(
        {
          principal: 'signer_worker',
          targetDomain: 'verus_signing_rpc',
          operation: 'read',
          correlationId: 'correlation:synthetic:signer-allow',
        },
        sink,
      ).decision,
    ).toBe('allow');
  });

  it('rejects private-domain exports, forbidden joins, and generalized citizen scores', () => {
    expect(() =>
      assertPublicExportSafe({
        fields: ['personId', 'social_credit'],
        domains: ['public_registry'],
      }),
    ).toThrow(/generalized-score/);
    expect(() =>
      assertPublicExportSafe({
        fields: ['overallCitizenRiskScore'],
        domains: ['public_registry'],
      }),
    ).toThrow(/generalized-score/);
    expect(() =>
      assertPublicExportSafe({
        fields: ['accountId', 'representativeSignal'],
        domains: ['account_authentication', 'private_civic_activity'],
      }),
    ).toThrow(/cannot join/);
    expect(() =>
      assertPublicExportSafe({ fields: ['moderatorNote'], domains: ['moderation'] }),
    ).toThrow(/not eligible/);
    expect(() =>
      assertPublicExportSafe({
        fields: ['personId', 'officeId'],
        domains: ['public_registry', 'public_methodology_provenance'],
      }),
    ).not.toThrow();
  });

  it('requires encrypted restores to preserve classification and environment', () => {
    const development: ClassificationPreservingBackupManifest = {
      environment: 'development',
      restoreMustPreserveClassification: true,
      productionToNonProductionAllowed: false,
      domains: [
        { domain: 'public_registry', classification: 'public', encrypted: true },
        {
          domain: 'private_civic_activity',
          classification: 'highly_restricted',
          encrypted: true,
        },
      ],
    };
    expect(() => validateClassificationPreservingRestore(development, development)).not.toThrow();
    const production = { ...development, environment: 'production' as const };
    expect(() => validateClassificationPreservingRestore(production, development)).toThrow(
      /non-production/,
    );
    expect(() =>
      validateClassificationPreservingRestore(development, {
        ...development,
        domains: [
          { domain: 'public_registry', classification: 'public', encrypted: true },
          {
            domain: 'private_civic_activity',
            classification: 'restricted',
            encrypted: true,
          },
        ],
      }),
    ).toThrow(/does not preserve/);
  });
});
