// Force-unregister old service workers and clear all caches
// Call this once on app load to fix stale SW issues
export async function clearOldServiceWorker() {
  try {
    // Unregister ALL service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    }

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }
    }

    return true;
  } catch (e) {
    console.warn("SW cleanup failed:", e);
    return false;
  }
}
