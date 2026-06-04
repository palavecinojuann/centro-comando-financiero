const CACHE_NAME = 'equilibra-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalar Service Worker y guardar recursos básicos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar y remover cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar llamadas locales (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Evitar interceptar llamadas a APIs de terceros (como Firebase) o a /api
  if (url.origin === self.location.origin) {
    if (event.request.method === 'GET' && !url.pathname.startsWith('/api')) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Actualización asíncrona en background
            fetch(event.request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            }).catch(() => {/* Ignorar caídas de conexión */});
            return cachedResponse;
          }
          return fetch(event.request);
        })
      );
    }
  }
});
