const CACHE = "ih-call-v3";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([
    "/", "/index.html", "/styles.css", "/doctor.html", "/doctor.js", "/reception.html", "/reception.js"
  ])));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
