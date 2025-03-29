// This is the service worker file for the PWA

// Cache name with version
const CACHE_NAME = "libreanvil-cache-v1"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-192x192.png",
  "/icons/icon-maskable-512x512.png",
]

// Map tile URLs to cache
const TILE_CACHE_NAME = "libreanvil-tiles-v1"
const MAX_TILE_CACHE_SIZE = 1000 // Maximum number of tiles to cache

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith("libreanvil-") && cacheName !== CACHE_NAME && cacheName !== TILE_CACHE_NAME
          })
          .map((cacheName) => {
            return caches.delete(cacheName)
          }),
      )
    }),
  )
})

// Helper function to determine if a request is for a map tile
function isTileRequest(url) {
  return url.includes("tile.openstreetmap.org")
}

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Handle tile requests separately
  if (isTileRequest(url.href)) {
    event.respondWith(handleTileRequest(event.request))
    return
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      // Clone the request because it's a one-time use stream
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If fetch fails (offline), return a fallback
          if (event.request.mode === "navigate") {
            return caches.match("/")
          }

          return new Response("Network error occurred", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          })
        })
    }),
  )
})

// Handle tile requests with a separate cache
async function handleTileRequest(request) {
  // Try to get from cache first
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  // If not in cache, fetch from network
  try {
    const response = await fetch(request)

    // Cache the tile if response is valid
    if (response.ok) {
      const cache = await caches.open(TILE_CACHE_NAME)
      cache.put(request, response.clone())

      // Manage cache size
      limitCacheSize(TILE_CACHE_NAME, MAX_TILE_CACHE_SIZE)
    }

    return response
  } catch (error) {
    console.error("Error fetching tile:", error)
    // Return a transparent tile as fallback
    return new Response(null, {
      status: 204,
    })
  }
}

// Limit the size of the cache
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length > maxItems) {
    // Delete oldest items (first 20% of max)
    const deleteCount = Math.floor(maxItems * 0.2)
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i])
    }
  }
}

// Handle sync events for offline changes
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-maps") {
    event.waitUntil(syncMaps())
  }
})

// Sync maps data when online
async function syncMaps() {
  // This would typically sync with a server
  // For this offline-only app, we're just ensuring data is saved to localStorage
  // which happens in the main app code
  console.log("🗺️🔁 Maps synced")
}

