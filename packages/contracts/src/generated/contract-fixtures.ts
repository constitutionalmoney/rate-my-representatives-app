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
    "publicRegistry": "proposed",
    "civicSignal": "disabled",
    "representativeSignals": "disabled",
    "verus": "disabled",
    "provenanceWrites": "disabled"
  },
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

export const SYNTHETIC_JURISDICTIONS_PROPOSED = {
  "schemaVersion": "api-error.v1",
  "code": "FEATURE_DISABLED",
  "message": "This capability is not operational.",
  "correlationId": "synthetic-correlation-jurisdictions",
  "fieldErrors": [],
  "retryable": false,
  "retryAfterSeconds": null,
  "featureState": "proposed",
  "dependencyState": null
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
