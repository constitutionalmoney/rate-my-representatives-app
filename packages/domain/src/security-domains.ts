export const SECURITY_DOMAINS = [
  'public_registry',
  'account_authentication',
  'location_resolver',
  'identity_attestation',
  'private_civic_activity',
  'moderation',
  'public_methodology_provenance',
  'verus_signing_rpc',
] as const;

export type SecurityDomain = (typeof SECURITY_DOMAINS)[number];

export const SERVICE_PRINCIPALS = [
  'public_reader',
  'native_client',
  'web_client',
  'public_api',
  'account_service',
  'location_service',
  'identity_service',
  'participation_service',
  'moderation_service',
  'publication_service',
  'core_worker',
  'source_worker',
  'signer_worker',
  'security_auditor',
  'backup_operator',
] as const;

export type ServicePrincipal = (typeof SERVICE_PRINCIPALS)[number];

export const DOMAIN_OPERATIONS = [
  'read',
  'write',
  'transient_process',
  'public_serialize',
  'backup',
  'restore',
  'audit_review',
] as const;

export type DomainOperation = (typeof DOMAIN_OPERATIONS)[number];

const accessMatrix = new Set<string>([
  'public_reader:public_registry:read',
  'public_reader:public_methodology_provenance:read',
  'native_client:public_registry:read',
  'native_client:public_methodology_provenance:read',
  'web_client:public_registry:read',
  'web_client:public_methodology_provenance:read',
  'public_api:public_registry:read',
  'public_api:public_registry:public_serialize',
  'public_api:public_methodology_provenance:read',
  'public_api:public_methodology_provenance:public_serialize',
  'account_service:account_authentication:read',
  'account_service:account_authentication:write',
  'location_service:location_resolver:transient_process',
  'location_service:public_registry:read',
  'identity_service:identity_attestation:read',
  'identity_service:identity_attestation:write',
  'participation_service:private_civic_activity:read',
  'participation_service:private_civic_activity:write',
  'moderation_service:moderation:read',
  'moderation_service:moderation:write',
  'moderation_service:identity_attestation:read',
  'publication_service:public_registry:read',
  'publication_service:public_registry:write',
  'publication_service:public_methodology_provenance:read',
  'publication_service:public_methodology_provenance:write',
  'core_worker:public_registry:read',
  'core_worker:public_methodology_provenance:read',
  'source_worker:public_registry:read',
  'source_worker:public_registry:write',
  'signer_worker:public_methodology_provenance:read',
  'signer_worker:verus_signing_rpc:read',
  'signer_worker:verus_signing_rpc:write',
  'security_auditor:public_registry:audit_review',
  'security_auditor:account_authentication:audit_review',
  'security_auditor:location_resolver:audit_review',
  'security_auditor:identity_attestation:audit_review',
  'security_auditor:private_civic_activity:audit_review',
  'security_auditor:moderation:audit_review',
  'security_auditor:public_methodology_provenance:audit_review',
  'security_auditor:verus_signing_rpc:audit_review',
  ...SECURITY_DOMAINS.flatMap((domain) => [
    `backup_operator:${domain}:backup`,
    `backup_operator:${domain}:restore`,
  ]),
]);

export interface DomainAccessRequest {
  readonly principal: ServicePrincipal;
  readonly sourceDomain?: SecurityDomain;
  readonly targetDomain: SecurityDomain;
  readonly operation: DomainOperation;
  readonly correlationId: string;
}

export interface DomainAccessDecision {
  readonly principal: ServicePrincipal;
  readonly sourceDomain: SecurityDomain | null;
  readonly targetDomain: SecurityDomain;
  readonly operation: DomainOperation;
  readonly decision: 'allow' | 'deny';
  readonly reason: 'explicit_allow' | 'default_deny';
  readonly correlationId: string;
  readonly occurredAt: string;
}

export type DomainAccessAuditSink = (decision: DomainAccessDecision) => void;

export function authorizeSecurityDomainAccess(
  request: DomainAccessRequest,
  auditSink: DomainAccessAuditSink,
  occurredAt = new Date().toISOString(),
): DomainAccessDecision {
  const allowed = accessMatrix.has(
    `${request.principal}:${request.targetDomain}:${request.operation}`,
  );
  const decision: DomainAccessDecision = Object.freeze({
    principal: request.principal,
    sourceDomain: request.sourceDomain ?? null,
    targetDomain: request.targetDomain,
    operation: request.operation,
    decision: allowed ? 'allow' : 'deny',
    reason: allowed ? 'explicit_allow' : 'default_deny',
    correlationId: request.correlationId,
    occurredAt,
  });
  auditSink(decision);
  return decision;
}

const GENERALIZED_CITIZEN_SCORE_FIELDS = new Set([
  'citizenscore',
  'civicreputation',
  'ideologyscore',
  'loyaltyscore',
  'politicalprofile',
  'reputationscore',
  'riskscore',
  'socialcredit',
]);

const GENERALIZED_CITIZEN_SCORE_PATTERN =
  /(citizen.*score|civicreputation|ideologyscore|loyaltyscore|politicalprofile|reputationscore|riskscore|socialcredit)/;

function normalizeField(field: string): string {
  return field.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
}

export interface PublicExportRequest {
  readonly fields: readonly string[];
  readonly domains: readonly SecurityDomain[];
}

export function assertPublicExportSafe(request: PublicExportRequest): void {
  const prohibitedField = request.fields.find((field) => {
    const normalized = normalizeField(field);
    return (
      GENERALIZED_CITIZEN_SCORE_FIELDS.has(normalized) ||
      GENERALIZED_CITIZEN_SCORE_PATTERN.test(normalized)
    );
  });
  if (prohibitedField) {
    throw new Error(
      `Public export contains a forbidden generalized-score field: ${prohibitedField}`,
    );
  }

  const domains = new Set(request.domains);
  const hasAccountOrIdentity =
    domains.has('account_authentication') || domains.has('identity_attestation');
  if (hasAccountOrIdentity && domains.has('private_civic_activity')) {
    throw new Error(
      'Public exports cannot join identity or account data to private civic activity.',
    );
  }
  for (const domain of domains) {
    if (domain !== 'public_registry' && domain !== 'public_methodology_provenance') {
      throw new Error(`Domain ${domain} is not eligible for a public export.`);
    }
  }
}

export interface BackupDomainEntry {
  readonly domain: SecurityDomain;
  readonly classification: 'public' | 'restricted' | 'highly_restricted';
  readonly encrypted: true;
}

export interface ClassificationPreservingBackupManifest {
  readonly environment: 'development' | 'test' | 'production';
  readonly restoreMustPreserveClassification: true;
  readonly productionToNonProductionAllowed: false;
  readonly domains: readonly BackupDomainEntry[];
}

export function validateClassificationPreservingRestore(
  source: ClassificationPreservingBackupManifest,
  target: ClassificationPreservingBackupManifest,
): void {
  if (source.environment === 'production' && target.environment !== 'production') {
    throw new Error('Production backups cannot be restored into non-production environments.');
  }
  const targetByDomain = new Map(target.domains.map((entry) => [entry.domain, entry]));
  for (const sourceEntry of source.domains) {
    const targetEntry = targetByDomain.get(sourceEntry.domain);
    if (
      !targetEntry ||
      targetEntry.classification !== sourceEntry.classification ||
      targetEntry.encrypted !== true
    ) {
      throw new Error(`Restore does not preserve classification for ${sourceEntry.domain}.`);
    }
  }
}
