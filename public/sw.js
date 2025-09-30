// Bump this to force clients to fetch latest files after deploy
const CACHE = "ih-call-v4";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([
      "/", "/index.html", "/styles.css",
      "/doctor.html?v=4", "/doctor.js?v=4",
      "/reception.html?v=4", "/reception.js?v=4",
      "/config.js?v=4"
    ]))
  );
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
