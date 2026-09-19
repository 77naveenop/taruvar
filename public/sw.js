const CACHE_NAME = 'taruvar-cache-v4';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/logo.jpg',
  '/favicon.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old service worker cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore non-http/https requests (e.g. chrome-extension://, moz-extension://)
  if (!url.protocol.startsWith('http')) return;

  // Bypass service worker completely for API requests, GitHub, HTML documents, and JS bundles
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api') ||
    url.hostname.includes('github.com') ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, resClone).catch(() => {});
            });
          }
          return response;
        })
        .catch(() => {
          return new Response('Offline resource', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});
