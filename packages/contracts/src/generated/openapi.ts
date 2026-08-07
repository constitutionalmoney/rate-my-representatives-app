export interface paths {
    "/api/v1/account": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/appeals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/candidacies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/category-ratings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/civic-signal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/claims": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/community-context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/corrections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/coverage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/disputes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/elections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read the API contract-foundation status
         * @description Reports that the implemented contract slice can respond. This is not the database/dependency readiness family owned by issue #42.
         */
        get: operations["getApiHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health/mobile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read installed native-client compatibility policy
         * @description Reports the synthetic foundation minimum app builds and supported contract versions for native iOS and Android clients. It does not claim an app-store release.
         */
        get: operations["getMobileCompatibility"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/jurisdictions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read the proposed jurisdiction route state
         * @description The route is deliberately non-operational until issue #49 implements the nested jurisdiction registry. No jurisdiction records are returned.
         */
        get: operations["getJurisdictionAvailability"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/methodologies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/office-terms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/offices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/people": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/provenance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/representation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/representative-claims": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/representative-signals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/responses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/staff-delegations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/verus": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * ApiError
         * @description Privacy-safe v1 API error envelope that prevents account and authority enumeration.
         */
        "api-error.schema": {
            /** @enum {unknown} */
            code: "NOT_FOUND" | "METHOD_NOT_ALLOWED" | "FEATURE_DISABLED" | "VALIDATION_ERROR" | "CONFLICT" | "PRECONDITION_FAILED" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "MAINTENANCE";
            correlationId: string;
            /** @enum {unknown} */
            dependencyState: "ready" | "degraded" | "unavailable" | "disabled" | null;
            /** @enum {unknown} */
            featureState: "operational" | "testnet" | "proposed" | "disabled" | null;
            fieldErrors: {
                code: string;
                field: string;
            }[];
            message: string;
            retryable: boolean;
            retryAfterSeconds: number | null;
            /** @constant */
            schemaVersion: "api-error.v1";
        };
        ApiError: components["schemas"]["api-error.schema"];
        /**
         * CivicSignalBriefing
         * @description Proposed monitoring/briefing envelope. It contains no human judgment operation.
         */
        "civic-signal-briefing.schema": {
            briefingId: string;
            /** Format: date-time */
            generatedAt: string;
            /** @constant */
            kind: "civic_signal_briefing";
            /** @constant */
            schemaVersion: "civic-signal-briefing.v1";
            /** @constant */
            status: "proposed";
        };
        CivicSignalBriefing: components["schemas"]["civic-signal-briefing.schema"];
        /**
         * HealthStatus
         * @description Operational v1 contract-foundation health response; expanded dependency readiness belongs to issue #42.
         */
        "health-status.schema": {
            contract: {
                /** @constant */
                currentVersion: "v1";
                /** @constant */
                minimumSupportedVersion: "v1";
                supportedVersions: "v1"[];
            };
            featureStates: {
                /** @constant */
                civicSignal: "disabled";
                /** @constant */
                provenanceWrites: "disabled";
                /** @constant */
                publicRegistry: "proposed";
                /** @constant */
                representativeSignals: "disabled";
                /** @constant */
                verus: "disabled";
            };
            optionalDependencies: {
                /** @constant */
                verus: "disabled";
            };
            /** @constant */
            service: "api";
            /** @constant */
            status: "ready";
            /** @constant */
            version: "1.0.0-contract";
        };
        HealthStatus: components["schemas"]["health-status.schema"];
        /**
         * MobileCompatibilityStatus
         * @description Synthetic foundation compatibility policy for installed native iOS and Android clients.
         */
        "mobile-compatibility-status.schema": {
            contract: {
                /** @constant */
                currentVersion: "v1";
                /** @constant */
                minimumSupportedVersion: "v1";
                supportedVersions: "v1"[];
            };
            platforms: {
                android: components["schemas"]["platformPolicy"];
                ios: components["schemas"]["platformPolicy"];
            };
            /** @constant */
            status: "compatible";
            $defs: {
                platformPolicy: {
                    /** @constant */
                    minimumAppVersion: "0.0.0-foundation";
                    /** @constant */
                    minimumBuildNumber: 1;
                    /** @constant */
                    releaseState: "foundation";
                    supportedContractVersions: "v1"[];
                };
            };
        };
        MobileCompatibilityStatus: components["schemas"]["mobile-compatibility-status.schema"];
        platformPolicy: {
            /** @constant */
            minimumAppVersion: "0.0.0-foundation";
            /** @constant */
            minimumBuildNumber: 1;
            /** @constant */
            releaseState: "foundation";
            supportedContractVersions: "v1"[];
        };
        /**
         * RepresentativeSignalCommand
         * @description Disabled future human-intent command contract. No API operation accepts it in issue #60.
         */
        "representative-signal-command.schema": {
            /** @constant */
            confirmation: "human-confirmed";
            /** @enum {unknown} */
            judgment: "support" | "concern";
            /** @constant */
            kind: "representative_signal_command";
            officeTermId: string;
            /** @constant */
            schemaVersion: "representative-signal-command.v1";
        };
        RepresentativeSignalCommand: components["schemas"]["representative-signal-command.schema"];
    };
    responses: {
        /** @description The capability is disabled or still proposed. */
        FeatureDisabled: {
            headers: {
                "Cache-Control": components["headers"]["CacheControl"];
                "X-Correlation-ID": components["headers"]["CorrelationId"];
                [name: string]: unknown;
            };
            content: {
                "application/problem+json": components["schemas"]["api-error.schema"];
            };
        };
    };
    parameters: never;
    requestBodies: never;
    headers: {
        /** @description Explicit response cache policy. */
        CacheControl: string;
        /** @description Safe opaque correlation reference; never an account or identity identifier. */
        CorrelationId: string;
        /** @description Seconds before a safe retry may be attempted. */
        RetryAfter: number;
    };
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getApiHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The API contract foundation is available. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["health-status.schema"];
                };
            };
        };
    };
    getMobileCompatibility: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Native client contract compatibility policy. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["mobile-compatibility-status.schema"];
                };
            };
        };
    };
    getJurisdictionAvailability: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            503: components["responses"]["FeatureDisabled"];
        };
    };
}
