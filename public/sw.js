// Minimal service worker to satisfy Chrome's installability criteria.
// This does NOT cache anything or provide offline support — it simply
// passes all requests through to the network so Chrome treats the site
// as an installable web app.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
