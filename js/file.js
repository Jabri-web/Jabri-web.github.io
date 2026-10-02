/* ═══════════════════════════════════════════════════════════════
   /js/file.js — واحة الجبري (Heaven Al-Jabri)
   محمّل القائمة الاحتياطية — v2.3
   ─────────────────────────────────────────────────────────────
   ✅ يعمل على الويب + APK (file://)
   ✅ يستعمل XHR كاحتياط لو fetch ممنوع
   ✅ قائمة ثابتة مدمجة (تعمل دائماً بدون شبكة)
   ✅ يقرأ file-all4.txt كمصدر ديناميكي أساسي
   ✅ يرجع STATIC فوراً + يحدّث في الخلفية
   ✅ إشعار عند تحديث القائمة الديناميكية
   ─────────────────────────────────────────────────────────────
   🆕 v2.3 التعديلات:
     • once-guard (منع التحميل المزدوج)
     • cache: 'default' بدل force-cache (لتحديث file-all4.txt)
     • STATIC_FILES كاملة (120+ ملف)
     • إزالة EXCLUDED غير المبرَّر

   الاستخدام:
     <script src="/js/file.js"></script>
     window.WAHA_FILE_LOADER()  →  Promise<Array<paths>>
     window.WAHA_ON_DYNAMIC_UPDATE = fn  →  callback عند التحديث
     window.WAHA_CLEAR_FILES_CACHE()  →  حذف الكاش يدوياً
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════
     🛡️ once-guard — منع التحميل المزدوج
     ═══════════════════════════════════════════════════ */
  if (window.__WAHA_FILE_JS_LOADED) {
    console.warn('⏩ [file.js] محمّل مسبقاً — تجاهل');
    return;
  }
  window.__WAHA_FILE_JS_LOADED = true;

  var VERSION = '2.3';

  /* ─── كشف البيئة ─── */
  var IS_FILE = (location.protocol === 'file:');
  var IS_WV   = (navigator.userAgent || '').indexOf('wv') !== -1;
  var IS_APK  = IS_FILE || IS_WV;

  console.log('%c📂 /js/file.js — v' + VERSION + ' (' + (IS_APK ? 'APK' : 'Web') + ')',
              'color:#ffd700;font-weight:700');

  /* ═══════════════════════════════════════════════════
     ① القائمة الثابتة — كاملة
     ═══════════════════════════════════════════════════ */
  var STATIC_FILES = [
    // ─────────────────────────────────────────────
    // الصفحات الرئيسية
    // ─────────────────────────────────────────────
    'index.html',
    'logo.html',
    'catalog.html',
    'all-links.html',
    'table-all.html',
    'monitor.html',

    // ─────────────────────────────────────────────
    // Page 1 → Page 12
    // ─────────────────────────────────────────────
    'Page1.html', 'Page2.html', 'Page3.html', 'Page4.html',
    'Page5.html', 'Page6.html', 'Page7.html', 'Page8.html',
    'Page9.html', 'Page10.html', 'Page11.html', 'Page12.html',

    // ─────────────────────────────────────────────
    // عن الموقع (About)
    // ─────────────────────────────────────────────
    'about.html',
    'about-ar.html',
    'about-en.html',
    'about-waha.html',

    // ─────────────────────────────────────────────
    // المؤلف والسيرة الذاتية
    // ─────────────────────────────────────────────
    'Author-cv.html',
    'author-history.html',
    'cv-2026a.html',
    'cv-2026e.html',
    'founder.html',
    'profile.html',
    'profile-en.html',

    // ─────────────────────────────────────────────
    // النظرية الموحدة
    // ─────────────────────────────────────────────
    'theory-ar.html',
    'theory-en.html',
    'Sindbad-theory.html',
    'Sindbad-Brdoni.html',

    // ─────────────────────────────────────────────
    // البحث العلمي
    // ─────────────────────────────────────────────
    'research.html',
    'research-deep.html',
    'Pages-Researches.html',

    // ─────────────────────────────────────────────
    // التراث اليمني
    // ─────────────────────────────────────────────
    'Sanaa.html',
    'Shibam.html',
    'Soqatra.html',
    'Yemen-library.html',
    'gallery.html',
    'yemen-photo.html',
    'yemen-photo2.html',
    'yemen-photo-api.html',
    'yemen-photo-php.html',

    // ─────────────────────────────────────────────
    // المجلات
    // ─────────────────────────────────────────────
    'journal.html',
    'journal2.html',
    'journal3.html',
    'journal4.html',
    'History-pdf.html',

    // ─────────────────────────────────────────────
    // الأدوات
    // ─────────────────────────────────────────────
    'calculator.html',
    'handsa.html',
    'char-balance.html',
    'Check.html',
    'magic-translator.html',
    'diagnose.html',
    'link-checker.html',

    // ─────────────────────────────────────────────
    // قواعد البيانات والشبكة
    // ─────────────────────────────────────────────
    'Dbase.html',
    'Dbase-deep.html',
    'microtik.html',
    'microtik-deep.html',

    // ─────────────────────────────────────────────
    // المكتبة والمحتوى
    // ─────────────────────────────────────────────
    'Office.html',
    'source.html',
    'citations.html',
    'music.html',
    'taraif.html',
    'Nezar.html',
    'wonder.html',
    'heaven-info.html',
    'visitor.html',
    'who-we.html',
    'project.html',
    'project-ar.html',
    'poster.html',

    // ─────────────────────────────────────────────
    // التواصل والنظام
    // ─────────────────────────────────────────────
    'contact.html',
    'FAQPage.html',
    'FAQPage-en.html',
    'privacy-policy.html',

    // ─────────────────────────────────────────────
    // أدوات المطور
    // ─────────────────────────────────────────────
    'file-structure.html',
    'file-structure2.html',
    'Router-all.html',
    'repos-auto.html',
    'repos-sqr.html',
    'current-auto.html',

    // ─────────────────────────────────────────────
    // المتنوع
    // ─────────────────────────────────────────────
    'kfupm-msg.html',
    'explore.html',

    // ─────────────────────────────────────────────
    // الملفات المحدّثة
    // ─────────────────────────────────────────────
    'technical-guide.html',
    'all-link-doc.html',
    'update-tracker.html',

    // ─────────────────────────────────────────────
    // النظام
    // ─────────────────────────────────────────────
    'sitemap.xml',
    'robots.txt',
    'manifest.json',
    'favicon.ico',

    // ─────────────────────────────────────────────
    // المجلدات الفرعية
    // ─────────────────────────────────────────────
    'game/game-auto.html',
    'publish/publish.html',

    // ─────────────────────────────────────────────
    // /ar/ — النسخة العربية
    // ─────────────────────────────────────────────
    'ar/index.html',
    'ar/about.html',
    'ar/contact.html',
    'ar/journal.html',
    'ar/profile.html',
    'ar/project.html',
    'ar/Router-all.html',
    'ar/Page4.html',
    'ar/Page10.html',
    'ar/Page11.html',
    'ar/Page12.html',

    // ─────────────────────────────────────────────
    // /en/ — النسخة الإنجليزية
    // ─────────────────────────────────────────────
    'en/index.html',
    'en/about.html',
    'en/contact.html',
    'en/journal.html',
    'en/profile.html',
    'en/project.html',
    'en/Router-all.html',
    'en/Page4.html',
    'en/Page10.html',
    'en/Page11.html',
    'en/Page12.html'
  ];

  /* ═══════════════════════════════════════════════════
     ② المصادر الديناميكية
     ═══════════════════════════════════════════════════ */
  var DYNAMIC_SOURCES = [
    { url: '/file-all4.txt',     type: 'text' },  // المصدر الأساسي
    { url: '/js/file-all4.txt',  type: 'text' },  // احتياطي
    { url: '/sitemap.xml',       type: 'xml'  },
    { url: '/sitemap_index.xml', type: 'xml'  },
    { url: '/sitemap-index.xml', type: 'xml'  },
    { url: '/all-links.txt',     type: 'text' },
    { url: '/sitemap.txt',       type: 'text' }
  ];

  var CACHE_KEY = 'waha_files_cache_v23';
  var CACHE_TS  = 'waha_files_cache_ts_v23';
  var CACHE_TTL = 24 * 60 * 60 * 1000;

  /* ═══════════════════════════════════════════════════
     ③ أدوات مساعدة
     ═══════════════════════════════════════════════════ */
  function toRel(u) {
    if (!u || typeof u !== 'string') return null;
    u = u.trim();
    if (!u) return null;
    try {
      var url = new URL(u, location.origin || 'http://x');
      var host = url.hostname || '';
      if (host && host !== location.hostname && !IS_APK) return null;
      var p = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      if (!p || p.slice(-1) === '/') return null;
      return p;
    } catch (e) {
      var p2 = u.replace(/^\/+/, '').split('#')[0].split('?')[0];
      return p2 || null;
    }
  }

  function useful(p) {
    if (!p) return false;
    if (/^sitemap/i.test(p)) return false;
    if (/^robots\.txt$/i.test(p)) return false;
    if (/^all-links\./i.test(p)) return false;
    if (/^links\.json$/i.test(p)) return false;
    if (/^file-all\d*\.txt$/i.test(p)) return false;
    if (p.indexOf('..') !== -1) return false;
    return true;
  }

  function parseXML(text) {
    var out = [];
    try {
      var doc = new DOMParser().parseFromString(text, 'application/xml');
      var locs = doc.querySelectorAll('loc');
      for (var i = 0; i < locs.length; i++) {
        var p = toRel(locs[i].textContent);
        if (useful(p)) out.push(p);
      }
    } catch (e) {}
    if (!out.length) {
      var re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
      var m;
      while ((m = re.exec(text)) !== null) {
        var p2 = toRel(m[1]);
        if (useful(p2)) out.push(p2);
      }
    }
    return out;
  }

  function parseJSON(data) {
    var arr = [];
    if (Array.isArray(data)) arr = data;
    else if (data && typeof data === 'object') {
      var keys = ['links','urls','pages','files','all','items','list'];
      for (var i = 0; i < keys.length; i++) {
        if (Array.isArray(data[keys[i]])) { arr = data[keys[i]]; break; }
      }
      if (!arr.length) {
        var ks = Object.keys(data);
        for (var j = 0; j < ks.length; j++) {
          if (Array.isArray(data[ks[j]])) { arr = data[ks[j]]; break; }
        }
      }
      if (!arr.length) arr = Object.keys(data);
    }
    var out = [];
    arr.forEach(function (x) {
      var raw = (typeof x === 'string') ? x
              : (x && (x.url || x.loc || x.href || x.path || x.link || x.page)) || '';
      var p = toRel(raw);
      if (useful(p)) out.push(p);
    });
    return out;
  }

  function parseText(text) {
    var out = [];
    var lines = text.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      if (line.charAt(0) === '#') continue;          // تعليقات
      if (line.indexOf('⛔') !== -1) continue;         // مستبعد
      if (line.indexOf('...') !== -1) continue;        // نطاقات

      // إزالة الترقيم (01. ، A01. ، إلخ)
      line = line.replace(/^[A-Z]?\d+\.\s+/, '');
      // إزالة النجوم والنص بعدها
      line = line.replace(/\s*⭐.*$/, '');
      // خذ أول كلمة (المسار)
      line = line.split(/\s+/)[0];
      // إزالة علامات التنصيص
      line = line.replace(/["']/g, '');
      // تجاهل السطور التي لا تحتوي على امتداد ملف
      if (!/\.\w{2,5}$/.test(line)) continue;

      var p = toRel(line);
      if (useful(p)) out.push(p);
    }
    return out;
  }

  /* ═══════════════════════════════════════════════════
     ④ XHR Fallback (احتياط fetch)
     ═══════════════════════════════════════════════════ */
  function xhrGet(url) {
    return new Promise(function (resolve) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 4000;
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            var ok = (xhr.status === 200) ||
                     (xhr.status === 0 && xhr.responseText);
            resolve(ok ? xhr.responseText : null);
          }
        };
        xhr.ontimeout = function () { resolve(null); };
        xhr.onerror   = function () { resolve(null); };
        xhr.send();
      } catch (e) { resolve(null); }
    });
  }

  async function fetchText(url) {
    // ✅ v2.3: cache 'default' بدل 'force-cache'
    //    للسماح بتحديث file-all4.txt عند الحاجة
    if (!IS_APK && typeof fetch === 'function') {
      try {
        var res = await fetch(url, { cache: 'default' });
        if (res && res.ok) return await res.text();
      } catch (e) {}
    }
    return await xhrGet(url);
  }

  /* ═══════════════════════════════════════════════════
     ⑤ المحمّل الرئيسي
     ═══════════════════════════════════════════════════ */
  window.WAHA_FILE_LOADER = async function () {

    /* ① الكاش المحلي */
    try {
      var cached = localStorage.getItem(CACHE_KEY);
      var ts = parseInt(localStorage.getItem(CACHE_TS) || '0', 10);
      if (cached && (Date.now() - ts) < CACHE_TTL) {
        var parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) {
          console.log('%c📦 /js/file.js — من الكاش (' + parsed.length + ')',
                      'color:#7ee787');
          return parsed;
        }
      }
    } catch (e) {}

    /* ② STATIC فوراً */
    var immediate = STATIC_FILES.slice();

    /* ③ تحديث في الخلفية */
    (async function loadDynamic() {
      for (var i = 0; i < DYNAMIC_SOURCES.length; i++) {
        var src = DYNAMIC_SOURCES[i];
        try {
          var text = await fetchText(src.url);
          if (!text) continue;

          var paths = [];
          if (src.type === 'xml') {
            paths = parseXML(text);
          } else if (src.type === 'json') {
            try { paths = parseJSON(JSON.parse(text)); }
            catch (e) { continue; }
          } else if (src.type === 'text') {
            paths = parseText(text);
          }

          var uniq = [];
          var seen = {};
          paths.forEach(function (p) {
            if (!seen[p]) { seen[p] = 1; uniq.push(p); }
          });

          if (uniq.length) {
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(uniq));
              localStorage.setItem(CACHE_TS, String(Date.now()));
            } catch (e) {}

            console.log('%c📡 /js/file.js — محدّث من ' + src.url +
                        ' (' + uniq.length + ')',
                        'color:#ffd700');

            if (typeof window.WAHA_ON_DYNAMIC_UPDATE === 'function') {
              try { window.WAHA_ON_DYNAMIC_UPDATE(uniq); }
              catch (e) { console.warn('⚠️ [file.js] callback error:', e); }
            }
            return;
          }
        } catch (e) {}
      }
      console.log('%c🛡️ /js/file.js — استخدمنا القائمة الثابتة',
                  'color:#ff7b72');
    })();

    /* ④ نرجع STATIC فوراً */
    console.log('%c⚡ /js/file.js — STATIC فوراً (' + immediate.length + ')',
                'color:#7ee787');
    return immediate;
  };

  /* ═══════════════════════════════════════════════════
     ⑥ القائمة الثابتة للاستخدام المباشر
     ═══════════════════════════════════════════════════ */
  window.WAHA_STATIC_FILES = STATIC_FILES.slice();

  /* ═══════════════════════════════════════════════════
     ⑦ تنظيف الكاش
     ═══════════════════════════════════════════════════ */
  window.WAHA_CLEAR_FILES_CACHE = function () {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TS);
      console.log('🗑️ [file.js] تم حذف كاش الملفات');
      return true;
    } catch (e) { return false; }
  };

  console.log('%c✅ /js/file.js v' + VERSION + ' جاهز — WAHA_FILE_LOADER()',
              'color:#ffd700;font-weight:700;background:#0d1117;' +
              'padding:2px 6px;border-radius:4px');

})();