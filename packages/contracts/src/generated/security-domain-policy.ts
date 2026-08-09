/* Generated from security-domain-policy.schema.json. Do not edit directly. */

export type Domain =
  | 'public_registry'
  | 'account_authentication'
  | 'location_resolver'
  | 'identity_attestation'
  | 'private_civic_activity'
  | 'moderation'
  | 'public_methodology_provenance'
  | 'verus_signing_rpc';
export type Principal =
  | 'public_reader'
  | 'native_client'
  | 'web_client'
  | 'public_api'
  | 'account_service'
  | 'location_service'
  | 'identity_service'
  | 'participation_service'
  | 'moderation_service'
  | 'publication_service'
  | 'core_worker'
  | 'source_worker'
  | 'signer_worker'
  | 'security_auditor'
  | 'backup_operator';

export interface SecurityDomainPolicyV1 {
  schemaVersion: 'security-domain-policy.v1';
  dataMode: 'synthetic';
  defaultAccess: 'deny';
  /**
   * @minItems 8
   * @maxItems 8
   */
  domains: [Domain, Domain, Domain, Domain, Domain, Domain, Domain, Domain];
  /**
   * @minItems 1
   */
  access: [
    {
      principal: Principal;
      domain: Domain;
      /**
       * @minItems 1
       */
      operations: [
        'read' | 'write' | 'transient_process' | 'public_serialize' | 'backup' | 'restore' | 'audit_review',
        ...('read' | 'write' | 'transient_process' | 'public_serialize' | 'backup' | 'restore' | 'audit_review')[],
      ];
    },
    ...{
      principal: Principal;
      domain: Domain;
      /**
       * @minItems 1
       */
      operations: [
        'read' | 'write' | 'transient_process' | 'public_serialize' | 'backup' | 'restore' | 'audit_review',
        ...('read' | 'write' | 'transient_process' | 'public_serialize' | 'backup' | 'restore' | 'audit_review')[],
      ];
    }[],
  ];
  /**
   * @minItems 4
   * @maxItems 4
   */
  objectStorage: [
    {
      bucket: 'rmr-public' | 'rmr-public-manifests' | 'rmr-quarantine' | 'rmr-private-evidence';
      classification: 'public' | 'restricted' | 'highly_restricted';
      anonymousRead: boolean;
    },
    {
      bucket: 'rmr-public' | 'rmr-public-manifests' | 'rmr-quarantine' | 'rmr-private-evidence';
      classification: 'public' | 'restricted' | 'highly_restricted';
      anonymousRead: boolean;
    },
    {
      bucket: 'rmr-public' | 'rmr-public-manifests' | 'rmr-quarantine' | 'rmr-private-evidence';
      classification: 'public' | 'restricted' | 'highly_restricted';
      anonymousRead: boolean;
    },
    {
      bucket: 'rmr-public' | 'rmr-public-manifests' | 'rmr-quarantine' | 'rmr-private-evidence';
      classification: 'public' | 'restricted' | 'highly_restricted';
      anonymousRead: boolean;
    },
  ];
  backup: {
    encrypted: true;
    restoreMustPreserveClassification: true;
    productionToNonProductionAllowed: false;
  };
  signerIsolation: {
    publicApiHasCredentials: false;
    nativeHasCredentials: false;
    webHasCredentials: false;
    coreWorkerHasCredentials: false;
    verusRequiredForCore: false;
  };
  noSocialCredit: {
    generalizedCitizenScoreAllowed: false;
    identityActivityJoinAllowed: false;
    politicalProfileAnalyticsAllowed: false;
  };
}
