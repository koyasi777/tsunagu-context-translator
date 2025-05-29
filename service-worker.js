const CACHE_PREFIX = 'translator-cache'; // 残ってるキャッシュのprefix

// install（特に何もしない。skipWaitingは早めに反映のため入れておく）
self.addEventListener('install', event => {
    self.skipWaiting();
});

// activate時に「translator-cache」から始まるキャッシュを全削除
self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(key => key.startsWith(CACHE_PREFIX))
                    .map(key => caches.delete(key))
            );
            self.clients.claim();
        })()
    );
});

// fetchは全部ネットに流す（キャッシュを一切使わない！）
self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
});
