/* Simple PWA service worker for GitHub Pages project `/Interview-/` */
const VERSION = 'v1.0.0';
const APP_SCOPE = '/Interview-/';
const PRECACHE = [
  APP_SCOPE,
  APP_SCOPE + 'index.html',
  APP_SCOPE + 'offline.html',
  APP_SCOPE + 'manifest.webmanifest',
  // Add your CSS/JS assets below when known, e.g.:
  // APP_SCOPE + 'styles.css',
  // APP_SCOPE + 'app.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== VERSION ? caches.delete(k) : Promise.resolve())));
    await self.clients.claim();
  })());
});

// Network-first for navigation requests (HTML), fallback to offline.html
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle our scope
  const url = new URL(request.url);
  if (!url.pathname.startsWith(APP_SCOPE)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const net = await fetch(request);
        // Cache a copy in background
        const cache = await caches.open(VERSION);
        cache.put(request, net.clone());
        return net;
      } catch (err) {
        const cache = await caches.open(VERSION);
        const cached = await cache.match(request);
        return cached || cache.match(APP_SCOPE + 'offline.html');
      }
    })());
    return;
  }

  // For same-origin static assets: cache-first, then network
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const res = await fetch(request);
        if (res && res.status === 200 && res.type === 'basic') {
          cache.put(request, res.clone());
        }
        return res;
      } catch (err) {
        return cached; // may be undefined
      }
    })());
  }
});
