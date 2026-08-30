
const CACHE_NAME = 'c7-attendance-cache-v1';
const APP_SHELL = [
  './',
  './index.html'
];
 
// Install: pre-cache the app shell, activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // Ignore pre-cache errors (e.g. offline on first install)
      })
  );
});
 
// Activate: clean up any old cache versions and take control right away
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    ).then(() => self.clients.claim())
  );
});
 
// Fetch: network-first, cache as a fallback for offline use
self.addEventListener('fetch', (event) => {
  // Only handle GET requests; let everything else (like POSTs to the
  // Google Apps Script API) go straight to the network untouched.
  if (event.request.method !== 'GET') {
    return;
  }
 
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
 
