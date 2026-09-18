const CACHE_NAME = 'heaven-al-jabri-v8.1-gold';
const CORE_ASSETS = ['/', '/logo.html', '/manifest.json'];
const NEVER_CACHE = ['/sw.js', '/sitemap.xml', '/robots.txt', '/vercel.json'];
const FETCH_TIMEOUT = 3000;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => Promise.allSettled(CORE_ASSETS.map(u => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED', version: CACHE_NAME })))
  );
});

function timeoutFetch(req, ms) {
  return Promise.race([
    fetch(req),
    new Promise((_, rej) => setTimeout(() => rej(new Error('SW-timeout')), ms))
  ]);
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  if (!url.startsWith(self.location.origin)) return;
  if (NEVER_CACHE.some(p => url.endsWith(p))) return;

  // HTML — Network First + timeout
  if (e.request.mode === 'navigate' || e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      timeoutFetch(e.request, FETCH_TIMEOUT)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(async () =>
          (await caches.match(e.request)) ||    // ← فقط الصفحة المطلوبة
          (await caches.match('/')) ||           // ← ثم الصفحة الرئيسية
          new Response('Offline', { status: 503 })
        )
    );
    return;
  }

  // Static — Stale While Revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = timeoutFetch(e.request, FETCH_TIMEOUT)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(async () => {
          if (e.request.destination === 'image') {
            return (await caches.match('/image/Yemen2026.png')) ||
                   new Response('', { status: 404 });
          }
          return cached || new Response('', { status: 504 });
        });
      return cached || network;
    })
  );
});

self.addEventListener('message', e => {
  if (e.data?.action === 'skipWaiting' || e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.action === 'checkVersion')
    e.source?.postMessage({ type: 'VERSION_INFO', version: CACHE_NAME });
});