// 每次改版都要把版本號 +1，手機上的舊快取才會被清掉
const CACHE_NAME = 'yoshino-mooncake-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 一律先走網路，並把抓到的新版順手存進快取，
// 這樣離線時的備援永遠是「最後一次看到的版本」，不會卡在很舊的那份
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(res => {
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(event.request))
  );
});
