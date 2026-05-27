importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');
workbox.setConfig({ debug: false });

// Skip external URLs — only cache assets from our origin
const isSameOrigin = ({ url }) => url.origin === self.location.origin;

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document' && isSameOrigin({ url: self.location }),
  new workbox.strategies.NetworkFirst({ cacheName: 'pages', networkTimeoutSeconds: 3 })
);

workbox.routing.registerRoute(
  ({ request, url }) => (request.destination === 'script' || request.destination === 'style') && url.origin === self.location.origin,
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'assets' })
);

workbox.routing.registerRoute(
  ({ url }) => /\.(png|svg|jpg|jpeg|webp|ico)$/.test(url.pathname) && url.origin === self.location.origin,
  new workbox.strategies.CacheFirst({ cacheName: 'images' })
);

workbox.routing.registerRoute(
  ({ url }) => url.origin === 'https://firestore.googleapis.com',
  new workbox.strategies.NetworkFirst({ cacheName: 'firebase-cache', networkTimeoutSeconds: 10 })
);

// Catch-all for same-origin fetches that might fail
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin) || event.request.url.includes('firestore.googleapis.com')) {
    return;
  }
  // Let external requests pass through without SW intervention
  event.respondWith(fetch(event.request).catch(() => new Response(null, { status: 408 })));
});

// Handle message events to prevent "channel closed" errors
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
