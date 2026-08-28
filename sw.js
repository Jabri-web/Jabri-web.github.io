const CACHE_NAME = 'heaven-aljabri-v1';
const FILES_TO_CACHE = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/Sindbad-Brdoni.html',
  '/Nezar.html',
  '/image/Jabri-photo.webp',
  '/music.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});