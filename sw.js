// ================================================================
//   service-worker.js - v5.1 (نظام إصدارات + تحكم كامل)
//   👑 CACHE_NAME = مفتاح التحكم بالإصدارات
// ================================================================

// ================================================================
//  🎯 رقم الإصدار (غيّره فقط — الباقي يعمل تلقائياً)
// ================================================================
const CACHE_NAME = 'heaven-aljabri-v5.1';
//                    ^^^^^^^^^^^^^^^^^^^^^
//  v5.1  → تحديث صامت (في الخلفية)
//  v5.5  → تحديث عند إعادة فتح التطبيق
//  v6.0  → تحديث فوري (مع رسالة للمستخدم)

// ================================================================
//  📦 الملفات المخزّنة (index + header فقط)
// ================================================================
const FILES_TO_CACHE = [
  './',
  'index.html',
  'header.html'
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
      // 🚀 تفعيل فوري — بدون انتظار إغلاق التبويبات
      return self.skipWaiting();
    })
  );
});

// ================================================================
//  🔄 التفعيل (Activate) — حذف الكاش القديم
// ================================================================
self.addEventListener('activate', event => {
  console.log(`🔄 [SW ${CACHE_NAME}] بدء التفعيل...`);
  
  event.waitUntil(
    caches.keys().then(keys => {
      // 🗑️ حذف كل الكاشات القديمة
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log(`🗑️ [SW] حذف الكاش القديم: ${k}`);
          return caches.delete(k);
        })
      );
    }).then(() => {
      console.log(`✅ [SW ${CACHE_NAME}] تم التفعيل`);
      // 👑 السيطرة على كل التبويبات المفتوحة
      return self.clients.claim();
    }).then(() => {
      // 📢 إبلاغ كل الصفحات بالتحديث
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
  // تجاهل الطلبات غير GET
  if (event.request.method !== 'GET') return;
  
  // تجاهل الطلبات الخارجية (Google Analytics, Fonts)
  const url = event.request.url;
  if (!url.startsWith(self.location.origin)) {
    return; // دعها تمر عبر الشبكة
  }
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // ✅ إذا كان في الكاش → أعده فوراً
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // ⚠️ ليس في الكاش → اجلبه من الشبكة
      return fetch(event.request)
        .then(networkResponse => {
          // 💾 خزّن نسخة للاستخدام المستقبلي
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 🚨 فشل الشبكة → أعد offline.html أو index
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
  
  // 🚀 skipWaiting — تفعيل فوري
  if (event.data.action === 'skipWaiting') {
    console.log('🚀 [SW] تفعيل فوري بناءً على طلب الصفحة');
    self.skipWaiting();
  }
  
  // 🔍 فحص الإصدار — طلب من الصفحة
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
console.log(`🌴 [SW ${CACHE_NAME}] جاهز — index.html + header.html فقط`);
console.log('👑 للتحكم بالإصدارات: غيّر CACHE_NAME فقط');