// ================================================================
//   service-worker.js - v5 (مبسّط: index + header فقط)
// ================================================================

const CACHE_NAME = 'heaven-aljabri-v5';

const FILES_TO_CACHE = [
  './',
  'index.html',
  'header.html'
];

// ================================================================
//   التثبيت
// ================================================================
self.addEventListener('install', event => {
  console.log('📦 [SW v5] بدء التثبيت...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        FILES_TO_CACHE.map(url => {
          return cache.add(url).then(() => {
            console.log(`✅ [SW] تم تخزين: ${url}`);
          }).catch(err => {
            console.warn(`⚠️ [SW] فشل تخزين: ${url}`, err.message);
          });
        })
      );
    }).then(() => {
      console.log('✅ [SW v5] تم التثبيت');
      return self.skipWaiting();
    })
  );
});

// ================================================================
//   التفعيل
// ================================================================
self.addEventListener('activate', event => {
  console.log('🔄 [SW v5] بدء التفعيل...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log(`🗑️ [SW] حذف الكاش القديم: ${k}`);
          return caches.delete(k);
        })
      );
    }).then(() => {
      console.log('✅ [SW v5] تم التفعيل');
      return self.clients.claim();
    })
  );
});

// ================================================================
//   الجلب (Fetch)
// ================================================================
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 &&
            event.request.url.startsWith('http')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
    })
  );
});

console.log('🌴 [SW v5] جاهز — index.html + header.html فقط');