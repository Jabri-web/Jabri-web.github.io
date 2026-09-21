/* ═══════════════════════════════════════════════════════════════
   /js/file.js — واحة الجبري (Heaven Al-Jabri)
   محمّل القائمة الاحتياطية — v2.0
   ✅ يعمل على الويب + APK (file://)
   ✅ يستعمل XHR كاحتياط لو fetch ممنوع
   ✅ قائمة ثابتة مدمجة (تعمل دائماً بدون شبكة)

   الاستخدام:
     <script src="/js/file.js"></script>
     window.WAHA_FILE_LOADER()  →  Promise<Array<paths>>
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ─── كشف البيئة ─── */
    var IS_FILE = (location.protocol === 'file:');
    var IS_WV   = (navigator.userAgent || '').indexOf('wv') !== -1;
    var IS_APK  = IS_FILE || IS_WV;

    console.log('%c📂 /js/file.js — v2.0 (' + (IS_APK ? 'APK' : 'Web') + ')',
                'color:#ffd700;font-weight:700');

    /* ─── ① القائمة الثابتة (تعمل دائماً بدون شبكة) ─── */
    var STATIC_FILES = [
        'index.html',
        'about.html',
        'about-ar.html',
        'about-en.html',
        'about-waha.html',
        'explore.html',
        'heaven-info.html',
        'repos-auto.html',
        'repos-sqr.html',
        'current-auto.html',
        'gallery.html',
        'theory-ar.html',
        'theory-en.html',
        'Sindbad-theory.html',
        'research.html',
        'Pages-Researches.html',
        'Sanaa.html',
        'Shibam.html',
        'Soqatra.html',
        'journal.html',
        'journal2.html',
        'journal3.html',
        'calculator.html',
        'handsa.html',
        'music.html',
        'visitor.html',
        'who-we.html',
        'project.html',
        'contact.html',
        'Author-cv.html',
        'citations.html',
        'source.html',
        'all-links.html',
        'sitemap.xml',
        'robots.txt',
        'manifest.json',
        'favicon.ico',
        'game/game-auto.html',
        'publish/publish.html',
        'ar/index.html',
        'ar/about.html',
        'ar/contact.html',
        'en/index.html',
        'en/about.html',
        'en/contact.html'
    ];

    /* ─── ② المصادر الديناميكية ─── */
    var DYNAMIC_SOURCES = [
        { url: '/all-links.json',    type: 'json' },
        { url: '/sitemap.xml',       type: 'xml'  },
        { url: '/sitemap_index.xml', type: 'xml'  },
        { url: '/links.json',        type: 'json' },
        { url: '/all-links.txt',     type: 'text' },
        { url: '/sitemap.txt',       type: 'text' }
    ];

    var EXCLUDED = ['explore.html'];
    var CACHE_KEY = 'waha_files_cache';
    var CACHE_TS  = 'waha_files_cache_ts';
    var CACHE_TTL = 24 * 60 * 60 * 1000;

    /* ─── ③ أدوات مساعدة ─── */
    function toRel(u) {
        if (!u || typeof u !== 'string') return null;
        u = u.trim();
        if (!u) return null;
        try {
            var url = new URL(u, location.origin || 'http://x');
            var host = url.hostname || '';
            // نقبل نفس النطاق أو ملفات محلية
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
        if (EXCLUDED.indexOf(p) !== -1) return false;
        if (/^sitemap/i.test(p)) return false;
        if (/^robots\.txt$/i.test(p)) return false;
        if (/^all-links\./i.test(p)) return false;
        if (/^links\.json$/i.test(p)) return false;
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
        arr.forEach(function(x) {
            var raw = (typeof x === 'string') ? x
                    : (x && (x.url || x.loc || x.href || x.path || x.link || x.page)) || '';
            var p = toRel(raw);
            if (useful(p)) out.push(p);
        });
        return out;
    }

    function parseText(text) {
        var out = [];
        text.split(/\r?\n/).forEach(function(line) {
            var p = toRel(line.trim());
            if (useful(p)) out.push(p);
        });
        return out;
    }

    /* ─── ④ XHR Fallback (مهم لـ APK/file://) ─── */
    function xhrGet(url) {
        return new Promise(function(resolve) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.timeout = 4000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        var ok = (xhr.status === 200) || (xhr.status === 0 && xhr.responseText);
                        resolve(ok ? xhr.responseText : null);
                    }
                };
                xhr.ontimeout = function() { resolve(null); };
                xhr.onerror = function() { resolve(null); };
                xhr.send();
            } catch (e) {
                resolve(null);
            }
        });
    }

    async function fetchText(url) {
        // ① نجرب fetch أولاً (أسرع على الويب)
        if (!IS_APK && typeof fetch === 'function') {
            try {
                var res = await fetch(url, { cache: 'force-cache' });
                if (res && res.ok) return await res.text();
            } catch (e) {}
        }
        // ② XHR fallback (APK + fetch فشل)
        return await xhrGet(url);
    }

    /* ─── ⑤ المحمّل الرئيسي ─── */
    window.WAHA_FILE_LOADER = async function () {

        /* ① الكاش المحلي أولاً (سريع + بدون شبكة) */
        try {
            var cached = localStorage.getItem(CACHE_KEY);
            var ts = parseInt(localStorage.getItem(CACHE_TS) || '0', 10);
            if (cached && (Date.now() - ts) < CACHE_TTL) {
                var parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length) {
                    console.log('%c📦 /js/file.js — من الكاش المحلي (' + parsed.length + ')',
                                'color:#7ee787');
                    return parsed;
                }
            }
        } catch (e) {}

        /* ② المصادر الديناميكية */
        for (var i = 0; i < DYNAMIC_SOURCES.length; i++) {
            var src = DYNAMIC_SOURCES[i];
            try {
                var text = await fetchText(src.url);
                if (!text) continue;

                var paths = [];
                if (src.type === 'xml')  paths = parseXML(text);
                else if (src.type === 'json') {
                    try { paths = parseJSON(JSON.parse(text)); }
                    catch (e) { continue; }
                }
                else if (src.type === 'text') paths = parseText(text);

                // إزالة التكرار
                var uniq = [];
                var seen = {};
                paths.forEach(function(p) {
                    if (!seen[p]) { seen[p] = 1; uniq.push(p); }
                });

                if (uniq.length) {
                    try {
                        localStorage.setItem(CACHE_KEY, JSON.stringify(uniq));
                        localStorage.setItem(CACHE_TS, String(Date.now()));
                    } catch (e) {}
                    console.log('%c📡 /js/file.js — من ' + src.url + ' (' + uniq.length + ')',
                                'color:#ffd700');
                    return uniq;
                }
            } catch (e) {}
        }

        /* ③ القائمة الثابتة (تعمل دائماً) */
        console.log('%c🛡️ /js/file.js — القائمة الثابتة (' + STATIC_FILES.length + ')',
                    'color:#ff7b72');
        return STATIC_FILES.slice();
    };

    /* ─── ⑥ إتاحة القائمة الثابتة للاستخدام المباشر ─── */
    window.WAHA_STATIC_FILES = STATIC_FILES.slice();

    /* ─── ⑦ تنظيف الكاش اليدوي (للاستدعاء عند التحديث فقط) ─── */
    window.WAHA_CLEAR_FILES_CACHE = function () {
        try {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_TS);
            console.log('🗑️ [file.js] تم حذف كاش الملفات');
            return true;
        } catch (e) { return false; }
    };

    console.log('%c✅ /js/file.js v2.0 جاهز — WAHA_FILE_LOADER()',
                'color:#ffd700;font-weight:700;background:#0d1117;padding:2px 6px;border-radius:4px');

})();