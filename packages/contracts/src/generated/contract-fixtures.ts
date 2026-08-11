/* Generated synthetic contract fixtures. Do not edit directly. */

export const SYNTHETIC_COVERAGE_REPORT = {
  "schemaVersion": "coverage-report.v1",
  "policyVersion": "coverage-policy.v1",
  "reportId": "coverage-report:synthetic:2026-08-09",
  "dataMode": "synthetic",
  "generatedAt": "2026-08-09T12:00:00Z",
  "asOf": "2026-08-09T11:55:00Z",
  "methodVersion": "coverage-method.v1",
  "codeRevision": "synthetic-revision",
  "scope": {
    "countryCodes": [
      "CA",
      "US"
    ],
    "jurisdictionIds": [
      "jurisdiction:ca:maple",
      "jurisdiction:us:example-state"
    ],
    "levels": [
      "province",
      "state"
    ],
    "recordFamilies": [
      "jurisdiction",
      "district",
      "public_body",
      "office",
      "person",
      "office_term",
      "election",
      "candidacy",
      "profile",
      "material_claim"
    ],
    "validFrom": "2026-01-01T00:00:00Z",
    "validTo": "2027-01-01T00:00:00Z",
    "inventorySourceIds": [
      "source:ca:synthetic-roster",
      "source:us:synthetic-roster"
    ]
  },
  "jurisdictions": [
    {
      "jurisdictionId": "jurisdiction:ca:maple",
      "countryCode": "CA",
      "level": "province",
      "supportState": "partial",
      "gapIds": [
        "gap:ca:synthetic-freshness"
      ]
    },
    {
      "jurisdictionId": "jurisdiction:us:example-state",
      "countryCode": "US",
      "level": "state",
      "supportState": "unsupported",
      "gapIds": [
        "gap:us:synthetic-candidacy"
      ]
    }
  ],
  "authoritativeSources": [
    {
      "sourceId": "source:ca:synthetic-roster",
      "sourceClass": "official_roster",
      "publisherAuthority": "Synthetic Maple Public Body",
      "connectorOwner": "RMR synthetic connector team",
      "dataStewardOwner": "RMR synthetic data steward",
      "termsUrl": "https://maple.invalid/terms",
      "licence": "CC0-1.0 synthetic fixture",
      "attribution": "Synthetic Maple roster; no real civic data",
      "retentionAllowed": true,
      "redistributionAllowed": true,
      "approvedFreshnessHours": 24,
      "lastCheckedAt": "2026-08-07T12:00:00Z",
      "availability": "stale"
    },
    {
      "sourceId": "source:us:synthetic-roster",
      "sourceClass": "legal_authority",
      "publisherAuthority": "Synthetic Example State Authority",
      "connectorOwner": "RMR synthetic connector team",
      "dataStewardOwner": "RMR synthetic data steward",
      "termsUrl": "https://example-state.invalid/terms",
      "licence": "CC0-1.0 synthetic fixture",
      "attribution": "Synthetic Example State roster; no real civic data",
      "retentionAllowed": true,
      "redistributionAllowed": true,
      "approvedFreshnessHours": 24,
      "lastCheckedAt": "2026-08-09T11:30:00Z",
      "availability": "available"
    }
  ],
  "inventory": {
    "expected": {
      "jurisdiction": 2,
      "district": 3,
      "publicBody": 2,
      "office": 3,
      "person": 3,
      "officeTerm": 2,
      "election": 1,
      "candidacy": 2,
      "profile": 3,
      "materialClaim": 6
    },
    "observed": {
      "jurisdiction": 2,
      "district": 3,
      "publicBody": 2,
      "office": 3,
      "person": 3,
      "officeTerm": 2,
      "election": 1,
      "candidacy": 1,
      "profile": 2,
      "materialClaim": 5
    },
    "unexpectedDiscoveryCount": 0
  },
  "dimensions": [
    {
      "dimensionId": "structural_registry",
      "numerator": 10,
      "denominator": 10,
      "percentage": 100,
      "thresholdPercentage": 100,
      "supportState": "supported",
      "gapIds": []
    },
    {
      "dimensionId": "person_role_lifecycle",
      "numerator": 7,
      "denominator": 8,
      "percentage": 87.5,
      "thresholdPercentage": 100,
      "supportState": "gap",
      "gapIds": [
        "gap:us:synthetic-candidacy"
      ]
    },
    {
      "dimensionId": "profile_coverage",
      "numerator": 2,
      "denominator": 3,
      "percentage": 66.67,
      "thresholdPercentage": 100,
      "supportState": "gap",
      "gapIds": [
        "gap:us:synthetic-candidacy"
      ]
    },
    {
      "dimensionId": "material_claim_source_coverage",
      "numerator": 5,
      "denominator": 6,
      "percentage": 83.33,
      "thresholdPercentage": 100,
      "supportState": "gap",
      "gapIds": [
        "gap:us:synthetic-candidacy"
      ]
    },
    {
      "dimensionId": "public_gap_disclosure",
      "numerator": 2,
      "denominator": 2,
      "percentage": 100,
      "thresholdPercentage": 100,
      "supportState": "supported",
      "gapIds": []
    },
    {
      "dimensionId": "correction_supersession",
      "numerator": 0,
      "denominator": 0,
      "percentage": null,
      "thresholdPercentage": 100,
      "supportState": "not_applicable",
      "gapIds": []
    },
    {
      "dimensionId": "representative_match",
      "numerator": 19,
      "denominator": 20,
      "percentage": 95,
      "thresholdPercentage": 99,
      "supportState": "gap",
      "gapIds": [
        "gap:us:synthetic-candidacy"
      ]
    }
  ],
  "freshness": {
    "denominator": 2,
    "currentCount": 1,
    "staleCount": 1,
    "unknownCount": 0,
    "unavailableCount": 0,
    "currentPercentage": 50
  },
  "connectors": [
    {
      "sourceId": "source:ca:synthetic-roster",
      "health": "stale",
      "lastScheduledAt": "2026-08-09T11:00:00Z",
      "lastCompletedAt": "2026-08-07T12:00:00Z",
      "scheduledRunCount": 2,
      "successfulRunCount": 1,
      "successPercentage": 50,
      "failureCount": 1,
      "gapIds": [
        "gap:ca:synthetic-freshness"
      ]
    },
    {
      "sourceId": "source:us:synthetic-roster",
      "health": "healthy",
      "lastScheduledAt": "2026-08-09T11:00:00Z",
      "lastCompletedAt": "2026-08-09T11:30:00Z",
      "scheduledRunCount": 2,
      "successfulRunCount": 2,
      "successPercentage": 100,
      "failureCount": 0,
      "gapIds": [
        "gap:us:synthetic-candidacy"
      ]
    }
  ],
  "gaps": [
    {
      "conditionId": "gap:ca:synthetic-freshness",
      "kind": "stale",
      "severity": "non_critical",
      "status": "open",
      "affectedIds": [
        "source:ca:synthetic-roster"
      ],
      "firstObservedAt": "2026-08-08T12:00:01Z",
      "lastObservedAt": "2026-08-09T11:55:00Z",
      "publicExplanation": "The synthetic Canadian roster is outside its declared freshness limit. This is a coverage gap, not evidence about a person."
    },
    {
      "conditionId": "gap:us:synthetic-candidacy",
      "kind": "missing",
      "severity": "critical",
      "status": "open",
      "affectedIds": [
        "jurisdiction:us:example-state"
      ],
      "firstObservedAt": "2026-08-09T11:30:00Z",
      "lastObservedAt": "2026-08-09T11:55:00Z",
      "publicExplanation": "One expected synthetic candidacy is not reviewed. No negative or misconduct inference is permitted."
    }
  ],
  "knownErrors": [],
  "corrections": {
    "acceptedCount": 0,
    "reflectedCount": 0,
    "pastTargetOutstandingCount": 0,
    "supersessionCoveragePercentage": null,
    "supersedesReportId": null
  },
  "changelog": [
    {
      "changeId": "change:synthetic:initial",
      "changedAt": "2026-08-09T12:00:00Z",
      "kind": "initial",
      "summary": "Initial non-production synthetic coverage-report example."
    }
  ],
  "missingDataMeaning": "coverage_gap_not_misconduct",
  "provenance": {
    "state": "not_anchored",
    "approvedPublicArtifactOnly": true,
    "anchorReference": null
  },
  "releaseDecision": {
    "status": "not_ready",
    "publicApproval": false,
    "blockingGapIds": [
      "gap:ca:synthetic-freshness",
      "gap:us:synthetic-candidacy"
    ]
  },
  "sha256": "4e0f518607653707fc089ffef8e2fcb47799e66b5e004a0f5dd17a8bcd7df6df"
} as const;

export const SYNTHETIC_HEALTH_READY = {
  "status": "ready",
  "service": "api",
  "version": "1.0.0-contract",
  "contract": {
    "currentVersion": "v1",
    "minimumSupportedVersion": "v1",
    "supportedVersions": [
      "v1"
    ]
  },
  "featureStates": {
    "publicRegistry": "operational",
    "civicSignal": "disabled",
    "representativeSignals": "disabled",
    "verus": "disabled",
    "provenanceWrites": "disabled"
  },
  "dataMode": "synthetic",
  "optionalDependencies": {
    "verus": "disabled"
  }
} as const;

export const SYNTHETIC_MOBILE_COMPATIBILITY_READY = {
  "status": "compatible",
  "contract": {
    "currentVersion": "v1",
    "minimumSupportedVersion": "v1",
    "supportedVersions": [
      "v1"
    ]
  },
  "platforms": {
    "ios": {
      "releaseState": "foundation",
      "minimumAppVersion": "0.1.0",
      "minimumBuildNumber": 1,
      "supportedContractVersions": [
        "v1"
      ]
    },
    "android": {
      "releaseState": "foundation",
      "minimumAppVersion": "0.1.0",
      "minimumBuildNumber": 1,
      "supportedContractVersions": [
        "v1"
      ]
    }
  }
} as const;

export const SYNTHETIC_JURISDICTIONS = {
  "schemaVersion": "jurisdiction-registry.v1",
  "dataMode": "synthetic",
  "generatedAt": "2026-08-06T12:00:00.000Z",
  "asOf": "2026-08-06T12:00:00.000Z",
  "jurisdictions": [
    {
      "jurisdictionId": "jurisdiction:ca",
      "countryCode": "CA",
      "versions": [
        {
          "versionId": "jv:ca",
          "name": "Canada synthetic fixture",
          "slug": "canada-synthetic",
          "kind": "country",
          "status": "active",
          "effectiveFrom": "2020-01-01T00:00:00.000Z",
          "effectiveTo": null,
          "attribution": {
            "assertionId": "assertion:jv:ca",
            "sourceReference": "synthetic://registry/assertion:jv:ca",
            "observedAt": "2026-08-06T12:00:00.000Z",
            "freshness": "current",
            "coverage": "supported",
            "conflict": "clear",
            "supersedesAssertionId": null
          }
        }
      ]
    },
    {
      "jurisdictionId": "jurisdiction:us",
      "countryCode": "US",
      "versions": [
        {
          "versionId": "jv:us",
          "name": "United States synthetic fixture",
          "slug": "united-states-synthetic",
          "kind": "country",
          "status": "active",
          "effectiveFrom": "2020-01-01T00:00:00.000Z",
          "effectiveTo": null,
          "attribution": {
            "assertionId": "assertion:jv:us",
            "sourceReference": "synthetic://registry/assertion:jv:us",
            "observedAt": "2026-08-06T12:00:00.000Z",
            "freshness": "current",
            "coverage": "supported",
            "conflict": "clear",
            "supersedesAssertionId": null
          }
        }
      ]
    }
  ],
  "jurisdictionRelationships": [],
  "districts": [],
  "districtJurisdictionRelationships": [],
  "districtLineage": [],
  "publicBodies": [],
  "bodyJurisdictionRelationships": [],
  "offices": [],
  "externalIdentifiers": [],
  "gaps": [],
  "deferredFamilies": [
    "people",
    "office_terms",
    "candidacies",
    "source_ingestion",
    "location_resolution"
  ],
  "page": {
    "nextCursor": null
  }
} as const;

export const SYNTHETIC_METHODOLOGY_INDICATOR = {
  "schemaVersion": "methodology-indicator-result.v1",
  "resultId": "synthetic:indicator:publication-timeliness:2028-q1:v1",
  "dataMode": "synthetic",
  "target": {
    "kind": "office_term",
    "targetId": "synthetic:office-term:harbour-council:2028"
  },
  "displayCategory": "performance_and_effectiveness",
  "method": {
    "methodId": "synthetic:method:publication-timeliness",
    "version": "0.0.0-illustrative",
    "specificationSha256": "1111111111111111111111111111111111111111111111111111111111111111",
    "codeRevision": "synthetic-fixture-v1",
    "approvalState": "illustrative_not_approved"
  },
  "sourceSet": {
    "sourceIds": [
      "synthetic:source:harbour-council-publications"
    ],
    "recordVersionIds": [
      "synthetic:record:meeting-1:v1",
      "synthetic:record:meeting-2:v1",
      "synthetic:record:meeting-3:v1",
      "synthetic:record:meeting-4:v1"
    ],
    "digest": "2222222222222222222222222222222222222222222222222222222222222222",
    "inputCutoffAt": "2028-01-14T23:59:59Z"
  },
  "coverage": {
    "numerator": 4,
    "denominator": 4,
    "percentage": 100,
    "state": "supported",
    "gapIds": []
  },
  "freshness": {
    "state": "current",
    "evaluatedAt": "2028-01-15T12:00:00Z",
    "thresholdHours": 168,
    "oldestInputAt": "2028-01-10T15:00:00Z"
  },
  "result": {
    "status": "available",
    "value": 75,
    "unit": "percent",
    "calculationRule": "100 * published_within_threshold / eligible_events",
    "calculationInputs": [
      {
        "name": "published_within_threshold",
        "value": 3
      },
      {
        "name": "eligible_events",
        "value": 4
      }
    ],
    "explanation": "Three of four fully sourced synthetic publications met the illustrative threshold."
  },
  "missingData": {
    "state": "complete",
    "missingInputCount": 0,
    "treatment": "no_adverse_inference",
    "publicExplanation": "All denominator inputs are present; no missing input was treated as a negative event."
  },
  "confidence": {
    "status": "moderate",
    "value": 0.75,
    "rationale": "Synthetic confidence is illustrative and is not approved for public use."
  },
  "ai": {
    "role": "none",
    "outputPublication": false,
    "humanReviewState": "not_required"
  },
  "correction": {
    "state": "current",
    "supersedesResultId": null,
    "affectedByRecordVersionIds": [],
    "explanation": "This synthetic fixture has no correction, dispute, appeal, or supersession."
  },
  "participationIncluded": false,
  "calculatedAt": "2028-01-15T12:00:00Z",
  "publicationState": "test_only",
  "provenance": {
    "state": "not_anchored",
    "meaning": "commitment_not_truth",
    "manifestSha256": null
  }
} as const;

export const SYNTHETIC_METHODOLOGY_RELEASE_GATE = {
  "schemaVersion": "methodology-release-gate.v1",
  "policyVersion": "light-mathematics-policy.v1",
  "reportId": "synthetic:methodology-release-gate:foundation",
  "generatedAt": "2028-01-15T12:00:00Z",
  "runtimeFlagEnabled": false,
  "approvedMethodologyVersion": null,
  "gates": {
    "publicMethodologyReview": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "No public methodology review has approved a composite method."
    },
    "sourceAndFactorAudit": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "No source and factor audit has approved a composite method."
    },
    "biasAndDisparateImpactReview": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "No bias and disparate-impact review has approved a composite method."
    },
    "adversarialAndManipulationTesting": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "No adversarial and manipulation test evidence has been approved."
    },
    "stabilityAndSmallDataTesting": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "No stability and small-data test evidence has been approved."
    },
    "correctionAndSupersessionTesting": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "No correction and supersession test evidence has been approved."
    },
    "privacyAndNoSocialCreditReview": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "No privacy and No Social Credit review has approved a composite method."
    },
    "legalReview": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "No Canada and United States legal review has approved a composite method."
    },
    "representativeResponseAndAppealBehavior": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "Representative response and appeal behavior has not been approved."
    },
    "publicConsultation": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "No public consultation has approved a composite method."
    },
    "reservedGovernanceApproval": {
      "status": "pending",
      "evidenceReferences": [],
      "decidedAt": null,
      "publicReason": "Reserved governance approval has not been granted."
    }
  },
  "decision": "disabled",
  "decisionReason": "The composite feature flag is false and every release gate is pending."
} as const;

export const SYNTHETIC_MODERATION_DECISION = {
  "schemaVersion": "moderation-decision.v1",
  "policyVersion": "moderation-due-process-policy.v1",
  "dataMode": "synthetic",
  "decisionId": "synthetic:moderation-decision:foundation",
  "workflow": "evidence_submission",
  "targetReference": "synthetic:evidence-submission:001",
  "previousState": "under_review",
  "outcomeState": "rejected",
  "review": {
    "reviewerRole": "reviewer",
    "assignmentReference": "synthetic:review-assignment:001",
    "conflictDisclosure": "Synthetic reviewer declared no conflict for this test fixture.",
    "recusalOutcome": "no_recusal_required",
    "independentOfOriginalDecision": false,
    "humanDecider": true
  },
  "basis": {
    "methodVersion": null,
    "sourceRecordVersionIds": [
      "synthetic:source-record-version:001"
    ],
    "rightsReview": "metadata_only",
    "reasonCode": "insufficient_source_support",
    "publicReason": "The synthetic submission does not provide enough source support for publication."
  },
  "ai": {
    "assistanceUsed": false,
    "disclosure": "No AI assistance was used for this synthetic decision.",
    "decidedOutcome": false
  },
  "history": {
    "supersedesDecisionId": null,
    "appealedDecisionId": null
  },
  "publication": {
    "state": "restricted_only",
    "automaticPublication": false,
    "allowedPublicFields": [],
    "rawPrivateMaterialIncluded": false,
    "provenanceEligible": false
  },
  "decidedAt": "2028-01-15T12:00:00Z"
} as const;

export const SYNTHETIC_NO_SOCIAL_CREDIT_POLICY = {
  "schemaVersion": "no-social-credit-policy.v1",
  "policyVersion": "no-social-credit-policy.v1",
  "dataMode": "synthetic",
  "covenant": "No social credit scores shall be created with this technology by Civic Ledger AI Ltd. or Checks and Balances Committee Ltd., or in any implementation that either company develops, operates, governs, or licenses.",
  "hardRules": {
    "generalizedCitizenValueAllowed": false,
    "citizenTraitInferenceAllowed": false,
    "individualCivicActivityPublicAllowed": false,
    "citizenDataInPublicRoleMethodAllowed": false,
    "narrowStatesPortableAllowed": false,
    "narrowStatesCombinableAllowed": false,
    "unrelatedAccessUseAllowed": false,
    "crossProductCitizenLinkageAllowed": false,
    "civicAdvertisingTargetingAllowed": false,
    "agentHumanIntentAllowed": false,
    "featureFlagOverrideAllowed": false,
    "productionApprovalClaimed": false
  },
  "citizenDataClasses": [
    "account_security",
    "identity_attestation",
    "jurisdiction_location",
    "private_civic_activity",
    "moderation_abuse",
    "notification_subscription",
    "browsing_behavior",
    "cross_product_activity",
    "ai_inferred_trait"
  ],
  "prohibitedOutcomes": [
    "generalized_reputation",
    "loyalty_or_conformity",
    "ideology_or_political_profile",
    "generalized_trustworthiness",
    "generalized_civic_worth",
    "generalized_eligibility_or_risk",
    "public_individual_civic_activity",
    "commercial_or_advertising_targeting",
    "unrelated_access_decision",
    "portable_narrow_state",
    "combined_narrow_state_rank",
    "cross_product_citizen_profile",
    "ai_inferred_citizen_trait",
    "citizen_attributes_in_public_role_method"
  ],
  "narrowStates": [
    {
      "stateKind": "authentication_status",
      "purpose": "establish_or_end_one_application_session",
      "dataClasses": [
        "account_security"
      ],
      "allowedPrincipals": [
        "account_service",
        "security_auditor"
      ],
      "retentionClass": "credential_lifecycle_pending_issues_23_45",
      "retentionStatus": "follow_on_policy_required",
      "reasonRule": "generic_external_reason",
      "reviewRight": "access_and_correction",
      "publicDisclosureAllowed": false,
      "portable": false,
      "combinable": false,
      "unrelatedAccessAllowed": false
    },
    {
      "stateKind": "attestation_status",
      "purpose": "evaluate_one_separately_approved_attestation_requirement",
      "dataClasses": [
        "identity_attestation"
      ],
      "allowedPrincipals": [
        "identity_service",
        "security_auditor"
      ],
      "retentionClass": "attestation_lifecycle_pending_issues_23_45",
      "retentionStatus": "follow_on_policy_required",
      "reasonRule": "purpose_specific_reason",
      "reviewRight": "access_correction_and_appeal",
      "publicDisclosureAllowed": false,
      "portable": false,
      "combinable": false,
      "unrelatedAccessAllowed": false
    },
    {
      "stateKind": "action_eligibility",
      "purpose": "authorize_one_defined_action_under_one_versioned_method",
      "dataClasses": [
        "identity_attestation",
        "jurisdiction_location"
      ],
      "allowedPrincipals": [
        "identity_service",
        "participation_service",
        "security_auditor"
      ],
      "retentionClass": "eligibility_snapshot_pending_issues_23_45",
      "retentionStatus": "follow_on_policy_required",
      "reasonRule": "purpose_specific_reason",
      "reviewRight": "access_correction_and_appeal",
      "publicDisclosureAllowed": false,
      "portable": false,
      "combinable": false,
      "unrelatedAccessAllowed": false
    },
    {
      "stateKind": "rate_limit",
      "purpose": "limit_one_route_family_for_abuse_and_availability",
      "dataClasses": [
        "account_security",
        "moderation_abuse"
      ],
      "allowedPrincipals": [
        "account_service",
        "moderation_service",
        "security_auditor"
      ],
      "retentionClass": "bounded_abuse_window_pending_issues_23_45",
      "retentionStatus": "follow_on_policy_required",
      "reasonRule": "generic_external_reason",
      "reviewRight": "access_correction_and_appeal",
      "publicDisclosureAllowed": false,
      "portable": false,
      "combinable": false,
      "unrelatedAccessAllowed": false
    },
    {
      "stateKind": "evidence_submission",
      "purpose": "track_one_evidence_submission_through_due_process",
      "dataClasses": [
        "private_civic_activity",
        "moderation_abuse"
      ],
      "allowedPrincipals": [
        "moderation_service",
        "security_auditor"
      ],
      "retentionClass": "evidence_case_pending_issues_23_45",
      "retentionStatus": "follow_on_policy_required",
      "reasonRule": "purpose_specific_reason",
      "reviewRight": "access_correction_and_appeal",
      "publicDisclosureAllowed": false,
      "portable": false,
      "combinable": false,
      "unrelatedAccessAllowed": false
    },
    {
      "stateKind": "moderation_decision",
      "purpose": "decide_one_moderation_case_under_one_policy_version",
      "dataClasses": [
        "moderation_abuse"
      ],
      "allowedPrincipals": [
        "moderation_service",
        "security_auditor"
      ],
      "retentionClass": "moderation_case_pending_issues_23_45",
      "retentionStatus": "follow_on_policy_required",
      "reasonRule": "purpose_specific_reason",
      "reviewRight": "access_correction_and_appeal",
      "publicDisclosureAllowed": false,
      "portable": false,
      "combinable": false,
      "unrelatedAccessAllowed": false
    },
    {
      "stateKind": "representative_authorization",
      "purpose": "authorize_one_scoped_representative_or_staff_action",
      "dataClasses": [
        "account_security"
      ],
      "allowedPrincipals": [
        "account_service",
        "moderation_service",
        "security_auditor"
      ],
      "retentionClass": "authority_lifecycle_pending_issues_23_45",
      "retentionStatus": "follow_on_policy_required",
      "reasonRule": "purpose_specific_reason",
      "reviewRight": "access_correction_and_appeal",
      "publicDisclosureAllowed": false,
      "portable": false,
      "combinable": false,
      "unrelatedAccessAllowed": false
    },
    {
      "stateKind": "security_incident",
      "purpose": "contain_and_review_one_security_incident",
      "dataClasses": [
        "account_security",
        "moderation_abuse"
      ],
      "allowedPrincipals": [
        "account_service",
        "security_auditor"
      ],
      "retentionClass": "security_incident_pending_issues_23_45",
      "retentionStatus": "follow_on_policy_required",
      "reasonRule": "generic_external_reason",
      "reviewRight": "access_correction_and_appeal",
      "publicDisclosureAllowed": false,
      "portable": false,
      "combinable": false,
      "unrelatedAccessAllowed": false
    },
    {
      "stateKind": "account_compromise",
      "purpose": "recover_and_protect_one_compromised_application_account",
      "dataClasses": [
        "account_security"
      ],
      "allowedPrincipals": [
        "account_service",
        "security_auditor"
      ],
      "retentionClass": "account_recovery_pending_issues_23_45",
      "retentionStatus": "follow_on_policy_required",
      "reasonRule": "generic_external_reason",
      "reviewRight": "access_correction_and_appeal",
      "publicDisclosureAllowed": false,
      "portable": false,
      "combinable": false,
      "unrelatedAccessAllowed": false
    }
  ],
  "enforcement": {
    "databaseForbiddenJoinGuard": true,
    "publicSerializerGuard": true,
    "eventAndExportGuard": true,
    "analyticsAllowlistGuard": true,
    "agentAndAiGuard": true,
    "mobileTelemetryGuard": true,
    "crossProductGuard": true,
    "publicRoleMethodGuard": true,
    "featureFlagsCannotOverride": true,
    "evidenceReferences": [
      "packages/domain/src/no-social-credit.test.ts",
      "packages/auth/src/no-social-credit.test.ts",
      "packages/domain/src/security-domains.test.ts",
      "packages/observability/src/index.test.ts",
      "apps/mobile/src/crash-privacy.test.ts",
      "scripts/check-no-social-credit.mjs"
    ]
  },
  "rightsAndReporting": {
    "publicPolicyPath": "docs/NO_SOCIAL_CREDIT.md",
    "suspectedViolationRoute": "SECURITY.md#report-privately",
    "accessCorrectionObjectionDeletionStatus": "follow_on_policy_required",
    "productionContactApproved": false
  },
  "impactAssessment": {
    "pullRequestTemplateRequired": true,
    "rfcTemplateRequired": true,
    "featureRequestTemplateRequired": true,
    "requiredFields": [
      "citizen_data",
      "purpose",
      "ranking_or_prediction",
      "access",
      "retention",
      "reason_and_appeal",
      "cross_product_use",
      "unrelated_access_effect",
      "proving_tests"
    ]
  },
  "releaseGate": {
    "decision": "blocked",
    "participatoryPilotAllowed": false,
    "productionLegalReviewApproved": false,
    "namedOwnerAssigned": false,
    "evidence": {
      "database": {
        "status": "implemented_foundation",
        "references": [
          "packages/db/migrations/0007_security_domain_separation.sql",
          "scripts/smoke/security-domains.sql"
        ]
      },
      "publicSerializers": {
        "status": "implemented_foundation",
        "references": [
          "packages/contracts/scripts/validate-contracts.mjs"
        ]
      },
      "authorization": {
        "status": "implemented_foundation",
        "references": [
          "packages/auth/src/no-social-credit.test.ts"
        ]
      },
      "eventsAndExports": {
        "status": "implemented_foundation",
        "references": [
          "packages/domain/src/audit-outbox.test.ts",
          "packages/domain/src/security-domains.test.ts"
        ]
      },
      "analytics": {
        "status": "implemented_foundation",
        "references": [
          "packages/observability/src/index.test.ts"
        ]
      },
      "ai": {
        "status": "implemented_foundation",
        "references": [
          "packages/domain/src/no-social-credit.test.ts",
          "packages/auth/src/roles.test.ts"
        ]
      },
      "mobileTelemetry": {
        "status": "implemented_foundation",
        "references": [
          "apps/mobile/src/crash-privacy.test.ts"
        ]
      },
      "crossProduct": {
        "status": "implemented_foundation",
        "references": [
          "packages/domain/src/no-social-credit.test.ts"
        ]
      },
      "aggregateDifferencing": {
        "status": "follow_on_required",
        "references": [
          "docs/THREAT_MODEL.md#92-privacy-and-no-social-credit",
          "https://github.com/constitutionalmoney/rate-my-representatives-app/issues/37",
          "https://github.com/constitutionalmoney/rate-my-representatives-app/issues/43"
        ]
      },
      "publicRoleMethodology": {
        "status": "implemented_foundation",
        "references": [
          "packages/domain/src/no-social-credit.test.ts",
          "packages/contracts/src/methodology.contract.test.ts"
        ]
      },
      "rightsAndReporting": {
        "status": "follow_on_required",
        "references": [
          "docs/NO_SOCIAL_CREDIT.md",
          "SECURITY.md#report-privately",
          "https://github.com/constitutionalmoney/rate-my-representatives-app/issues/23"
        ]
      },
      "independentReview": {
        "status": "follow_on_required",
        "references": []
      }
    },
    "openBlockers": [
      "production_legal_privacy_review",
      "retention_and_deletion_durations",
      "aggregate_differencing_method",
      "production_ai_and_analytics_review",
      "cross_product_data_inventory",
      "named_privacy_governance_owner",
      "independent_enforcement_review"
    ],
    "decisionReason": "Foundation controls are synthetic and enforced in repository tests, but production legal, retention, aggregate, provider, ownership, and independent-review evidence is unresolved."
  }
} as const;

export const SYNTHETIC_PUBLIC_ROLE_PROFILE = {
  "schemaVersion": "public-role-profile.v1",
  "dataMode": "synthetic",
  "profileId": "profile:ca:avery-quill:maple-member:2024",
  "recordVersion": 3,
  "updatedAt": "2026-08-07T15:00:00Z",
  "etag": "W/\"profile:ca:avery-quill:maple-member:2024.v3\"",
  "publication": {
    "state": "published",
    "method": "human_review",
    "decisionId": "publication-decision:ca:profile:1",
    "decidedAt": "2026-08-07T15:00:00Z"
  },
  "summary": {
    "profileId": "profile:ca:avery-quill:maple-member:2024",
    "personId": "person:ca:avery-quill",
    "displayName": "Avery Quill",
    "countryCode": "CA",
    "governmentLevel": "provincial",
    "officeTitle": "Member of the Synthetic Maple Assembly",
    "districtLabel": "Maple North",
    "roleStatus": "appointed",
    "context": {
      "kind": "office_term",
      "officeTermId": "office-term:ca:avery-quill:2024",
      "candidacyId": null
    },
    "availability": "available",
    "recordVersion": 3,
    "updatedAt": "2026-08-07T15:00:00Z"
  },
  "person": {
    "personId": "person:ca:avery-quill",
    "displayName": "Avery Quill",
    "officialIdentifiers": [
      {
        "identifierId": "official-id:ca:avery-quill",
        "issuer": "synthetic-maple-registry",
        "value": "SYN-CA-PERSON-001",
        "sourceIds": [
          "source:ca:synthetic-registry"
        ],
        "freshness": "current"
      }
    ]
  },
  "office": {
    "officeId": "office:ca:maple-member",
    "title": "Member of the Synthetic Maple Assembly",
    "governmentLevel": "provincial",
    "selectionMethod": "appointed",
    "sourceIds": [
      "source:ca:synthetic-registry"
    ],
    "freshness": "current"
  },
  "district": {
    "districtId": "district:ca:maple-north",
    "label": "Maple North",
    "sourceIds": [
      "source:ca:synthetic-registry"
    ],
    "freshness": "current"
  },
  "officeTerm": {
    "officeTermId": "office-term:ca:avery-quill:2024",
    "state": "active",
    "origin": "appointment",
    "serviceCapacity": "regular",
    "plannedStart": "2024-01-01T00:00:00Z",
    "plannedEnd": null,
    "sourceIds": [
      "source:ca:synthetic-registry"
    ],
    "freshness": "current"
  },
  "election": null,
  "candidacy": null,
  "officialContactRoutes": [],
  "claims": [],
  "sources": {
    "schemaVersion": "public-role-profile-sources.v1",
    "profileId": "profile:ca:avery-quill:maple-member:2024",
    "recordVersion": 3,
    "updatedAt": "2026-08-07T15:00:00Z",
    "items": [
      {
        "sourceId": "source:ca:synthetic-registry",
        "publisher": "Synthetic Canada Registry Publisher",
        "sourceType": "official_registry",
        "originalUrl": "synthetic://ca/registry/avery-quill",
        "normalizedUrl": "synthetic://ca/registry/avery-quill",
        "retrievedAt": "2026-08-07T15:00:00Z",
        "contentSha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "licenceNote": "Synthetic fixture; no real public record is represented.",
        "termsUrl": "synthetic://ca/terms",
        "freshness": "current",
        "fetchOutcome": "succeeded",
        "reviewedRecordVersionId": "reviewed-version:ca:registry:1"
      }
    ]
  },
  "coverage": {
    "schemaVersion": "public-role-profile-coverage.v1",
    "profileId": "profile:ca:avery-quill:maple-member:2024",
    "recordVersion": 3,
    "updatedAt": "2026-08-07T15:00:00Z",
    "methodVersion": "source-coverage.v1",
    "missingDataMeaning": "coverage_gap_not_misconduct",
    "items": [
      {
        "category": "identity",
        "state": "available",
        "explanation": "Reviewed synthetic registry fixture is available.",
        "lastReviewedAt": "2026-08-07T15:00:00Z",
        "sourceIds": [
          "source:ca:synthetic-registry"
        ]
      },
      {
        "category": "expenses",
        "state": "coverage_gap",
        "explanation": "No approved synthetic expense source is configured.",
        "lastReviewedAt": null,
        "sourceIds": []
      }
    ],
    "conflicts": []
  },
  "responses": {
    "schemaVersion": "public-role-profile-responses.v1",
    "profileId": "profile:ca:avery-quill:maple-member:2024",
    "recordVersion": 3,
    "updatedAt": "2026-08-07T15:00:00Z",
    "availability": "not_available",
    "items": []
  },
  "disputes": {
    "schemaVersion": "public-role-profile-disputes.v1",
    "profileId": "profile:ca:avery-quill:maple-member:2024",
    "recordVersion": 3,
    "updatedAt": "2026-08-07T15:00:00Z",
    "availability": "not_available",
    "items": []
  },
  "corrections": {
    "schemaVersion": "public-role-profile-corrections.v1",
    "profileId": "profile:ca:avery-quill:maple-member:2024",
    "recordVersion": 3,
    "updatedAt": "2026-08-07T15:00:00Z",
    "availability": "not_available",
    "items": []
  },
  "appeals": {
    "schemaVersion": "public-role-profile-appeals.v1",
    "profileId": "profile:ca:avery-quill:maple-member:2024",
    "recordVersion": 3,
    "updatedAt": "2026-08-07T15:00:00Z",
    "availability": "not_available",
    "items": []
  },
  "method": {
    "profileMethodVersion": "public-profile.v1",
    "coverageMethodVersion": "source-coverage.v1",
    "compositeScoreIncluded": false,
    "signalAggregateIncluded": false
  },
  "provenance": null,
  "externalIdentityReferences": [],
  "timelinePath": "/api/v1/profiles/profile:ca:avery-quill:maple-member:2024/timeline"
} as const;

export const SYNTHETIC_PUBLIC_ROLE_REGISTRY = {
  "schemaVersion": "public-role-registry.v1",
  "dataMode": "synthetic",
  "generatedAt": "2026-08-07T12:00:00.000Z",
  "asOf": "2026-08-07T12:00:00.000Z",
  "selection": {
    "kind": "all",
    "id": null
  },
  "people": [
    {
      "personId": "person:ca:avery-quill",
      "recordState": "active",
      "names": [
        {
          "personNameId": "person-name:ca:avery:primary",
          "displayName": "Avery Quill",
          "kind": "primary",
          "languageTag": "en-CA",
          "effectiveFrom": "2024-01-01T00:00:00Z",
          "effectiveTo": null,
          "attribution": {
            "assertionId": "assertion:public-role:name:ca:avery",
            "sourceReference": "synthetic://public-role/name/ca/avery",
            "observedAt": "2026-08-07T12:00:00.000Z",
            "freshness": "current",
            "coverage": "supported",
            "conflict": "clear",
            "supersedesAssertionId": null
          }
        }
      ]
    },
    {
      "personId": "person:us:morgan-fields",
      "recordState": "active",
      "names": [
        {
          "personNameId": "person-name:us:morgan-fields:primary",
          "displayName": "Morgan Fields",
          "kind": "primary",
          "languageTag": "en-US",
          "effectiveFrom": "2020-01-01T00:00:00Z",
          "effectiveTo": null,
          "attribution": {
            "assertionId": "assertion:public-role:name:us:morgan-fields",
            "sourceReference": "synthetic://public-role/name/us/morgan-fields",
            "observedAt": "2026-08-07T12:00:00.000Z",
            "freshness": "current",
            "coverage": "supported",
            "conflict": "clear",
            "supersedesAssertionId": null
          }
        }
      ]
    }
  ],
  "officeTerms": [],
  "officeTermRelationships": [],
  "officeTermContacts": [],
  "elections": [],
  "candidacies": [],
  "officialIdentifiers": [],
  "personResolutions": [],
  "externalIdentityReferences": [],
  "deferredFamilies": [
    "source_ingestion",
    "public_conduct",
    "participation",
    "representative_authorization",
    "identity_proof",
    "provenance",
    "representative_scoring"
  ],
  "page": {
    "nextCursor": null
  }
} as const;

export const SYNTHETIC_REPRESENTATION_CAPABILITIES = {
  "schemaVersion": "representation-capabilities.v1",
  "dataMode": "synthetic",
  "items": [
    {
      "schemaVersion": "representation-capability.v1",
      "coverage": {
        "state": "partial",
        "gapCodes": [
          "FEDERAL_OFFICE_TERM_GAP",
          "LOCAL_OFFICE_TERM_GAP"
        ]
      },
      "countryCode": "CA",
      "dataMode": "synthetic",
      "featureState": "disabled",
      "input": {
        "autocomplete": "postal-code",
        "kind": "postal_code",
        "label": "Synthetic postal code",
        "maxLength": 7,
        "retention": "request_only"
      },
      "legalDeterminations": "none",
      "provider": {
        "geometry": {
          "effectiveFrom": "2026-01-01T00:00:00.000Z",
          "license": "CC0-1.0 synthetic fixture",
          "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          "version": "synthetic-ca-geometry-2026.1"
        },
        "source": {
          "license": "CC0-1.0 synthetic fixture",
          "observedAt": "2026-06-01T00:00:00.000Z",
          "providerId": "provider:synthetic:ca",
          "retention": "none",
          "termsUrl": null,
          "version": "synthetic-ca-lookup-1.0.0"
        }
      },
      "supportedScopes": [
        "local",
        "regional",
        "province_state",
        "federal"
      ]
    },
    {
      "schemaVersion": "representation-capability.v1",
      "coverage": {
        "state": "partial",
        "gapCodes": [
          "FEDERAL_OFFICE_TERM_GAP",
          "LOCAL_OFFICE_TERM_GAP",
          "REGIONAL_OFFICE_TERM_GAP"
        ]
      },
      "countryCode": "US",
      "dataMode": "synthetic",
      "featureState": "disabled",
      "input": {
        "autocomplete": "street-address",
        "kind": "address",
        "label": "Synthetic street address",
        "maxLength": 240,
        "retention": "request_only"
      },
      "legalDeterminations": "none",
      "provider": {
        "geometry": {
          "effectiveFrom": "2026-01-01T00:00:00.000Z",
          "license": "CC0-1.0 synthetic fixture",
          "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          "version": "synthetic-us-geometry-2026.1"
        },
        "source": {
          "license": "CC0-1.0 synthetic fixture",
          "observedAt": "2026-06-01T00:00:00.000Z",
          "providerId": "provider:synthetic:us",
          "retention": "none",
          "termsUrl": null,
          "version": "synthetic-us-lookup-1.0.0"
        }
      },
      "supportedScopes": [
        "local",
        "regional",
        "province_state",
        "federal",
        "special"
      ]
    }
  ]
} as const;

export const SYNTHETIC_CA_REPRESENTATION_RESOLUTION = {
  "schemaVersion": "representation-resolution.v1",
  "resolutionId": "resolution:synthetic:ca:1",
  "dataMode": "synthetic",
  "countryCode": "CA",
  "asOf": "2026-06-01T12:00:00.000Z",
  "state": "resolved",
  "detailCode": null,
  "matches": [
    {
      "scope": "local",
      "matchState": "coverage_gap",
      "jurisdiction": {
        "applicationId": "jurisdiction:ca:harbour",
        "authoritativeIdentifiers": [
          {
            "issuer": "synthetic-ca-municipal-registry",
            "identifier": "HARBOUR-CITY-002"
          }
        ],
        "label": "Harbour City"
      },
      "district": null,
      "officeId": "office:ca:harbour-mayor",
      "officeTermId": null,
      "candidacyIds": []
    },
    {
      "scope": "regional",
      "matchState": "matched",
      "jurisdiction": {
        "applicationId": "jurisdiction:ca:north-region",
        "authoritativeIdentifiers": [
          {
            "issuer": "synthetic-ca-regional-registry",
            "identifier": "NORTH-REGION-001"
          }
        ],
        "label": "North Regional District"
      },
      "district": null,
      "officeId": "office:ca:north-director",
      "officeTermId": "term:ca:rowan:north-director:2026",
      "candidacyIds": []
    },
    {
      "scope": "province_state",
      "matchState": "matched",
      "jurisdiction": {
        "applicationId": "jurisdiction:ca:maple",
        "authoritativeIdentifiers": [
          {
            "issuer": "synthetic-ca-provincial-registry",
            "identifier": "CA-MAPLE"
          }
        ],
        "label": "Maple Province"
      },
      "district": {
        "applicationId": "district:ca:maple-provincial",
        "authoritativeIdentifiers": [
          {
            "issuer": "synthetic-ca-election-boundaries",
            "identifier": "CA-MAPLE-PROV-2026"
          }
        ],
        "label": "Harbour Coast Provincial District"
      },
      "officeId": "office:ca:maple-member",
      "officeTermId": "term:ca:avery:maple-member:2026",
      "candidacyIds": []
    },
    {
      "scope": "federal",
      "matchState": "coverage_gap",
      "jurisdiction": {
        "applicationId": "jurisdiction:ca",
        "authoritativeIdentifiers": [
          {
            "issuer": "synthetic-ca-country-registry",
            "identifier": "CA"
          }
        ],
        "label": "Canada synthetic fixture"
      },
      "district": {
        "applicationId": "district:ca:maple-federal-new",
        "authoritativeIdentifiers": [
          {
            "issuer": "synthetic-ca-federal-boundaries",
            "identifier": "CA-FED-MAPLE-2026"
          }
        ],
        "label": "Maple Federal District 2026"
      },
      "officeId": null,
      "officeTermId": null,
      "candidacyIds": []
    }
  ],
  "ambiguity": null,
  "provider": {
    "geometry": {
      "effectiveFrom": "2026-01-01T00:00:00.000Z",
      "license": "CC0-1.0 synthetic fixture",
      "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "version": "synthetic-ca-geometry-2026.1"
    },
    "source": {
      "license": "CC0-1.0 synthetic fixture",
      "observedAt": "2026-06-01T00:00:00.000Z",
      "providerId": "provider:synthetic:ca",
      "retention": "none",
      "termsUrl": null,
      "version": "synthetic-ca-lookup-1.0.0"
    }
  },
  "inputDisposition": {
    "disposedAt": "2026-06-01T12:00:00.000Z",
    "logged": false,
    "persisted": false,
    "queued": false,
    "sentToAi": false,
    "sentToVerus": false
  },
  "legalDeterminations": {
    "citizenship": "not_determined",
    "legalResidence": "not_determined",
    "voterEligibility": "not_determined"
  }
} as const;

export const SYNTHETIC_SAVED_BROAD_JURISDICTION = {
  "schemaVersion": "saved-broad-jurisdiction.v1",
  "preferenceId": "preference:synthetic:ca:1",
  "countryCode": "CA",
  "jurisdictionId": "jurisdiction:ca:maple",
  "jurisdictionKind": "province",
  "label": "Maple Province",
  "createdAt": "2026-06-01T12:00:00.000Z",
  "updatedAt": "2026-06-01T12:00:00.000Z"
} as const;

export const SYNTHETIC_SECURITY_DOMAIN_POLICY = {
  "schemaVersion": "security-domain-policy.v1",
  "dataMode": "synthetic",
  "defaultAccess": "deny",
  "domains": [
    "public_registry",
    "account_authentication",
    "location_resolver",
    "identity_attestation",
    "private_civic_activity",
    "moderation",
    "public_methodology_provenance",
    "verus_signing_rpc"
  ],
  "access": [
    {
      "principal": "public_api",
      "domain": "public_registry",
      "operations": [
        "read",
        "public_serialize"
      ]
    },
    {
      "principal": "location_service",
      "domain": "location_resolver",
      "operations": [
        "transient_process"
      ]
    },
    {
      "principal": "participation_service",
      "domain": "private_civic_activity",
      "operations": [
        "read",
        "write"
      ]
    },
    {
      "principal": "moderation_service",
      "domain": "moderation",
      "operations": [
        "read",
        "write"
      ]
    },
    {
      "principal": "publication_service",
      "domain": "public_methodology_provenance",
      "operations": [
        "read",
        "write"
      ]
    },
    {
      "principal": "signer_worker",
      "domain": "verus_signing_rpc",
      "operations": [
        "read",
        "write"
      ]
    },
    {
      "principal": "security_auditor",
      "domain": "private_civic_activity",
      "operations": [
        "audit_review"
      ]
    },
    {
      "principal": "backup_operator",
      "domain": "private_civic_activity",
      "operations": [
        "backup",
        "restore"
      ]
    }
  ],
  "objectStorage": [
    {
      "bucket": "rmr-public",
      "classification": "public",
      "anonymousRead": true
    },
    {
      "bucket": "rmr-public-manifests",
      "classification": "public",
      "anonymousRead": true
    },
    {
      "bucket": "rmr-quarantine",
      "classification": "restricted",
      "anonymousRead": false
    },
    {
      "bucket": "rmr-private-evidence",
      "classification": "highly_restricted",
      "anonymousRead": false
    }
  ],
  "backup": {
    "encrypted": true,
    "restoreMustPreserveClassification": true,
    "productionToNonProductionAllowed": false
  },
  "signerIsolation": {
    "publicApiHasCredentials": false,
    "nativeHasCredentials": false,
    "webHasCredentials": false,
    "coreWorkerHasCredentials": false,
    "verusRequiredForCore": false
  },
  "noSocialCredit": {
    "generalizedCitizenScoreAllowed": false,
    "identityActivityJoinAllowed": false,
    "politicalProfileAnalyticsAllowed": false
  }
} as const;

export const SYNTHETIC_CA_SOURCE_CONNECTOR = {
  "schemaVersion": "source-connector-capability.v1",
  "connectorId": "connector:ca:synthetic-pilot",
  "connectorVersion": "1.0.0",
  "dataMode": "synthetic",
  "approval": {
    "state": "synthetic_approved",
    "reviewReference": "issue:55:synthetic-pilot-approval",
    "reviewedAt": "2026-08-07T12:00:00Z"
  },
  "source": {
    "sourceId": "source:ca:synthetic-pilot",
    "publisher": "Synthetic Canada Pilot Authority",
    "authoritativeScope": "Synthetic CA public-role pilot records only.",
    "countries": [
      "CA"
    ],
    "jurisdictionIds": [
      "jurisdiction:ca:maple"
    ],
    "recordTypes": [
      "person",
      "office_term",
      "correction"
    ]
  },
  "access": {
    "method": "https_json",
    "authentication": "none",
    "endpointOrigin": "https://ca-pilot.synthetic.invalid",
    "rateLimitPerMinute": 10,
    "obeyRobotsPolicy": true
  },
  "rights": {
    "licenseName": "CC0-1.0 synthetic fixture",
    "termsUrl": "https://ca-pilot.synthetic.invalid/terms",
    "attributionText": "Synthetic Canada Pilot Authority; synthetic fixture for automated tests.",
    "retentionDays": 30,
    "redistribution": "permitted_snapshots",
    "snapshotStorage": "quarantine_only"
  },
  "identity": {
    "externalIdentifierTypes": [
      "synthetic-official-record-id"
    ],
    "effectiveDateSemantics": "RFC3339 effective time declared by the synthetic publisher"
  },
  "schedule": {
    "cadenceMinutes": 60,
    "freshnessExpectedMinutes": 120,
    "freshnessStaleMinutes": 240
  },
  "pagination": {
    "style": "cursor",
    "checkpointVersion": "checkpoint.v1"
  },
  "parser": {
    "parserVersion": "synthetic-ca-parser.v1",
    "schemaVersion": "pilot-feed.v1"
  },
  "content": {
    "expectedContentTypes": [
      "application/json"
    ],
    "permittedContentEncodings": [
      "identity"
    ],
    "maximumWireBytes": 100000,
    "maximumDecodedBytes": 200000,
    "maximumExpansionRatio": 10,
    "timeoutMs": 1000,
    "maximumRedirects": 2
  },
  "behavior": {
    "conflicts": "quarantine",
    "deletions": "review",
    "retractions": "review",
    "outages": "retry_then_dead_letter"
  },
  "owner": {
    "team": "data-stewardship",
    "incidentRunbook": "docs/runbooks/SOURCE_INGESTION.md"
  }
} as const;

export const SYNTHETIC_US_SOURCE_CONNECTOR = {
  "schemaVersion": "source-connector-capability.v1",
  "connectorId": "connector:us:synthetic-pilot",
  "connectorVersion": "1.0.0",
  "dataMode": "synthetic",
  "approval": {
    "state": "synthetic_approved",
    "reviewReference": "issue:55:synthetic-pilot-approval",
    "reviewedAt": "2026-08-07T12:00:00Z"
  },
  "source": {
    "sourceId": "source:us:synthetic-pilot",
    "publisher": "Synthetic United States Pilot Authority",
    "authoritativeScope": "Synthetic US public-role pilot records only.",
    "countries": [
      "US"
    ],
    "jurisdictionIds": [
      "jurisdiction:us:example-state"
    ],
    "recordTypes": [
      "person",
      "candidacy",
      "election",
      "correction"
    ]
  },
  "access": {
    "method": "https_json",
    "authentication": "none",
    "endpointOrigin": "https://us-pilot.synthetic.invalid",
    "rateLimitPerMinute": 10,
    "obeyRobotsPolicy": true
  },
  "rights": {
    "licenseName": "CC0-1.0 synthetic fixture",
    "termsUrl": "https://us-pilot.synthetic.invalid/terms",
    "attributionText": "Synthetic United States Pilot Authority; synthetic fixture for automated tests.",
    "retentionDays": 30,
    "redistribution": "permitted_snapshots",
    "snapshotStorage": "quarantine_only"
  },
  "identity": {
    "externalIdentifierTypes": [
      "synthetic-official-record-id"
    ],
    "effectiveDateSemantics": "RFC3339 effective time declared by the synthetic publisher"
  },
  "schedule": {
    "cadenceMinutes": 60,
    "freshnessExpectedMinutes": 120,
    "freshnessStaleMinutes": 240
  },
  "pagination": {
    "style": "cursor",
    "checkpointVersion": "checkpoint.v1"
  },
  "parser": {
    "parserVersion": "synthetic-us-parser.v1",
    "schemaVersion": "pilot-feed.v1"
  },
  "content": {
    "expectedContentTypes": [
      "application/json"
    ],
    "permittedContentEncodings": [
      "identity"
    ],
    "maximumWireBytes": 100000,
    "maximumDecodedBytes": 200000,
    "maximumExpansionRatio": 10,
    "timeoutMs": 1000,
    "maximumRedirects": 2
  },
  "behavior": {
    "conflicts": "quarantine",
    "deletions": "review",
    "retractions": "review",
    "outages": "retry_then_dead_letter"
  },
  "owner": {
    "team": "data-stewardship",
    "incidentRunbook": "docs/runbooks/SOURCE_INGESTION.md"
  }
} as const;

export const SYNTHETIC_SOURCE_COVERAGE = {
  "schemaVersion": "source-coverage-snapshot.v1",
  "dataMode": "synthetic",
  "snapshotId": "coverage:synthetic:issue55",
  "generatedAt": "2026-08-07T14:00:01Z",
  "methodVersion": "source-coverage.v1",
  "codeRevision": "issue-55-synthetic",
  "items": [
    {
      "countryCode": "CA",
      "jurisdictionId": "jurisdiction:ca:maple",
      "recordType": "person",
      "sourceAvailability": "available",
      "candidateCount": 1,
      "pendingReviewCount": 1,
      "conflictCount": 0,
      "lastRetrievedAt": "2026-08-07T14:00:00Z"
    },
    {
      "countryCode": "US",
      "jurisdictionId": "jurisdiction:us:example-state",
      "recordType": "candidacy",
      "sourceAvailability": "missing",
      "candidateCount": 0,
      "pendingReviewCount": 0,
      "conflictCount": 0,
      "lastRetrievedAt": null
    }
  ],
  "missingDataMeaning": "coverage_gap_not_misconduct",
  "provenanceState": "not_anchored",
  "sha256": "5555555555555555555555555555555555555555555555555555555555555555"
} as const;

export const SYNTHETIC_THREAT_CONTROL_CATALOG = {
  "schemaVersion": "threat-control-catalog.v1",
  "policyVersion": "application-threat-model.v1",
  "catalogId": "synthetic:threat-control-catalog:foundation",
  "dataMode": "synthetic",
  "generatedAt": "2028-01-15T12:00:00Z",
  "assumptions": [
    "PostgreSQL application records remain canonical.",
    "Every high-risk runtime feature remains false by default.",
    "This fixture is policy evidence and not a production assurance claim."
  ],
  "hardRules": {
    "coreBuildRequiresVerus": false,
    "mainnetWritesAllowed": false,
    "privateMaterialAllowedInPublicProvenance": false,
    "aiMayExerciseHumanIntent": false,
    "automaticAllegationPublicationAllowed": false,
    "provenanceProvesTruth": false,
    "highRiskFeaturesDefaultEnabled": false,
    "optionalDependencyFailureBlocksSafePublicReads": false,
    "productionAssuranceClaimed": false
  },
  "actorClasses": [
    "external_attacker",
    "compromised_user",
    "representative_or_staff",
    "coordinated_group",
    "malicious_submitter",
    "colluding_moderators",
    "insider",
    "data_broker",
    "scraper",
    "source_publisher",
    "compromised_dependency",
    "ai_provider",
    "wallet_link_attacker",
    "compromised_signer_or_node",
    "operator_error"
  ],
  "boundaryIds": [
    "B01",
    "B02",
    "B03",
    "B04",
    "B05",
    "B06",
    "B07",
    "B08",
    "B09",
    "B10",
    "B11",
    "B12"
  ],
  "domainCoverage": [
    "authentication_authority",
    "privacy_location",
    "no_social_credit",
    "sources_documents",
    "ai",
    "moderation_safety",
    "mobile_supply_chain",
    "mobile_links_storage_push",
    "verus_account_proof",
    "verus_identity_update",
    "verus_managed_identities",
    "provenance",
    "operations_resilience",
    "public_registry_memory"
  ],
  "threats": [
    {
      "threatId": "AUTH-01",
      "domain": "authentication_authority",
      "title": "Account takeover and authority escalation",
      "scenario": "A synthetic attacker replays a session or obtains a role outside its scope.",
      "assetClasses": [
        "accounts_sessions",
        "representative_authority"
      ],
      "actorClasses": [
        "external_attacker",
        "compromised_user",
        "representative_or_staff"
      ],
      "boundaryIds": [
        "B01",
        "B02",
        "B03",
        "B07"
      ],
      "impacts": [
        "authorization",
        "privacy",
        "integrity"
      ],
      "controls": [
        {
          "controlId": "auth_deny_by_default",
          "status": "implemented_foundation",
          "description": "Route and domain policy deny invalid sessions, roles, scopes, and replay.",
          "evidenceReferences": [
            "packages/auth/src/authentication.abuse.test.ts"
          ]
        }
      ],
      "tests": [
        {
          "testId": "auth_abuse",
          "kind": "automated",
          "status": "implemented",
          "evidenceReference": "packages/auth/src/authentication.abuse.test.ts",
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "high",
        "status": "pilot_blocker",
        "explanation": "Production providers and representative authority workflows are not approved."
      },
      "incidentOwnerRole": "security_lead",
      "safeDegradation": "Deny account and authority commands while preserving anonymous public reads.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "production_auth_provider"
      ]
    },
    {
      "threatId": "PRIV-01",
      "domain": "privacy_location",
      "title": "Precise location or private civic activity leakage",
      "scenario": "Restricted synthetic data reaches logs, analytics, public output, or another account.",
      "assetClasses": [
        "location",
        "private_civic_activity"
      ],
      "actorClasses": [
        "insider",
        "data_broker",
        "scraper"
      ],
      "boundaryIds": [
        "B03",
        "B12"
      ],
      "impacts": [
        "privacy",
        "safety"
      ],
      "controls": [
        {
          "controlId": "classified_domain_separation",
          "status": "implemented_foundation",
          "description": "Transient location and separate security domains reject public serialization and forbidden storage.",
          "evidenceReferences": [
            "tests/tooling/security-domain-foundation.test.ts",
            "packages/domain/src/location-resolution.test.ts"
          ]
        }
      ],
      "tests": [
        {
          "testId": "location_redaction",
          "kind": "automated",
          "status": "implemented",
          "evidenceReference": "tests/tooling/location-resolution-foundation.test.ts",
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "requires_mitigation",
        "explanation": "Production telemetry, providers, and participation stores require review."
      },
      "incidentOwnerRole": "privacy_lead",
      "safeDegradation": "Disable location/private writes and retain safe public directory reads.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "production_telemetry_boundary"
      ]
    },
    {
      "threatId": "NSC-01",
      "domain": "no_social_credit",
      "title": "Generalized citizen reputation or political profile",
      "scenario": "Narrow identity, moderation, location, or participation states are combined into a portable citizen value.",
      "assetClasses": [
        "identity_attestation",
        "private_civic_activity",
        "analytics_exports"
      ],
      "actorClasses": [
        "insider",
        "data_broker",
        "ai_provider"
      ],
      "boundaryIds": [
        "B03",
        "B08",
        "B12"
      ],
      "impacts": [
        "privacy",
        "authorization",
        "democratic_process"
      ],
      "controls": [
        {
          "controlId": "no_social_credit_invariant",
          "status": "implemented_foundation",
          "description": "Forbidden joins, names, exports, and agent outputs are rejected by foundation tests.",
          "evidenceReferences": [
            "packages/auth/src/no-social-credit.test.ts"
          ]
        }
      ],
      "tests": [
        {
          "testId": "no_social_credit_foundation",
          "kind": "automated",
          "status": "implemented",
          "evidenceReference": "packages/auth/src/no-social-credit.test.ts",
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "pilot_blocker",
        "explanation": "Future analytics, AI, and cross-product paths need issue #57 enforcement and review."
      },
      "incidentOwnerRole": "privacy_lead",
      "safeDegradation": "Reject the query, export, model, or integration and preserve narrow purpose-limited states only.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "no_social_credit_independent_review"
      ]
    },
    {
      "threatId": "SRC-01",
      "domain": "sources_documents",
      "title": "Source poisoning, SSRF, or hostile content",
      "scenario": "A malicious source or submitter targets internal networks, parsers, rights, or public record integrity.",
      "assetClasses": [
        "source_records",
        "evidence_moderation"
      ],
      "actorClasses": [
        "malicious_submitter",
        "source_publisher",
        "compromised_dependency"
      ],
      "boundaryIds": [
        "B05",
        "B06"
      ],
      "impacts": [
        "integrity",
        "availability",
        "legal",
        "supply_chain"
      ],
      "controls": [
        {
          "controlId": "source_quarantine",
          "status": "implemented_foundation",
          "description": "Synthetic connector retrieval revalidates origins and addresses, applies limits, and quarantines candidates.",
          "evidenceReferences": [
            "packages/connectors/src/source-ingestion.test.ts"
          ]
        }
      ],
      "tests": [
        {
          "testId": "source_ssrf",
          "kind": "automated",
          "status": "implemented",
          "evidenceReference": "packages/connectors/src/source-ingestion.test.ts",
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "pilot_blocker",
        "explanation": "Production egress sandbox, publishers, licences, and arbitrary-document controls are absent."
      },
      "incidentOwnerRole": "data_stewardship",
      "safeDegradation": "Disable retrieval and publication; mark source state unavailable or quarantined.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "production_source_inventory",
        "hostile_document_stack"
      ]
    },
    {
      "threatId": "AI-01",
      "domain": "ai",
      "title": "AI fabrication, prompt injection, or private-data exfiltration",
      "scenario": "An AI provider or hostile source causes fabricated civic output, tool escape, or restricted-data disclosure.",
      "assetClasses": [
        "ai_inputs_jobs",
        "source_records",
        "private_civic_activity"
      ],
      "actorClasses": [
        "ai_provider",
        "malicious_submitter",
        "source_publisher"
      ],
      "boundaryIds": [
        "B06",
        "B08"
      ],
      "impacts": [
        "privacy",
        "integrity",
        "democratic_process"
      ],
      "controls": [
        {
          "controlId": "ai_draft_only",
          "status": "accepted_policy",
          "description": "AI has no human intent or publication authority and receives no private civic data.",
          "evidenceReferences": [
            "docs/METHODOLOGY.md",
            "docs/MODERATION_AND_DUE_PROCESS.md"
          ]
        }
      ],
      "tests": [
        {
          "testId": "ai_red_team",
          "kind": "independent_review",
          "status": "planned",
          "evidenceReference": null,
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "pilot_blocker",
        "explanation": "No provider, isolation gateway, or adversarial evaluation is approved."
      },
      "incidentOwnerRole": "ai_governance_owner",
      "safeDegradation": "Disable AI and use a manual queue or unavailable state.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "ai_provider_and_model"
      ]
    },
    {
      "threatId": "MOD-01",
      "domain": "moderation_safety",
      "title": "Moderation capture, doxxing, or false publication",
      "scenario": "Conflicted reviewers or malicious submissions bypass due process or expose protected material.",
      "assetClasses": [
        "evidence_moderation",
        "public_registry"
      ],
      "actorClasses": [
        "colluding_moderators",
        "coordinated_group",
        "malicious_submitter"
      ],
      "boundaryIds": [
        "B02",
        "B05",
        "B07"
      ],
      "impacts": [
        "safety",
        "privacy",
        "integrity",
        "democratic_process"
      ],
      "controls": [
        {
          "controlId": "moderation_due_process",
          "status": "accepted_policy",
          "description": "Explicit human states, conflict recusal, public history, emergency restriction, and independent appeal are required.",
          "evidenceReferences": [
            "docs/MODERATION_AND_DUE_PROCESS.md"
          ]
        }
      ],
      "tests": [
        {
          "testId": "moderation_policy",
          "kind": "automated",
          "status": "implemented",
          "evidenceReference": "tests/tooling/moderation-due-process-policy.test.ts",
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "pilot_blocker",
        "explanation": "No staffed operational queue or independent exercise exists."
      },
      "incidentOwnerRole": "moderation_safety_owner",
      "safeDegradation": "Close intake and publication while existing reviewed public history remains available.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "moderation_staffing"
      ]
    },
    {
      "threatId": "MOB-01",
      "domain": "mobile_supply_chain",
      "title": "Native build or signing supply-chain compromise",
      "scenario": "A dependency, CI action, signing key, artifact, or update channel is compromised.",
      "assetClasses": [
        "mobile_builds_links_push"
      ],
      "actorClasses": [
        "compromised_dependency",
        "insider",
        "operator_error"
      ],
      "boundaryIds": [
        "B11"
      ],
      "impacts": [
        "supply_chain",
        "privacy",
        "integrity"
      ],
      "controls": [
        {
          "controlId": "mobile_foundation_ci",
          "status": "implemented_foundation",
          "description": "Pinned toolchains, lockfile, SBOM, unsigned development builds, and configuration checks run in CI.",
          "evidenceReferences": [
            "docs/NATIVE_MOBILE.md",
            ".github/workflows/ci.yml"
          ]
        }
      ],
      "tests": [
        {
          "testId": "mobile_release_review",
          "kind": "independent_review",
          "status": "independent_review_required",
          "evidenceReference": null,
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "pilot_blocker",
        "explanation": "Production app signing, store release, rollback, and recovery evidence do not exist."
      },
      "incidentOwnerRole": "mobile_release_owner",
      "safeDegradation": "Stop release and rebuild only after dependency, credential, and artifact review.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "production_mobile_signing"
      ]
    },
    {
      "threatId": "MOB-02",
      "domain": "mobile_links_storage_push",
      "title": "Malicious link, insecure storage, clipboard, or push leakage",
      "scenario": "A synthetic attacker substitutes an app/wallet link or obtains session/political data from device or notification state.",
      "assetClasses": [
        "mobile_builds_links_push",
        "accounts_sessions"
      ],
      "actorClasses": [
        "wallet_link_attacker",
        "external_attacker",
        "data_broker"
      ],
      "boundaryIds": [
        "B01",
        "B08",
        "B09"
      ],
      "impacts": [
        "privacy",
        "authorization",
        "integrity"
      ],
      "controls": [
        {
          "controlId": "mobile_safe_boundaries",
          "status": "implemented_foundation",
          "description": "Exact links, explicit wallet gesture, protected-storage ports, clear-all behavior, and opaque push payloads are tested.",
          "evidenceReferences": [
            "apps/mobile/src/links.test.ts",
            "apps/mobile/src/secure-storage.test.ts",
            "apps/mobile/src/push.test.ts"
          ]
        }
      ],
      "tests": [
        {
          "testId": "mobile_security_foundation",
          "kind": "automated",
          "status": "implemented",
          "evidenceReference": "apps/mobile/src/wallet-harness.test.ts",
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "high",
        "status": "requires_mitigation",
        "explanation": "Associated-domain, device lifecycle, clipboard/screenshot, and provider tests remain manual/future."
      },
      "incidentOwnerRole": "mobile_release_owner",
      "safeDegradation": "Reject the link, clear local state, disable push/wallet launch, and allow safe in-app public reads.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "device_and_app_link_matrix"
      ]
    },
    {
      "threatId": "VRLOGIN-01",
      "domain": "verus_account_proof",
      "title": "Forged, replayed, wrong-chain, or wrong-audience wallet proof",
      "scenario": "A wallet/deep-link attacker or compromised signer returns a response outside the exact challenge context.",
      "assetClasses": [
        "verus_requests_identities",
        "accounts_sessions"
      ],
      "actorClasses": [
        "wallet_link_attacker",
        "compromised_signer_or_node"
      ],
      "boundaryIds": [
        "B09",
        "B10"
      ],
      "impacts": [
        "authorization",
        "privacy",
        "integrity"
      ],
      "controls": [
        {
          "controlId": "verus_proof_policy",
          "status": "accepted_policy",
          "description": "Nonce, expiry, audience, purpose, network, session, signatures, current identity state, and compatibility must all verify.",
          "evidenceReferences": [
            "docs/IDENTITY_AND_VERUS_MOBILE.md"
          ]
        }
      ],
      "tests": [
        {
          "testId": "verus_cryptographic_e2e",
          "kind": "manual",
          "status": "planned",
          "evidenceReference": null,
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "pilot_blocker",
        "explanation": "The disabled mobile harness does not perform cryptographic wallet verification."
      },
      "incidentOwnerRole": "identity_authority_owner",
      "safeDegradation": "Create no link and preserve local account and public read paths.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "verus_compatibility_and_auth_service"
      ]
    },
    {
      "threatId": "VRUPDATE-01",
      "domain": "verus_identity_update",
      "title": "Unsafe representative-controlled identity update",
      "scenario": "A hidden or wrong-network payload is bundled with login or accepted without exact consent and readback.",
      "assetClasses": [
        "verus_requests_identities",
        "representative_authority"
      ],
      "actorClasses": [
        "wallet_link_attacker",
        "representative_or_staff",
        "operator_error"
      ],
      "boundaryIds": [
        "B09",
        "B10"
      ],
      "impacts": [
        "authorization",
        "integrity",
        "legal"
      ],
      "controls": [
        {
          "controlId": "identity_update_absent",
          "status": "accepted_policy",
          "description": "The initial RMR-managed model does not authorize representative-controlled identity updates.",
          "evidenceReferences": [
            "docs/IDENTITY_AND_VERUS_MOBILE.md"
          ]
        }
      ],
      "tests": [
        {
          "testId": "identity_update_future_review",
          "kind": "independent_review",
          "status": "planned",
          "evidenceReference": null,
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "accepted_for_foundation",
        "explanation": "The safest current control is absence; a new governance issue is required to revive the path."
      },
      "incidentOwnerRole": "governance_legal",
      "safeDegradation": "Keep the feature absent; canonical profiles and local corrections remain available.",
      "pilotBlocker": false,
      "unresolvedDecisions": []
    },
    {
      "threatId": "VRMANAGED-01",
      "domain": "verus_managed_identities",
      "title": "Wrong representative identity, parent, namespace, or custody",
      "scenario": "An operator or compromised signer provisions a collision, wrong parent, duplicate identity, or unsafe authority.",
      "assetClasses": [
        "verus_requests_identities",
        "signer_rpc"
      ],
      "actorClasses": [
        "compromised_signer_or_node",
        "insider",
        "operator_error"
      ],
      "boundaryIds": [
        "B03",
        "B04",
        "B10"
      ],
      "impacts": [
        "authorization",
        "integrity",
        "democratic_process"
      ],
      "controls": [
        {
          "controlId": "managed_identity_policy_required",
          "status": "future_required",
          "description": "Issues #80-#82 require deterministic hierarchy, collision checks, reviewed batches, separate custody, idempotency, and readback.",
          "evidenceReferences": [
            "https://github.com/constitutionalmoney/rate-my-representatives-app/issues/80"
          ]
        }
      ],
      "tests": [
        {
          "testId": "managed_identity_vrsctest",
          "kind": "manual",
          "status": "planned",
          "evidenceReference": null,
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "pilot_blocker",
        "explanation": "Hierarchy, custody, recovery, runbooks, and write adapters are not approved."
      },
      "incidentOwnerRole": "verus_operations_owner",
      "safeDegradation": "Provision nothing and keep canonical public profiles independent of Verus.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "managed_identity_hierarchy",
        "signer_custody"
      ]
    },
    {
      "threatId": "PROV-01",
      "domain": "provenance",
      "title": "Signer/RPC compromise, reorg, content overwrite, or provenance-as-truth",
      "scenario": "A compromised node or operator writes wrong bytes/network or labels a mismatch as verified truth.",
      "assetClasses": [
        "provenance_manifests",
        "signer_rpc"
      ],
      "actorClasses": [
        "compromised_signer_or_node",
        "operator_error",
        "coordinated_group"
      ],
      "boundaryIds": [
        "B04",
        "B05",
        "B10"
      ],
      "impacts": [
        "integrity",
        "availability",
        "democratic_process"
      ],
      "controls": [
        {
          "controlId": "provenance_disabled",
          "status": "implemented_foundation",
          "description": "Signer/RPC domains are isolated, gates are false, and provenance explicitly does not prove truth.",
          "evidenceReferences": [
            "packages/provenance/src/index.ts",
            "packages/domain/src/security-domains.test.ts"
          ]
        }
      ],
      "tests": [
        {
          "testId": "provenance_vrsctest_faults",
          "kind": "manual",
          "status": "planned",
          "evidenceReference": null,
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "pilot_blocker",
        "explanation": "VDXF namespace, exact-byte pipeline, signer/node faults, readback, and recovery are not implemented."
      },
      "incidentOwnerRole": "provenance_owner",
      "safeDegradation": "Perform no write and show accurate pending/unavailable provenance while canonical reads remain.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "vdxf_namespace_and_pipeline",
        "mainnet_prohibited"
      ]
    },
    {
      "threatId": "OPS-01",
      "domain": "operations_resilience",
      "title": "Operator error, secret exposure, unsafe backup, or failed recovery",
      "scenario": "A broad grant, wrong environment, copied secret, backup, telemetry, or destructive retry crosses a security boundary.",
      "assetClasses": [
        "signer_rpc",
        "backups_analytics",
        "classified_data"
      ],
      "actorClasses": [
        "operator_error",
        "insider",
        "compromised_dependency"
      ],
      "boundaryIds": [
        "B03",
        "B05",
        "B10",
        "B11",
        "B12"
      ],
      "impacts": [
        "privacy",
        "integrity",
        "availability",
        "supply_chain"
      ],
      "controls": [
        {
          "controlId": "operations_foundation",
          "status": "implemented_foundation",
          "description": "Deny-by-default roles, redaction, secret scan, synthetic backup manifest, outbox, and VRSCTEST defaults exist.",
          "evidenceReferences": [
            "docs/DATA_CLASSIFICATION.md",
            "docs/AUDIT_OUTBOX.md"
          ]
        }
      ],
      "tests": [
        {
          "testId": "production_recovery_exercise",
          "kind": "manual",
          "status": "manual_required",
          "evidenceReference": null,
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "critical",
        "status": "pilot_blocker",
        "explanation": "Production secret management, restore, rotation, on-call, and incident exercises are pending."
      },
      "incidentOwnerRole": "platform_owner",
      "safeDegradation": "Disable affected writes/exports, rotate or revoke, and preserve classified audit evidence.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "production_operations_and_restore"
      ]
    },
    {
      "threatId": "REG-01",
      "domain": "public_registry_memory",
      "title": "Scraping, defacement, registry capture, or public-memory manipulation",
      "scenario": "A scraper or coordinated actor distorts, suppresses, or over-enumerates source-backed public records and corrections.",
      "assetClasses": [
        "public_registry",
        "source_records",
        "provenance_manifests"
      ],
      "actorClasses": [
        "scraper",
        "coordinated_group",
        "source_publisher"
      ],
      "boundaryIds": [
        "B01",
        "B03",
        "B06"
      ],
      "impacts": [
        "integrity",
        "availability",
        "democratic_process"
      ],
      "controls": [
        {
          "controlId": "reviewed_public_history",
          "status": "implemented_foundation",
          "description": "Public profiles are source-backed allowlists with versioned timelines, coverage, corrections, and explicit missing-data meaning.",
          "evidenceReferences": [
            "docs/PUBLIC_PROFILE_API.md",
            "docs/COVERAGE_POLICY.md"
          ]
        }
      ],
      "tests": [
        {
          "testId": "public_profile_foundation",
          "kind": "automated",
          "status": "implemented",
          "evidenceReference": "tests/tooling/public-profile-api-foundation.test.ts",
          "redactionRequired": true
        }
      ],
      "residualRisk": {
        "severity": "high",
        "status": "requires_mitigation",
        "explanation": "Public records are intentionally enumerable; availability, abuse, and editorial monitoring need production evidence."
      },
      "incidentOwnerRole": "data_stewardship",
      "safeDegradation": "Preserve proportionate public access, label gaps, and append corrections without hidden rewriting.",
      "pilotBlocker": true,
      "unresolvedDecisions": [
        "public_availability_and_abuse_policy"
      ]
    }
  ],
  "releaseReadiness": {
    "decision": "blocked",
    "namedOwnersAssigned": false,
    "publicReadDegradationTested": false,
    "independentReviews": {
      "applicationSecurity": {
        "status": "pending",
        "evidenceReferences": []
      },
      "privacyAndNoSocialCredit": {
        "status": "pending",
        "evidenceReferences": []
      },
      "sourceAndHostileContent": {
        "status": "pending",
        "evidenceReferences": []
      },
      "moderationAndSafety": {
        "status": "pending",
        "evidenceReferences": []
      },
      "nativeMobileSupplyChain": {
        "status": "pending",
        "evidenceReferences": []
      },
      "aiSafety": {
        "status": "pending",
        "evidenceReferences": []
      },
      "verusAndSignerOperations": {
        "status": "pending",
        "evidenceReferences": []
      },
      "backupRestoreAndIncidentResponse": {
        "status": "pending",
        "evidenceReferences": []
      }
    },
    "unresolvedDecisionIds": [
      "production_operations_and_restore",
      "production_auth_provider",
      "no_social_credit_independent_review",
      "managed_identity_hierarchy",
      "vdxf_namespace_and_pipeline"
    ],
    "pilotBlockerThreatIds": [
      "AUTH-01",
      "PRIV-01",
      "NSC-01",
      "SRC-01",
      "AI-01",
      "MOD-01",
      "MOB-01",
      "MOB-02",
      "VRLOGIN-01",
      "VRMANAGED-01",
      "PROV-01",
      "OPS-01",
      "REG-01"
    ],
    "decisionReason": "Synthetic foundation controls exist, but named owners, independent reviews, production exercises, and unresolved high-risk decisions remain incomplete."
  }
} as const;

export const SYNTHETIC_NOT_FOUND = {
  "schemaVersion": "api-error.v1",
  "code": "NOT_FOUND",
  "message": "The requested API route does not exist.",
  "correlationId": "synthetic-correlation-not-found",
  "fieldErrors": [],
  "retryable": false,
  "retryAfterSeconds": null,
  "featureState": null,
  "dependencyState": null
} as const;
