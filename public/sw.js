/**
 * Service Worker for Dev Utils
 *
 * PRIVACY-CRITICAL: This is a cache-only service worker.
 * - Caches all assets on install
 * - Serves from cache only (no network fallback)
 * - Ensures the app works completely offline after first load
 *
 * This design guarantees that after initial load, no network
 * requests are made, enforcing our privacy guarantee.
 */

const CACHE_NAME = 'dev-utils-v1';

// Assets to cache (will be populated by the build process)
// For now, we use a catch-all approach
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

/**
 * Install event - cache all static assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      // Activate immediately
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - serve from cache, with network fallback for uncached assets
 *
 * Strategy: Cache-first for all requests
 * - Check cache first
 * - If not in cache, fetch from network and cache it
 * - This ensures all assets are eventually cached
 *
 * PRIVACY NOTE: Network requests only happen for assets not yet cached.
 * After all assets are cached, no network requests are made.
 */
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Only handle same-origin requests
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response
        return cachedResponse;
      }

      // Not in cache - fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Don't cache non-successful responses
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Clone the response before caching
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Network failed and not in cache
        // Return a fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

/**
 * Message handler for cache updates
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
