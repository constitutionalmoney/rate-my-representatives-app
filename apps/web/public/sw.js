const STATIC_CACHE = 'rmr-static-v1';
const PUBLIC_RECORD_CACHE = 'rmr-public-records-v1';
const SHELL = ['/', '/manifest.webmanifest', '/app-icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, PUBLIC_RECORD_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheName, requirePublicResponse = false) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    const cacheControl = response.headers.get('cache-control') ?? '';
    if (response.ok && (!requirePublicResponse || cacheControl.includes('public'))) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = (await cache.match(request)) ?? (await cache.match('/'));
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if (url.pathname.startsWith('/api/v1/profiles') && !request.headers.has('authorization')) {
    event.respondWith(networkFirst(request, PUBLIC_RECORD_CACHE, true));
    return;
  }
  if (url.pathname.startsWith('/api/')) return;
  if (
    url.pathname.startsWith('/assets/') ||
    ['/app-icon.svg', '/manifest.webmanifest', '/sw.js'].includes(url.pathname)
  ) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
  }
});
