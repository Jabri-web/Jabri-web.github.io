// ================================================================
//   service-worker.js - v6.0 - SEO Safe + Network First for HTML
//   Z+C+A=1 - Heaven Al-Jabri
// ================================================================

const CACHE_NAME = 'heaven-aljabri-v6.0';
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/logo.html',
  '/about-waha.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// الملفات اللي لازم NEVER تتكاش
const NEVER_CACHE = [
  '/sw.js',
  '/sitemap.xml',
  '/sitemap-',
  '/robots.txt',
  '/vercel.json'
];

// ================================================================
//  📥 Install
// ================================================================
self.addEventListener('install', event => {
  console.log(`📦 [SW ${CACHE_NAME}] Install...`);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_CACHE.map(url => {
        return new Request(url, { cache: 'reload' });
      }));
    }).then(() => self.skipWaiting())
  );
});

// ================================================================
//  🔄 Activate - مسح شامل
// ================================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
    .then(() => {
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED', version: CACHE_NAME }));
      });
    })
  );
});

// ================================================================
//  🌐 Fetch - استراتيجية ذكية
// ================================================================
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  const reqUrl = new URL(url);
  
  // 1. لا تتدخل في الخارجي + ملفات NEVER_CACHE
  if (!url.startsWith(self.location.origin) || NEVER_CACHE.some(p => url.includes(p))) {
    return;
  }
  
  // 2. HTML = Network First (مهم جدا للـ SEO!)
  if (event.request.mode === 'navigate' || reqUrl.pathname.endsWith('.html') || reqUrl.pathname === '/') {
    event.respondWith(
      fetch(event.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }
  
  // 3. الصور والأيقونات والـ JS/CSS = Cache First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      });
    })
  );
});

// ================================================================
//  💬 Messages
// ================================================================
self.addEventListener('message', event => {
  if (event.data?.action === 'skipWaiting') self.skipWaiting();
  if (event.data?.action === 'checkVersion') {
    event.source?.postMessage({ type: 'VERSION_INFO', version: CACHE_NAME });
  }
});

console.log(`🌴 [SW ${CACHE_NAME}] Ready - SEO Safe Mode`);