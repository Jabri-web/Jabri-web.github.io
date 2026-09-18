const CACHE_NAME = 'heaven-al-jabri-v8.6-final';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.add('/')).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE_NAME).map(x => caches.delete(x)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  if (e.request.url.includes('sw.js') || e.request.url.includes('sitemap') || e.request.url.includes('vercel.json')) return;
  
  // للصفحات: جيب من الشبكة أولاً، لو 404 رجع 404 نفسه (لا ترجع logo)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        return res; // حتى لو 404 - رجعه كما هو
      }).catch(() => {
        // فقط لو مافي نت نهائياً
        return caches.match('/') || new Response('Offline', { status: 503 });
      })
    );
    return;
  }
  
  // للصور والملفات: من الكاش أولاً
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request))
  );
});