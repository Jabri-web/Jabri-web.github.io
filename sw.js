// ================================================================
//   service-worker.js - v5.2 (تحديث صامت + مسح أسرع للكاش)
//   👑 CACHE_NAME = مفتاح التحكم بالإصدارات
// ================================================================

const CACHE_NAME = 'heaven-aljabri-v5.2';

// 📦 الملفات المخزّنة (index + header + logo فقط)
const FILES_TO_CACHE = [
  './',
  'index.html',
  'header.html',
  'logo.html', // ✅ تم استبدال Page12.html
  'about-waha.html' // ✅ صفحة الواحة
];

// ================================================================
//  📥 التثبيت (Install)
// ================================================================
self.addEventListener('install', event => {
  console.log(`📦 [SW ${CACHE_NAME}] بدء التثبيت...`);
  
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
      console.log(`✅ [SW ${CACHE_NAME}] تم التثبيت`);
      return self.skipWaiting(); // 🚀 تفعيل فوري
    })
  );
});

// ================================================================
//  🔄 التفعيل (Activate) — حذف الكاش القديم (مسح أسرع)
// ================================================================
self.addEventListener('activate', event => {
  console.log(`🔄 [SW ${CACHE_NAME}] بدء التفعيل...`);
  
  event.waitUntil(
    caches.keys().then(keys => {
      // 🗑️ حذف كل الكاشات القديمة (مسح أسرع)
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log(`🗑️ [SW] حذف الكاش القديم: ${k}`);
          return caches.delete(k);
        })
      );
    }).then(() => {
      console.log(`✅ [SW ${CACHE_NAME}] تم التفعيل`);
      return self.clients.claim(); // 👑 السيطرة على كل التبويبات
    }).then(() => {
      // 📢 إبلاغ كل الصفحات بالتحديث (هذا ما سيُظهر الـ Popup)
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          console.log('📢 [SW] إبلاغ الصفحة بالتحديث');
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_NAME
          });
        });
      });
    })
  );
});

// ================================================================
//  🌐 الجلب (Fetch) — Cache First, Network Fallback
// ================================================================
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = event.request.url;
  if (!url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
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
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
    })
  );
});

// ================================================================
//  💬 الرسائل من الصفحات (Messages)
// ================================================================
self.addEventListener('message', event => {
  if (!event.data) return;
  
  if (event.data.action === 'skipWaiting') {
    console.log('🚀 [SW] تفعيل فوري بناءً على طلب الصفحة');
    self.skipWaiting();
  }
  
  if (event.data.action === 'checkVersion') {
    event.source.postMessage({
      type: 'VERSION_INFO',
      version: CACHE_NAME,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================================================
//  🎯 جاهز!
// ================================================================
console.log(`🌴 [SW ${CACHE_NAME}] جاهز — logo.html + index.html + الصفحات الأساسية`);
console.log('👑 للتحكم بالإصدارات: غيّر CACHE_NAME فقط');