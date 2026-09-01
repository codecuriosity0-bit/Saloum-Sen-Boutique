const CACHE_NAME = "ssb-admin-v1";
const urlsToCache = [
  "./admin.html",
  "./manifest.json"
  // ajoutez ici vos fichiers CSS/JS séparés s'il y en a
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
