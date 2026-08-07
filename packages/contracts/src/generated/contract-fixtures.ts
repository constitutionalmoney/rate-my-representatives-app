/* Generated synthetic contract fixtures. Do not edit directly. */

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
