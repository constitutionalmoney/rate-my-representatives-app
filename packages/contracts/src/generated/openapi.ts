export interface paths {
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read core API foundation readiness */
        get: operations["getHealth"];
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
         * HealthStatus
         * @description Synthetic foundation health response. This is not a production status claim.
         */
        "health-status.schema": {
            optionalDependencies: {
                /** @enum {unknown} */
                verus: "disabled" | "degraded" | "ready";
            };
            /** @constant */
            service: "api";
            /** @constant */
            status: "ready";
            version: string;
        };
        HealthStatus: components["schemas"]["health-status.schema"];
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Core API can serve the enabled foundation routes. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["health-status.schema"];
                };
            };
        };
    };
}
