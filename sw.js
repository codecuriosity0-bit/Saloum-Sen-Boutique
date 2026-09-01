// Nom du cache : changez le "v1" en "v2", "v3"... à chaque mise à jour importante
// pour forcer les téléphones à récupérer les nouveaux fichiers.
const CACHE_NAME = 'saloum-admin-v1';

// Ajoutez ici les fichiers CSS/JS que admin.html charge, par ex. 'admin.css', 'admin.js'
const URLS_TO_CACHE = [
  'admin.html'
];

// Étape 1 : à l'installation, on met les fichiers de base en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Étape 2 : on nettoie les anciens caches quand une nouvelle version s'active
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Étape 3 : on sert depuis le cache si possible, sinon depuis le réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
