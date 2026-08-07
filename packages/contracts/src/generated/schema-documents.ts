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
          "const": "proposed"
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
