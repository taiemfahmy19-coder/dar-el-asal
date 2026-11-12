/*
 * Dar El Asal & Olive — Service Worker
 * ------------------------------------
 * SAFE caching policy:
 *   0. Personal routes (admin, auth, checkout, orders, account, favorites) and
 *      ALL /api/* are NETWORK-ONLY — never written to any cache, ever. RSC
 *      prefetch flights are treated the same (they can carry fragments of
 *      private views).
 *   1. HTML navigations are ALWAYS network-first → users on an open tab get
 *      the freshly deployed build the moment they reload/visit (the old
 *      version can never keep running after a new publish). The cache is
 *      only an offline fallback.
 *   2. /api/* is NEVER cached (auth, orders, admin data stay live & private).
 *   3. Immutable Next.js chunks (/_next/static) are cache-first (hashed URLs).
 *   4. Icons / images are cache-first with a versioned cache; bumping
 *      SW_VERSION below purges every old cache on activation.
 *   5. skipWaiting + clientsClaim → the new worker takes over immediately.
 *
 * ⚠️ bump SW_VERSION in the SAME commit as every production release.
 */
const SW_VERSION = 'dar-pwa-v3-2026-11-12-legal-contact';
const STATIC_CACHE = `dar-static-${SW_VERSION}`;
const RUNTIME_CACHE = `dar-runtime-${SW_VERSION}`;
const OFFLINE_URL = '/';

const PRECACHE_URLS = [
  OFFLINE_URL,
  '/products',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // Cache each core file independently — one failing asset must never
      // break the whole installation.
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      );
      // takeover ASAP: a newly published build must activate right away
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Purge every cache that does not belong to the current version
      const names = await caches.keys();
      const keep = new Set([STATIC_CACHE, RUNTIME_CACHE]);
      await Promise.all(
        names
          .filter((n) => !keep.has(n) && n.startsWith('dar-'))
          .map((n) => caches.delete(n))
      );
      await self.clientsClaim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isPrivateApi(url) {
  return url.pathname.startsWith('/api/');
}

/** Never cache anything personal: admin/auth/checkout/orders/account pages */
function isPersonalRoute(url) {
  const p = url.pathname;
  return ['/admin', '/auth', '/checkout', '/orders', '/account', '/favorites'].some(
    (prefix) => p === prefix || p.startsWith(prefix + '/')
  );
}

function isImmutableStatic(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:png|jpe?g|webp|avif|svg|woff2?|css)$/i.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never touch cross-origin traffic, non-GET, or anything personal/private.
  // This includes ALL /api/* calls, personal pages, and RSC prefetch flights
  // (which can embed fragments of account/admin views) — network only.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivateApi(url)) return; // network-only (privacy + freshness)
  if (isPersonalRoute(url)) return; // checkout/account/orders never cached
  if (request.headers.get('RSC') || request.headers.get('Next-Router-Prefetch')) {
    return; // React Server Component flights stay live
  }

  // 1) Document navigations: network-first, cache only as OFFLINE fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch (err) {
          const cache = await caches.open(RUNTIME_CACHE);
          const cached =
            (await cache.match(request)) || (await caches.match(OFFLINE_URL));
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // 2) Immutable/hashed assets: cache-first, refresh in the background
  if (isImmutableStatic(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch (err) {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // 3) Everything else same-origin: network-first with runtime fallback
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch (err) {
        const cached = await caches.match(request);
        return cached || Response.error();
      }
    })()
  );
});
