/**
 * Portfolio Service Worker
 * Network-first dengan cache fallback (konten selalu segar, tetap bisa offline).
 */
const CACHE_NAME = "fauzan-portfolio-v3.1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./assets/css/main.css",
  "./assets/css/app.css",
  "./assets/js/app.js",
  "./assets/vendor/bootstrap.min.css",
  "./assets/vendor/bootstrap.bundle.min.js",
  "./assets/icons/favicon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-192.png",
  "./founder-v2.jpg",
  "./manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  // Hanya same-origin. Font/CDN pihak ketiga dibiarkan lewat langsung.
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./")))
  );
});
