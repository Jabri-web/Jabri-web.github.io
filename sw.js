// ================================================================
//  sw.js - v9.1 (Dual Cache Architecture)
//  Heaven Al-Jabri | واحة الجبري
//  ─────────────────────────────────────────────────────────────
//  🎯 الفكرة:
//    كاش واحد = فشل مزدوج. كاشين = نجاح مزدوج.
//    • CACHE_SHELL   → يخدم offline (ثابت، مُرقَّم بالإصدار)
//    • CACHE_RUNTIME → يخدم الأداء (متحرك، يُنظَّف مع كل إصدار)
//  ─────────────────────────────────────────────────────────────
//  🔄 عند إصدار جديد: غيّر VERSION فقط → الحذف تلقائي
// ================================================================

const VERSION = '9.1';                            // ← غيّر هذا فقط عند التحديث
const CACHE_SHELL   = 'waha-shell-v'   + VERSION;
const CACHE_RUNTIME = 'waha-runtime-v' + VERSION;

// ─────────────────────────────────────────────────────────────
//  الملفات الجوهرية — تُخزَّن عند التثبيت (خدمة Offline)
//  ⚠️ أضف/احذف بحذر — هذي هي أساس الـ APK offline
// ─────────────────────────────────────────────────────────────
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/js/file.js',
  '/js/menu.js',
  '/js/init-page-root.js',
  '/js/update-tracker.js',
  '/header.html',
  '/footer.html',
  '/explore.html'
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

    // نحمّل كل ملف على حدة — لو واحد فشل، لا نفشل الكل
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

    // ننتقل للتفعيل فوراً
    await self.skipWaiting();
  })());
});

// ================================================================
//  activate — نحذف كل النسخ القديمة (Shell + Runtime)
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

    // نسيطر على كل التبويبات المفتوحة
    await self.clients.claim();

    console.log('✅ [sw] v' + VERSION + ' نشط — حُذف ' + oldKeys.length + ' كاش قديم');
  })());
});

// ================================================================
//  fetch — 4 استراتيجيات حسب نوع المورد
// ================================================================
self.addEventListener('fetch', event => {
  const req = event.request;

  // ① نتجاهل غير GET
  if (req.method !== 'GET') return;

  // ② نتجاهل النطاقات الخارجية (CDN، fonts.googleapis، إلخ)
  //    ملاحظة: نشيلها لأننا ما نبي نخزّن خطوط Google
  if (!req.url.startsWith(self.location.origin)) return;

  // ③ نتجاهل المسارات الحساسة
  if (BYPASS_PATTERN.test(req.url)) return;

  const url = new URL(req.url);
  const path = url.pathname;

  // ─────────────────────────────────────────────────────────────
  //  ④ الصفحات (navigate) → Network First
  //     السبب: نبي التحديث يوصل فوراً، لكن نرجع للكاش لو فشل
  // ─────────────────────────────────────────────────────────────
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, CACHE_RUNTIME));
    return;
  }

  // ─────────────────────────────────────────────────────────────
  //  ⑤ ملفات جوهرية (Shell) → Shell First
  //     السبب: offline guarantee — نعطيها الأولوية القصوى
  // ─────────────────────────────────────────────────────────────
  if (SHELL_FILES.indexOf(path) !== -1) {
    event.respondWith(shellFirst(req));
    return;
  }

  // ─────────────────────────────────────────────────────────────
  //  ⑥ صور/أيقونات → Cache First Forever
  //     السبب: ما تتغيّر أصلاً — نخزّنها للأبد
  // ─────────────────────────────────────────────────────────────
  if (/\.(png|jpg|jpeg|webp|svg|gif|ico|bmp|avif)$/i.test(path)) {
    event.respondWith(cacheFirstForever(req, CACHE_RUNTIME));
    return;
  }

  // ─────────────────────────────────────────────────────────────
  //  ⑦ فيديو/صوت → Cache First مع حد أقصى (اختياري)
  //     السبب: كبيرة الحجم — نخزّن لكن بحذر
  // ─────────────────────────────────────────────────────────────
  if (/\.(mp4|webm|mp3|ogg|wav|m4a)$/i.test(path)) {
    event.respondWith(cacheFirstForever(req, CACHE_RUNTIME));
    return;
  }

  // ─────────────────────────────────────────────────────────────
  //  ⑧ الباقي (JS/CSS/خطوط) → Stale-While-Revalidate
  //     السبب: سريع + متجدد في الخلفية
  // ─────────────────────────────────────────────────────────────
  event.respondWith(staleWhileRevalidate(req, CACHE_RUNTIME));
});

// ================================================================
//  الاستراتيجيات الأربع
// ================================================================

/**
 * 🌐 Network First — للصفحات
 *   يحاول الشبكة → لو نجحت يخزّن ويُرجع
 *   لو فشلت → يرجع من الكاش → لو ما فيه، الصفحة الرئيسية
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
    // آخر حل — الصفحة الرئيسية
    const home = await caches.match('/') || await caches.match('/index.html');
    if (home) return home;

    return new Response(
      '<html dir="rtl"><body style="background:#0a0a0f;color:#ffd700;font-family:sans-serif;text-align:center;padding:50px;">' +
      '<h2>🌴 واحة الجبري</h2>' +
      '<p>أنت غير متصل بالإنترنت</p>' +
      '<p style="font-size:0.9em;opacity:0.7;">You are offline</p>' +
      '</body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/**
 * 🏕️ Shell First — للملفات الجوهرية
 *   من الكاش أولاً → لو ما فيه، من الشبكة
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
 *   من الكاش أولاً → لا نحدّث أبداً (إلا لو تغير الرابط)
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
    // placeholder شفاف للصور
    if (req.destination === 'image') {
      return new Response('', { status: 204 });
    }
    return new Response('Offline', { status: 503 });
  }
}

/**
 * ⚡ Stale-While-Revalidate — للـ JS/CSS/خطوط
 *   نرجع الكاش فوراً → نحدّث في الخلفية
 */
async function staleWhileRevalidate(req, cacheName) {
  const cached = await caches.match(req);

  // نبدأ التحديث في الخلفية بغض النظر
  const fetchPromise = fetch(req).then(res => {
    if (res && res.ok) {
      caches.open(cacheName).then(c => c.put(req, res.clone()));
    }
    return res;
  }).catch(() => null);

  // نرجع الكاش فوراً لو موجود → وإلا ننتظر الشبكة
  if (cached) {
    // نشغّل التحديث بدون انتظار
    fetchPromise.catch(() => {});
    return cached;
  }

  const networkRes = await fetchPromise;
  if (networkRes) return networkRes;

  return new Response('Offline', { status: 503 });
}

// ================================================================
//  message — SKIP_WAITING + أوامر إضافية
// ================================================================
self.addEventListener('message', event => {
  const data = event.data;

  if (data === 'SKIP_WAITING') {
    console.log('⏩ [sw] SKIP_WAITING — تفعيل النسخة الجديدة');
    self.skipWaiting();
    return;
  }

  // أمر إضافي: تفريغ كل شيء
  if (data === 'CLEAR_ALL_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      console.log('🗑️ [sw] تم حذف كل الكاش — ' + keys.length + ' كاش');
      // نعلم التبويبات
      const clients = await self.clients.matchAll();
      clients.forEach(c => c.postMessage('CACHES_CLEARED'));
    })());
    return;
  }

  // أمر: إرجاع معلومات الكاش
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
console.log('%c🌴 [sw] Heaven Al-Jabri v' + VERSION + ' loaded',
            'color:#ffd700;font-weight:700;background:#0d1117;padding:2px 8px;border-radius:4px');