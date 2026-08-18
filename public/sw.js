// FoodDrop PWA Service Worker
const CACHE_NAME = "fooddrop-cache-v1";
const PRECACHE_ASSETS = [
  "/",
  "/icons/icon.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("PWA: Pre-caching non-fatal warning", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network First for API/pages, Cache fallback for static icons)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin and API POST/PATCH/DELETE requests from caching
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Static Assets (Images, Icons, Fonts) -> Cache First with Network Fallback
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML / App Navigation -> Network First with Offline Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return caches.match("/");
        });
      })
  );
});

// Push Notification Event (Ready for future push triggers)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || "FoodDrop Notification";
    const options = {
      body: data.body || "You have a new update on FoodDrop!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: {
        url: data.url || "/",
      },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // quiet
  }
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
