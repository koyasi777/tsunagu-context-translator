const CACHE_NAME = 'translator-cache-v1';
const ASSETS = [
    '/Translator-Tsunagu-For-You/',
    '/Translator-Tsunagu-For-You/index.html',
    '/Translator-Tsunagu-For-You/app.js',
    '/Translator-Tsunagu-For-You/manifest.json',
    '/Translator-Tsunagu-For-You/icons/icon-192x192.png',
    '/Translator-Tsunagu-For-You/icons/icon-512x512.png',
    '/Translator-Tsunagu-For-You/offline.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
            .catch(() => caches.match('/Translator-Tsunagu-For-You/offline.html'))
    );
});
