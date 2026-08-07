/* Generated from source-coverage-snapshot.schema.json. Do not edit directly. */

export type Id = string;

export interface SourceCoverageSnapshotV1 {
  schemaVersion: 'source-coverage-snapshot.v1';
  dataMode: 'synthetic';
  snapshotId: Id;
  generatedAt: string;
  methodVersion: Id;
  codeRevision: Id;
  missingDataMeaning: 'coverage_gap_not_misconduct';
  provenanceState: 'not_anchored';
  sha256: string;
  items: {
    countryCode: 'CA' | 'US';
    jurisdictionId: Id;
    recordType: string;
    sourceAvailability: 'available' | 'stale' | 'missing' | 'retracted' | 'unavailable';
    candidateCount: number;
    pendingReviewCount: number;
    conflictCount: number;
    lastRetrievedAt: string | null;
  }[];
}
