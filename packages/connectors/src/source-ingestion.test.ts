import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { InMemoryIngestionStore, SourceIngestionPipeline } from './pipeline.js';
import {
  SafeSourceRetriever,
  SourceRetrievalError,
  type SourceAddressResolver,
  type SourceTransport,
  type SourceTransportResponse,
} from './security.js';
import {
  SYNTHETIC_CA_PILOT_CAPABILITY,
  SYNTHETIC_CA_PILOT_CONNECTOR,
  SYNTHETIC_US_PILOT_CONNECTOR,
} from './synthetic-pilots.js';

const fixture = (name: string) =>
  readFile(new URL(`../fixtures/${name}`, import.meta.url)).then((body) => new Uint8Array(body));

class FixtureResolver implements SourceAddressResolver {
  constructor(private readonly addresses: readonly string[] = ['192.0.2.55']) {}

  async resolve(): Promise<readonly string[]> {
    return this.addresses;
  }
}

class FixtureTransport implements SourceTransport {
  calls = 0;

  constructor(private readonly responseFactory: () => Promise<SourceTransportResponse>) {}

  async request(): Promise<SourceTransportResponse> {
    this.calls += 1;
    return this.responseFactory();
  }
}

function response(body: Uint8Array): SourceTransportResponse {
  return {
    body,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      etag: '"synthetic-v1"',
      'last-modified': 'Thu, 06 Aug 2026 00:00:00 GMT',
    },
    peerAddress: '192.0.2.55',
    status: 200,
  };
}

describe('official-source pilot pipeline', () => {
  it('runs approved Canada and United States pilots end to end without publishing', async () => {
    const bodies = [await fixture('ca-pilot.json'), await fixture('us-pilot.json')];
    const transport = new FixtureTransport(async () =>
      response(bodies.shift() ?? new Uint8Array()),
    );
    const store = new InMemoryIngestionStore();
    const pipeline = new SourceIngestionPipeline(
      new SafeSourceRetriever(new FixtureResolver(), transport),
      store,
      {
        codeRevision: 'synthetic-test-revision',
        now: () => new Date('2026-08-07T14:00:00Z'),
      },
    );

    const canada = await pipeline.run(SYNTHETIC_CA_PILOT_CONNECTOR);
    const unitedStates = await pipeline.run(SYNTHETIC_US_PILOT_CONNECTOR);

    expect(canada.disposition).toBe('completed');
    expect(unitedStates.disposition).toBe('completed');
    expect(store.retrievals).toHaveLength(2);
    expect(store.candidates).toHaveLength(3);
    expect(store.candidates.every(({ reviewState }) => reviewState === 'pending_review')).toBe(
      true,
    );
    expect(store.candidates).not.toContainEqual(
      expect.objectContaining({ reviewState: 'approved' }),
    );
    expect(
      store.candidates.find(({ sourceRecordId }) => sourceRecordId.endsWith('name-only')),
    ).toMatchObject({ matchOutcome: 'ambiguous', reviewState: 'pending_review' });
    expect(store.retrievals[0]).toMatchObject({
      attributionText: expect.stringContaining('synthetic fixture'),
      contentType: 'application/json',
      licenseName: 'CC0-1.0 synthetic fixture',
      parserVersion: 'synthetic-ca-parser.v1',
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(store.candidates[0]?.transformations[0]?.inputSha256).toBe(store.retrievals[0]?.sha256);
  });

  it('checkpoints, sends conditional metadata, and suppresses duplicate content', async () => {
    const body = await fixture('ca-pilot.json');
    let lastHeaders: Readonly<Record<string, string>> = {};
    const transport: SourceTransport = {
      async request(request) {
        lastHeaders = request.headers;
        return response(body);
      },
    };
    const store = new InMemoryIngestionStore();
    const pipeline = new SourceIngestionPipeline(
      new SafeSourceRetriever(new FixtureResolver(), transport),
      store,
      { codeRevision: 'synthetic-test-revision', now: () => new Date('2026-08-07T14:00:00Z') },
    );

    expect((await pipeline.run(SYNTHETIC_CA_PILOT_CONNECTOR)).disposition).toBe('completed');
    expect((await pipeline.run(SYNTHETIC_CA_PILOT_CONNECTOR)).disposition).toBe('duplicate');
    expect(lastHeaders['if-none-match']).toBe('"synthetic-v1"');
    expect(store.checkpoint(SYNTHETIC_CA_PILOT_CAPABILITY.connectorId)?.cursor).toBe('ca-page-2');
    expect(store.candidates).toHaveLength(1);
  });

  it('produces reproducible coverage from identical inputs', async () => {
    const run = async () => {
      const body = await fixture('ca-pilot.json');
      const store = new InMemoryIngestionStore();
      const pipeline = new SourceIngestionPipeline(
        new SafeSourceRetriever(
          new FixtureResolver(),
          new FixtureTransport(async () => response(body)),
        ),
        store,
        { codeRevision: 'revision-55', now: () => new Date('2026-08-07T14:00:00Z') },
      );
      return pipeline.run(SYNTHETIC_CA_PILOT_CONNECTOR);
    };
    const [left, right] = await Promise.all([run(), run()]);
    expect(left.coverage?.sha256).toBe(right.coverage?.sha256);
    expect(left.coverage).toMatchObject({
      dataMode: 'synthetic',
      missingDataMeaning: 'coverage_gap_not_misconduct',
      provenanceState: 'not_anchored',
    });
  });

  it('retries outages, then quarantines and dead-letters a safe summary', async () => {
    const transport = new FixtureTransport(async () => ({
      body: new Uint8Array(),
      headers: {},
      peerAddress: '192.0.2.55',
      status: 503,
    }));
    const store = new InMemoryIngestionStore();
    const pipeline = new SourceIngestionPipeline(
      new SafeSourceRetriever(new FixtureResolver(), transport),
      store,
      { codeRevision: 'revision-55', maximumAttempts: 3 },
    );

    const result = await pipeline.run(SYNTHETIC_CA_PILOT_CONNECTOR);
    expect(result).toMatchObject({ disposition: 'quarantined', quarantineCode: 'HTTP_STATUS' });
    expect(transport.calls).toBe(3);
    expect(store.deadLetters).toEqual([
      expect.objectContaining({ attemptCount: 3, code: 'HTTP_STATUS' }),
    ]);
  });

  it('quarantines malformed source data and preserves the prior checkpoint', async () => {
    const transport = new FixtureTransport(async () => response(new TextEncoder().encode('{')));
    const store = new InMemoryIngestionStore();
    const pipeline = new SourceIngestionPipeline(
      new SafeSourceRetriever(new FixtureResolver(), transport),
      store,
      { codeRevision: 'revision-55' },
    );
    const result = await pipeline.run(SYNTHETIC_CA_PILOT_CONNECTOR);
    expect(result).toMatchObject({ disposition: 'quarantined', quarantineCode: 'PARSE_FAILED' });
    expect(store.checkpoint(SYNTHETIC_CA_PILOT_CAPABILITY.connectorId)).toBeNull();
  });

  it('refuses to execute a suspended synthetic capability', async () => {
    const body = await fixture('ca-pilot.json');
    const store = new InMemoryIngestionStore();
    const pipeline = new SourceIngestionPipeline(
      new SafeSourceRetriever(
        new FixtureResolver(),
        new FixtureTransport(async () => response(body)),
      ),
      store,
      { codeRevision: 'revision-55' },
    );
    await expect(
      pipeline.run({
        ...SYNTHETIC_CA_PILOT_CONNECTOR,
        capability: {
          ...SYNTHETIC_CA_PILOT_CAPABILITY,
          approval: { ...SYNTHETIC_CA_PILOT_CAPABILITY.approval, state: 'suspended' },
        },
      }),
    ).rejects.toThrow(/Suspended/);
    expect(store.retrievals).toHaveLength(0);
  });
});

describe('source retrieval security boundary', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '169.254.169.254',
    '172.20.0.4',
    '192.168.1.5',
    '::1',
    'fd00::1',
    'fe80::1',
    '::ffff:7f00:1',
  ])('blocks private or metadata address %s before transport', async (address) => {
    const transport = new FixtureTransport(async () => response(new Uint8Array()));
    const retriever = new SafeSourceRetriever(new FixtureResolver([address]), transport);
    await expect(
      retriever.retrieve(
        SYNTHETIC_CA_PILOT_CAPABILITY,
        'https://ca-pilot.synthetic.invalid/v1/records',
      ),
    ).rejects.toMatchObject({ code: 'PRIVATE_NETWORK_BLOCKED' });
    expect(transport.calls).toBe(0);
  });

  it('blocks unapproved origins, credentials, fragments, and DNS rebinding', async () => {
    const transport = new FixtureTransport(async () => ({
      ...response(new TextEncoder().encode('{}')),
      peerAddress: '192.0.2.99',
    }));
    const retriever = new SafeSourceRetriever(new FixtureResolver(), transport);
    for (const url of [
      'http://ca-pilot.synthetic.invalid/data',
      'https://user:secret@ca-pilot.synthetic.invalid/data',
      'https://ca-pilot.synthetic.invalid/data#fragment',
      'https://other.synthetic.invalid/data',
    ]) {
      await expect(retriever.retrieve(SYNTHETIC_CA_PILOT_CAPABILITY, url)).rejects.toBeInstanceOf(
        SourceRetrievalError,
      );
    }
    await expect(
      retriever.retrieve(SYNTHETIC_CA_PILOT_CAPABILITY, 'https://ca-pilot.synthetic.invalid/data'),
    ).rejects.toMatchObject({ code: 'DNS_REBINDING' });
  });

  it('rejects malicious content types, oversized bodies, and decompression expansion', async () => {
    const attempt = async (responseValue: SourceTransportResponse) =>
      new SafeSourceRetriever(
        new FixtureResolver(),
        new FixtureTransport(async () => responseValue),
      ).retrieve(SYNTHETIC_CA_PILOT_CAPABILITY, 'https://ca-pilot.synthetic.invalid/data');

    await expect(
      attempt({
        ...response(new Uint8Array()),
        headers: { 'content-type': 'text/html' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_CONTENT_TYPE' });
    await expect(
      attempt({
        ...response(new Uint8Array()),
        decodedBytes: 200_001,
        wireBytes: 100,
      }),
    ).rejects.toMatchObject({ code: 'RESPONSE_TOO_LARGE' });
    await expect(
      attempt({ ...response(new Uint8Array()), decodedBytes: 1_001, wireBytes: 100 }),
    ).rejects.toMatchObject({ code: 'RESPONSE_TOO_LARGE' });
  });

  it('enforces the connector timeout before parsing or persistence', async () => {
    const retriever = new SafeSourceRetriever(new FixtureResolver(), {
      request: () => new Promise<never>(() => undefined),
    });
    await expect(
      retriever.retrieve(
        {
          ...SYNTHETIC_CA_PILOT_CAPABILITY,
          content: { ...SYNTHETIC_CA_PILOT_CAPABILITY.content, timeoutMs: 5 },
        },
        'https://ca-pilot.synthetic.invalid/data',
      ),
    ).rejects.toMatchObject({ code: 'TIMEOUT', retriable: true });
  });
});
