const CACHE_NAME = 'heaven-aljabri-v4';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/image/Jabri-photo.webp',
  '/music.mp3',
  '/Sindbad-Brdoni.html',
  '/Nezar.html',
  '/offline.html',
  '/Page1.html',
  '/Page2.html',
  '/Page11.html',
  '/Page12.html',
  '/Yemen-library.html',
  '/Router-all.html',
  '/Dbase.html',
  '/research.html',
  '/Pages-Researches.html',
  '/Office.html',
  '/Check.html',
  '/about.html',
  '/about-ar.html',
  '/about-en.html',
  '/about-waha.html',
  '/Author-cv.html',
  '/cv-2026a.html',
  '/cv-2026e.html',
  '/profile.html',
  '/profile-en.html',
  '/all-links.html',
  '/theory-ar.html',
  '/theory-en.html',
  '/Sanaa.html',
  '/Shibam.html',
  '/Soqatra.html',
  '/contact.html',
  '/privacy-policy.html',
  '/sitemap.xml',
  '/robots.txt',
  '/js/init-page-root.js',
  '/js/menu.js',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'UPDATE_AVAILABLE', version: CACHE_NAME });
        });
      });
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => caches.match('/offline.html'));
    })
  );
});