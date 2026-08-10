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
        "MAINTENANCE",
        "UNAUTHENTICATED",
        "FORBIDDEN",
        "GONE"
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

export const COVERAGE_REPORT_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/coverage-report.schema.json",
  "title": "CoverageReportV1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "policyVersion",
    "reportId",
    "dataMode",
    "generatedAt",
    "asOf",
    "methodVersion",
    "codeRevision",
    "scope",
    "jurisdictions",
    "authoritativeSources",
    "inventory",
    "dimensions",
    "freshness",
    "connectors",
    "gaps",
    "knownErrors",
    "corrections",
    "changelog",
    "missingDataMeaning",
    "provenance",
    "releaseDecision",
    "sha256"
  ],
  "properties": {
    "schemaVersion": {
      "const": "coverage-report.v1"
    },
    "policyVersion": {
      "const": "coverage-policy.v1"
    },
    "reportId": {
      "$ref": "#/$defs/id"
    },
    "dataMode": {
      "enum": [
        "synthetic",
        "pilot",
        "production"
      ]
    },
    "generatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "asOf": {
      "type": "string",
      "format": "date-time"
    },
    "methodVersion": {
      "$ref": "#/$defs/id"
    },
    "codeRevision": {
      "$ref": "#/$defs/id"
    },
    "scope": {
      "$ref": "#/$defs/scope"
    },
    "jurisdictions": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/jurisdictionCoverage"
      }
    },
    "authoritativeSources": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/source"
      }
    },
    "inventory": {
      "$ref": "#/$defs/inventory"
    },
    "dimensions": {
      "type": "array",
      "minItems": 7,
      "maxItems": 7,
      "allOf": [
        {
          "contains": {
            "type": "object",
            "properties": {
              "dimensionId": {
                "const": "structural_registry"
              }
            },
            "required": [
              "dimensionId"
            ]
          },
          "minContains": 1,
          "maxContains": 1
        },
        {
          "contains": {
            "type": "object",
            "properties": {
              "dimensionId": {
                "const": "person_role_lifecycle"
              }
            },
            "required": [
              "dimensionId"
            ]
          },
          "minContains": 1,
          "maxContains": 1
        },
        {
          "contains": {
            "type": "object",
            "properties": {
              "dimensionId": {
                "const": "profile_coverage"
              }
            },
            "required": [
              "dimensionId"
            ]
          },
          "minContains": 1,
          "maxContains": 1
        },
        {
          "contains": {
            "type": "object",
            "properties": {
              "dimensionId": {
                "const": "material_claim_source_coverage"
              }
            },
            "required": [
              "dimensionId"
            ]
          },
          "minContains": 1,
          "maxContains": 1
        },
        {
          "contains": {
            "type": "object",
            "properties": {
              "dimensionId": {
                "const": "public_gap_disclosure"
              }
            },
            "required": [
              "dimensionId"
            ]
          },
          "minContains": 1,
          "maxContains": 1
        },
        {
          "contains": {
            "type": "object",
            "properties": {
              "dimensionId": {
                "const": "correction_supersession"
              }
            },
            "required": [
              "dimensionId"
            ]
          },
          "minContains": 1,
          "maxContains": 1
        },
        {
          "contains": {
            "type": "object",
            "properties": {
              "dimensionId": {
                "const": "representative_match"
              }
            },
            "required": [
              "dimensionId"
            ]
          },
          "minContains": 1,
          "maxContains": 1
        }
      ],
      "items": {
        "$ref": "#/$defs/dimension"
      }
    },
    "freshness": {
      "$ref": "#/$defs/freshness"
    },
    "connectors": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/connector"
      }
    },
    "gaps": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/publicCondition"
      }
    },
    "knownErrors": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/publicCondition"
      }
    },
    "corrections": {
      "$ref": "#/$defs/corrections"
    },
    "changelog": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/change"
      }
    },
    "missingDataMeaning": {
      "const": "coverage_gap_not_misconduct"
    },
    "provenance": {
      "$ref": "#/$defs/provenance"
    },
    "releaseDecision": {
      "$ref": "#/$defs/releaseDecision"
    },
    "sha256": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    }
  },
  "allOf": [
    {
      "if": {
        "type": "object",
        "properties": {
          "dataMode": {
            "const": "synthetic"
          }
        },
        "required": [
          "dataMode"
        ]
      },
      "then": {
        "type": "object",
        "properties": {
          "provenance": {
            "type": "object",
            "properties": {
              "state": {
                "const": "not_anchored"
              }
            },
            "required": [
              "state"
            ]
          },
          "releaseDecision": {
            "type": "object",
            "properties": {
              "status": {
                "const": "not_ready"
              },
              "publicApproval": {
                "const": false
              }
            },
            "required": [
              "status",
              "publicApproval"
            ]
          }
        }
      }
    }
  ],
  "$defs": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$"
    },
    "nonNegativeInteger": {
      "type": "integer",
      "minimum": 0
    },
    "percentage": {
      "type": [
        "number",
        "null"
      ],
      "minimum": 0,
      "maximum": 100
    },
    "supportState": {
      "enum": [
        "supported",
        "partial",
        "gap",
        "unsupported",
        "not_applicable"
      ]
    },
    "scope": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "countryCodes",
        "jurisdictionIds",
        "levels",
        "recordFamilies",
        "validFrom",
        "validTo",
        "inventorySourceIds"
      ],
      "properties": {
        "countryCodes": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "enum": [
              "CA",
              "US"
            ]
          }
        },
        "jurisdictionIds": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        },
        "levels": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        },
        "recordFamilies": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "enum": [
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
            ]
          }
        },
        "validFrom": {
          "type": "string",
          "format": "date-time"
        },
        "validTo": {
          "type": "string",
          "format": "date-time"
        },
        "inventorySourceIds": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        }
      }
    },
    "jurisdictionCoverage": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "jurisdictionId",
        "countryCode",
        "level",
        "supportState",
        "gapIds"
      ],
      "properties": {
        "jurisdictionId": {
          "$ref": "#/$defs/id"
        },
        "countryCode": {
          "enum": [
            "CA",
            "US"
          ]
        },
        "level": {
          "$ref": "#/$defs/id"
        },
        "supportState": {
          "$ref": "#/$defs/supportState"
        },
        "gapIds": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        }
      }
    },
    "source": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "sourceId",
        "sourceClass",
        "publisherAuthority",
        "connectorOwner",
        "dataStewardOwner",
        "termsUrl",
        "licence",
        "attribution",
        "retentionAllowed",
        "redistributionAllowed",
        "approvedFreshnessHours",
        "lastCheckedAt",
        "availability"
      ],
      "properties": {
        "sourceId": {
          "$ref": "#/$defs/id"
        },
        "sourceClass": {
          "enum": [
            "legal_authority",
            "official_roster",
            "official_page",
            "secondary_gap_only"
          ]
        },
        "publisherAuthority": {
          "type": "string",
          "minLength": 1
        },
        "connectorOwner": {
          "type": "string",
          "minLength": 1
        },
        "dataStewardOwner": {
          "type": "string",
          "minLength": 1
        },
        "termsUrl": {
          "type": "string",
          "format": "uri"
        },
        "licence": {
          "type": "string",
          "minLength": 1
        },
        "attribution": {
          "type": "string",
          "minLength": 1
        },
        "retentionAllowed": {
          "type": "boolean"
        },
        "redistributionAllowed": {
          "type": "boolean"
        },
        "approvedFreshnessHours": {
          "type": "integer",
          "minimum": 1
        },
        "lastCheckedAt": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "availability": {
          "enum": [
            "available",
            "stale",
            "missing",
            "retracted",
            "unavailable"
          ]
        }
      }
    },
    "entityCounts": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "jurisdiction",
        "district",
        "publicBody",
        "office",
        "person",
        "officeTerm",
        "election",
        "candidacy",
        "profile",
        "materialClaim"
      ],
      "properties": {
        "jurisdiction": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "district": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "publicBody": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "office": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "person": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "officeTerm": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "election": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "candidacy": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "profile": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "materialClaim": {
          "$ref": "#/$defs/nonNegativeInteger"
        }
      }
    },
    "inventory": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "expected",
        "observed",
        "unexpectedDiscoveryCount"
      ],
      "properties": {
        "expected": {
          "$ref": "#/$defs/entityCounts"
        },
        "observed": {
          "$ref": "#/$defs/entityCounts"
        },
        "unexpectedDiscoveryCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        }
      }
    },
    "dimension": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "dimensionId",
        "numerator",
        "denominator",
        "percentage",
        "thresholdPercentage",
        "supportState",
        "gapIds"
      ],
      "properties": {
        "dimensionId": {
          "enum": [
            "structural_registry",
            "person_role_lifecycle",
            "profile_coverage",
            "material_claim_source_coverage",
            "public_gap_disclosure",
            "correction_supersession",
            "representative_match"
          ]
        },
        "numerator": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "denominator": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "percentage": {
          "$ref": "#/$defs/percentage"
        },
        "thresholdPercentage": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        },
        "supportState": {
          "$ref": "#/$defs/supportState"
        },
        "gapIds": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        }
      }
    },
    "freshness": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "denominator",
        "currentCount",
        "staleCount",
        "unknownCount",
        "unavailableCount",
        "currentPercentage"
      ],
      "properties": {
        "denominator": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "currentCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "staleCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "unknownCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "unavailableCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "currentPercentage": {
          "$ref": "#/$defs/percentage"
        }
      }
    },
    "connector": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "sourceId",
        "health",
        "lastScheduledAt",
        "lastCompletedAt",
        "scheduledRunCount",
        "successfulRunCount",
        "successPercentage",
        "failureCount",
        "gapIds"
      ],
      "properties": {
        "sourceId": {
          "$ref": "#/$defs/id"
        },
        "health": {
          "enum": [
            "healthy",
            "degraded",
            "stale",
            "failed",
            "unavailable"
          ]
        },
        "lastScheduledAt": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "lastCompletedAt": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "scheduledRunCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "successfulRunCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "successPercentage": {
          "$ref": "#/$defs/percentage"
        },
        "failureCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "gapIds": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        }
      }
    },
    "publicCondition": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "conditionId",
        "kind",
        "severity",
        "status",
        "affectedIds",
        "firstObservedAt",
        "lastObservedAt",
        "publicExplanation"
      ],
      "properties": {
        "conditionId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "missing",
            "stale",
            "failed",
            "conflicting",
            "quarantined",
            "retracted",
            "unavailable",
            "method_error"
          ]
        },
        "severity": {
          "enum": [
            "informational",
            "non_critical",
            "critical"
          ]
        },
        "status": {
          "enum": [
            "open",
            "corrected",
            "superseded",
            "retracted"
          ]
        },
        "affectedIds": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        },
        "firstObservedAt": {
          "type": "string",
          "format": "date-time"
        },
        "lastObservedAt": {
          "type": "string",
          "format": "date-time"
        },
        "publicExplanation": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "corrections": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "acceptedCount",
        "reflectedCount",
        "pastTargetOutstandingCount",
        "supersessionCoveragePercentage",
        "supersedesReportId"
      ],
      "properties": {
        "acceptedCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "reflectedCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "pastTargetOutstandingCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "supersessionCoveragePercentage": {
          "$ref": "#/$defs/percentage"
        },
        "supersedesReportId": {
          "anyOf": [
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
    "change": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "changeId",
        "changedAt",
        "kind",
        "summary"
      ],
      "properties": {
        "changeId": {
          "$ref": "#/$defs/id"
        },
        "changedAt": {
          "type": "string",
          "format": "date-time"
        },
        "kind": {
          "enum": [
            "initial",
            "scope",
            "denominator",
            "source",
            "method",
            "correction",
            "supersession",
            "retraction"
          ]
        },
        "summary": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "provenance": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "state",
        "approvedPublicArtifactOnly",
        "anchorReference"
      ],
      "properties": {
        "state": {
          "enum": [
            "not_anchored",
            "not_applicable",
            "verified_public_anchor"
          ]
        },
        "approvedPublicArtifactOnly": {
          "const": true
        },
        "anchorReference": {
          "type": [
            "string",
            "null"
          ],
          "minLength": 1
        }
      },
      "allOf": [
        {
          "if": {
            "type": "object",
            "properties": {
              "state": {
                "const": "verified_public_anchor"
              }
            },
            "required": [
              "state"
            ]
          },
          "then": {
            "type": "object",
            "properties": {
              "anchorReference": {
                "type": "string"
              }
            }
          },
          "else": {
            "type": "object",
            "properties": {
              "anchorReference": {
                "type": "null"
              }
            }
          }
        }
      ]
    },
    "releaseDecision": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "status",
        "publicApproval",
        "blockingGapIds"
      ],
      "properties": {
        "status": {
          "enum": [
            "not_ready",
            "eligible_for_review",
            "supported"
          ]
        },
        "publicApproval": {
          "type": "boolean"
        },
        "blockingGapIds": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        }
      },
      "allOf": [
        {
          "if": {
            "type": "object",
            "properties": {
              "status": {
                "const": "supported"
              }
            },
            "required": [
              "status"
            ]
          },
          "then": {
            "type": "object",
            "properties": {
              "publicApproval": {
                "const": true
              },
              "blockingGapIds": {
                "type": "array",
                "maxItems": 0
              }
            }
          }
        }
      ]
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
    "LOCATION_RESOLUTION_ENABLED": {
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
    "SOURCE_INGESTION_ENABLED": {
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
    "LOCATION_RESOLUTION_ENABLED",
    "PRIVILEGED_ACCESS_ENABLED",
    "NATIVE_PARTICIPATION_ENABLED",
    "CIVIC_SIGNAL_ENABLED",
    "REPRESENTATIVE_SIGNALS_ENABLED",
    "CATEGORY_RATINGS_ENABLED",
    "COMMUNITY_CONTEXT_ENABLED",
    "EVIDENCE_SUBMISSION_ENABLED",
    "SOURCE_INGESTION_ENABLED",
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

export const METHODOLOGY_INDICATOR_RESULT_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/methodology-indicator-result.schema.json",
  "title": "MethodologyIndicatorResultV1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "resultId",
    "dataMode",
    "target",
    "displayCategory",
    "method",
    "sourceSet",
    "coverage",
    "freshness",
    "result",
    "missingData",
    "confidence",
    "ai",
    "correction",
    "participationIncluded",
    "calculatedAt",
    "publicationState",
    "provenance"
  ],
  "properties": {
    "schemaVersion": {
      "const": "methodology-indicator-result.v1"
    },
    "resultId": {
      "$ref": "#/$defs/id"
    },
    "dataMode": {
      "enum": [
        "synthetic",
        "pilot",
        "production"
      ]
    },
    "target": {
      "$ref": "#/$defs/target"
    },
    "displayCategory": {
      "enum": [
        "policy_and_voting_alignment",
        "integrity_and_accountability",
        "financial_influence_and_disclosure",
        "constituent_engagement",
        "performance_and_effectiveness",
        "verification_and_source_coverage"
      ]
    },
    "method": {
      "$ref": "#/$defs/method"
    },
    "sourceSet": {
      "$ref": "#/$defs/sourceSet"
    },
    "coverage": {
      "$ref": "#/$defs/coverage"
    },
    "freshness": {
      "$ref": "#/$defs/freshness"
    },
    "result": {
      "$ref": "#/$defs/result"
    },
    "missingData": {
      "$ref": "#/$defs/missingData"
    },
    "confidence": {
      "$ref": "#/$defs/confidence"
    },
    "ai": {
      "$ref": "#/$defs/ai"
    },
    "correction": {
      "$ref": "#/$defs/correction"
    },
    "participationIncluded": {
      "const": false
    },
    "calculatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "publicationState": {
      "enum": [
        "test_only",
        "withheld",
        "approved"
      ]
    },
    "provenance": {
      "$ref": "#/$defs/provenance"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "dataMode": {
            "const": "synthetic"
          }
        },
        "required": [
          "dataMode"
        ]
      },
      "then": {
        "properties": {
          "method": {
            "type": "object",
            "properties": {
              "approvalState": {
                "const": "illustrative_not_approved"
              }
            }
          },
          "publicationState": {
            "const": "test_only"
          },
          "provenance": {
            "type": "object",
            "properties": {
              "state": {
                "const": "not_anchored"
              }
            }
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "missingData": {
            "type": "object",
            "properties": {
              "state": {
                "enum": [
                  "gap",
                  "conflict",
                  "stale",
                  "retracted",
                  "unavailable"
                ]
              }
            },
            "required": [
              "state"
            ]
          }
        },
        "required": [
          "missingData"
        ]
      },
      "then": {
        "properties": {
          "result": {
            "type": "object",
            "properties": {
              "status": {
                "const": "unavailable"
              },
              "value": {
                "type": "null"
              }
            }
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "result": {
            "type": "object",
            "properties": {
              "status": {
                "const": "available"
              }
            },
            "required": [
              "status"
            ]
          }
        },
        "required": [
          "result"
        ]
      },
      "then": {
        "properties": {
          "coverage": {
            "type": "object",
            "properties": {
              "state": {
                "const": "supported"
              }
            }
          },
          "missingData": {
            "type": "object",
            "properties": {
              "state": {
                "const": "complete"
              },
              "missingInputCount": {
                "const": 0
              }
            }
          },
          "result": {
            "type": "object",
            "properties": {
              "value": {
                "type": "number"
              }
            }
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "correction": {
            "type": "object",
            "properties": {
              "state": {
                "enum": [
                  "superseded",
                  "retracted"
                ]
              }
            },
            "required": [
              "state"
            ]
          }
        },
        "required": [
          "correction"
        ]
      },
      "then": {
        "properties": {
          "result": {
            "type": "object",
            "properties": {
              "status": {
                "const": "unavailable"
              },
              "value": {
                "type": "null"
              }
            }
          },
          "publicationState": {
            "enum": [
              "test_only",
              "withheld"
            ]
          }
        }
      }
    }
  ],
  "$defs": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$"
    },
    "sha256": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    },
    "nonNegativeInteger": {
      "type": "integer",
      "minimum": 0
    },
    "percentage": {
      "type": [
        "number",
        "null"
      ],
      "minimum": 0,
      "maximum": 100
    },
    "target": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "targetId"
      ],
      "properties": {
        "kind": {
          "enum": [
            "office_term",
            "candidacy"
          ]
        },
        "targetId": {
          "$ref": "#/$defs/id"
        }
      }
    },
    "method": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "methodId",
        "version",
        "specificationSha256",
        "codeRevision",
        "approvalState"
      ],
      "properties": {
        "methodId": {
          "$ref": "#/$defs/id"
        },
        "version": {
          "$ref": "#/$defs/id"
        },
        "specificationSha256": {
          "$ref": "#/$defs/sha256"
        },
        "codeRevision": {
          "$ref": "#/$defs/id"
        },
        "approvalState": {
          "enum": [
            "illustrative_not_approved",
            "approved"
          ]
        }
      }
    },
    "sourceSet": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "sourceIds",
        "recordVersionIds",
        "digest",
        "inputCutoffAt"
      ],
      "properties": {
        "sourceIds": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        },
        "recordVersionIds": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        },
        "digest": {
          "$ref": "#/$defs/sha256"
        },
        "inputCutoffAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    "coverage": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "numerator",
        "denominator",
        "percentage",
        "state",
        "gapIds"
      ],
      "properties": {
        "numerator": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "denominator": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "percentage": {
          "$ref": "#/$defs/percentage"
        },
        "state": {
          "enum": [
            "supported",
            "partial",
            "gap",
            "unsupported",
            "not_applicable"
          ]
        },
        "gapIds": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        }
      }
    },
    "freshness": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "state",
        "evaluatedAt",
        "thresholdHours",
        "oldestInputAt"
      ],
      "properties": {
        "state": {
          "enum": [
            "current",
            "stale",
            "unknown",
            "unavailable"
          ]
        },
        "evaluatedAt": {
          "type": "string",
          "format": "date-time"
        },
        "thresholdHours": {
          "type": "integer",
          "minimum": 1
        },
        "oldestInputAt": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        }
      }
    },
    "calculationInput": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "name",
        "value"
      ],
      "properties": {
        "name": {
          "$ref": "#/$defs/id"
        },
        "value": {
          "type": "number"
        }
      }
    },
    "result": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "status",
        "value",
        "unit",
        "calculationRule",
        "calculationInputs",
        "explanation"
      ],
      "properties": {
        "status": {
          "enum": [
            "available",
            "unavailable"
          ]
        },
        "value": {
          "type": [
            "number",
            "null"
          ]
        },
        "unit": {
          "enum": [
            "percent",
            "ratio",
            "count",
            "boolean",
            "not_applicable"
          ]
        },
        "calculationRule": {
          "type": "string",
          "minLength": 1
        },
        "calculationInputs": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/calculationInput"
          }
        },
        "explanation": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "missingData": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "state",
        "missingInputCount",
        "treatment",
        "publicExplanation"
      ],
      "properties": {
        "state": {
          "enum": [
            "complete",
            "gap",
            "conflict",
            "stale",
            "retracted",
            "unavailable"
          ]
        },
        "missingInputCount": {
          "$ref": "#/$defs/nonNegativeInteger"
        },
        "treatment": {
          "const": "no_adverse_inference"
        },
        "publicExplanation": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "confidence": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "status",
        "value",
        "rationale"
      ],
      "properties": {
        "status": {
          "enum": [
            "not_assessed",
            "insufficient",
            "low",
            "moderate",
            "high"
          ]
        },
        "value": {
          "type": [
            "number",
            "null"
          ],
          "minimum": 0,
          "maximum": 1
        },
        "rationale": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "ai": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "role",
        "outputPublication",
        "humanReviewState"
      ],
      "properties": {
        "role": {
          "enum": [
            "none",
            "extraction_assist",
            "classification_assist",
            "comparison_assist"
          ]
        },
        "outputPublication": {
          "const": false
        },
        "humanReviewState": {
          "enum": [
            "not_required",
            "required",
            "completed"
          ]
        }
      }
    },
    "correction": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "state",
        "supersedesResultId",
        "affectedByRecordVersionIds",
        "explanation"
      ],
      "properties": {
        "state": {
          "enum": [
            "current",
            "disputed",
            "under_appeal",
            "corrected",
            "superseded",
            "retracted"
          ]
        },
        "supersedesResultId": {
          "oneOf": [
            {
              "$ref": "#/$defs/id"
            },
            {
              "type": "null"
            }
          ]
        },
        "affectedByRecordVersionIds": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        },
        "explanation": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "provenance": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "state",
        "meaning",
        "manifestSha256"
      ],
      "properties": {
        "state": {
          "enum": [
            "not_anchored",
            "anchored"
          ]
        },
        "meaning": {
          "const": "commitment_not_truth"
        },
        "manifestSha256": {
          "oneOf": [
            {
              "$ref": "#/$defs/sha256"
            },
            {
              "type": "null"
            }
          ]
        }
      }
    }
  }
} as const;

export const METHODOLOGY_RELEASE_GATE_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/methodology-release-gate.schema.json",
  "title": "MethodologyReleaseGateV1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "policyVersion",
    "reportId",
    "generatedAt",
    "runtimeFlagEnabled",
    "approvedMethodologyVersion",
    "gates",
    "decision",
    "decisionReason"
  ],
  "properties": {
    "schemaVersion": {
      "const": "methodology-release-gate.v1"
    },
    "policyVersion": {
      "const": "light-mathematics-policy.v1"
    },
    "reportId": {
      "$ref": "#/$defs/id"
    },
    "generatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "runtimeFlagEnabled": {
      "type": "boolean",
      "default": false
    },
    "approvedMethodologyVersion": {
      "oneOf": [
        {
          "$ref": "#/$defs/id"
        },
        {
          "type": "null"
        }
      ]
    },
    "gates": {
      "$ref": "#/$defs/gates"
    },
    "decision": {
      "enum": [
        "disabled",
        "eligible_for_separate_enablement",
        "rejected"
      ]
    },
    "decisionReason": {
      "type": "string",
      "minLength": 1
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "runtimeFlagEnabled": {
            "const": false
          }
        },
        "required": [
          "runtimeFlagEnabled"
        ]
      },
      "then": {
        "properties": {
          "decision": {
            "enum": [
              "disabled",
              "rejected"
            ]
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "runtimeFlagEnabled": {
            "const": true
          }
        },
        "required": [
          "runtimeFlagEnabled"
        ]
      },
      "then": {
        "properties": {
          "approvedMethodologyVersion": {
            "$ref": "#/$defs/id"
          },
          "decision": {
            "const": "eligible_for_separate_enablement"
          },
          "gates": {
            "type": "object",
            "properties": {
              "publicMethodologyReview": {
                "$ref": "#/$defs/approvedGate"
              },
              "sourceAndFactorAudit": {
                "$ref": "#/$defs/approvedGate"
              },
              "biasAndDisparateImpactReview": {
                "$ref": "#/$defs/approvedGate"
              },
              "adversarialAndManipulationTesting": {
                "$ref": "#/$defs/approvedGate"
              },
              "stabilityAndSmallDataTesting": {
                "$ref": "#/$defs/approvedGate"
              },
              "correctionAndSupersessionTesting": {
                "$ref": "#/$defs/approvedGate"
              },
              "privacyAndNoSocialCreditReview": {
                "$ref": "#/$defs/approvedGate"
              },
              "legalReview": {
                "$ref": "#/$defs/approvedGate"
              },
              "representativeResponseAndAppealBehavior": {
                "$ref": "#/$defs/approvedGate"
              },
              "publicConsultation": {
                "$ref": "#/$defs/approvedGate"
              },
              "reservedGovernanceApproval": {
                "$ref": "#/$defs/approvedGate"
              }
            }
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "decision": {
            "const": "eligible_for_separate_enablement"
          }
        },
        "required": [
          "decision"
        ]
      },
      "then": {
        "properties": {
          "runtimeFlagEnabled": {
            "const": true
          }
        }
      }
    }
  ],
  "$defs": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$"
    },
    "gate": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "status",
        "evidenceReferences",
        "decidedAt",
        "publicReason"
      ],
      "properties": {
        "status": {
          "enum": [
            "pending",
            "approved",
            "rejected"
          ]
        },
        "evidenceReferences": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "type": "string",
            "format": "uri"
          }
        },
        "decidedAt": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "publicReason": {
          "type": "string",
          "minLength": 1
        }
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "status": {
                "const": "pending"
              }
            },
            "required": [
              "status"
            ]
          },
          "then": {
            "properties": {
              "evidenceReferences": {
                "type": "array",
                "maxItems": 0
              },
              "decidedAt": {
                "type": "null"
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "status": {
                "enum": [
                  "approved",
                  "rejected"
                ]
              }
            },
            "required": [
              "status"
            ]
          },
          "then": {
            "properties": {
              "evidenceReferences": {
                "type": "array",
                "minItems": 1
              },
              "decidedAt": {
                "type": "string",
                "format": "date-time"
              }
            }
          }
        }
      ]
    },
    "approvedGate": {
      "allOf": [
        {
          "$ref": "#/$defs/gate"
        },
        {
          "type": "object",
          "properties": {
            "status": {
              "const": "approved"
            }
          }
        }
      ]
    },
    "gates": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "publicMethodologyReview",
        "sourceAndFactorAudit",
        "biasAndDisparateImpactReview",
        "adversarialAndManipulationTesting",
        "stabilityAndSmallDataTesting",
        "correctionAndSupersessionTesting",
        "privacyAndNoSocialCreditReview",
        "legalReview",
        "representativeResponseAndAppealBehavior",
        "publicConsultation",
        "reservedGovernanceApproval"
      ],
      "properties": {
        "publicMethodologyReview": {
          "$ref": "#/$defs/gate"
        },
        "sourceAndFactorAudit": {
          "$ref": "#/$defs/gate"
        },
        "biasAndDisparateImpactReview": {
          "$ref": "#/$defs/gate"
        },
        "adversarialAndManipulationTesting": {
          "$ref": "#/$defs/gate"
        },
        "stabilityAndSmallDataTesting": {
          "$ref": "#/$defs/gate"
        },
        "correctionAndSupersessionTesting": {
          "$ref": "#/$defs/gate"
        },
        "privacyAndNoSocialCreditReview": {
          "$ref": "#/$defs/gate"
        },
        "legalReview": {
          "$ref": "#/$defs/gate"
        },
        "representativeResponseAndAppealBehavior": {
          "$ref": "#/$defs/gate"
        },
        "publicConsultation": {
          "$ref": "#/$defs/gate"
        },
        "reservedGovernanceApproval": {
          "$ref": "#/$defs/gate"
        }
      }
    }
  }
} as const;

export const MOBILE_COMPATIBILITY_STATUS_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/v1/mobile-compatibility-status.schema.json",
  "title": "MobileCompatibilityStatus",
  "description": "Versioned compatibility policy for installed native iOS and Android clients.",
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
          "enum": [
            "foundation",
            "development",
            "staging",
            "pilot",
            "production",
            "blocked"
          ]
        },
        "minimumAppVersion": {
          "type": "string",
          "pattern": "^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)$"
        },
        "minimumBuildNumber": {
          "type": "integer",
          "minimum": 1,
          "maximum": 2100000000
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

export const PUBLIC_ROLE_PROFILE_LIST_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/public-role-profile-list.schema.json",
  "title": "PublicRoleProfileList",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "dataMode",
    "generatedAt",
    "filters",
    "items",
    "page"
  ],
  "properties": {
    "schemaVersion": {
      "const": "public-role-profile-list.v1"
    },
    "dataMode": {
      "const": "synthetic"
    },
    "generatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "filters": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "countryCode",
        "contextKind"
      ],
      "properties": {
        "countryCode": {
          "oneOf": [
            {
              "enum": [
                "CA",
                "US"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "contextKind": {
          "oneOf": [
            {
              "enum": [
                "office_term",
                "candidacy"
              ]
            },
            {
              "type": "null"
            }
          ]
        }
      }
    },
    "items": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/profileSummary"
      }
    },
    "page": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "limit",
        "nextCursor"
      ],
      "properties": {
        "limit": {
          "const": 50
        },
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
    "profileSummary": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "profileId",
        "personId",
        "displayName",
        "countryCode",
        "governmentLevel",
        "officeTitle",
        "districtLabel",
        "roleStatus",
        "context",
        "availability",
        "recordVersion",
        "updatedAt"
      ],
      "properties": {
        "profileId": {
          "$ref": "#/$defs/id"
        },
        "personId": {
          "$ref": "#/$defs/id"
        },
        "displayName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "countryCode": {
          "enum": [
            "CA",
            "US"
          ]
        },
        "governmentLevel": {
          "enum": [
            "federal",
            "provincial",
            "territorial",
            "state",
            "municipal",
            "local",
            "special"
          ]
        },
        "officeTitle": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "districtLabel": {
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
        "roleStatus": {
          "enum": [
            "current",
            "former",
            "acting",
            "appointed",
            "elected",
            "declared",
            "withdrawn",
            "disqualified",
            "historical"
          ]
        },
        "context": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "kind",
            "officeTermId",
            "candidacyId"
          ],
          "properties": {
            "kind": {
              "enum": [
                "office_term",
                "candidacy"
              ]
            },
            "officeTermId": {
              "oneOf": [
                {
                  "$ref": "#/$defs/id"
                },
                {
                  "type": "null"
                }
              ]
            },
            "candidacyId": {
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
        "availability": {
          "enum": [
            "available",
            "not_available",
            "unsupported",
            "stale",
            "coverage_gap"
          ]
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
} as const;

export const PUBLIC_ROLE_PROFILE_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/public-role-profile.schema.json",
  "title": "PublicRoleProfile",
  "description": "Allowlisted, source-backed public profile for one person in one office-term or candidacy context.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "dataMode",
    "profileId",
    "recordVersion",
    "updatedAt",
    "etag",
    "publication",
    "summary",
    "person",
    "office",
    "district",
    "officeTerm",
    "election",
    "candidacy",
    "officialContactRoutes",
    "claims",
    "sources",
    "coverage",
    "responses",
    "disputes",
    "corrections",
    "appeals",
    "method",
    "provenance",
    "externalIdentityReferences",
    "timelinePath"
  ],
  "properties": {
    "schemaVersion": {
      "const": "public-role-profile.v1"
    },
    "dataMode": {
      "const": "synthetic"
    },
    "profileId": {
      "$ref": "#/$defs/id"
    },
    "recordVersion": {
      "type": "integer",
      "minimum": 1
    },
    "updatedAt": {
      "$ref": "#/$defs/timestamp"
    },
    "etag": {
      "type": "string",
      "pattern": "^W/\"[a-zA-Z0-9._:-]+\"$"
    },
    "publication": {
      "$ref": "#/$defs/publication"
    },
    "summary": {
      "$ref": "#/$defs/profileSummary"
    },
    "person": {
      "$ref": "#/$defs/person"
    },
    "office": {
      "$ref": "#/$defs/office"
    },
    "district": {
      "oneOf": [
        {
          "$ref": "#/$defs/district"
        },
        {
          "type": "null"
        }
      ]
    },
    "officeTerm": {
      "oneOf": [
        {
          "$ref": "#/$defs/officeTerm"
        },
        {
          "type": "null"
        }
      ]
    },
    "election": {
      "oneOf": [
        {
          "$ref": "#/$defs/election"
        },
        {
          "type": "null"
        }
      ]
    },
    "candidacy": {
      "oneOf": [
        {
          "$ref": "#/$defs/candidacy"
        },
        {
          "type": "null"
        }
      ]
    },
    "officialContactRoutes": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/contactRoute"
      }
    },
    "claims": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/materialClaim"
      }
    },
    "sources": {
      "$ref": "#/$defs/sourceSection"
    },
    "coverage": {
      "$ref": "#/$defs/coverageSection"
    },
    "responses": {
      "$ref": "#/$defs/responseSection"
    },
    "disputes": {
      "$ref": "#/$defs/disputeSection"
    },
    "corrections": {
      "$ref": "#/$defs/correctionSection"
    },
    "appeals": {
      "$ref": "#/$defs/appealSection"
    },
    "method": {
      "$ref": "#/$defs/methodMetadata"
    },
    "provenance": {
      "oneOf": [
        {
          "$ref": "#/$defs/provenanceMetadata"
        },
        {
          "type": "null"
        }
      ]
    },
    "externalIdentityReferences": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/externalIdentityReference"
      }
    },
    "timelinePath": {
      "type": "string",
      "pattern": "^/api/v1/profiles/[^/]+/timeline$"
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
    "availabilityState": {
      "enum": [
        "available",
        "not_available",
        "unsupported",
        "stale",
        "coverage_gap"
      ]
    },
    "freshnessState": {
      "enum": [
        "current",
        "stale",
        "not_available",
        "unsupported",
        "coverage_gap"
      ]
    },
    "publication": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "state",
        "method",
        "decisionId",
        "decidedAt"
      ],
      "properties": {
        "state": {
          "const": "published"
        },
        "method": {
          "const": "human_review"
        },
        "decisionId": {
          "$ref": "#/$defs/id"
        },
        "decidedAt": {
          "$ref": "#/$defs/timestamp"
        }
      }
    },
    "profileContext": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "officeTermId",
        "candidacyId"
      ],
      "properties": {
        "kind": {
          "enum": [
            "office_term",
            "candidacy"
          ]
        },
        "officeTermId": {
          "oneOf": [
            {
              "$ref": "#/$defs/id"
            },
            {
              "type": "null"
            }
          ]
        },
        "candidacyId": {
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
    "profileSummary": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "profileId",
        "personId",
        "displayName",
        "countryCode",
        "governmentLevel",
        "officeTitle",
        "districtLabel",
        "roleStatus",
        "context",
        "availability",
        "recordVersion",
        "updatedAt"
      ],
      "properties": {
        "profileId": {
          "$ref": "#/$defs/id"
        },
        "personId": {
          "$ref": "#/$defs/id"
        },
        "displayName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "countryCode": {
          "$ref": "#/$defs/countryCode"
        },
        "governmentLevel": {
          "enum": [
            "federal",
            "provincial",
            "territorial",
            "state",
            "municipal",
            "local",
            "special"
          ]
        },
        "officeTitle": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "districtLabel": {
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
        "roleStatus": {
          "enum": [
            "current",
            "former",
            "acting",
            "appointed",
            "elected",
            "declared",
            "withdrawn",
            "disqualified",
            "historical"
          ]
        },
        "context": {
          "$ref": "#/$defs/profileContext"
        },
        "availability": {
          "$ref": "#/$defs/availabilityState"
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        },
        "updatedAt": {
          "$ref": "#/$defs/timestamp"
        }
      }
    },
    "profileSummaryCollection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "dataMode",
        "generatedAt",
        "filters",
        "items",
        "page"
      ],
      "properties": {
        "schemaVersion": {
          "const": "public-role-profile-list.v1"
        },
        "dataMode": {
          "const": "synthetic"
        },
        "generatedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "filters": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "countryCode",
            "contextKind"
          ],
          "properties": {
            "countryCode": {
              "oneOf": [
                {
                  "$ref": "#/$defs/countryCode"
                },
                {
                  "type": "null"
                }
              ]
            },
            "contextKind": {
              "oneOf": [
                {
                  "enum": [
                    "office_term",
                    "candidacy"
                  ]
                },
                {
                  "type": "null"
                }
              ]
            }
          }
        },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/profileSummary"
          }
        },
        "page": {
          "$ref": "#/$defs/page"
        }
      }
    },
    "person": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "personId",
        "displayName",
        "officialIdentifiers"
      ],
      "properties": {
        "personId": {
          "$ref": "#/$defs/id"
        },
        "displayName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "officialIdentifiers": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "identifierId",
              "issuer",
              "value",
              "sourceIds",
              "freshness"
            ],
            "properties": {
              "identifierId": {
                "$ref": "#/$defs/id"
              },
              "issuer": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              },
              "value": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              },
              "sourceIds": {
                "$ref": "#/$defs/sourceIds"
              },
              "freshness": {
                "$ref": "#/$defs/freshnessState"
              }
            }
          }
        }
      }
    },
    "office": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "officeId",
        "title",
        "governmentLevel",
        "selectionMethod",
        "sourceIds",
        "freshness"
      ],
      "properties": {
        "officeId": {
          "$ref": "#/$defs/id"
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "governmentLevel": {
          "$ref": "#/$defs/profileSummary/properties/governmentLevel"
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
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        }
      }
    },
    "district": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "districtId",
        "label",
        "sourceIds",
        "freshness"
      ],
      "properties": {
        "districtId": {
          "$ref": "#/$defs/id"
        },
        "label": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        }
      }
    },
    "officeTerm": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "officeTermId",
        "state",
        "origin",
        "serviceCapacity",
        "plannedStart",
        "plannedEnd",
        "sourceIds",
        "freshness"
      ],
      "properties": {
        "officeTermId": {
          "$ref": "#/$defs/id"
        },
        "state": {
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
        "origin": {
          "enum": [
            "scheduled",
            "election_result",
            "appointment",
            "ex_officio"
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
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        }
      }
    },
    "election": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "electionId",
        "name",
        "kind",
        "state",
        "scheduledAt",
        "sourceIds",
        "freshness"
      ],
      "properties": {
        "electionId": {
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
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        }
      }
    },
    "candidacy": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "candidacyId",
        "state",
        "sourceIds",
        "freshness"
      ],
      "properties": {
        "candidacyId": {
          "$ref": "#/$defs/id"
        },
        "state": {
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
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        }
      }
    },
    "contactRoute": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "contactRouteId",
        "kind",
        "value",
        "sourceIds",
        "freshness"
      ],
      "properties": {
        "contactRouteId": {
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
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        }
      }
    },
    "sourceIds": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/id"
      }
    },
    "materialClaim": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "claimId",
        "category",
        "label",
        "value",
        "status",
        "sourceIds",
        "freshness",
        "observedAt",
        "conflictState",
        "evidence",
        "updatedAt"
      ],
      "properties": {
        "claimId": {
          "$ref": "#/$defs/id"
        },
        "category": {
          "enum": [
            "vote",
            "attendance",
            "committee_work",
            "expense",
            "disclosure",
            "public_statement",
            "promise_position",
            "documented_event",
            "outcome"
          ]
        },
        "label": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "value": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "status": {
          "enum": [
            "reviewed",
            "corrected",
            "disputed"
          ]
        },
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        },
        "observedAt": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "conflictState": {
          "enum": [
            "clear",
            "conflicting"
          ]
        },
        "evidence": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "supportingSourceIds",
            "challengingSourceIds",
            "note"
          ],
          "properties": {
            "supportingSourceIds": {
              "$ref": "#/$defs/sourceIds"
            },
            "challengingSourceIds": {
              "type": "array",
              "uniqueItems": true,
              "items": {
                "$ref": "#/$defs/id"
              }
            },
            "note": {
              "oneOf": [
                {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 500
                },
                {
                  "type": "null"
                }
              ]
            }
          }
        },
        "updatedAt": {
          "$ref": "#/$defs/timestamp"
        }
      }
    },
    "source": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "sourceId",
        "publisher",
        "sourceType",
        "originalUrl",
        "normalizedUrl",
        "retrievedAt",
        "contentSha256",
        "licenceNote",
        "termsUrl",
        "freshness",
        "fetchOutcome",
        "reviewedRecordVersionId"
      ],
      "properties": {
        "sourceId": {
          "$ref": "#/$defs/id"
        },
        "publisher": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "sourceType": {
          "enum": [
            "official_registry",
            "official_legislative_record",
            "official_election_record",
            "official_disclosure",
            "official_statement"
          ]
        },
        "originalUrl": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "normalizedUrl": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "retrievedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "contentSha256": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        },
        "licenceNote": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500
        },
        "termsUrl": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        },
        "fetchOutcome": {
          "enum": [
            "succeeded",
            "not_modified",
            "failed",
            "blocked",
            "too_large",
            "invalid_content",
            "redirect_rejected"
          ]
        },
        "reviewedRecordVersionId": {
          "$ref": "#/$defs/id"
        }
      }
    },
    "sourceSection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "profileId",
        "recordVersion",
        "updatedAt",
        "items"
      ],
      "properties": {
        "schemaVersion": {
          "const": "public-role-profile-sources.v1"
        },
        "profileId": {
          "$ref": "#/$defs/id"
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        },
        "updatedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "items": {
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/$defs/source"
          }
        }
      }
    },
    "coverageItem": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "category",
        "state",
        "explanation",
        "lastReviewedAt",
        "sourceIds"
      ],
      "properties": {
        "category": {
          "enum": [
            "identity",
            "office_context",
            "contact",
            "votes",
            "attendance",
            "committee_work",
            "expenses",
            "disclosures",
            "public_statements",
            "promises_positions",
            "events_outcomes"
          ]
        },
        "state": {
          "$ref": "#/$defs/availabilityState"
        },
        "explanation": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500
        },
        "lastReviewedAt": {
          "oneOf": [
            {
              "$ref": "#/$defs/timestamp"
            },
            {
              "type": "null"
            }
          ]
        },
        "sourceIds": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        }
      }
    },
    "sourceConflict": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "conflictId",
        "field",
        "state",
        "sourceIds",
        "explanation"
      ],
      "properties": {
        "conflictId": {
          "$ref": "#/$defs/id"
        },
        "field": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "state": {
          "enum": [
            "open",
            "resolved",
            "quarantined"
          ]
        },
        "sourceIds": {
          "type": "array",
          "minItems": 2,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        },
        "explanation": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500
        }
      }
    },
    "coverageSection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "profileId",
        "recordVersion",
        "updatedAt",
        "methodVersion",
        "missingDataMeaning",
        "items",
        "conflicts"
      ],
      "properties": {
        "schemaVersion": {
          "const": "public-role-profile-coverage.v1"
        },
        "profileId": {
          "$ref": "#/$defs/id"
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        },
        "updatedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "methodVersion": {
          "$ref": "#/$defs/id"
        },
        "missingDataMeaning": {
          "const": "coverage_gap_not_misconduct"
        },
        "items": {
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/$defs/coverageItem"
          }
        },
        "conflicts": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/sourceConflict"
          }
        }
      }
    },
    "responseItem": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "responseId",
        "publishedAt",
        "summary",
        "sourceIds"
      ],
      "properties": {
        "responseId": {
          "$ref": "#/$defs/id"
        },
        "publishedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "summary": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        }
      }
    },
    "responseSection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "profileId",
        "recordVersion",
        "updatedAt",
        "availability",
        "items"
      ],
      "properties": {
        "schemaVersion": {
          "const": "public-role-profile-responses.v1"
        },
        "profileId": {
          "$ref": "#/$defs/id"
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        },
        "updatedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "availability": {
          "$ref": "#/$defs/availabilityState"
        },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/responseItem"
          }
        }
      }
    },
    "disputeItem": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "disputeId",
        "state",
        "openedAt",
        "summary",
        "claimIds",
        "sourceIds"
      ],
      "properties": {
        "disputeId": {
          "$ref": "#/$defs/id"
        },
        "state": {
          "enum": [
            "open",
            "resolved",
            "withdrawn"
          ]
        },
        "openedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "summary": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "claimIds": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        },
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        }
      }
    },
    "disputeSection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "profileId",
        "recordVersion",
        "updatedAt",
        "availability",
        "items"
      ],
      "properties": {
        "schemaVersion": {
          "const": "public-role-profile-disputes.v1"
        },
        "profileId": {
          "$ref": "#/$defs/id"
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        },
        "updatedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "availability": {
          "$ref": "#/$defs/availabilityState"
        },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/disputeItem"
          }
        }
      }
    },
    "correctionItem": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "correctionId",
        "correctedAt",
        "summary",
        "supersedesClaimId",
        "replacementClaimId",
        "sourceIds"
      ],
      "properties": {
        "correctionId": {
          "$ref": "#/$defs/id"
        },
        "correctedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "summary": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "supersedesClaimId": {
          "$ref": "#/$defs/id"
        },
        "replacementClaimId": {
          "$ref": "#/$defs/id"
        },
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        }
      }
    },
    "correctionSection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "profileId",
        "recordVersion",
        "updatedAt",
        "availability",
        "items"
      ],
      "properties": {
        "schemaVersion": {
          "const": "public-role-profile-corrections.v1"
        },
        "profileId": {
          "$ref": "#/$defs/id"
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        },
        "updatedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "availability": {
          "$ref": "#/$defs/availabilityState"
        },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/correctionItem"
          }
        }
      }
    },
    "appealItem": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "appealId",
        "state",
        "openedAt",
        "summary",
        "disputeId",
        "sourceIds"
      ],
      "properties": {
        "appealId": {
          "$ref": "#/$defs/id"
        },
        "state": {
          "enum": [
            "open",
            "upheld",
            "denied",
            "withdrawn"
          ]
        },
        "openedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "summary": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "disputeId": {
          "$ref": "#/$defs/id"
        },
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        }
      }
    },
    "appealSection": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "profileId",
        "recordVersion",
        "updatedAt",
        "availability",
        "items"
      ],
      "properties": {
        "schemaVersion": {
          "const": "public-role-profile-appeals.v1"
        },
        "profileId": {
          "$ref": "#/$defs/id"
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        },
        "updatedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "availability": {
          "$ref": "#/$defs/availabilityState"
        },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/appealItem"
          }
        }
      }
    },
    "methodMetadata": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "profileMethodVersion",
        "coverageMethodVersion",
        "compositeScoreIncluded",
        "signalAggregateIncluded"
      ],
      "properties": {
        "profileMethodVersion": {
          "$ref": "#/$defs/id"
        },
        "coverageMethodVersion": {
          "$ref": "#/$defs/id"
        },
        "compositeScoreIncluded": {
          "const": false
        },
        "signalAggregateIncluded": {
          "const": false
        }
      }
    },
    "provenanceMetadata": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "state",
        "network",
        "anchorId",
        "truthDisclaimer"
      ],
      "properties": {
        "state": {
          "enum": [
            "not_anchored",
            "pending",
            "confirmed_unverified",
            "verified",
            "verification_failed",
            "orphaned",
            "superseded"
          ]
        },
        "network": {
          "enum": [
            "VRSCTEST",
            "VRSC"
          ]
        },
        "anchorId": {
          "oneOf": [
            {
              "$ref": "#/$defs/id"
            },
            {
              "type": "null"
            }
          ]
        },
        "truthDisclaimer": {
          "const": "provenance_commits_to_bytes_not_truth"
        }
      }
    },
    "externalIdentityReference": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "referenceId",
        "kind",
        "immutableReference",
        "canonicalAuthority",
        "grantsAuthorization",
        "sourceIds",
        "freshness"
      ],
      "properties": {
        "referenceId": {
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
        "canonicalAuthority": {
          "const": false
        },
        "grantsAuthorization": {
          "const": false
        },
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        }
      }
    },
    "timelineItem": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "timelineItemId",
        "kind",
        "occurredAt",
        "summary",
        "sourceIds",
        "freshness",
        "recordVersion"
      ],
      "properties": {
        "timelineItemId": {
          "$ref": "#/$defs/id"
        },
        "kind": {
          "enum": [
            "office_term_transition",
            "candidacy_transition",
            "source_refresh",
            "correction",
            "response",
            "dispute",
            "appeal"
          ]
        },
        "occurredAt": {
          "$ref": "#/$defs/timestamp"
        },
        "summary": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "sourceIds": {
          "$ref": "#/$defs/sourceIds"
        },
        "freshness": {
          "$ref": "#/$defs/freshnessState"
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        }
      }
    },
    "profileTimeline": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "dataMode",
        "profileId",
        "recordVersion",
        "updatedAt",
        "filters",
        "items",
        "page"
      ],
      "properties": {
        "schemaVersion": {
          "const": "public-role-profile-timeline.v1"
        },
        "dataMode": {
          "const": "synthetic"
        },
        "profileId": {
          "$ref": "#/$defs/id"
        },
        "recordVersion": {
          "type": "integer",
          "minimum": 1
        },
        "updatedAt": {
          "$ref": "#/$defs/timestamp"
        },
        "filters": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "kind"
          ],
          "properties": {
            "kind": {
              "oneOf": [
                {
                  "$ref": "#/$defs/timelineItem/properties/kind"
                },
                {
                  "type": "null"
                }
              ]
            }
          }
        },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/timelineItem"
          }
        },
        "page": {
          "$ref": "#/$defs/page"
        }
      }
    },
    "page": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "limit",
        "nextCursor"
      ],
      "properties": {
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 50
        },
        "nextCursor": {
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
    }
  }
} as const;

export const PUBLIC_ROLE_PROFILE_TIMELINE_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/public-role-profile-timeline.schema.json",
  "title": "PublicRoleProfileTimeline",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "dataMode",
    "profileId",
    "recordVersion",
    "updatedAt",
    "filters",
    "items",
    "page"
  ],
  "properties": {
    "schemaVersion": {
      "const": "public-role-profile-timeline.v1"
    },
    "dataMode": {
      "const": "synthetic"
    },
    "profileId": {
      "$ref": "#/$defs/id"
    },
    "recordVersion": {
      "type": "integer",
      "minimum": 1
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "filters": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind"
      ],
      "properties": {
        "kind": {
          "oneOf": [
            {
              "$ref": "#/$defs/timelineKind"
            },
            {
              "type": "null"
            }
          ]
        }
      }
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "timelineItemId",
          "kind",
          "occurredAt",
          "summary",
          "sourceIds",
          "freshness",
          "recordVersion"
        ],
        "properties": {
          "timelineItemId": {
            "$ref": "#/$defs/id"
          },
          "kind": {
            "$ref": "#/$defs/timelineKind"
          },
          "occurredAt": {
            "type": "string",
            "format": "date-time"
          },
          "summary": {
            "type": "string",
            "minLength": 1,
            "maxLength": 1000
          },
          "sourceIds": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": {
              "$ref": "#/$defs/id"
            }
          },
          "freshness": {
            "enum": [
              "current",
              "stale",
              "not_available",
              "unsupported",
              "coverage_gap"
            ]
          },
          "recordVersion": {
            "type": "integer",
            "minimum": 1
          }
        }
      }
    },
    "page": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "limit",
        "nextCursor"
      ],
      "properties": {
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 50
        },
        "nextCursor": {
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
    }
  },
  "$defs": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "timelineKind": {
      "enum": [
        "office_term_transition",
        "candidacy_transition",
        "source_refresh",
        "correction",
        "response",
        "dispute",
        "appeal"
      ]
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

export const REPRESENTATION_AMBIGUITY_SELECTION_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.ratemyrepresentatives.app/v1/representation-ambiguity-selection.schema.json",
  "title": "RepresentationAmbiguitySelection",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "asOf",
    "selectionToken",
    "optionId"
  ],
  "properties": {
    "schemaVersion": {
      "const": "representation-ambiguity-selection.v1"
    },
    "asOf": {
      "type": "string",
      "format": "date-time"
    },
    "selectionToken": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "optionId": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    }
  }
} as const;

export const REPRESENTATION_CAPABILITIES_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.ratemyrepresentatives.app/v1/representation-capabilities.schema.json",
  "title": "RepresentationCapabilities",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "dataMode",
    "items"
  ],
  "properties": {
    "schemaVersion": {
      "const": "representation-capabilities.v1"
    },
    "dataMode": {
      "const": "synthetic"
    },
    "items": {
      "type": "array",
      "minItems": 2,
      "maxItems": 2,
      "items": {
        "$ref": "#/$defs/capability"
      }
    }
  },
  "$defs": {
    "countryCode": {
      "enum": [
        "CA",
        "US"
      ]
    },
    "scope": {
      "enum": [
        "local",
        "regional",
        "province_state",
        "federal",
        "special"
      ]
    },
    "metadata": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "geometry",
        "source"
      ],
      "properties": {
        "geometry": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "effectiveFrom",
            "license",
            "sha256",
            "version"
          ],
          "properties": {
            "effectiveFrom": {
              "type": "string",
              "format": "date-time"
            },
            "license": {
              "type": "string",
              "minLength": 1,
              "maxLength": 256
            },
            "sha256": {
              "type": "string",
              "pattern": "^[a-f0-9]{64}$"
            },
            "version": {
              "type": "string",
              "minLength": 1,
              "maxLength": 128
            }
          }
        },
        "source": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "license",
            "observedAt",
            "providerId",
            "retention",
            "termsUrl",
            "version"
          ],
          "properties": {
            "license": {
              "type": "string",
              "minLength": 1,
              "maxLength": 256
            },
            "observedAt": {
              "type": "string",
              "format": "date-time"
            },
            "providerId": {
              "type": "string",
              "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
            },
            "retention": {
              "const": "none"
            },
            "termsUrl": {
              "oneOf": [
                {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^https://"
                },
                {
                  "type": "null"
                }
              ]
            },
            "version": {
              "type": "string",
              "minLength": 1,
              "maxLength": 128
            }
          }
        }
      }
    },
    "capability": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "schemaVersion",
        "coverage",
        "countryCode",
        "dataMode",
        "featureState",
        "input",
        "legalDeterminations",
        "provider",
        "supportedScopes"
      ],
      "properties": {
        "schemaVersion": {
          "const": "representation-capability.v1"
        },
        "coverage": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "state",
            "gapCodes"
          ],
          "properties": {
            "state": {
              "const": "partial"
            },
            "gapCodes": {
              "type": "array",
              "uniqueItems": true,
              "items": {
                "type": "string",
                "pattern": "^[A-Z][A-Z0-9_]{2,63}$"
              }
            }
          }
        },
        "countryCode": {
          "$ref": "#/$defs/countryCode"
        },
        "dataMode": {
          "const": "synthetic"
        },
        "featureState": {
          "enum": [
            "disabled",
            "operational"
          ]
        },
        "input": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "autocomplete",
            "kind",
            "label",
            "maxLength",
            "retention"
          ],
          "properties": {
            "autocomplete": {
              "enum": [
                "postal-code",
                "street-address"
              ]
            },
            "kind": {
              "enum": [
                "postal_code",
                "address"
              ]
            },
            "label": {
              "type": "string",
              "minLength": 1,
              "maxLength": 128
            },
            "maxLength": {
              "type": "integer",
              "minimum": 1,
              "maximum": 240
            },
            "retention": {
              "const": "request_only"
            }
          }
        },
        "legalDeterminations": {
          "const": "none"
        },
        "provider": {
          "$ref": "#/$defs/metadata"
        },
        "supportedScopes": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/scope"
          }
        }
      }
    }
  }
} as const;

export const REPRESENTATION_RESOLUTION_REQUEST_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.ratemyrepresentatives.app/v1/representation-resolution-request.schema.json",
  "title": "RepresentationResolutionRequest",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "asOf",
    "countryCode",
    "input"
  ],
  "properties": {
    "schemaVersion": {
      "const": "representation-resolution-request.v1"
    },
    "asOf": {
      "type": "string",
      "format": "date-time"
    },
    "countryCode": {
      "enum": [
        "CA",
        "US"
      ]
    },
    "input": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "value"
      ],
      "properties": {
        "kind": {
          "enum": [
            "postal_code",
            "address"
          ]
        },
        "value": {
          "type": "string",
          "minLength": 1,
          "maxLength": 240
        }
      }
    }
  },
  "allOf": [
    {
      "if": {
        "type": "object",
        "properties": {
          "countryCode": {
            "const": "CA"
          }
        }
      },
      "then": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "kind": {
                "const": "postal_code"
              },
              "value": {
                "type": "string",
                "maxLength": 7
              }
            }
          }
        }
      }
    },
    {
      "if": {
        "type": "object",
        "properties": {
          "countryCode": {
            "const": "US"
          }
        }
      },
      "then": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "kind": {
                "const": "address"
              }
            }
          }
        }
      }
    }
  ]
} as const;

export const REPRESENTATION_RESOLUTION_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.ratemyrepresentatives.app/v1/representation-resolution.schema.json",
  "title": "RepresentationResolution",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "resolutionId",
    "dataMode",
    "countryCode",
    "asOf",
    "state",
    "detailCode",
    "matches",
    "ambiguity",
    "provider",
    "inputDisposition",
    "legalDeterminations"
  ],
  "properties": {
    "schemaVersion": {
      "const": "representation-resolution.v1"
    },
    "resolutionId": {
      "$ref": "#/$defs/opaqueId"
    },
    "dataMode": {
      "const": "synthetic"
    },
    "countryCode": {
      "enum": [
        "CA",
        "US"
      ]
    },
    "asOf": {
      "type": "string",
      "format": "date-time"
    },
    "state": {
      "enum": [
        "resolved",
        "ambiguous",
        "unsupported",
        "conflicting",
        "stale",
        "provider_unavailable"
      ]
    },
    "detailCode": {
      "oneOf": [
        {
          "type": "string",
          "pattern": "^[A-Z][A-Z0-9_]{2,63}$"
        },
        {
          "type": "null"
        }
      ]
    },
    "matches": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/match"
      }
    },
    "ambiguity": {
      "oneOf": [
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "selectionToken",
            "expiresAt",
            "options"
          ],
          "properties": {
            "selectionToken": {
              "$ref": "#/$defs/opaqueId"
            },
            "expiresAt": {
              "type": "string",
              "format": "date-time"
            },
            "options": {
              "type": "array",
              "minItems": 2,
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": [
                  "candidateId",
                  "label"
                ],
                "properties": {
                  "candidateId": {
                    "$ref": "#/$defs/opaqueId"
                  },
                  "label": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 160
                  }
                }
              }
            }
          }
        },
        {
          "type": "null"
        }
      ]
    },
    "provider": {
      "$ref": "#/$defs/metadata"
    },
    "inputDisposition": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "disposedAt",
        "logged",
        "persisted",
        "queued",
        "sentToAi",
        "sentToVerus"
      ],
      "properties": {
        "disposedAt": {
          "type": "string",
          "format": "date-time"
        },
        "logged": {
          "const": false
        },
        "persisted": {
          "const": false
        },
        "queued": {
          "const": false
        },
        "sentToAi": {
          "const": false
        },
        "sentToVerus": {
          "const": false
        }
      }
    },
    "legalDeterminations": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "citizenship",
        "legalResidence",
        "voterEligibility"
      ],
      "properties": {
        "citizenship": {
          "const": "not_determined"
        },
        "legalResidence": {
          "const": "not_determined"
        },
        "voterEligibility": {
          "const": "not_determined"
        }
      }
    }
  },
  "$defs": {
    "opaqueId": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "identifier": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "issuer",
        "identifier"
      ],
      "properties": {
        "issuer": {
          "type": "string",
          "minLength": 1,
          "maxLength": 128
        },
        "identifier": {
          "type": "string",
          "minLength": 1,
          "maxLength": 128
        }
      }
    },
    "entity": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "applicationId",
        "authoritativeIdentifiers",
        "label"
      ],
      "properties": {
        "applicationId": {
          "$ref": "#/$defs/opaqueId"
        },
        "authoritativeIdentifiers": {
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/$defs/identifier"
          }
        },
        "label": {
          "type": "string",
          "minLength": 1,
          "maxLength": 160
        }
      }
    },
    "match": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "scope",
        "matchState",
        "jurisdiction",
        "district",
        "officeId",
        "officeTermId",
        "candidacyIds"
      ],
      "properties": {
        "scope": {
          "enum": [
            "local",
            "regional",
            "province_state",
            "federal",
            "special"
          ]
        },
        "matchState": {
          "enum": [
            "matched",
            "coverage_gap"
          ]
        },
        "jurisdiction": {
          "$ref": "#/$defs/entity"
        },
        "district": {
          "oneOf": [
            {
              "$ref": "#/$defs/entity"
            },
            {
              "type": "null"
            }
          ]
        },
        "officeId": {
          "oneOf": [
            {
              "$ref": "#/$defs/opaqueId"
            },
            {
              "type": "null"
            }
          ]
        },
        "officeTermId": {
          "oneOf": [
            {
              "$ref": "#/$defs/opaqueId"
            },
            {
              "type": "null"
            }
          ]
        },
        "candidacyIds": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/opaqueId"
          }
        }
      }
    },
    "metadata": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "geometry",
        "source"
      ],
      "properties": {
        "geometry": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "effectiveFrom",
            "license",
            "sha256",
            "version"
          ],
          "properties": {
            "effectiveFrom": {
              "type": "string",
              "format": "date-time"
            },
            "license": {
              "type": "string",
              "minLength": 1,
              "maxLength": 256
            },
            "sha256": {
              "type": "string",
              "pattern": "^[a-f0-9]{64}$"
            },
            "version": {
              "type": "string",
              "minLength": 1,
              "maxLength": 128
            }
          }
        },
        "source": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "license",
            "observedAt",
            "providerId",
            "retention",
            "termsUrl",
            "version"
          ],
          "properties": {
            "license": {
              "type": "string",
              "minLength": 1,
              "maxLength": 256
            },
            "observedAt": {
              "type": "string",
              "format": "date-time"
            },
            "providerId": {
              "$ref": "#/$defs/opaqueId"
            },
            "retention": {
              "const": "none"
            },
            "termsUrl": {
              "oneOf": [
                {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^https://"
                },
                {
                  "type": "null"
                }
              ]
            },
            "version": {
              "type": "string",
              "minLength": 1,
              "maxLength": 128
            }
          }
        }
      }
    }
  }
} as const;

export const SAVED_BROAD_JURISDICTION_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.ratemyrepresentatives.app/v1/saved-broad-jurisdiction.schema.json",
  "title": "SavedBroadJurisdiction",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "preferenceId",
    "countryCode",
    "jurisdictionId",
    "jurisdictionKind",
    "label",
    "createdAt",
    "updatedAt"
  ],
  "properties": {
    "schemaVersion": {
      "const": "saved-broad-jurisdiction.v1"
    },
    "preferenceId": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "countryCode": {
      "enum": [
        "CA",
        "US"
      ]
    },
    "jurisdictionId": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$"
    },
    "jurisdictionKind": {
      "enum": [
        "country",
        "province",
        "state",
        "territory"
      ]
    },
    "label": {
      "type": "string",
      "minLength": 1,
      "maxLength": 160
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
} as const;

export const SECURITY_DOMAIN_POLICY_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.checksandbalances.services/security-domain-policy.schema.json",
  "title": "Security domain policy v1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "dataMode",
    "defaultAccess",
    "domains",
    "access",
    "objectStorage",
    "backup",
    "signerIsolation",
    "noSocialCredit"
  ],
  "properties": {
    "schemaVersion": {
      "const": "security-domain-policy.v1"
    },
    "dataMode": {
      "const": "synthetic"
    },
    "defaultAccess": {
      "const": "deny"
    },
    "domains": {
      "type": "array",
      "minItems": 8,
      "maxItems": 8,
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/domain"
      }
    },
    "access": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "principal",
          "domain",
          "operations"
        ],
        "properties": {
          "principal": {
            "$ref": "#/$defs/principal"
          },
          "domain": {
            "$ref": "#/$defs/domain"
          },
          "operations": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": {
              "enum": [
                "read",
                "write",
                "transient_process",
                "public_serialize",
                "backup",
                "restore",
                "audit_review"
              ]
            }
          }
        }
      }
    },
    "objectStorage": {
      "type": "array",
      "minItems": 4,
      "maxItems": 4,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "bucket",
          "classification",
          "anonymousRead"
        ],
        "properties": {
          "bucket": {
            "enum": [
              "rmr-public",
              "rmr-public-manifests",
              "rmr-quarantine",
              "rmr-private-evidence"
            ]
          },
          "classification": {
            "enum": [
              "public",
              "restricted",
              "highly_restricted"
            ]
          },
          "anonymousRead": {
            "type": "boolean"
          }
        }
      }
    },
    "backup": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "encrypted",
        "restoreMustPreserveClassification",
        "productionToNonProductionAllowed"
      ],
      "properties": {
        "encrypted": {
          "const": true
        },
        "restoreMustPreserveClassification": {
          "const": true
        },
        "productionToNonProductionAllowed": {
          "const": false
        }
      }
    },
    "signerIsolation": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "publicApiHasCredentials",
        "nativeHasCredentials",
        "webHasCredentials",
        "coreWorkerHasCredentials",
        "verusRequiredForCore"
      ],
      "properties": {
        "publicApiHasCredentials": {
          "const": false
        },
        "nativeHasCredentials": {
          "const": false
        },
        "webHasCredentials": {
          "const": false
        },
        "coreWorkerHasCredentials": {
          "const": false
        },
        "verusRequiredForCore": {
          "const": false
        }
      }
    },
    "noSocialCredit": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "generalizedCitizenScoreAllowed",
        "identityActivityJoinAllowed",
        "politicalProfileAnalyticsAllowed"
      ],
      "properties": {
        "generalizedCitizenScoreAllowed": {
          "const": false
        },
        "identityActivityJoinAllowed": {
          "const": false
        },
        "politicalProfileAnalyticsAllowed": {
          "const": false
        }
      }
    }
  },
  "$defs": {
    "domain": {
      "enum": [
        "public_registry",
        "account_authentication",
        "location_resolver",
        "identity_attestation",
        "private_civic_activity",
        "moderation",
        "public_methodology_provenance",
        "verus_signing_rpc"
      ]
    },
    "principal": {
      "enum": [
        "public_reader",
        "native_client",
        "web_client",
        "public_api",
        "account_service",
        "location_service",
        "identity_service",
        "participation_service",
        "moderation_service",
        "publication_service",
        "core_worker",
        "source_worker",
        "signer_worker",
        "security_auditor",
        "backup_operator"
      ]
    }
  }
} as const;

export const SOURCE_CONNECTOR_CAPABILITY_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/source-connector-capability.schema.json",
  "title": "SourceConnectorCapabilityV1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "connectorId",
    "connectorVersion",
    "dataMode",
    "approval",
    "source",
    "access",
    "rights",
    "identity",
    "schedule",
    "pagination",
    "parser",
    "content",
    "behavior",
    "owner"
  ],
  "properties": {
    "schemaVersion": {
      "const": "source-connector-capability.v1"
    },
    "connectorId": {
      "$ref": "#/$defs/id"
    },
    "connectorVersion": {
      "$ref": "#/$defs/id"
    },
    "dataMode": {
      "enum": [
        "synthetic",
        "production"
      ]
    },
    "approval": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "state",
        "reviewReference",
        "reviewedAt"
      ],
      "properties": {
        "state": {
          "enum": [
            "synthetic_approved",
            "production_approved",
            "suspended"
          ]
        },
        "reviewReference": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "reviewedAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    "source": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "sourceId",
        "publisher",
        "authoritativeScope",
        "countries",
        "jurisdictionIds",
        "recordTypes"
      ],
      "properties": {
        "sourceId": {
          "$ref": "#/$defs/id"
        },
        "publisher": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "authoritativeScope": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "countries": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "enum": [
              "CA",
              "US"
            ]
          }
        },
        "jurisdictionIds": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/id"
          }
        },
        "recordTypes": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/recordType"
          }
        }
      }
    },
    "access": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "method",
        "authentication",
        "endpointOrigin",
        "rateLimitPerMinute",
        "obeyRobotsPolicy"
      ],
      "properties": {
        "method": {
          "enum": [
            "https_json",
            "https_csv"
          ]
        },
        "authentication": {
          "enum": [
            "none",
            "api_key",
            "oauth_client",
            "client_certificate"
          ]
        },
        "endpointOrigin": {
          "type": "string",
          "format": "uri",
          "pattern": "^https://"
        },
        "rateLimitPerMinute": {
          "type": "integer",
          "minimum": 1
        },
        "obeyRobotsPolicy": {
          "type": "boolean"
        }
      }
    },
    "rights": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "licenseName",
        "termsUrl",
        "attributionText",
        "retentionDays",
        "redistribution",
        "snapshotStorage"
      ],
      "properties": {
        "licenseName": {
          "type": "string",
          "minLength": 1
        },
        "termsUrl": {
          "type": "string",
          "format": "uri",
          "pattern": "^https://"
        },
        "attributionText": {
          "type": "string",
          "minLength": 1
        },
        "retentionDays": {
          "type": "integer",
          "minimum": 0
        },
        "redistribution": {
          "enum": [
            "metadata_only",
            "permitted_snapshots"
          ]
        },
        "snapshotStorage": {
          "enum": [
            "prohibited",
            "quarantine_only",
            "permitted"
          ]
        }
      }
    },
    "identity": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "externalIdentifierTypes",
        "effectiveDateSemantics"
      ],
      "properties": {
        "externalIdentifierTypes": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "effectiveDateSemantics": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "schedule": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "cadenceMinutes",
        "freshnessExpectedMinutes",
        "freshnessStaleMinutes"
      ],
      "properties": {
        "cadenceMinutes": {
          "type": "integer",
          "minimum": 1
        },
        "freshnessExpectedMinutes": {
          "type": "integer",
          "minimum": 1
        },
        "freshnessStaleMinutes": {
          "type": "integer",
          "minimum": 1
        }
      }
    },
    "pagination": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "style",
        "checkpointVersion"
      ],
      "properties": {
        "style": {
          "enum": [
            "none",
            "cursor",
            "page"
          ]
        },
        "checkpointVersion": {
          "$ref": "#/$defs/id"
        }
      }
    },
    "parser": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "parserVersion",
        "schemaVersion"
      ],
      "properties": {
        "parserVersion": {
          "$ref": "#/$defs/id"
        },
        "schemaVersion": {
          "$ref": "#/$defs/id"
        }
      }
    },
    "content": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "expectedContentTypes",
        "permittedContentEncodings",
        "maximumWireBytes",
        "maximumDecodedBytes",
        "maximumExpansionRatio",
        "timeoutMs",
        "maximumRedirects"
      ],
      "properties": {
        "expectedContentTypes": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "permittedContentEncodings": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "enum": [
              "identity",
              "gzip",
              "br"
            ]
          }
        },
        "maximumWireBytes": {
          "type": "integer",
          "minimum": 1
        },
        "maximumDecodedBytes": {
          "type": "integer",
          "minimum": 1
        },
        "maximumExpansionRatio": {
          "type": "number",
          "minimum": 1
        },
        "timeoutMs": {
          "type": "integer",
          "minimum": 1
        },
        "maximumRedirects": {
          "type": "integer",
          "minimum": 0
        }
      }
    },
    "behavior": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "conflicts",
        "deletions",
        "retractions",
        "outages"
      ],
      "properties": {
        "conflicts": {
          "const": "quarantine"
        },
        "deletions": {
          "const": "review"
        },
        "retractions": {
          "const": "review"
        },
        "outages": {
          "const": "retry_then_dead_letter"
        }
      }
    },
    "owner": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "team",
        "incidentRunbook"
      ],
      "properties": {
        "team": {
          "type": "string",
          "minLength": 1
        },
        "incidentRunbook": {
          "type": "string",
          "pattern": "^docs/runbooks/"
        }
      }
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "dataMode": {
            "const": "synthetic"
          }
        }
      },
      "then": {
        "properties": {
          "approval": {
            "type": "object",
            "properties": {
              "state": {
                "enum": [
                  "synthetic_approved",
                  "suspended"
                ]
              }
            }
          },
          "access": {
            "type": "object",
            "properties": {
              "endpointOrigin": {
                "type": "string",
                "pattern": "^https://[^/]+\\.invalid/?$"
              }
            }
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "dataMode": {
            "const": "production"
          }
        }
      },
      "then": {
        "properties": {
          "approval": {
            "type": "object",
            "properties": {
              "state": {
                "enum": [
                  "production_approved",
                  "suspended"
                ]
              }
            }
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "rights": {
            "type": "object",
            "properties": {
              "redistribution": {
                "const": "metadata_only"
              }
            }
          }
        }
      },
      "then": {
        "properties": {
          "rights": {
            "type": "object",
            "properties": {
              "snapshotStorage": {
                "const": "prohibited"
              }
            }
          }
        }
      }
    }
  ],
  "$defs": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$"
    },
    "recordType": {
      "enum": [
        "jurisdiction",
        "person",
        "office",
        "office_term",
        "candidacy",
        "election",
        "vote",
        "attendance",
        "committee",
        "expense",
        "disclosure",
        "statement",
        "promise_position",
        "event",
        "outcome",
        "correction"
      ]
    }
  }
} as const;

export const SOURCE_COVERAGE_SNAPSHOT_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schemas.ratemyrepresentatives.com/source-coverage-snapshot.schema.json",
  "title": "SourceCoverageSnapshotV1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "dataMode",
    "snapshotId",
    "generatedAt",
    "methodVersion",
    "codeRevision",
    "items",
    "missingDataMeaning",
    "provenanceState",
    "sha256"
  ],
  "properties": {
    "schemaVersion": {
      "const": "source-coverage-snapshot.v1"
    },
    "dataMode": {
      "const": "synthetic"
    },
    "snapshotId": {
      "$ref": "#/$defs/id"
    },
    "generatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "methodVersion": {
      "$ref": "#/$defs/id"
    },
    "codeRevision": {
      "$ref": "#/$defs/id"
    },
    "missingDataMeaning": {
      "const": "coverage_gap_not_misconduct"
    },
    "provenanceState": {
      "const": "not_anchored"
    },
    "sha256": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "countryCode",
          "jurisdictionId",
          "recordType",
          "sourceAvailability",
          "candidateCount",
          "pendingReviewCount",
          "conflictCount",
          "lastRetrievedAt"
        ],
        "properties": {
          "countryCode": {
            "enum": [
              "CA",
              "US"
            ]
          },
          "jurisdictionId": {
            "$ref": "#/$defs/id"
          },
          "recordType": {
            "type": "string",
            "minLength": 1
          },
          "sourceAvailability": {
            "enum": [
              "available",
              "stale",
              "missing",
              "retracted",
              "unavailable"
            ]
          },
          "candidateCount": {
            "type": "integer",
            "minimum": 0
          },
          "pendingReviewCount": {
            "type": "integer",
            "minimum": 0
          },
          "conflictCount": {
            "type": "integer",
            "minimum": 0
          },
          "lastRetrievedAt": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time"
          }
        }
      }
    }
  },
  "$defs": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,191}$"
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
