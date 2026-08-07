import { createHash } from 'node:crypto';

import {
  assertSourceCandidate,
  assertSourceConnectorCapability,
  type CoverageItem,
  type SourceCandidateRecord,
  type SourceConnectorCapabilityV1,
  type SourceCoverageSnapshot,
} from '@rmr/domain';

import {
  SourceRetrievalError,
  type RetrievalConditions,
  type SafeSourceRetriever,
  type SecuredRetrieval,
} from './security.js';

export interface ConnectorCheckpoint {
  readonly cursor: string | null;
  readonly etag: string | null;
  readonly lastModified: string | null;
  readonly version: string;
}

export interface ParsedSourceEnvelope<ParsedRecord = unknown> {
  readonly nextCursor: string | null;
  readonly records: readonly ParsedRecord[];
}

export interface SourceConnector<ParsedRecord = unknown> {
  readonly capability: SourceConnectorCapabilityV1;
  buildUrl(checkpoint: ConnectorCheckpoint | null): string;
  parse(body: Uint8Array): ParsedSourceEnvelope<ParsedRecord>;
  normalize(
    record: ParsedRecord,
    context: {
      readonly retrievedAt: string;
      readonly retrievalId: string;
      readonly retrievalSha256: string;
    },
  ): SourceCandidateRecord;
}

export interface RetrievalMetadata {
  readonly attributionText: string;
  readonly capabilityVersion: string;
  readonly connectorId: string;
  readonly contentEncoding: string;
  readonly contentType: string;
  readonly decodedBytes: number;
  readonly etag: string | null;
  readonly lastModified: string | null;
  readonly licenseName: string;
  readonly parserVersion: string;
  readonly retrievalId: string;
  readonly retrievedAt: string;
  readonly retrievedUrl: string;
  readonly sha256: string;
  readonly sourceId: string;
  readonly termsUrl: string;
  readonly wireBytes: number;
}

export interface QuarantineItem {
  readonly code: string;
  readonly connectorId: string;
  readonly createdAt: string;
  readonly itemId: string;
  readonly retrievalId: string | null;
  readonly safeSummary: string;
}

export interface DeadLetterItem extends QuarantineItem {
  readonly attemptCount: number;
}

export interface SourceIngestionRunResult {
  readonly candidateCount: number;
  readonly checkpoint: ConnectorCheckpoint | null;
  readonly coverage: SourceCoverageSnapshot | null;
  readonly disposition: 'completed' | 'duplicate' | 'not_modified' | 'quarantined';
  readonly idempotencyKey: string | null;
  readonly quarantineCode: string | null;
  readonly retrieval: RetrievalMetadata | null;
  readonly runId: string;
}

export class InMemoryIngestionStore {
  readonly candidates: SourceCandidateRecord[] = [];
  readonly coverage: SourceCoverageSnapshot[] = [];
  readonly deadLetters: DeadLetterItem[] = [];
  readonly quarantines: QuarantineItem[] = [];
  readonly retrievals: RetrievalMetadata[] = [];
  private readonly checkpoints = new Map<string, ConnectorCheckpoint>();
  private readonly idempotencyKeys = new Set<string>();

  checkpoint(connectorId: string): ConnectorCheckpoint | null {
    return this.checkpoints.get(connectorId) ?? null;
  }

  hasIdempotencyKey(key: string): boolean {
    return this.idempotencyKeys.has(key);
  }

  commit(input: {
    readonly candidates: readonly SourceCandidateRecord[];
    readonly checkpoint: ConnectorCheckpoint;
    readonly coverage: SourceCoverageSnapshot;
    readonly idempotencyKey: string;
    readonly retrieval: RetrievalMetadata;
  }): void {
    this.retrievals.push(input.retrieval);
    this.candidates.push(...input.candidates);
    this.coverage.push(input.coverage);
    this.checkpoints.set(input.retrieval.connectorId, input.checkpoint);
    this.idempotencyKeys.add(input.idempotencyKey);
  }

  recordQuarantine(item: QuarantineItem): void {
    this.quarantines.push(Object.freeze(item));
  }

  recordDeadLetter(item: DeadLetterItem): void {
    this.deadLetters.push(Object.freeze(item));
  }
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`)
    .join(',')}}`;
}

function stableToken(value: string): string {
  return sha256(value).slice(0, 24);
}

function buildCoverage(
  candidates: readonly SourceCandidateRecord[],
  input: { readonly generatedAt: string; readonly codeRevision: string; readonly runId: string },
): SourceCoverageSnapshot {
  const groups = new Map<string, CoverageItem>();
  for (const candidate of candidates) {
    const key = `${candidate.countryCode}|${candidate.jurisdictionId}|${candidate.recordType}|${candidate.sourceAvailability}`;
    const existing = groups.get(key);
    groups.set(key, {
      candidateCount: (existing?.candidateCount ?? 0) + 1,
      conflictCount:
        (existing?.conflictCount ?? 0) + (candidate.matchOutcome === 'conflict' ? 1 : 0),
      countryCode: candidate.countryCode,
      jurisdictionId: candidate.jurisdictionId,
      lastRetrievedAt: input.generatedAt,
      pendingReviewCount:
        (existing?.pendingReviewCount ?? 0) + (candidate.reviewState === 'pending_review' ? 1 : 0),
      recordType: candidate.recordType,
      sourceAvailability: candidate.sourceAvailability,
    });
  }
  const items = [...groups.values()].sort((left, right) =>
    `${left.countryCode}|${left.jurisdictionId}|${left.recordType}`.localeCompare(
      `${right.countryCode}|${right.jurisdictionId}|${right.recordType}`,
    ),
  );
  const withoutHash = {
    codeRevision: input.codeRevision,
    dataMode: 'synthetic' as const,
    generatedAt: input.generatedAt,
    items,
    methodVersion: 'source-coverage.v1',
    missingDataMeaning: 'coverage_gap_not_misconduct' as const,
    provenanceState: 'not_anchored' as const,
    schemaVersion: 'source-coverage-snapshot.v1' as const,
    snapshotId: `coverage:${stableToken(input.runId)}`,
  };
  return Object.freeze({ ...withoutHash, sha256: sha256(canonicalJson(withoutHash)) });
}

function conditions(checkpoint: ConnectorCheckpoint | null): RetrievalConditions {
  if (checkpoint === null) return {};
  return {
    ...(checkpoint.etag === null ? {} : { etag: checkpoint.etag }),
    ...(checkpoint.lastModified === null ? {} : { lastModified: checkpoint.lastModified }),
  };
}

function retrievalMetadata(
  capability: SourceConnectorCapabilityV1,
  retrieval: SecuredRetrieval,
  retrievalId: string,
  retrievedAt: string,
): RetrievalMetadata {
  return Object.freeze({
    attributionText: capability.rights.attributionText,
    capabilityVersion: capability.connectorVersion,
    connectorId: capability.connectorId,
    contentEncoding: retrieval.contentEncoding,
    contentType: retrieval.contentType,
    decodedBytes: retrieval.decodedBytes,
    etag: retrieval.etag,
    lastModified: retrieval.lastModified,
    licenseName: capability.rights.licenseName,
    parserVersion: capability.parser.parserVersion,
    retrievalId,
    retrievedAt,
    retrievedUrl: retrieval.retrievedUrl,
    sha256: retrieval.sha256,
    sourceId: capability.source.sourceId,
    termsUrl: capability.rights.termsUrl,
    wireBytes: retrieval.wireBytes,
  });
}

export class SourceIngestionPipeline {
  constructor(
    private readonly retriever: SafeSourceRetriever,
    private readonly store: InMemoryIngestionStore,
    private readonly options: {
      readonly codeRevision: string;
      readonly maximumAttempts?: number;
      readonly now?: () => Date;
    },
  ) {}

  async run<ParsedRecord>(
    connector: SourceConnector<ParsedRecord>,
  ): Promise<SourceIngestionRunResult> {
    assertSourceConnectorCapability(connector.capability);
    if (connector.capability.dataMode !== 'synthetic') {
      throw new Error(
        'Production source execution remains disabled until an explicit release gate.',
      );
    }
    if (connector.capability.approval.state !== 'synthetic_approved') {
      throw new Error('Suspended source connectors cannot execute.');
    }
    const now = this.options.now ?? (() => new Date());
    const retrievedAt = now().toISOString();
    const runId = `run:${stableToken(`${connector.capability.connectorId}|${retrievedAt}`)}`;
    const priorCheckpoint = this.store.checkpoint(connector.capability.connectorId);
    let attempt = 0;
    const maximumAttempts = this.options.maximumAttempts ?? 3;

    while (attempt < maximumAttempts) {
      attempt += 1;
      try {
        const retrieval = await this.retriever.retrieve(
          connector.capability,
          connector.buildUrl(priorCheckpoint),
          conditions(priorCheckpoint),
        );
        if (retrieval.notModified) {
          return Object.freeze({
            candidateCount: 0,
            checkpoint: priorCheckpoint,
            coverage: null,
            disposition: 'not_modified',
            idempotencyKey: null,
            quarantineCode: null,
            retrieval: null,
            runId,
          });
        }
        const idempotencyKey = sha256(
          `${connector.capability.connectorId}|${connector.capability.connectorVersion}|${retrieval.sha256}`,
        );
        if (this.store.hasIdempotencyKey(idempotencyKey)) {
          return Object.freeze({
            candidateCount: 0,
            checkpoint: priorCheckpoint,
            coverage: null,
            disposition: 'duplicate',
            idempotencyKey,
            quarantineCode: null,
            retrieval: null,
            runId,
          });
        }
        const retrievalId = `retrieval:${stableToken(idempotencyKey)}`;
        const parsed = connector.parse(retrieval.body);
        const candidates = parsed.records.map((record) =>
          connector.normalize(record, {
            retrievedAt,
            retrievalId,
            retrievalSha256: retrieval.sha256,
          }),
        );
        for (const candidate of candidates) assertSourceCandidate(candidate);
        const checkpoint = Object.freeze({
          cursor: parsed.nextCursor,
          etag: retrieval.etag,
          lastModified: retrieval.lastModified,
          version: connector.capability.pagination.checkpointVersion,
        });
        const metadata = retrievalMetadata(
          connector.capability,
          retrieval,
          retrievalId,
          retrievedAt,
        );
        const coverage = buildCoverage(candidates, {
          codeRevision: this.options.codeRevision,
          generatedAt: retrievedAt,
          runId,
        });
        this.store.commit({
          candidates,
          checkpoint,
          coverage,
          idempotencyKey,
          retrieval: metadata,
        });
        return Object.freeze({
          candidateCount: candidates.length,
          checkpoint,
          coverage,
          disposition: 'completed',
          idempotencyKey,
          quarantineCode: null,
          retrieval: metadata,
          runId,
        });
      } catch (error) {
        const sourceError =
          error instanceof SourceRetrievalError
            ? error
            : new SourceRetrievalError(
                'PARSE_FAILED',
                error instanceof Error ? error.message : 'Unknown connector failure.',
                false,
              );
        if (sourceError.retriable && attempt < maximumAttempts) continue;
        const item = {
          attemptCount: attempt,
          code: sourceError.code,
          connectorId: connector.capability.connectorId,
          createdAt: retrievedAt,
          itemId: `quarantine:${stableToken(`${runId}|${sourceError.code}`)}`,
          retrievalId: null,
          safeSummary: sourceError.message,
        };
        this.store.recordQuarantine(item);
        if (sourceError.retriable) this.store.recordDeadLetter(item);
        return Object.freeze({
          candidateCount: 0,
          checkpoint: priorCheckpoint,
          coverage: null,
          disposition: 'quarantined',
          idempotencyKey: null,
          quarantineCode: sourceError.code,
          retrieval: null,
          runId,
        });
      }
    }
    throw new Error('Unreachable ingestion retry state.');
  }
}
