/* Generated from api-error.schema.json. Do not edit directly. */

/**
 * Privacy-safe v1 API error envelope that prevents account and authority enumeration.
 */
export interface ApiError {
  schemaVersion: 'api-error.v1';
  code:
    | 'NOT_FOUND'
    | 'METHOD_NOT_ALLOWED'
    | 'FEATURE_DISABLED'
    | 'VALIDATION_ERROR'
    | 'CONFLICT'
    | 'PRECONDITION_FAILED'
    | 'RATE_LIMITED'
    | 'DEPENDENCY_UNAVAILABLE'
    | 'MAINTENANCE';
  message: string;
  correlationId: string;
  /**
   * @maxItems 32
   */
  fieldErrors: {
    field: string;
    code: string;
  }[];
  retryable: boolean;
  retryAfterSeconds: number | null;
  featureState: 'operational' | 'testnet' | 'proposed' | 'disabled' | null;
  dependencyState: 'ready' | 'degraded' | 'unavailable' | 'disabled' | null;
}
