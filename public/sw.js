/**
 * Service Worker for Louis Polo GS1 Product Entry
 *
 * Strategy:
 *   - App shell (HTML, CSS, JS, fonts): Cache-first with network fallback
 *   - API calls (Apps Script, Cloudinary): Network-first (always fresh data)
 *   - Images: Cache-first with network fallback
 *
 * This ensures the app loads instantly on repeat visits, even on
 * flaky factory Wi-Fi, while always fetching fresh product data.
 */

const CACHE_NAME = "lp-gs1-v2"

/** Resources to pre-cache on install */
const PRECACHE_URLS = [
  "/",
  "/index.html",
]

/** Domains that should always go network-first (API calls) */
const NETWORK_FIRST_DOMAINS = [
  "script.google.com",
  "api.cloudinary.com",
]

// ── Install: pre-cache app shell ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate: clean old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: route requests by strategy ──
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Network-first for API calls — always get fresh data
  if (NETWORK_FIRST_DOMAINS.some(d => url.hostname.includes(d))) {
    event.respondWith(networkFirst(event.request))
    return
  }

  // Cache-first for everything else (app shell, fonts, images)
  event.respondWith(cacheFirst(event.request))
})

/**
 * Cache-first strategy.
 * Try cache → fall back to network → cache the response for next time.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Offline and not cached — return a simple offline message
    return new Response("Offline", { status: 503, statusText: "Offline" })
  }
}

/**
 * Network-first strategy.
 * Try network → fall back to cache (for API resilience).
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response(
      JSON.stringify({ status: "error", message: "Offline" }),
      { headers: { "Content-Type": "application/json" }, status: 503 }
    )
  }
}
