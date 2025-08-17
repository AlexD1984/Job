/* Service Worker for GitHub Pages project `/Interview-/` */
const VERSION = 'v1.1.0';
const APP_SCOPE = '/Interview-/';
const PRECACHE_URLS = [
  APP_SCOPE,
  APP_SCOPE + 'index.html',
  APP_SCOPE + 'offline.html',
  APP_SCOPE + 'manifest.webmanifest',
  // Also cache Tailwind CDN once seen
  'https://cdn.tailwindcss.com/'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    try {
      await cache.addAll(PRECACHE_URLS);
    } catch(e) {
      // Ignore failures for cross-origin precache if any
      console.warn('Precache warning:', e);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== VERSION ? caches.delete(k) : Promise.resolve())));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // App navigations: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const network = await fetch(request);
        const cache = await caches.open(VERSION);
        cache.put(request, network.clone());
        return network;
      } catch (err) {
        const cache = await caches.open(VERSION);
        const cached = await cache.match(request);
        return cached || cache.match(APP_SCOPE + 'offline.html');
      }
    })());
    return;
  }

  // Same-origin assets: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const res = await fetch(request);
        if (res && (res.ok || res.type === 'opaque')) {
          cache.put(request, res.clone());
        }
        return res;
      } catch (err) {
        return cached; // may be undefined
      }
    })());
    return;
  }

  // Tailwind CDN and other cross-origin GETs: cache-first
  if (url.hostname.includes('cdn.tailwindcss.com')) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const res = await fetch(request, { mode: 'cors' });
        if (res && (res.ok || res.type === 'opaque')) {
          cache.put(request, res.clone());
        }
        return res;
      } catch (err) {
        return cached; // may be undefined
      }
    })());
  }
});
