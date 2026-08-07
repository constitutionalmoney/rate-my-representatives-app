/* Generated JSON Schema documents. Do not edit directly. */

export const API_ERROR_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/v1/api-error.schema.json",
  "title": "ApiError",
  "description": "Privacy-safe v1 API error envelope that prevents account and authority enumeration.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "code",
    "message",
    "correlationId",
    "fieldErrors",
    "retryable",
    "retryAfterSeconds",
    "featureState",
    "dependencyState"
  ],
  "properties": {
    "schemaVersion": {
      "const": "api-error.v1"
    },
    "code": {
      "enum": [
        "NOT_FOUND",
        "METHOD_NOT_ALLOWED",
        "FEATURE_DISABLED",
        "VALIDATION_ERROR",
        "CONFLICT",
        "PRECONDITION_FAILED",
        "RATE_LIMITED",
        "DEPENDENCY_UNAVAILABLE",
        "MAINTENANCE"
      ]
    },
    "message": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    },
    "correlationId": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "fieldErrors": {
      "type": "array",
      "maxItems": 32,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "field",
          "code"
        ],
        "properties": {
          "field": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._\\[\\]-]{0,127}$"
          },
          "code": {
            "type": "string",
            "pattern": "^[A-Z][A-Z0-9_]{0,63}$"
          }
        }
      }
    },
    "retryable": {
      "type": "boolean"
    },
    "retryAfterSeconds": {
      "type": [
        "integer",
        "null"
      ],
      "minimum": 0
    },
    "featureState": {
      "enum": [
        "operational",
        "testnet",
        "proposed",
        "disabled",
        null
      ]
    },
    "dependencyState": {
      "enum": [
        "ready",
        "degraded",
        "unavailable",
        "disabled",
        null
      ]
    }
  }
} as const;

export const AUDIT_EVENT_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/audit-event.schema.json",
  "title": "Audit event",
  "description": "Privacy-minimized append-only audit event contract.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "eventId",
    "eventSchema",
    "aggregateType",
    "aggregateId",
    "actorType",
    "actorRef",
    "action",
    "priorStateRef",
    "newStateRef",
    "policyVersion",
    "methodVersion",
    "consentVersion",
    "requestId",
    "idempotencyKey",
    "correlationId",
    "occurredAt",
    "recordedAt",
    "reasonCode",
    "reasonRef",
    "privacyClass",
    "redactionVersion",
    "codeRevision",
    "environment",
    "safeDetail"
  ],
  "properties": {
    "eventId": {
      "type": "string",
      "minLength": 1
    },
    "eventSchema": {
      "type": "string",
      "minLength": 1
    },
    "aggregateType": {
      "type": "string",
      "minLength": 1
    },
    "aggregateId": {
      "type": "string",
      "minLength": 1
    },
    "actorType": {
      "enum": [
        "human",
        "representative",
        "staff",
        "reviewer",
        "admin",
        "service",
        "agent"
      ]
    },
    "actorRef": {
      "type": "string",
      "minLength": 1
    },
    "action": {
      "type": "string",
      "minLength": 1
    },
    "priorStateRef": {
      "type": [
        "string",
        "null"
      ]
    },
    "newStateRef": {
      "type": [
        "string",
        "null"
      ]
    },
    "policyVersion": {
      "type": "string",
      "minLength": 1
    },
    "methodVersion": {
      "type": "string",
      "minLength": 1
    },
    "consentVersion": {
      "type": [
        "string",
        "null"
      ]
    },
    "requestId": {
      "type": "string",
      "minLength": 1
    },
    "idempotencyKey": {
      "type": "string",
      "minLength": 1
    },
    "correlationId": {
      "type": "string",
      "minLength": 1
    },
    "occurredAt": {
      "type": "string",
      "format": "date-time"
    },
    "recordedAt": {
      "type": "string",
      "format": "date-time"
    },
    "reasonCode": {
      "type": "string",
      "minLength": 1
    },
    "reasonRef": {
      "type": [
        "string",
        "null"
      ]
    },
    "privacyClass": {
      "enum": [
        "public",
        "internal",
        "restricted",
        "security"
      ]
    },
    "redactionVersion": {
      "type": "string",
      "minLength": 1
    },
    "codeRevision": {
      "type": "string",
      "minLength": 1
    },
    "environment": {
      "type": "string",
      "minLength": 1
    },
    "safeDetail": {
      "type": "object",
      "additionalProperties": true
    }
  }
} as const;

export const AUTHENTICATION_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/authentication.schema.json",
  "title": "AuthenticationContract",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "authenticatedSession": {
      "$ref": "#/$defs/AuthenticatedSession"
    },
    "genericStart": {
      "$ref": "#/$defs/GenericAuthenticationStart"
    },
    "passkeyStart": {
      "$ref": "#/$defs/PasskeyAuthenticationStart"
    },
    "roleGrant": {
      "$ref": "#/$defs/RoleGrant"
    }
  },
  "required": [
    "authenticatedSession",
    "genericStart",
    "passkeyStart",
    "roleGrant"
  ],
  "$defs": {
    "DeviceDescriptor": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "deviceId": {
          "type": "string",
          "minLength": 1
        },
        "label": {
          "type": "string",
          "minLength": 1
        },
        "platform": {
          "enum": [
            "ios",
            "android",
            "web"
          ]
        }
      },
      "required": [
        "deviceId",
        "label",
        "platform"
      ]
    },
    "PasskeyAuthenticationStart": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "challenge": {
          "type": "string",
          "minLength": 43
        },
        "expiresAt": {
          "type": "string",
          "format": "date-time"
        },
        "requestId": {
          "type": "string",
          "minLength": 1
        },
        "status": {
          "const": "pending"
        }
      },
      "required": [
        "challenge",
        "expiresAt",
        "requestId",
        "status"
      ]
    },
    "GenericAuthenticationStart": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "expiresAt": {
          "type": "string",
          "format": "date-time"
        },
        "message": {
          "type": "string",
          "minLength": 1
        },
        "requestId": {
          "type": "string",
          "minLength": 1
        },
        "status": {
          "const": "pending"
        }
      },
      "required": [
        "expiresAt",
        "message",
        "requestId",
        "status"
      ]
    },
    "SessionSummary": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "assurance": {
          "enum": [
            "basic",
            "phishing_resistant"
          ]
        },
        "authenticationMethod": {
          "enum": [
            "passkey",
            "verified_email"
          ]
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "current": {
          "type": "boolean"
        },
        "device": {
          "$ref": "#/$defs/DeviceDescriptor"
        },
        "expiresAt": {
          "type": "string",
          "format": "date-time"
        },
        "lastRotatedAt": {
          "type": "string",
          "format": "date-time"
        },
        "privileged": {
          "type": "boolean"
        },
        "revokedAt": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "sessionId": {
          "type": "string",
          "minLength": 1
        }
      },
      "required": [
        "assurance",
        "authenticationMethod",
        "createdAt",
        "current",
        "device",
        "expiresAt",
        "lastRotatedAt",
        "privileged",
        "revokedAt",
        "sessionId"
      ]
    },
    "AuthenticatedSession": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "accountId": {
          "type": "string",
          "minLength": 1
        },
        "session": {
          "$ref": "#/$defs/SessionSummary"
        },
        "sessionToken": {
          "type": "string",
          "minLength": 32
        }
      },
      "required": [
        "accountId",
        "session",
        "sessionToken"
      ]
    },
    "RoleScope": {
      "oneOf": [
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "kind": {
              "const": "global"
            }
          },
          "required": [
            "kind"
          ]
        },
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "jurisdictionId": {
              "type": "string",
              "minLength": 1
            },
            "kind": {
              "const": "jurisdiction"
            }
          },
          "required": [
            "jurisdictionId",
            "kind"
          ]
        },
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "kind": {
              "const": "office_term"
            },
            "officeTermId": {
              "type": "string",
              "minLength": 1
            }
          },
          "required": [
            "kind",
            "officeTermId"
          ]
        }
      ]
    },
    "RoleGrant": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "actorId": {
          "type": "string",
          "minLength": 1
        },
        "effectiveFrom": {
          "type": "string",
          "format": "date-time"
        },
        "effectiveUntil": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "grantId": {
          "type": "string",
          "minLength": 1
        },
        "revokedAt": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "role": {
          "enum": [
            "participant",
            "evidence_contributor",
            "representative_candidate",
            "authorized_staff",
            "moderator_reviewer",
            "administrator",
            "civic_agent"
          ]
        },
        "scope": {
          "$ref": "#/$defs/RoleScope"
        }
      },
      "required": [
        "actorId",
        "effectiveFrom",
        "effectiveUntil",
        "grantId",
        "revokedAt",
        "role",
        "scope"
      ]
    }
  }
} as const;

export const CIVIC_SIGNAL_BRIEFING_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/v1/civic-signal-briefing.schema.json",
  "title": "CivicSignalBriefing",
  "description": "Proposed monitoring/briefing envelope. It contains no human judgment operation.",
  "type": "object",
  "additionalProperties": false,
  "x-rmr-feature-status": "disabled",
  "x-rmr-human-intent": "forbidden",
  "x-rmr-allowed-actors": [
    "human",
    "service",
    "agent"
  ],
  "required": [
    "schemaVersion",
    "kind",
    "briefingId",
    "generatedAt",
    "status"
  ],
  "properties": {
    "schemaVersion": {
      "const": "civic-signal-briefing.v1"
    },
    "kind": {
      "const": "civic_signal_briefing"
    },
    "briefingId": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "generatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "status": {
      "const": "proposed"
    }
  }
} as const;

export const FEATURE_GATES_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/feature-gates.schema.json",
  "title": "FeatureGatesContract",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "PASSKEY_AUTH_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "VERIFIED_EMAIL_AUTH_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "ACCOUNT_RECOVERY_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "ACCOUNT_DATA_ACCESS_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "ACCOUNT_EXPORT_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "ACCOUNT_CORRECTION_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "ACCOUNT_DELETION_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "PRIVILEGED_ACCESS_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "NATIVE_PARTICIPATION_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "CIVIC_SIGNAL_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "REPRESENTATIVE_SIGNALS_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "CATEGORY_RATINGS_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "COMMUNITY_CONTEXT_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "EVIDENCE_SUBMISSION_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "AI_RESEARCH_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "VERUS_ID_LINKING_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "VERUS_AUTH_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "REPRESENTATIVE_CLAIMS_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "REPRESENTATIVE_VERUS_CLAIMS_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "VERUS_IDENTITY_UPDATE_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "CBC_ATTESTATION_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "PROVENANCE_WRITES_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "VERUS_ANCHORING_ENABLED": {
      "type": "boolean",
      "default": false
    },
    "COMPOSITE_SCORE_ENABLED": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "PASSKEY_AUTH_ENABLED",
    "VERIFIED_EMAIL_AUTH_ENABLED",
    "ACCOUNT_RECOVERY_ENABLED",
    "ACCOUNT_DATA_ACCESS_ENABLED",
    "ACCOUNT_EXPORT_ENABLED",
    "ACCOUNT_CORRECTION_ENABLED",
    "ACCOUNT_DELETION_ENABLED",
    "PRIVILEGED_ACCESS_ENABLED",
    "NATIVE_PARTICIPATION_ENABLED",
    "CIVIC_SIGNAL_ENABLED",
    "REPRESENTATIVE_SIGNALS_ENABLED",
    "CATEGORY_RATINGS_ENABLED",
    "COMMUNITY_CONTEXT_ENABLED",
    "EVIDENCE_SUBMISSION_ENABLED",
    "AI_RESEARCH_ENABLED",
    "VERUS_ID_LINKING_ENABLED",
    "VERUS_AUTH_ENABLED",
    "REPRESENTATIVE_CLAIMS_ENABLED",
    "REPRESENTATIVE_VERUS_CLAIMS_ENABLED",
    "VERUS_IDENTITY_UPDATE_ENABLED",
    "CBC_ATTESTATION_ENABLED",
    "PROVENANCE_WRITES_ENABLED",
    "VERUS_ANCHORING_ENABLED",
    "COMPOSITE_SCORE_ENABLED"
  ]
} as const;

export const HEALTH_STATUS_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/v1/health-status.schema.json",
  "title": "HealthStatus",
  "description": "Operational v1 contract-foundation health response; expanded dependency readiness belongs to issue #42.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "status",
    "service",
    "version",
    "contract",
    "featureStates",
    "optionalDependencies"
  ],
  "properties": {
    "status": {
      "const": "ready"
    },
    "service": {
      "const": "api"
    },
    "version": {
      "const": "1.0.0-contract"
    },
    "contract": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "currentVersion",
        "minimumSupportedVersion",
        "supportedVersions"
      ],
      "properties": {
        "currentVersion": {
          "const": "v1"
        },
        "minimumSupportedVersion": {
          "const": "v1"
        },
        "supportedVersions": {
          "type": "array",
          "items": {
            "const": "v1"
          },
          "minItems": 1,
          "maxItems": 1
        }
      }
    },
    "featureStates": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "publicRegistry",
        "civicSignal",
        "representativeSignals",
        "verus",
        "provenanceWrites"
      ],
      "properties": {
        "publicRegistry": {
          "enum": [
            "proposed",
            "operational"
          ]
        },
        "civicSignal": {
          "const": "disabled"
        },
        "representativeSignals": {
          "const": "disabled"
        },
        "verus": {
          "const": "disabled"
        },
        "provenanceWrites": {
          "const": "disabled"
        }
      }
    },
    "dataMode": {
      "enum": [
        "synthetic"
      ]
    },
    "optionalDependencies": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "verus"
      ],
      "properties": {
        "verus": {
          "const": "disabled"
        }
      }
    }
  }
} as const;

export const JURISDICTION_REGISTRY_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/v1/jurisdiction-registry.schema.json",
  "title": "JurisdictionRegistry",
  "description": "Synthetic, effective-dated public registry read model. It contains jurisdictions, districts, public bodies, and offices only; person, term, candidacy, source-ingestion, and location-resolution families are deferred.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "dataMode",
    "generatedAt",
    "asOf",
    "jurisdictions",
    "jurisdictionRelationships",
    "districts",
    "districtJurisdictionRelationships",
    "districtLineage",
    "publicBodies",
    "bodyJurisdictionRelationships",
    "offices",
    "externalIdentifiers",
    "gaps",
    "deferredFamilies",
    "page"
  ],
  "properties": {
    "schemaVersion": {
      "const": "jurisdiction-registry.v1"
    },
    "dataMode": {
      "const": "synthetic"
    },
    "generatedAt": {
      "$ref": "#/$defs/timestamp"
    },
    "asOf": {
      "$ref": "#/$defs/timestamp"
    },
    "jurisdictions": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/jurisdiction"
      }
    },
    "jurisdictionRelationships": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/jurisdictionRelationship"
      }
    },
    "districts": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/district"
      }
    },
    "districtJurisdictionRelationships": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/districtJurisdictionRelationship"
      }
    },
    "districtLineage": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/districtLineage"
      }
    },
    "publicBodies": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/publicBody"
      }
    },
    "bodyJurisdictionRelationships": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/bodyJurisdictionRelationship"
      }
    },
    "offices": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/office"
      }
    },
    "externalIdentifiers": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/externalIdentifier"
      }
    },
    "gaps": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/gap"
      }
    },
    "deferredFamilies": {
      "type": "array",
      "items": {
        "enum": [
          "people",
          "office_terms",
          "candidacies",
          "source_ingestion",
          "location_resolution"
        ]
      },
      "minItems": 5,
      "maxItems": 5,
      "uniqueItems": true
    },
    "page": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "nextCursor"
      ],
      "properties": {
        "nextCursor": {
          "type": "null"
        }
      }
    }
  },
  "$defs": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "countryCode": {
      "enum": [
        "CA",
        "US"
      ]
    },
    "attribution": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "assertionId",
        "sourceReference",
        "observedAt",
        "freshness",
        "coverage",
        "conflict",
        "supersedesAssertionId"
      ],
      "properties": {
        "assertionId": {
          "$ref": "#/$defs/id"
        },
        "sourceReference": {
          "type": "string",
          "pattern": "^synthetic://[a-zA-Z0-9./_:-]+$"
        },
        "observedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "freshness": {
          "enum": [
            "current",
            "stale",
            "unknown",
            "unavailable"
          ]
        },
        "coverage": {
          "enum": [
            "supported",
            "partial",
            "gap",
            "unsupported"
          ]
        },
        "conflict": {
          "enum": [
            "clear",
            "conflicting",
            "unsupported"
          ]
        },
        "supersedesAssertionId": {
          "oneOf": [
            {
              "$ref": "#/$defs/id"
            },
            {
              "type": "null"
            }
          ]
        }
      }
    },
    "jurisdictionVersion": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "versionId",
        "name",
        "slug",
        "kind",
        "status",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "versionId": {
          "$ref": "#/$defs/id"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "slug": {
          "type": "string",
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        },
        "kind": {
          "enum": [
            "country",
            "province",
            "state",
            "territory",
            "municipality",
            "locality",
            "unincorporated_area",
            "county",
            "regional_district",
            "region",
            "special_district"
          ]
        },
        "status": {
          "enum": [
            "active",
            "future",
            "former",
            "amalgamated",
            "dissolved",
            "superseded"
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "jurisdiction": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "jurisdictionId",
        "countryCode",
        "versions"
      ],
      "properties": {
        "jurisdictionId": {
          "$ref": "#/$defs/id"
        },
        "countryCode": {
          "$ref": "#/$defs/countryCode"
        },
        "versions": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/jurisdictionVersion"
          },
          "minItems": 1
        }
      }
    },
    "jurisdictionRelationship": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "relationshipId",
        "subjectJurisdictionId",
        "objectJurisdictionId",
        "kind",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "relationshipId": {
          "$ref": "#/$defs/id"
        },
        "subjectJurisdictionId": {
          "$ref": "#/$defs/id"
        },
        "objectJurisdictionId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "contained_by",
            "administered_by",
            "overlaps",
            "represented_by",
            "successor_of"
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "boundary": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "boundaryVersionId",
        "geometryReference",
        "geometrySha256",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "boundaryVersionId": {
          "$ref": "#/$defs/id"
        },
        "geometryReference": {
          "type": "string",
          "pattern": "^synthetic://[a-zA-Z0-9./_:-]+$"
        },
        "geometrySha256": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "districtVersion": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "versionId",
        "name",
        "slug",
        "kind",
        "status",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "versionId": {
          "$ref": "#/$defs/id"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "slug": {
          "type": "string",
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        },
        "kind": {
          "enum": [
            "federal_electoral",
            "provincial_electoral",
            "state_legislative",
            "local_electoral",
            "special"
          ]
        },
        "status": {
          "enum": [
            "active",
            "future",
            "former",
            "superseded"
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "district": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "districtId",
        "countryCode",
        "versions",
        "boundaries"
      ],
      "properties": {
        "districtId": {
          "$ref": "#/$defs/id"
        },
        "countryCode": {
          "$ref": "#/$defs/countryCode"
        },
        "versions": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/districtVersion"
          },
          "minItems": 1
        },
        "boundaries": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/boundary"
          }
        }
      }
    },
    "districtJurisdictionRelationship": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "relationshipId",
        "districtId",
        "jurisdictionId",
        "kind",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "relationshipId": {
          "$ref": "#/$defs/id"
        },
        "districtId": {
          "$ref": "#/$defs/id"
        },
        "jurisdictionId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "contained_by",
            "overlaps",
            "represents",
            "successor_of"
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "districtLineage": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "lineageId",
        "districtId",
        "predecessorDistrictId",
        "kind",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "lineageId": {
          "$ref": "#/$defs/id"
        },
        "districtId": {
          "$ref": "#/$defs/id"
        },
        "predecessorDistrictId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "redistricted_from",
            "split_from",
            "merged_from"
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "publicBodyVersion": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "versionId",
        "name",
        "slug",
        "kind",
        "status",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "versionId": {
          "$ref": "#/$defs/id"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "slug": {
          "type": "string",
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        },
        "kind": {
          "enum": [
            "legislature",
            "council",
            "board",
            "agency",
            "commission"
          ]
        },
        "status": {
          "enum": [
            "active",
            "future",
            "former",
            "abolished"
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "publicBody": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "publicBodyId",
        "countryCode",
        "versions"
      ],
      "properties": {
        "publicBodyId": {
          "$ref": "#/$defs/id"
        },
        "countryCode": {
          "$ref": "#/$defs/countryCode"
        },
        "versions": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/publicBodyVersion"
          },
          "minItems": 1
        }
      }
    },
    "bodyJurisdictionRelationship": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "relationshipId",
        "publicBodyId",
        "jurisdictionId",
        "kind",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "relationshipId": {
          "$ref": "#/$defs/id"
        },
        "publicBodyId": {
          "$ref": "#/$defs/id"
        },
        "jurisdictionId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "governs",
            "serves",
            "overlaps"
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "officeVersion": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "versionId",
        "publicBodyId",
        "districtId",
        "name",
        "slug",
        "selectionMethod",
        "operationalState",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "versionId": {
          "$ref": "#/$defs/id"
        },
        "publicBodyId": {
          "$ref": "#/$defs/id"
        },
        "districtId": {
          "oneOf": [
            {
              "$ref": "#/$defs/id"
            },
            {
              "type": "null"
            }
          ]
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "slug": {
          "type": "string",
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        },
        "selectionMethod": {
          "enum": [
            "elected",
            "appointed",
            "mixed",
            "ex_officio",
            "unknown"
          ]
        },
        "operationalState": {
          "enum": [
            "active",
            "vacant",
            "acting",
            "future",
            "abolished"
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "office": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "officeId",
        "countryCode",
        "versions"
      ],
      "properties": {
        "officeId": {
          "$ref": "#/$defs/id"
        },
        "countryCode": {
          "$ref": "#/$defs/countryCode"
        },
        "versions": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/officeVersion"
          },
          "minItems": 1
        }
      }
    },
    "externalIdentifier": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "externalIdentifierId",
        "entityKind",
        "entityId",
        "issuer",
        "identifier",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "externalIdentifierId": {
          "$ref": "#/$defs/id"
        },
        "entityKind": {
          "enum": [
            "jurisdiction",
            "district",
            "public_body",
            "office"
          ]
        },
        "entityId": {
          "$ref": "#/$defs/id"
        },
        "issuer": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "identifier": {
          "type": "string",
          "minLength": 1,
          "maxLength": 160
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "gap": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "gapId",
        "entityKind",
        "entityId",
        "code",
        "message",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "gapId": {
          "$ref": "#/$defs/id"
        },
        "entityKind": {
          "enum": [
            "jurisdiction",
            "district",
            "public_body",
            "office"
          ]
        },
        "entityId": {
          "$ref": "#/$defs/id"
        },
        "code": {
          "type": "string",
          "pattern": "^[A-Z][A-Z0-9_]{0,63}$"
        },
        "message": {
          "type": "string",
          "minLength": 1,
          "maxLength": 256
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    }
  }
} as const;

export const MOBILE_COMPATIBILITY_STATUS_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/v1/mobile-compatibility-status.schema.json",
  "title": "MobileCompatibilityStatus",
  "description": "Synthetic foundation compatibility policy for installed native iOS and Android clients.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "status",
    "contract",
    "platforms"
  ],
  "properties": {
    "status": {
      "const": "compatible"
    },
    "contract": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "currentVersion",
        "minimumSupportedVersion",
        "supportedVersions"
      ],
      "properties": {
        "currentVersion": {
          "const": "v1"
        },
        "minimumSupportedVersion": {
          "const": "v1"
        },
        "supportedVersions": {
          "type": "array",
          "items": {
            "const": "v1"
          },
          "minItems": 1,
          "maxItems": 1
        }
      }
    },
    "platforms": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "ios",
        "android"
      ],
      "properties": {
        "ios": {
          "$ref": "#/$defs/platformPolicy"
        },
        "android": {
          "$ref": "#/$defs/platformPolicy"
        }
      }
    }
  },
  "$defs": {
    "platformPolicy": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "releaseState",
        "minimumAppVersion",
        "minimumBuildNumber",
        "supportedContractVersions"
      ],
      "properties": {
        "releaseState": {
          "const": "foundation"
        },
        "minimumAppVersion": {
          "const": "0.0.0-foundation"
        },
        "minimumBuildNumber": {
          "const": 1
        },
        "supportedContractVersions": {
          "type": "array",
          "items": {
            "const": "v1"
          },
          "minItems": 1,
          "maxItems": 1
        }
      }
    }
  }
} as const;

export const INFRASTRUCTURE_SERVICES_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/infrastructure-services.schema.json",
  "title": "InfrastructureServicesContract",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "coreServices",
    "optionalProfiles"
  ],
  "properties": {
    "schemaVersion": {
      "const": "1.0.0"
    },
    "coreServices": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "enum": [
          "postgres",
          "migrations",
          "rabbitmq",
          "object-storage",
          "mailpit",
          "api",
          "worker"
        ]
      }
    },
    "optionalProfiles": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "verus"
      ],
      "properties": {
        "verus": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "enabledByDefault",
            "network",
            "services",
            "writesEnabled"
          ],
          "properties": {
            "enabledByDefault": {
              "const": false
            },
            "network": {
              "const": "VRSCTEST"
            },
            "writesEnabled": {
              "const": false
            },
            "services": {
              "type": "array",
              "uniqueItems": true,
              "items": {
                "enum": [
                  "verus-params",
                  "verus-node",
                  "wallet-request-signer-stub",
                  "provenance-worker-signer-stub"
                ]
              }
            }
          }
        }
      }
    }
  }
} as const;

export const OUTBOX_EVENT_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/outbox-event.schema.json",
  "title": "Outbox event",
  "description": "At-least-once transactional outbox envelope.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "eventId",
    "eventType",
    "eventSchema",
    "aggregateType",
    "aggregateId",
    "idempotencyKey",
    "correlationId",
    "privacyClass",
    "payload",
    "state",
    "availableAt",
    "attemptCount",
    "maxAttempts",
    "createdAt"
  ],
  "properties": {
    "eventId": {
      "type": "string",
      "minLength": 1
    },
    "eventType": {
      "enum": [
        "notification.dispatch",
        "search.index",
        "aggregate.recompute",
        "source.retrieve",
        "ai.draft.requested",
        "public_manifest.materialize",
        "provenance.anchor.requested"
      ]
    },
    "eventSchema": {
      "type": "string",
      "minLength": 1
    },
    "aggregateType": {
      "type": "string",
      "minLength": 1
    },
    "aggregateId": {
      "type": "string",
      "minLength": 1
    },
    "idempotencyKey": {
      "type": "string",
      "minLength": 1
    },
    "correlationId": {
      "type": "string",
      "minLength": 1
    },
    "privacyClass": {
      "enum": [
        "public",
        "internal",
        "restricted",
        "security"
      ]
    },
    "payload": {
      "type": "object",
      "additionalProperties": true
    },
    "state": {
      "enum": [
        "pending",
        "leased",
        "delivered",
        "dead_letter"
      ]
    },
    "availableAt": {
      "type": "string",
      "format": "date-time"
    },
    "attemptCount": {
      "type": "integer",
      "minimum": 0
    },
    "maxAttempts": {
      "type": "integer",
      "minimum": 1
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
} as const;

export const PUBLIC_ROLE_REGISTRY_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/v1/public-role-registry.schema.json",
  "title": "PublicRoleRegistry",
  "description": "Synthetic public people, office-term, election, candidacy, and reviewed person-resolution read model. PostgreSQL remains canonical and external identity references are inert.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "dataMode",
    "generatedAt",
    "asOf",
    "selection",
    "people",
    "officeTerms",
    "officeTermRelationships",
    "officeTermContacts",
    "elections",
    "candidacies",
    "officialIdentifiers",
    "personResolutions",
    "externalIdentityReferences",
    "deferredFamilies",
    "page"
  ],
  "properties": {
    "schemaVersion": {
      "const": "public-role-registry.v1"
    },
    "dataMode": {
      "const": "synthetic"
    },
    "generatedAt": {
      "$ref": "#/$defs/timestamp"
    },
    "asOf": {
      "$ref": "#/$defs/timestamp"
    },
    "selection": {
      "$ref": "#/$defs/selection"
    },
    "people": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/person"
      }
    },
    "officeTerms": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/officeTerm"
      }
    },
    "officeTermRelationships": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/termRelationship"
      }
    },
    "officeTermContacts": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/termContact"
      }
    },
    "elections": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/election"
      }
    },
    "candidacies": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/candidacy"
      }
    },
    "officialIdentifiers": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/officialIdentifier"
      }
    },
    "personResolutions": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/personResolution"
      }
    },
    "externalIdentityReferences": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/externalIdentityReference"
      }
    },
    "deferredFamilies": {
      "type": "array",
      "prefixItems": [
        {
          "const": "source_ingestion"
        },
        {
          "const": "public_conduct"
        },
        {
          "const": "participation"
        },
        {
          "const": "representative_authorization"
        },
        {
          "const": "identity_proof"
        },
        {
          "const": "provenance"
        },
        {
          "const": "representative_scoring"
        }
      ],
      "items": false,
      "minItems": 7,
      "maxItems": 7
    },
    "page": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "nextCursor"
      ],
      "properties": {
        "nextCursor": {
          "type": "null"
        }
      }
    }
  },
  "$defs": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "nullableTimestamp": {
      "oneOf": [
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "type": "null"
        }
      ]
    },
    "nullableId": {
      "oneOf": [
        {
          "$ref": "#/$defs/id"
        },
        {
          "type": "null"
        }
      ]
    },
    "countryCode": {
      "enum": [
        "CA",
        "US"
      ]
    },
    "attribution": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "assertionId",
        "sourceReference",
        "observedAt",
        "freshness",
        "coverage",
        "conflict",
        "supersedesAssertionId"
      ],
      "properties": {
        "assertionId": {
          "$ref": "#/$defs/id"
        },
        "sourceReference": {
          "type": "string",
          "pattern": "^synthetic://[a-zA-Z0-9./_:-]+$"
        },
        "observedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "freshness": {
          "enum": [
            "current",
            "stale",
            "unknown",
            "unavailable"
          ]
        },
        "coverage": {
          "enum": [
            "supported",
            "partial",
            "gap",
            "unsupported"
          ]
        },
        "conflict": {
          "enum": [
            "clear",
            "conflicting",
            "unsupported"
          ]
        },
        "supersedesAssertionId": {
          "$ref": "#/$defs/nullableId"
        }
      }
    },
    "publicReview": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "actorType",
        "process",
        "reasonCode",
        "recordedAt"
      ],
      "properties": {
        "actorType": {
          "enum": [
            "reviewer",
            "admin",
            "source_process"
          ]
        },
        "process": {
          "enum": [
            "manual_review",
            "reviewed_import",
            "synthetic_seed"
          ]
        },
        "reasonCode": {
          "type": "string",
          "pattern": "^[A-Z][A-Z0-9_]{0,63}$"
        },
        "recordedAt": {
          "$ref": "#/$defs/timestamp"
        }
      }
    },
    "personName": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "personNameId",
        "displayName",
        "kind",
        "languageTag",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "personNameId": {
          "$ref": "#/$defs/id"
        },
        "displayName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "kind": {
          "enum": [
            "primary",
            "alias",
            "previous",
            "transliteration"
          ]
        },
        "languageTag": {
          "oneOf": [
            {
              "type": "string",
              "minLength": 2,
              "maxLength": 64
            },
            {
              "type": "null"
            }
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "$ref": "#/$defs/nullableTimestamp"
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "person": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "personId",
        "recordState",
        "names"
      ],
      "properties": {
        "personId": {
          "$ref": "#/$defs/id"
        },
        "recordState": {
          "enum": [
            "active",
            "historical",
            "superseded"
          ]
        },
        "names": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/personName"
          },
          "minItems": 1
        }
      }
    },
    "termTransition": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "transitionId",
        "fromState",
        "toState",
        "effectiveAt",
        "attribution",
        "review"
      ],
      "properties": {
        "transitionId": {
          "$ref": "#/$defs/id"
        },
        "fromState": {
          "oneOf": [
            {
              "enum": [
                "pending",
                "active",
                "cancelled",
                "ended",
                "resigned",
                "removed",
                "deceased",
                "disqualified",
                "superseded"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "toState": {
          "enum": [
            "pending",
            "active",
            "cancelled",
            "ended",
            "resigned",
            "removed",
            "deceased",
            "disqualified",
            "superseded"
          ]
        },
        "effectiveAt": {
          "$ref": "#/$defs/timestamp"
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        },
        "review": {
          "$ref": "#/$defs/publicReview"
        }
      }
    },
    "officeTerm": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "officeTermId",
        "personId",
        "countryCode",
        "jurisdictionId",
        "districtId",
        "publicBodyId",
        "officeId",
        "origin",
        "selectionMethod",
        "serviceCapacity",
        "plannedStart",
        "plannedEnd",
        "currentState",
        "tenureClassification",
        "transitions"
      ],
      "properties": {
        "officeTermId": {
          "$ref": "#/$defs/id"
        },
        "personId": {
          "$ref": "#/$defs/id"
        },
        "countryCode": {
          "$ref": "#/$defs/countryCode"
        },
        "jurisdictionId": {
          "$ref": "#/$defs/id"
        },
        "districtId": {
          "$ref": "#/$defs/nullableId"
        },
        "publicBodyId": {
          "$ref": "#/$defs/id"
        },
        "officeId": {
          "$ref": "#/$defs/id"
        },
        "origin": {
          "enum": [
            "scheduled",
            "election_result",
            "appointment",
            "ex_officio"
          ]
        },
        "selectionMethod": {
          "enum": [
            "elected",
            "appointed",
            "mixed",
            "ex_officio",
            "unknown"
          ]
        },
        "serviceCapacity": {
          "enum": [
            "regular",
            "acting",
            "interim"
          ]
        },
        "plannedStart": {
          "$ref": "#/$defs/timestamp"
        },
        "plannedEnd": {
          "$ref": "#/$defs/nullableTimestamp"
        },
        "currentState": {
          "enum": [
            "pending",
            "active",
            "cancelled",
            "ended",
            "resigned",
            "removed",
            "deceased",
            "disqualified",
            "superseded"
          ]
        },
        "tenureClassification": {
          "enum": [
            "current",
            "former",
            "historical",
            "pending"
          ]
        },
        "transitions": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/termTransition"
          },
          "minItems": 1
        }
      }
    },
    "termRelationship": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "relationshipId",
        "officeTermId",
        "relatedOfficeTermId",
        "kind",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "relationshipId": {
          "$ref": "#/$defs/id"
        },
        "officeTermId": {
          "$ref": "#/$defs/id"
        },
        "relatedOfficeTermId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "predecessor_of",
            "successor_of",
            "supersedes"
          ]
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "$ref": "#/$defs/nullableTimestamp"
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "termContact": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "contactId",
        "officeTermId",
        "kind",
        "value",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "contactId": {
          "$ref": "#/$defs/id"
        },
        "officeTermId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "office_email",
            "office_phone",
            "office_url"
          ]
        },
        "value": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "$ref": "#/$defs/nullableTimestamp"
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "electionVersion": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "versionId",
        "name",
        "kind",
        "state",
        "scheduledAt",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "versionId": {
          "$ref": "#/$defs/id"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "kind": {
          "enum": [
            "general",
            "by_election",
            "primary",
            "special",
            "other"
          ]
        },
        "state": {
          "enum": [
            "scheduled",
            "active",
            "completed",
            "cancelled",
            "superseded"
          ]
        },
        "scheduledAt": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "$ref": "#/$defs/nullableTimestamp"
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "election": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "electionId",
        "countryCode",
        "jurisdictionId",
        "districtId",
        "publicBodyId",
        "officeId",
        "versions"
      ],
      "properties": {
        "electionId": {
          "$ref": "#/$defs/id"
        },
        "countryCode": {
          "$ref": "#/$defs/countryCode"
        },
        "jurisdictionId": {
          "$ref": "#/$defs/id"
        },
        "districtId": {
          "$ref": "#/$defs/nullableId"
        },
        "publicBodyId": {
          "$ref": "#/$defs/id"
        },
        "officeId": {
          "$ref": "#/$defs/id"
        },
        "versions": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/electionVersion"
          },
          "minItems": 1
        }
      }
    },
    "candidacyTransition": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "transitionId",
        "fromState",
        "toState",
        "effectiveAt",
        "attribution",
        "review"
      ],
      "properties": {
        "transitionId": {
          "$ref": "#/$defs/id"
        },
        "fromState": {
          "oneOf": [
            {
              "enum": [
                "declared",
                "registered",
                "qualified",
                "withdrawn",
                "suspended",
                "rejected",
                "disqualified",
                "active",
                "won",
                "defeated",
                "cancelled",
                "superseded"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "toState": {
          "enum": [
            "declared",
            "registered",
            "qualified",
            "withdrawn",
            "suspended",
            "rejected",
            "disqualified",
            "active",
            "won",
            "defeated",
            "cancelled",
            "superseded"
          ]
        },
        "effectiveAt": {
          "$ref": "#/$defs/timestamp"
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        },
        "review": {
          "$ref": "#/$defs/publicReview"
        }
      }
    },
    "candidacy": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "candidacyId",
        "personId",
        "electionId",
        "countryCode",
        "jurisdictionId",
        "districtId",
        "officeId",
        "currentState",
        "transitions"
      ],
      "properties": {
        "candidacyId": {
          "$ref": "#/$defs/id"
        },
        "personId": {
          "$ref": "#/$defs/id"
        },
        "electionId": {
          "$ref": "#/$defs/id"
        },
        "countryCode": {
          "$ref": "#/$defs/countryCode"
        },
        "jurisdictionId": {
          "$ref": "#/$defs/id"
        },
        "districtId": {
          "$ref": "#/$defs/nullableId"
        },
        "officeId": {
          "$ref": "#/$defs/id"
        },
        "currentState": {
          "enum": [
            "declared",
            "registered",
            "qualified",
            "withdrawn",
            "suspended",
            "rejected",
            "disqualified",
            "active",
            "won",
            "defeated",
            "cancelled",
            "superseded"
          ]
        },
        "transitions": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/candidacyTransition"
          },
          "minItems": 1
        }
      }
    },
    "officialIdentifier": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "officialIdentifierId",
        "entityKind",
        "entityId",
        "issuer",
        "identifier",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "officialIdentifierId": {
          "$ref": "#/$defs/id"
        },
        "entityKind": {
          "enum": [
            "person",
            "office_term",
            "election",
            "candidacy"
          ]
        },
        "entityId": {
          "$ref": "#/$defs/id"
        },
        "issuer": {
          "$ref": "#/$defs/id"
        },
        "identifier": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "$ref": "#/$defs/nullableTimestamp"
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "resolutionEvidence": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "evidenceId",
        "kind",
        "reference",
        "attribution"
      ],
      "properties": {
        "evidenceId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "name",
            "official_identifier",
            "office_context",
            "district_context",
            "effective_date",
            "source_conflict"
          ]
        },
        "reference": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "personResolution": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "decisionId",
        "kind",
        "inputPersonIds",
        "outputPersonIds",
        "effectiveAt",
        "evidence",
        "attribution",
        "review",
        "supersedesDecisionId"
      ],
      "properties": {
        "decisionId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "merge",
            "split",
            "distinct"
          ]
        },
        "inputPersonIds": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/id"
          },
          "minItems": 1,
          "uniqueItems": true
        },
        "outputPersonIds": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/id"
          },
          "minItems": 1,
          "uniqueItems": true
        },
        "effectiveAt": {
          "$ref": "#/$defs/timestamp"
        },
        "evidence": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/resolutionEvidence"
          },
          "minItems": 2
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        },
        "review": {
          "$ref": "#/$defs/publicReview"
        },
        "supersedesDecisionId": {
          "$ref": "#/$defs/nullableId"
        }
      }
    },
    "externalIdentityReference": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "externalIdentityReferenceId",
        "personId",
        "kind",
        "immutableReference",
        "displayNameSnapshot",
        "canonicalAuthority",
        "grantsAuthorization",
        "effectiveFrom",
        "effectiveTo",
        "attribution"
      ],
      "properties": {
        "externalIdentityReferenceId": {
          "$ref": "#/$defs/id"
        },
        "personId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "public_identifier",
            "verus_id"
          ]
        },
        "immutableReference": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "displayNameSnapshot": {
          "oneOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "canonicalAuthority": {
          "const": false
        },
        "grantsAuthorization": {
          "const": false
        },
        "effectiveFrom": {
          "$ref": "#/$defs/timestamp"
        },
        "effectiveTo": {
          "$ref": "#/$defs/nullableTimestamp"
        },
        "attribution": {
          "$ref": "#/$defs/attribution"
        }
      }
    },
    "selection": {
      "oneOf": [
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "kind",
            "id"
          ],
          "properties": {
            "kind": {
              "const": "all"
            },
            "id": {
              "type": "null"
            }
          }
        },
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "kind",
            "id"
          ],
          "properties": {
            "kind": {
              "enum": [
                "person",
                "office",
                "office_term",
                "election",
                "candidacy"
              ]
            },
            "id": {
              "$ref": "#/$defs/id"
            }
          }
        }
      ]
    }
  }
} as const;

export const REPRESENTATIVE_SIGNAL_COMMAND_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/v1/representative-signal-command.schema.json",
  "title": "RepresentativeSignalCommand",
  "description": "Disabled future human-intent command contract. No API operation accepts it in issue #60.",
  "type": "object",
  "additionalProperties": false,
  "x-rmr-feature-status": "disabled",
  "x-rmr-allowed-actors": [
    "human"
  ],
  "x-rmr-agent-access": "forbidden",
  "required": [
    "schemaVersion",
    "kind",
    "officeTermId",
    "judgment",
    "confirmation"
  ],
  "properties": {
    "schemaVersion": {
      "const": "representative-signal-command.v1"
    },
    "kind": {
      "const": "representative_signal_command"
    },
    "officeTermId": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "judgment": {
      "enum": [
        "support",
        "concern"
      ]
    },
    "confirmation": {
      "const": "human-confirmed"
    }
  }
} as const;
