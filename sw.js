// ================================================================
//  sw.js - v10.2 (Dual Cache + APK-Proof + Network-First JS)
//  Heaven Al-Jabri | واحة الجبري
//  ─────────────────────────────────────────────────────────────
//  🎯 التغييرات في v10.2:
//    1. JS/HTML حساسة → Network First (تحديث فوري)
//    2. SHELL_FILES يحتوي فقط الملفات الثابتة
//    3. منع disable في APK بسبب السكربتات القديمة
// ================================================================

const VERSION = '10.2';
const CACHE_SHELL   = 'waha-shell-v'   + VERSION;
const CACHE_RUNTIME = 'waha-runtime-v' + VERSION;

// ─────────────────────────────────────────────────────────────
//  ملفات ثابتة فقط — لا JS، لا HTML متغير
// ─────────────────────────────────────────────────────────────
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

// ─────────────────────────────────────────────────────────────
//  ملفات حساسة — Network First دائماً (تحديث فوري)
// ─────────────────────────────────────────────────────────────
const NETWORK_FIRST_PATHS = [
  '/js/init-page-root.js',   // ← المرعبة
  '/js/menu.js',
  '/js/link-checker.js',
  '/js/file.js',
  '/js/update-tracker.js',
  '/header.html',
  '/footer.html',
  '/version.json'
];

// ─────────────────────────────────────────────────────────────
//  مسارات لا نلمسها أبداً
// ─────────────────────────────────────────────────────────────
const BYPASS_PATTERN = /\/sw\.js|\/sitemap|\/robots\.txt|\/vercel\.json|\?utm_|\?fbclid|\?gclid/;

// ================================================================
//  install — نحضّر Shell Cache
// ================================================================
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    console.log('🔧 [sw] install — v' + VERSION);

    const shell = await caches.open(CACHE_SHELL);

    const results = await Promise.all(
      SHELL_FILES.map(async (url) => {
        try {
          await shell.add(new Request(url, { cache: 'reload' }));
          return { url, ok: true };
        } catch (err) {
          console.warn('⚠️ [sw] precache فشل:', url, '-', err.message);
          return { url, ok: false };
        }
      })
    );

    const okCount = results.filter(r => r.ok).length;
    console.log('✅ [sw] Shell جاهز: ' + okCount + '/' + SHELL_FILES.length + ' ملف');

    await self.skipWaiting();
  })());
});

// ================================================================
//  activate — نحذف كل النسخ القديمة
// ================================================================
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    console.log('🚀 [sw] activate — v' + VERSION);

    const keys = await caches.keys();
    const oldKeys = keys.filter(k => k !== CACHE_SHELL && k !== CACHE_RUNTIME);

    await Promise.all(oldKeys.map(k => {
      console.log('🗑️ [sw] حذف كاش قديم:', k);
      return caches.delete(k);
    }));

    await self.clients.claim();

    console.log('✅ [sw] v' + VERSION + ' نشط — حُذف ' + oldKeys.length + ' كاش قديم');
  })());
});

// ================================================================
//  fetch — 5 استراتيجيات + استثناء Googlebot
// ================================================================
self.addEventListener('fetch', event => {
  const req = event.request;

  // ① نتجاهل غير GET
  if (req.method !== 'GET') return;

  // ② نتجاهل النطاقات الخارجية
  if (!req.url.startsWith(self.location.origin)) return;

  // ③ 🛑 حماية محركات البحث
  const userAgent = req.headers.get('user-agent') || '';
  if (userAgent.includes('Googlebot') || 
      userAgent.includes('Bingbot') || 
      userAgent.includes('YandexBot')) {
    return;
  }

  // ④ نتجاهل المسارات الحساسة
  if (BYPASS_PATTERN.test(req.url)) return;

  const url = new URL(req.url);
  const path = url.pathname;

  // ─────────────────────────────────────────────────────────────
  //  ⑤ الصفحات (navigate) → Network First
  // ─────────────────────────────────────────────────────────────
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, CACHE_RUNTIME));
    return;
  }

  // ─────────────────────────────────────────────────────────────
  //  ⑥ ✅ ملفات حساسة → Network First (v10.2 جديد)
  // ─────────────────────────────────────────────────────────────
  if (NETWORK_FIRST_PATHS.indexOf(path) !== -1) {
    console.log('🌐 [sw] network-first (حساس):', path);
    event.respondWith(networkFirst(req, CACHE_RUNTIME));
    return;
  }

  // ─────────────────────────────────────────────────────────────
  //  ⑦ ملفات جوهرية → Shell First
  // ─────────────────────────────────────────────────────────────
  if (SHELL_FILES.indexOf(path) !== -1) {
    event.respondWith(shellFirst(req));
    return;
  }

  // ─────────────────────────────────────────────────────────────
  //  ⑧ صور/أيقونات → Cache First Forever
  // ─────────────────────────────────────────────────────────────
  if (/\.(png|jpg|jpeg|webp|svg|gif|ico|bmp|avif)$/i.test(path)) {
    event.respondWith(cacheFirstForever(req, CACHE_RUNTIME));
    return;
  }

  // ─────────────────────────────────────────────────────────────
  //  ⑨ فيديو/صوت → Cache First Forever
  // ─────────────────────────────────────────────────────────────
  if (/\.(mp4|webm|mp3|ogg|wav|m4a)$/i.test(path)) {
    event.respondWith(cacheFirstForever(req, CACHE_RUNTIME));
    return;
  }

  // ─────────────────────────────────────────────────────────────
  //  ⑩ الباقي (CSS/خطوط) → Stale-While-Revalidate
  // ─────────────────────────────────────────────────────────────
  event.respondWith(staleWhileRevalidate(req, CACHE_RUNTIME));
});

// ================================================================
//  الاستراتيجيات
// ================================================================

/**
 * 🌐 Network First — للصفحات والملفات الحساسة
 */
async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const c = await caches.open(cacheName);
      c.put(req, res.clone());
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) {
      console.log('📦 [sw] offline fallback:', req.url);
      return cached;
    }
    
    console.warn('⚠️ [sw] networkFirst فشل ولا يوجد كاش:', req.url);
    return new Response(
      '<html dir="rtl"><body style="background:#0a0a0f;color:#ffd700;font-family:sans-serif;text-align:center;padding:50px;">' +
      '<h2>🌴 واحة الجبري</h2>' +
      '<p>عذراً، هذه الصفحة غير متوفرة حالياً.</p>' +
      '<p style="font-size:0.9em;opacity:0.7;">Page Not Found</p>' +
      '</body></html>',
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/**
 * 🏕️ Shell First — للملفات الجوهرية
 */
async function shellFirst(req) {
  const cached = await caches.match(req, { cacheName: CACHE_SHELL });
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const c = await caches.open(CACHE_SHELL);
      c.put(req, res.clone());
    }
    return res;
  } catch (err) {
    console.warn('⚠️ [sw] shellFirst فشل:', req.url);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * 🖼️ Cache First Forever — للصور والفيديو
 */
async function cacheFirstForever(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const c = await caches.open(cacheName);
      c.put(req, res.clone());
    }
    return res;
  } catch (err) {
    if (req.destination === 'image') {
      return new Response('', { status: 204 });
    }
    return new Response('Offline', { status: 503 });
  }
}

/**
 * ⚡ Stale-While-Revalidate — للـ CSS/خطوط
 */
async function staleWhileRevalidate(req, cacheName) {
  const cached = await caches.match(req);

  const fetchPromise = fetch(req).then(res => {
    if (res && res.ok) {
      caches.open(cacheName).then(c => c.put(req, res.clone()));
    }
    return res;
  }).catch(() => null);

  if (cached) {
    fetchPromise.catch(() => {});
    return cached;
  }

  const networkRes = await fetchPromise;
  if (networkRes) return networkRes;

  return new Response('Offline', { status: 503 });
}

// ================================================================
//  message — أوامر
// ================================================================
self.addEventListener('message', event => {
  const data = event.data;

  if (data === 'SKIP_WAITING') {
    console.log('⏩ [sw] SKIP_WAITING');
    self.skipWaiting();
    return;
  }

  if (data === 'CLEAR_ALL_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      console.log('🗑️ [sw] حذف كل الكاش — ' + keys.length);
      const clients = await self.clients.matchAll();
      clients.forEach(c => c.postMessage('CACHES_CLEARED'));
    })());
    return;
  }

  if (data === 'GET_CACHE_INFO') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      const info = { version: VERSION, caches: {} };
      for (const k of keys) {
        const c = await caches.open(k);
        const reqs = await c.keys();
        info.caches[k] = reqs.length;
      }
      event.source.postMessage({ type: 'CACHE_INFO', data: info });
    })());
    return;
  }
});

// ================================================================
//  تسجيل بدء التشغيل
// ================================================================
console.log('%c🌴 [sw] Heaven Al-Jabri v' + VERSION + ' loaded (APK-Proof)',
            'color:#ffd700;font-weight:700;background:#0d1117;padding:2px 8px;border-radius:4px');