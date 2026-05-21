importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');
workbox.setConfig({ debug: false });

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({ cacheName: 'pages', networkTimeoutSeconds: 3 })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'assets' })
);

workbox.routing.registerRoute(
  /\.(png|svg|jpg|jpeg|webp|ico)$/,
  new workbox.strategies.CacheFirst({ cacheName: 'images' })
);

workbox.routing.registerRoute(
  /^https:\/\/firestore\.googleapis\.com\/.*/i,
  new workbox.strategies.NetworkFirst({ cacheName: 'firebase-cache', networkTimeoutSeconds: 10 })
);
