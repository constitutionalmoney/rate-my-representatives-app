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
