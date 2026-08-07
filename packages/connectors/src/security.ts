import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

import type { SourceConnectorCapabilityV1 } from '@rmr/domain';

export type SourceRetrievalFailureCode =
  | 'DNS_EMPTY'
  | 'DNS_REBINDING'
  | 'HTTP_STATUS'
  | 'INVALID_CONTENT_ENCODING'
  | 'INVALID_CONTENT_TYPE'
  | 'INVALID_URL'
  | 'PARSE_FAILED'
  | 'PRIVATE_NETWORK_BLOCKED'
  | 'REDIRECT_BLOCKED'
  | 'RESPONSE_TOO_LARGE'
  | 'TIMEOUT';

export class SourceRetrievalError extends Error {
  constructor(
    readonly code: SourceRetrievalFailureCode,
    message: string,
    readonly retriable: boolean,
  ) {
    super(message);
    this.name = 'SourceRetrievalError';
  }
}

export interface SourceAddressResolver {
  resolve(hostname: string): Promise<readonly string[]>;
}

export interface SourceTransportRequest {
  readonly headers: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly url: string;
}

export interface SourceTransportResponse {
  readonly body: Uint8Array;
  readonly decodedBytes?: number;
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly peerAddress: string;
  readonly status: number;
  readonly wireBytes?: number;
}

export interface SourceTransport {
  request(request: SourceTransportRequest): Promise<SourceTransportResponse>;
}

export interface RetrievalConditions {
  readonly etag?: string;
  readonly lastModified?: string;
}

export interface SecuredRetrieval {
  readonly body: Uint8Array;
  readonly contentEncoding: string;
  readonly contentType: string;
  readonly decodedBytes: number;
  readonly etag: string | null;
  readonly lastModified: string | null;
  readonly notModified: boolean;
  readonly peerAddress: string;
  readonly retrievedUrl: string;
  readonly sha256: string;
  readonly status: number;
  readonly wireBytes: number;
}

const DOCUMENTATION_IPV4 = ['192.0.2.', '198.51.100.', '203.0.113.'] as const;

function parseIpv4(address: string): readonly number[] | undefined {
  if (isIP(address) !== 4) return undefined;
  return address.split('.').map(Number);
}

function isBlockedIpv4(address: string): boolean {
  const parts = parseIpv4(address);
  if (!parts) return false;
  const [a = 0, b = 0, c = 0] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isDocumentationIpv4(address: string): boolean {
  return DOCUMENTATION_IPV4.some((prefix) => address.startsWith(prefix));
}

function isBlockedIpv6(address: string): boolean {
  if (isIP(address) !== 6) return false;
  const normalized = address.toLowerCase();
  if (normalized === '::' || normalized === '::1') return true;
  if (
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb') ||
    normalized.startsWith('ff') ||
    normalized.startsWith('2001:db8:') ||
    normalized.startsWith('::ffff:')
  ) {
    return true;
  }
  return false;
}

function assertPermittedAddress(address: string, capability: SourceConnectorCapabilityV1): void {
  if (isIP(address) === 0) {
    throw new SourceRetrievalError('DNS_EMPTY', 'Resolver returned an invalid address.', true);
  }
  const permittedSyntheticDocumentationAddress =
    capability.dataMode === 'synthetic' && isDocumentationIpv4(address);
  if (
    isBlockedIpv4(address) ||
    isBlockedIpv6(address) ||
    (isDocumentationIpv4(address) && !permittedSyntheticDocumentationAddress)
  ) {
    throw new SourceRetrievalError(
      'PRIVATE_NETWORK_BLOCKED',
      'Connector resolution reached a private or non-routable network.',
      false,
    );
  }
}

function parseRequestUrl(value: string, capability: SourceConnectorCapabilityV1): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new SourceRetrievalError('INVALID_URL', 'Source URL is not absolute.', false);
  }
  const allowedOrigin = new URL(capability.access.endpointOrigin).origin;
  if (
    url.protocol !== 'https:' ||
    url.username !== '' ||
    url.password !== '' ||
    url.hash !== '' ||
    url.origin !== allowedOrigin
  ) {
    throw new SourceRetrievalError(
      'INVALID_URL',
      'Source URL must remain on the approved HTTPS origin without credentials or fragments.',
      false,
    );
  }
  return url;
}

function header(
  headers: Readonly<Record<string, string | undefined>>,
  name: string,
): string | undefined {
  const match = Object.entries(headers).find(([key]) => key.toLowerCase() === name);
  return match?.[1];
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new SourceRetrievalError('TIMEOUT', 'Source retrieval timed out.', true)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export class SafeSourceRetriever {
  constructor(
    private readonly resolver: SourceAddressResolver,
    private readonly transport: SourceTransport,
  ) {}

  async retrieve(
    capability: SourceConnectorCapabilityV1,
    requestedUrl: string,
    conditions: RetrievalConditions = {},
  ): Promise<SecuredRetrieval> {
    let url = parseRequestUrl(requestedUrl, capability);
    let redirects = 0;

    while (true) {
      const addresses = await this.resolver.resolve(url.hostname);
      if (addresses.length === 0) {
        throw new SourceRetrievalError('DNS_EMPTY', 'Source hostname did not resolve.', true);
      }
      for (const address of addresses) assertPermittedAddress(address, capability);

      const requestHeaders: Record<string, string> = {
        accept: capability.content.expectedContentTypes.join(', '),
        'accept-encoding': capability.content.permittedContentEncodings.join(', '),
        'user-agent': 'rmr-source-ingestion/1',
      };
      if (conditions.etag) requestHeaders['if-none-match'] = conditions.etag;
      if (conditions.lastModified) requestHeaders['if-modified-since'] = conditions.lastModified;

      const response = await withTimeout(
        this.transport.request({
          headers: requestHeaders,
          timeoutMs: capability.content.timeoutMs,
          url: url.toString(),
        }),
        capability.content.timeoutMs,
      );
      if (!addresses.includes(response.peerAddress)) {
        throw new SourceRetrievalError(
          'DNS_REBINDING',
          'Connected peer did not match the validated DNS result.',
          false,
        );
      }

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = header(response.headers, 'location');
        if (location === undefined || redirects >= capability.content.maximumRedirects) {
          throw new SourceRetrievalError(
            'REDIRECT_BLOCKED',
            'Source redirect was rejected.',
            false,
          );
        }
        url = parseRequestUrl(new URL(location, url).toString(), capability);
        redirects += 1;
        continue;
      }

      if (response.status === 304) {
        return Object.freeze({
          body: new Uint8Array(),
          contentEncoding: 'identity',
          contentType: 'application/octet-stream',
          decodedBytes: 0,
          etag: header(response.headers, 'etag') ?? null,
          lastModified: header(response.headers, 'last-modified') ?? null,
          notModified: true,
          peerAddress: response.peerAddress,
          retrievedUrl: url.toString(),
          sha256: createHash('sha256').update(response.body).digest('hex'),
          status: response.status,
          wireBytes: 0,
        });
      }
      if (response.status < 200 || response.status >= 300) {
        throw new SourceRetrievalError(
          'HTTP_STATUS',
          `Source returned HTTP ${response.status}.`,
          response.status === 408 || response.status === 429 || response.status >= 500,
        );
      }

      const contentType = (header(response.headers, 'content-type') ?? '')
        .split(';', 1)[0]
        ?.trim()
        .toLowerCase();
      if (!contentType || !capability.content.expectedContentTypes.includes(contentType)) {
        throw new SourceRetrievalError(
          'INVALID_CONTENT_TYPE',
          'Source response content type is not allowlisted.',
          false,
        );
      }
      const contentEncoding = (header(response.headers, 'content-encoding') ?? 'identity')
        .trim()
        .toLowerCase();
      if (
        !capability.content.permittedContentEncodings.includes(
          contentEncoding as 'identity' | 'gzip' | 'br',
        )
      ) {
        throw new SourceRetrievalError(
          'INVALID_CONTENT_ENCODING',
          'Source response content encoding is not allowlisted.',
          false,
        );
      }
      const wireBytes = response.wireBytes ?? response.body.byteLength;
      const decodedBytes = response.decodedBytes ?? response.body.byteLength;
      if (
        wireBytes > capability.content.maximumWireBytes ||
        decodedBytes > capability.content.maximumDecodedBytes ||
        decodedBytes > Math.max(1, wireBytes) * capability.content.maximumExpansionRatio
      ) {
        throw new SourceRetrievalError(
          'RESPONSE_TOO_LARGE',
          'Source response exceeded wire, decoded, or expansion limits.',
          false,
        );
      }

      return Object.freeze({
        body: response.body,
        contentEncoding,
        contentType,
        decodedBytes,
        etag: header(response.headers, 'etag') ?? null,
        lastModified: header(response.headers, 'last-modified') ?? null,
        notModified: false,
        peerAddress: response.peerAddress,
        retrievedUrl: url.toString(),
        sha256: createHash('sha256').update(response.body).digest('hex'),
        status: response.status,
        wireBytes,
      });
    }
  }
}
