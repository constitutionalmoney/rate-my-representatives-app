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
      "minimumAppVersion": "0.0.0-foundation",
      "minimumBuildNumber": 1,
      "supportedContractVersions": [
        "v1"
      ]
    },
    "android": {
      "releaseState": "foundation",
      "minimumAppVersion": "0.0.0-foundation",
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
