// file= sw.js
const CACHE_NAME = 'yemen-library-v5'; // زود الرقم مع كل تحديث كبير
const urlsToCache = [
  './', // الصفحة الرئيسية
  'index.html',
  'Sindbad.html',
  'Yemen-Sindbad.html',
  'Yemen-bird.html',
  'Yemen-Ankboot.html',
  'Pages-Researches.html',
  'Yemen-library.html',
  'Config.js', // مهم جدا
  'Logo.png', // اللي في Config
  'Image/Jabri-photo.png'
];

// 1. التثبيت: خبّي كل الملفات اول مرة
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
    .then(() => self.skipWaiting()) // فعل النسخة الجديدة فورا
  );
});

// 2. التنظيف: امسح الكاش القديم v4 لما تنزل v5
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 3. الجلب: Cache First = مخبأ اول، نت ثاني
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
    .then(response => response || fetch(e.request).catch(() => {
      // لو مافي نت والملف مش مخبأ، رجع الصفحة الرئيسية
      return caches.match('./');
    }))
  );
});
