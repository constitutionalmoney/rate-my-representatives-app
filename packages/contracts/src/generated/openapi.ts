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
         * Read the effective-dated synthetic jurisdiction registry
         * @description Returns the nested Canada/United States synthetic registry at an effective date. It is not an eligibility, citizenship, legal-residence, or precise location determination. Person, term, candidacy, ingestion, and location resolution families remain explicitly deferred.
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
        attribution: {
            assertionId: components["schemas"]["id"];
            /** @enum {unknown} */
            conflict: "clear" | "conflicting" | "unsupported";
            /** @enum {unknown} */
            coverage: "supported" | "partial" | "gap" | "unsupported";
            /** @enum {unknown} */
            freshness: "current" | "stale" | "unknown" | "unavailable";
            observedAt: components["schemas"]["timestamp"];
            sourceReference: string;
            supersedesAssertionId: components["schemas"]["id"] | null;
        };
        bodyJurisdictionRelationship: {
            attribution: components["schemas"]["attribution"];
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            jurisdictionId: components["schemas"]["id"];
            /** @enum {unknown} */
            kind: "governs" | "serves" | "overlaps";
            publicBodyId: components["schemas"]["id"];
            relationshipId: components["schemas"]["id"];
        };
        boundary: {
            attribution: components["schemas"]["attribution"];
            boundaryVersionId: components["schemas"]["id"];
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            geometryReference: string;
            geometrySha256: string;
        };
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
        /** @enum {unknown} */
        countryCode: "CA" | "US";
        district: {
            boundaries: components["schemas"]["boundary"][];
            countryCode: components["schemas"]["countryCode"];
            districtId: components["schemas"]["id"];
            versions: components["schemas"]["districtVersion"][];
        };
        districtJurisdictionRelationship: {
            attribution: components["schemas"]["attribution"];
            districtId: components["schemas"]["id"];
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            jurisdictionId: components["schemas"]["id"];
            /** @enum {unknown} */
            kind: "contained_by" | "overlaps" | "represents" | "successor_of";
            relationshipId: components["schemas"]["id"];
        };
        districtLineage: {
            attribution: components["schemas"]["attribution"];
            districtId: components["schemas"]["id"];
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            /** @enum {unknown} */
            kind: "redistricted_from" | "split_from" | "merged_from";
            lineageId: components["schemas"]["id"];
            predecessorDistrictId: components["schemas"]["id"];
        };
        districtVersion: {
            attribution: components["schemas"]["attribution"];
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            /** @enum {unknown} */
            kind: "federal_electoral" | "provincial_electoral" | "state_legislative" | "local_electoral" | "special";
            name: string;
            slug: string;
            /** @enum {unknown} */
            status: "active" | "future" | "former" | "superseded";
            versionId: components["schemas"]["id"];
        };
        externalIdentifier: {
            attribution: components["schemas"]["attribution"];
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            entityId: components["schemas"]["id"];
            /** @enum {unknown} */
            entityKind: "jurisdiction" | "district" | "public_body" | "office";
            externalIdentifierId: components["schemas"]["id"];
            identifier: string;
            issuer: string;
        };
        gap: {
            attribution: components["schemas"]["attribution"];
            code: string;
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            entityId: components["schemas"]["id"];
            /** @enum {unknown} */
            entityKind: "jurisdiction" | "district" | "public_body" | "office";
            gapId: components["schemas"]["id"];
            message: string;
        };
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
            /** @enum {unknown} */
            dataMode?: "synthetic";
            featureStates: {
                /** @constant */
                civicSignal: "disabled";
                /** @constant */
                provenanceWrites: "disabled";
                /** @enum {unknown} */
                publicRegistry: "proposed" | "operational";
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
        id: string;
        jurisdiction: {
            countryCode: components["schemas"]["countryCode"];
            jurisdictionId: components["schemas"]["id"];
            versions: components["schemas"]["jurisdictionVersion"][];
        };
        /**
         * JurisdictionRegistry
         * @description Synthetic, effective-dated public registry read model. It contains jurisdictions, districts, public bodies, and offices only; person, term, candidacy, source-ingestion, and location-resolution families are deferred.
         */
        "jurisdiction-registry.schema": {
            asOf: components["schemas"]["timestamp"];
            bodyJurisdictionRelationships: components["schemas"]["bodyJurisdictionRelationship"][];
            /** @constant */
            dataMode: "synthetic";
            deferredFamilies: ("people" | "office_terms" | "candidacies" | "source_ingestion" | "location_resolution")[];
            districtJurisdictionRelationships: components["schemas"]["districtJurisdictionRelationship"][];
            districtLineage: components["schemas"]["districtLineage"][];
            districts: components["schemas"]["district"][];
            externalIdentifiers: components["schemas"]["externalIdentifier"][];
            gaps: components["schemas"]["gap"][];
            generatedAt: components["schemas"]["timestamp"];
            jurisdictionRelationships: components["schemas"]["jurisdictionRelationship"][];
            jurisdictions: components["schemas"]["jurisdiction"][];
            offices: components["schemas"]["office"][];
            page: {
                nextCursor: null;
            };
            publicBodies: components["schemas"]["publicBody"][];
            /** @constant */
            schemaVersion: "jurisdiction-registry.v1";
            $defs: {
                id: string;
                /** Format: date-time */
                timestamp: string;
                /** @enum {unknown} */
                countryCode: "CA" | "US";
                attribution: {
                    assertionId: components["schemas"]["id"];
                    /** @enum {unknown} */
                    conflict: "clear" | "conflicting" | "unsupported";
                    /** @enum {unknown} */
                    coverage: "supported" | "partial" | "gap" | "unsupported";
                    /** @enum {unknown} */
                    freshness: "current" | "stale" | "unknown" | "unavailable";
                    observedAt: components["schemas"]["timestamp"];
                    sourceReference: string;
                    supersedesAssertionId: components["schemas"]["id"] | null;
                };
                jurisdictionVersion: {
                    attribution: components["schemas"]["attribution"];
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    /** @enum {unknown} */
                    kind: "country" | "province" | "state" | "territory" | "municipality" | "locality" | "unincorporated_area" | "county" | "regional_district" | "region" | "special_district";
                    name: string;
                    slug: string;
                    /** @enum {unknown} */
                    status: "active" | "future" | "former" | "amalgamated" | "dissolved" | "superseded";
                    versionId: components["schemas"]["id"];
                };
                jurisdiction: {
                    countryCode: components["schemas"]["countryCode"];
                    jurisdictionId: components["schemas"]["id"];
                    versions: components["schemas"]["jurisdictionVersion"][];
                };
                jurisdictionRelationship: {
                    attribution: components["schemas"]["attribution"];
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    /** @enum {unknown} */
                    kind: "contained_by" | "administered_by" | "overlaps" | "represented_by" | "successor_of";
                    objectJurisdictionId: components["schemas"]["id"];
                    relationshipId: components["schemas"]["id"];
                    subjectJurisdictionId: components["schemas"]["id"];
                };
                boundary: {
                    attribution: components["schemas"]["attribution"];
                    boundaryVersionId: components["schemas"]["id"];
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    geometryReference: string;
                    geometrySha256: string;
                };
                districtVersion: {
                    attribution: components["schemas"]["attribution"];
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    /** @enum {unknown} */
                    kind: "federal_electoral" | "provincial_electoral" | "state_legislative" | "local_electoral" | "special";
                    name: string;
                    slug: string;
                    /** @enum {unknown} */
                    status: "active" | "future" | "former" | "superseded";
                    versionId: components["schemas"]["id"];
                };
                district: {
                    boundaries: components["schemas"]["boundary"][];
                    countryCode: components["schemas"]["countryCode"];
                    districtId: components["schemas"]["id"];
                    versions: components["schemas"]["districtVersion"][];
                };
                districtJurisdictionRelationship: {
                    attribution: components["schemas"]["attribution"];
                    districtId: components["schemas"]["id"];
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    jurisdictionId: components["schemas"]["id"];
                    /** @enum {unknown} */
                    kind: "contained_by" | "overlaps" | "represents" | "successor_of";
                    relationshipId: components["schemas"]["id"];
                };
                districtLineage: {
                    attribution: components["schemas"]["attribution"];
                    districtId: components["schemas"]["id"];
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    /** @enum {unknown} */
                    kind: "redistricted_from" | "split_from" | "merged_from";
                    lineageId: components["schemas"]["id"];
                    predecessorDistrictId: components["schemas"]["id"];
                };
                publicBodyVersion: {
                    attribution: components["schemas"]["attribution"];
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    /** @enum {unknown} */
                    kind: "legislature" | "council" | "board" | "agency" | "commission";
                    name: string;
                    slug: string;
                    /** @enum {unknown} */
                    status: "active" | "future" | "former" | "abolished";
                    versionId: components["schemas"]["id"];
                };
                publicBody: {
                    countryCode: components["schemas"]["countryCode"];
                    publicBodyId: components["schemas"]["id"];
                    versions: components["schemas"]["publicBodyVersion"][];
                };
                bodyJurisdictionRelationship: {
                    attribution: components["schemas"]["attribution"];
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    jurisdictionId: components["schemas"]["id"];
                    /** @enum {unknown} */
                    kind: "governs" | "serves" | "overlaps";
                    publicBodyId: components["schemas"]["id"];
                    relationshipId: components["schemas"]["id"];
                };
                officeVersion: {
                    attribution: components["schemas"]["attribution"];
                    districtId: components["schemas"]["id"] | null;
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    name: string;
                    /** @enum {unknown} */
                    operationalState: "active" | "vacant" | "acting" | "future" | "abolished";
                    publicBodyId: components["schemas"]["id"];
                    /** @enum {unknown} */
                    selectionMethod: "elected" | "appointed" | "mixed" | "ex_officio" | "unknown";
                    slug: string;
                    versionId: components["schemas"]["id"];
                };
                office: {
                    countryCode: components["schemas"]["countryCode"];
                    officeId: components["schemas"]["id"];
                    versions: components["schemas"]["officeVersion"][];
                };
                externalIdentifier: {
                    attribution: components["schemas"]["attribution"];
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    entityId: components["schemas"]["id"];
                    /** @enum {unknown} */
                    entityKind: "jurisdiction" | "district" | "public_body" | "office";
                    externalIdentifierId: components["schemas"]["id"];
                    identifier: string;
                    issuer: string;
                };
                gap: {
                    attribution: components["schemas"]["attribution"];
                    code: string;
                    effectiveFrom: components["schemas"]["timestamp"];
                    effectiveTo: components["schemas"]["timestamp"] | null;
                    entityId: components["schemas"]["id"];
                    /** @enum {unknown} */
                    entityKind: "jurisdiction" | "district" | "public_body" | "office";
                    gapId: components["schemas"]["id"];
                    message: string;
                };
            };
        };
        JurisdictionRegistry: components["schemas"]["jurisdiction-registry.schema"];
        jurisdictionRelationship: {
            attribution: components["schemas"]["attribution"];
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            /** @enum {unknown} */
            kind: "contained_by" | "administered_by" | "overlaps" | "represented_by" | "successor_of";
            objectJurisdictionId: components["schemas"]["id"];
            relationshipId: components["schemas"]["id"];
            subjectJurisdictionId: components["schemas"]["id"];
        };
        jurisdictionVersion: {
            attribution: components["schemas"]["attribution"];
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            /** @enum {unknown} */
            kind: "country" | "province" | "state" | "territory" | "municipality" | "locality" | "unincorporated_area" | "county" | "regional_district" | "region" | "special_district";
            name: string;
            slug: string;
            /** @enum {unknown} */
            status: "active" | "future" | "former" | "amalgamated" | "dissolved" | "superseded";
            versionId: components["schemas"]["id"];
        };
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
        office: {
            countryCode: components["schemas"]["countryCode"];
            officeId: components["schemas"]["id"];
            versions: components["schemas"]["officeVersion"][];
        };
        officeVersion: {
            attribution: components["schemas"]["attribution"];
            districtId: components["schemas"]["id"] | null;
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            name: string;
            /** @enum {unknown} */
            operationalState: "active" | "vacant" | "acting" | "future" | "abolished";
            publicBodyId: components["schemas"]["id"];
            /** @enum {unknown} */
            selectionMethod: "elected" | "appointed" | "mixed" | "ex_officio" | "unknown";
            slug: string;
            versionId: components["schemas"]["id"];
        };
        platformPolicy: {
            /** @constant */
            minimumAppVersion: "0.0.0-foundation";
            /** @constant */
            minimumBuildNumber: 1;
            /** @constant */
            releaseState: "foundation";
            supportedContractVersions: "v1"[];
        };
        publicBody: {
            countryCode: components["schemas"]["countryCode"];
            publicBodyId: components["schemas"]["id"];
            versions: components["schemas"]["publicBodyVersion"][];
        };
        publicBodyVersion: {
            attribution: components["schemas"]["attribution"];
            effectiveFrom: components["schemas"]["timestamp"];
            effectiveTo: components["schemas"]["timestamp"] | null;
            /** @enum {unknown} */
            kind: "legislature" | "council" | "board" | "agency" | "commission";
            name: string;
            slug: string;
            /** @enum {unknown} */
            status: "active" | "future" | "former" | "abolished";
            versionId: components["schemas"]["id"];
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
        /** Format: date-time */
        timestamp: string;
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
            query?: {
                /** @description Effective-date timestamp; defaults to the deterministic fixture timestamp. */
                asOf?: string;
                /** @description Restrict the graph to a synthetic country fixture. */
                countryCode?: "CA" | "US";
                /** @description Include superseded and historical versions instead of only the as-of slice. */
                includeHistorical?: boolean;
                /** @description Restrict the result to the connected effective-dated jurisdiction graph. */
                jurisdictionId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Effective-dated synthetic registry read model. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["jurisdiction-registry.schema"];
                };
            };
            /** @description One or more effective-date or filter parameters are invalid. */
            400: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    "X-Correlation-ID": components["headers"]["CorrelationId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["api-error.schema"];
                };
            };
            503: components["responses"]["FeatureDisabled"];
        };
    };
}
