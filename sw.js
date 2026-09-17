const CACHE_NAME = "huisritme-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            // Only cache successful same-origin GET requests
            if (
              event.request.method === "GET" &&
              response &&
              response.status === 200 &&
              response.type === "basic"
            ) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) =>
                cache.put(event.request, responseClone)
              );
            }
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
