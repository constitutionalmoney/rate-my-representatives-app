const stableProfileId = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/u;

export function resolveWebApiOrigin(locationOrigin: string, configuredOrigin?: string): string {
  const candidate = configuredOrigin?.trim() || locationOrigin;
  let parsed: URL;
  let location: URL;
  try {
    parsed = new URL(candidate);
    location = new URL(locationOrigin);
  } catch {
    throw new Error('The public API origin is invalid.');
  }
  const localHttp =
    parsed.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(parsed.hostname);
  if (
    (parsed.protocol !== 'https:' && !localHttp) ||
    parsed.username.length > 0 ||
    parsed.password.length > 0 ||
    parsed.pathname !== '/' ||
    parsed.search.length > 0 ||
    parsed.hash.length > 0 ||
    (parsed.origin !== location.origin && !localHttp)
  ) {
    throw new Error('The public API origin is not allowed.');
  }
  return parsed.origin;
}

export function publicProfileIdFromPath(pathname: string): string | null {
  const match = /^\/app\/profiles\/([^/]+)\/?$/u.exec(pathname);
  if (match === null) return null;
  try {
    const profileId = decodeURIComponent(match[1] ?? '');
    return stableProfileId.test(profileId) ? profileId : null;
  } catch {
    return null;
  }
}
