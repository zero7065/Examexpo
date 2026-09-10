importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');
workbox.setConfig({ debug: false });

const isSameOrigin = ({ url }) => url.origin === self.location.origin;

// Only cache same-origin page navigations
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document' && isSameOrigin({ url: self.location }),
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 5,
    plugins: [
      {
        cacheDidUpdate: async ({ cacheName }) => {
          // Notify clients when cache updates
          const clients = await self.clients.matchAll();
          clients.forEach(client => client.postMessage({ type: 'CACHE_UPDATED', cacheName }));
        }
      }
    ]
  })
);

// Cache JS/CSS assets with stale-while-revalidate
workbox.routing.registerRoute(
  ({ request, url }) => (request.destination === 'script' || request.destination === 'style') && url.origin === self.location.origin,
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'assets' })
);

// Cache images with cache-first
workbox.routing.registerRoute(
  ({ url }) => /\.(png|svg|jpg|jpeg|webp|ico)$/.test(url.pathname) && url.origin === self.location.origin,
  new workbox.strategies.CacheFirst({ cacheName: 'images' })
);

// DO NOT intercept Firestore or Auth API calls — let the browser handle them directly
// This prevents the SW from caching failed auth responses

// Handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
