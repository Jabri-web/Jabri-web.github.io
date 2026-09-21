/* ================================================================
   /js/link-checker.js — v2.0
   Heaven Al-Jabri | واحة الجبري
   ─────────────────────────────────────────────────────────────
   🎯 فاحص الروابط الذكي + مقترح المسارات الصحيحة

   مميزات v2.0:
     • 🔍 يفحص كل <a href> في الخلفية
     • 🔧 يصلح بصمت لما يكون الحل واضح (ناقص .html)
     • 💡 لما يعجز → يفحص اقتراحات بديلة ويعرض الصالح منها
     • 📋 زر نسخ + زر جرّب لكل اقتراح
     • 🎓 يعلّم المطور: "الصق هذا" أو "ارفع الملف إلى /image/"

   الاستخدام:
     <script src="/js/link-checker.js" defer></script>

   الإعدادات (اختياري):
     window.WAHA_LINK_CHECKER = { autoRun: true, ... }
   ================================================================ */

(function () {
    'use strict';

    if (window.__WAHA_LINK_CHECKER_LOADED__) return;
    window.__WAHA_LINK_CHECKER_LOADED__ = true;

    /* ─────────────────────────────────────────────────────────────
       ⚙️ الإعدادات
       ───────────────────────────────────────────────────────────── */
    const CFG = Object.assign({
        autoRun:        true,
        runDelay:       800,
        batchSize:      6,
        checkTimeout:   3500,
        maxLinks:       120,
        cacheTTL:       30 * 60 * 1000,
        autoHideAfter:  30000,
        checkerUrl:     '/link-checker.html',
        enableFix:      true,
        enableNotify:   true,
        maxSuggestions: 4          // حد أقصى للاقتراحات لكل رابط
    }, window.WAHA_LINK_CHECKER || {});

    /* ─────────────────────────────────────────────────────────────
       🌍 كشف البيئة
       ───────────────────────────────────────────────────────────── */
    const PROTO  = location.protocol;
    const IS_FILE = PROTO === 'file:';
    const IS_WV   = (navigator.userAgent || '').indexOf('wv') !== -1;
    const IS_APK  = IS_FILE || IS_WV ||
                    (PROTO !== 'http:' && PROTO !== 'https:' &&
                     (location.hostname || '').indexOf('vercel') === -1 &&
                     (location.hostname || '').indexOf('github') === -1);

    console.log('%c🔗 [link-checker] v2.0 — ' + (IS_APK ? 'APK' : 'Web'),
                'color:#ffd700;font-weight:700');

    /* ─────────────────────────────────────────────────────────────
       📁 المجلدات الشائعة — نجربها لو الرابط مكسور
       ───────────────────────────────────────────────────────────── */
    const COMMON_FOLDERS = [
        '/image/', '/images/', '/img/',
        '/css/', '/styles/',
        '/js/', '/scripts/',
        '/fonts/', '/font/',
        '/assets/', '/static/', '/public/',
        '/downloads/', '/download/',
        '/files/', '/file/', '/docs/', '/documents/',
        '/media/', '/videos/', '/video/', '/audio/', '/music/',
        '/pdf/', '/apk/', '/zip/',
        '/uploads/', '/upload/'
    ];

    // امتدادات بديلة شائعة — نفس الصورة بامتداد مختلف
    const EXT_ALTS = {
        'png':  ['webp', 'jpg', 'jpeg', 'svg', 'gif'],
        'jpg':  ['jpeg', 'webp', 'png'],
        'jpeg': ['jpg', 'webp', 'png'],
        'webp': ['png', 'jpg', 'jpeg'],
        'svg':  ['png', 'webp'],
        'gif':  ['png', 'webp'],
        'mp4':  ['webm'],
        'webm': ['mp4'],
        'mp3':  ['ogg', 'm4a'],
        'ogg':  ['mp3', 'm4a']
    };

    /* ─────────────────────────────────────────────────────────────
       💾 الكاش
       ───────────────────────────────────────────────────────────── */
    const MEM_CACHE = new Map();

    function cacheKey(url) {
        return 'wlc_' + btoa(unescape(encodeURIComponent(url))).slice(0, 40);
    }

    function getCache(url) {
        if (MEM_CACHE.has(url)) return MEM_CACHE.get(url);
        try {
            const raw = sessionStorage.getItem(cacheKey(url));
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (Date.now() - data.t > CFG.cacheTTL) {
                sessionStorage.removeItem(cacheKey(url));
                return null;
            }
            MEM_CACHE.set(url, data);
            return data;
        } catch (e) { return null; }
    }

    function setCache(url, value) {
        const data = { v: value, t: Date.now() };
        MEM_CACHE.set(url, data);
        try { sessionStorage.setItem(cacheKey(url), JSON.stringify(data)); } catch (e) {}
    }

    /* ─────────────────────────────────────────────────────────────
       🔍 أدوات الفحص
       ───────────────────────────────────────────────────────────── */
    function isInternalLink(url) {
        if (!url) return false;
        if (url.indexOf('#') === 0) return false;
        if (/^(mailto|tel|javascript|data|whatsapp|tg|blob):/i.test(url)) return false;

        try {
            const u = new URL(url, location.href);
            if (u.origin !== location.origin) return false;
            if (u.pathname === location.pathname && u.search === location.search) return false;
            return true;
        } catch (e) { return false; }
    }

    function probeFetch(url) {
        return new Promise(function (resolve) {
            const ctl = new AbortController();
            const tid = setTimeout(function () { ctl.abort(); resolve(false); }, CFG.checkTimeout);

            fetch(url, {
                method: 'HEAD', cache: 'no-cache',
                redirect: 'follow', signal: ctl.signal
            }).then(function (r) {
                clearTimeout(tid);
                resolve(r.ok);
            }).catch(function () {
                clearTimeout(tid);
                probeFetchGET(url).then(resolve);
            });
        });
    }

    function probeFetchGET(url) {
        return new Promise(function (resolve) {
            const ctl = new AbortController();
            const tid = setTimeout(function () { ctl.abort(); resolve(false); }, CFG.checkTimeout);

            fetch(url, {
                method: 'GET', cache: 'no-cache',
                redirect: 'follow', signal: ctl.signal
            }).then(function (r) {
                clearTimeout(tid);
                resolve(r.ok);
            }).catch(function () {
                clearTimeout(tid);
                resolve(false);
            });
        });
    }

    function probeXHR(url) {
        return new Promise(function (resolve) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.timeout = CFG.checkTimeout;
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        const ok = (xhr.status === 200) || (xhr.status === 0 && xhr.responseText);
                        resolve(!!ok);
                    }
                };
                xhr.ontimeout = function () { resolve(false); };
                xhr.onerror  = function () { resolve(false); };
                xhr.send();
            } catch (e) { resolve(false); }
        });
    }

    async function probe(url) {
        const cached = getCache(url);
        if (cached) return cached.v;
        const result = IS_APK ? await probeXHR(url) : await probeFetch(url);
        setCache(url, result);
        return result;
    }

    /* ─────────────────────────────────────────────────────────────
       🔧 محاولة الإصلاح التلقائي
       ───────────────────────────────────────────────────────────── */
    function basicFixes(url) {
        var fixes = [];
        try {
            var u = new URL(url, location.href);
            var path = u.pathname;
            var search = u.search || '';

            if (!/\.\w{2,5}$/.test(path)) {
                fixes.push(path + '.html' + search);
            }

            var langMatch = path.match(/^\/(ar|en)\//);
            if (langMatch) {
                var lang = langMatch[1];
                var other = lang === 'ar' ? 'en' : 'ar';
                var rest = path.slice(('/' + lang + '/').length);
                fixes.push('/' + other + '/' + rest + search);
                fixes.push('/' + rest + search);
            } else if (path !== '/') {
                fixes.push('/ar' + path + search);
                fixes.push('/en' + path + search);
            }

            var parts = path.split('/').filter(function (x) { return x; });
            if (parts.length > 1) {
                var last = parts[parts.length - 1];
                fixes.push('/' + last + search);
            }
        } catch (e) {}
        return fixes;
    }

    async function tryAutoFix(url) {
        if (!CFG.enableFix) return null;
        const fixes = basicFixes(url);
        for (var i = 0; i < fixes.length; i++) {
            if (await probe(fixes[i])) return fixes[i];
        }
        return null;
    }

    /* ─────────────────────────────────────────────────────────────
       💡 [v2.0] مولّد الاقتراحات الذكي
       ─────────────────────────────────────────────────────────────
       لكل رابط مكسور، يولّد قائمة اقتراحات محتملة:
         ① إضافة .html
         ② عكس اللغة (ar ↔ en)
         ③ إضافة مجلد شائع (/image/, /css/, /js/...)
         ④ تغيير الامتداد (png ↔ webp ↔ jpg)
         ⑤ إزالة/إضافة slash في البداية
       ثم يفحصها كلها ويرجع الصالح فقط
       ───────────────────────────────────────────────────────────── */
    function generateSuggestionCandidates(path) {
        var candidates = [];
        var u;
        try { u = new URL(path, location.href); } catch (e) { return candidates; }

        var p       = u.pathname;
        var search  = u.search || '';
        var hash    = u.hash || '';

        // ─── تفكيك المسار ───
        var parts   = p.split('/').filter(function (x) { return x; });
        var file    = parts.length ? parts[parts.length - 1] : '';
        var folder  = parts.length > 1 ? '/' + parts.slice(0, -1).join('/') + '/' : '/';

        if (!file) return candidates;

        // ─── تفكيك الاسم والامتداد ───
        var dot = file.lastIndexOf('.');
        var baseName = dot > 0 ? file.slice(0, dot) : file;
        var ext      = dot > 0 ? file.slice(dot + 1).toLowerCase() : '';

        // ═══════════════════════════════════════════════════════
        // ① المجلدات الشائعة — نفس اسم الملف
        // ═══════════════════════════════════════════════════════
        for (var i = 0; i < COMMON_FOLDERS.length; i++) {
            var f = COMMON_FOLDERS[i];
            // لا نكرر المجلد الحالي
            if (f === folder) continue;
            candidates.push(f + file + search + hash);
        }

        // ═══════════════════════════════════════════════════════
        // ② بدون slash في البداية
        // ═══════════════════════════════════════════════════════
        candidates.push(p.replace(/^\//, '') + search + hash);
        candidates.push('./' + p.replace(/^\//, '') + search + hash);

        // ═══════════════════════════════════════════════════════
        // ③ تغيير الامتداد
        // ═══════════════════════════════════════════════════════
        if (ext && EXT_ALTS[ext]) {
            var alts = EXT_ALTS[ext];
            for (var j = 0; j < alts.length; j++) {
                candidates.push(folder + baseName + '.' + alts[j] + search + hash);
            }
        }

        // ═══════════════════════════════════════════════════════
        // ④ نفس الاسم في الجذر (لو كان في مجلد)
        // ═══════════════════════════════════════════════════════
        if (folder !== '/') {
            candidates.push('/' + file + search + hash);
        }

        // ═══════════════════════════════════════════════════════
        // ⑤ تغييرات حالة الأحرف
        // ═══════════════════════════════════════════════════════
        var lower = file.toLowerCase();
        var upperFirst = file.charAt(0).toUpperCase() + file.slice(1);
        if (lower !== file)        candidates.push(folder + lower + search + hash);
        if (upperFirst !== file)   candidates.push(folder + upperFirst + search + hash);

        return candidates;
    }

    // يفحص الاقتراحات ويرجع الصالح فقط (مع حد أقصى)
    async function findWorkingSuggestions(path) {
        var candidates = generateSuggestionCandidates(path);
        var seen = {};
        var working = [];

        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
            if (!c || seen[c]) continue;
            seen[c] = 1;

            if (working.length >= CFG.maxSuggestions) break;

            var ok = await probe(c);
            if (ok) working.push(c);
        }

        return working;
    }

    /* ─────────────────────────────────────────────────────────────
       📋 جمع الروابط
       ───────────────────────────────────────────────────────────── */
    function collectLinks() {
        var anchors = document.querySelectorAll('a[href]');
        var result = [];
        var seen = {};

        for (var i = 0; i < anchors.length; i++) {
            var a = anchors[i];
            var href = a.getAttribute('href');
            if (!href) continue;
            if (!isInternalLink(href)) continue;

            try {
                var abs = new URL(href, location.href).href.split('#')[0];
                if (seen[abs]) continue;
                seen[abs] = 1;
                result.push({ el: a, href: href, abs: abs });
                if (result.length >= CFG.maxLinks) break;
            } catch (e) {}
        }
        return result;
    }

    /* ─────────────────────────────────────────────────────────────
       🎨 لوحة التنبيهات
       ───────────────────────────────────────────────────────────── */
    let panelEl = null;
    let panelHideTimer = null;

    function ensurePanel() {
        if (panelEl) return panelEl;

        panelEl = document.createElement('div');
        panelEl.id = 'waha-link-checker-panel';
        panelEl.style.cssText =
            'position:fixed;bottom:20px;right:20px;z-index:99990;' +
            'max-width:420px;width:calc(100vw - 40px);' +
            'background:linear-gradient(135deg,#1a1a2e,#0a0a0f);' +
            'border:2px solid #ffd700;border-radius:14px;' +
            'box-shadow:0 10px 40px rgba(0,0,0,0.7),0 0 30px rgba(255,215,0,0.2);' +
            'font-family:"Cairo","Tajawal",sans-serif;direction:rtl;' +
            'color:#e6edf3;padding:14px;opacity:0;transform:translateY(20px);' +
            'transition:opacity 0.3s,transform 0.3s;pointer-events:auto;';

        panelEl.innerHTML =
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
                '<span style="font-size:20px;">🔧</span>' +
                '<strong style="color:#ffd700;flex:1;font-size:14px;" id="wlc-title"></strong>' +
                '<button id="wlc-close" style="background:transparent;border:none;color:#888;' +
                    'cursor:pointer;font-size:20px;padding:0 4px;line-height:1;">×</button>' +
            '</div>' +
            '<div id="wlc-list" style="max-height:300px;overflow-y:auto;' +
                'margin-bottom:10px;font-size:12.5px;line-height:1.6;"></div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
                '<a id="wlc-fix" href="' + CFG.checkerUrl + '" ' +
                    'style="flex:1;min-width:130px;text-align:center;padding:8px 12px;' +
                    'background:#ffd700;color:#0a0a0f;border-radius:8px;text-decoration:none;' +
                    'font-weight:700;font-size:12.5px;">🎓 الفاحص الكامل</a>' +
                '<button id="wlc-hide" style="flex:1;min-width:100px;padding:8px 12px;' +
                    'background:transparent;color:#ffd700;border:1px solid #ffd700;' +
                    'border-radius:8px;font-weight:700;font-size:12.5px;cursor:pointer;' +
                    'font-family:inherit;">✕ تجاهل</button>' +
            '</div>';

        document.body.appendChild(panelEl);

        panelEl.querySelector('#wlc-close').addEventListener('click', hidePanel);
        panelEl.querySelector('#wlc-hide').addEventListener('click', function () {
            hidePanel();
            try { sessionStorage.setItem('wlc_dismissed', '1'); } catch (e) {}
        });

        return panelEl;
    }

    function showPanel(brokenList) {
        if (!CFG.enableNotify) return;

        try {
            if (sessionStorage.getItem('wlc_dismissed') === '1') return;
        } catch (e) {}

        var panel = ensurePanel();
        var title = panel.querySelector('#wlc-title');
        var list = panel.querySelector('#wlc-list');

        title.textContent = 'وجدنا ' + brokenList.length + ' رابط مكسور';

        // لكل رابط مكسور، نعرض الاقتراحات
        list.innerHTML = brokenList.map(function (item) {
            var href = item.href;
            var shortHref = href.length > 50 ? href.slice(0, 47) + '...' : href;
            var suggestions = item.suggestions || [];

            var suggestionsHtml = '';
            if (suggestions.length) {
                suggestionsHtml =
                    '<div style="margin-top:6px;padding-top:6px;' +
                         'border-top:1px dashed rgba(255,215,0,0.2);">' +
                        '<div style="color:#7ee787;font-size:11px;font-weight:700;' +
                             'margin-bottom:4px;">💡 اقتراحات صالحة:</div>' +
                        suggestions.map(function (s) {
                            var displayS = s.length > 42 ? '...' + s.slice(-39) : s;
                            return '<div style="display:flex;align-items:center;gap:6px;' +
                                       'background:rgba(126,231,135,0.08);padding:5px 8px;' +
                                       'border-radius:6px;margin-bottom:3px;font-size:11.5px;">' +
                                       '<code style="flex:1;color:#7ee787;word-break:break-all;' +
                                           'background:transparent;font-size:11px;">' +
                                           escapeHtml(displayS) + '</code>' +
                                       '<button class="wlc-copy-btn" data-copy="' + escapeAttr(s) + '" ' +
                                           'style="background:transparent;border:1px solid #7ee787;' +
                                           'color:#7ee787;border-radius:4px;padding:2px 7px;' +
                                           'cursor:pointer;font-size:10px;font-family:inherit;">📋</button>' +
                                       '<a href="' + escapeAttr(s) + '" target="_blank" ' +
                                           'style="background:transparent;border:1px solid #6ae3ff;' +
                                           'color:#6ae3ff;border-radius:4px;padding:2px 7px;' +
                                           'text-decoration:none;font-size:10px;">▶</a>' +
                                   '</div>';
                        }).join('') +
                    '</div>';
            } else {
                suggestionsHtml =
                    '<div style="margin-top:6px;padding-top:6px;' +
                         'border-top:1px dashed rgba(255,106,106,0.2);' +
                         'color:#ff9b9b;font-size:11px;">' +
                        '❌ لا اقتراحات — تأكد من رفع الملف للمسار الصحيح' +
                    '</div>';
            }

            return '<div style="padding:8px 10px;background:rgba(255,215,0,0.04);' +
                       'border-right:3px solid #ff6a6a;border-radius:8px;margin-bottom:8px;">' +
                       '<div style="color:#ff9b9b;font-size:11px;margin-bottom:2px;">🔗 الرابط المكسور:</div>' +
                       '<code style="color:#ffd700;word-break:break-all;font-size:11.5px;' +
                           'background:transparent;">' + escapeHtml(shortHref) + '</code>' +
                       suggestionsHtml +
                   '</div>';
        }).join('');

        // ربط أزرار النسخ
        setTimeout(function () {
            panel.querySelectorAll('.wlc-copy-btn').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    var txt = btn.getAttribute('data-copy');
                    copyToClipboard(txt).then(function () {
                        var old = btn.textContent;
                        btn.textContent = '✅';
                        btn.style.borderColor = '#7ee787';
                        setTimeout(function () {
                            btn.textContent = old;
                            btn.style.borderColor = '#7ee787';
                        }, 1200);
                    });
                });
            });
        }, 50);

        setTimeout(function () {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 50);

        if (panelHideTimer) clearTimeout(panelHideTimer);
        panelHideTimer = setTimeout(hidePanel, CFG.autoHideAfter);
    }

    function hidePanel() {
        if (!panelEl) return;
        panelEl.style.opacity = '0';
        panelEl.style.transform = 'translateY(20px)';
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(function () {
                return legacyCopy(text);
            });
        }
        return Promise.resolve(legacyCopy(text));
    }

    function legacyCopy(text) {
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            return true;
        } catch (e) { return false; }
    }

    /* ─────────────────────────────────────────────────────────────
       🚀 السائق الرئيسي
       ───────────────────────────────────────────────────────────── */
    async function scanAll() {
        if (!document.body) return;

        var links = collectLinks();
        if (!links.length) {
            console.log('🔗 [link-checker] لا توجد روابط داخلية');
            return;
        }

        console.log('🔗 [link-checker] نفحص ' + links.length + ' رابط...');

        var broken = [];
        var fixed = [];

        for (var i = 0; i < links.length; i += CFG.batchSize) {
            var batch = links.slice(i, i + CFG.batchSize);
            var results = await Promise.all(batch.map(function (item) {
                return probe(item.abs).then(function (ok) {
                    return { item: item, ok: ok };
                });
            }));

            for (var j = 0; j < results.length; j++) {
                var r = results[j];
                if (r.ok) continue;

                // 🔧 جرّب الإصلاح البسيط أولاً
                var fixedUrl = await tryAutoFix(r.item.abs);
                if (fixedUrl) {
                    try {
                        var abs = new URL(fixedUrl, location.href);
                        r.item.el.setAttribute('href', abs.pathname + abs.search + abs.hash);
                        r.item.el.title = (r.item.el.title || '') + ' [مُصلَح تلقائياً]';
                        fixed.push({ from: r.item.abs, to: fixedUrl });
                    } catch (e) {}
                    continue;
                }

                // 💡 [v2.0] ما نجح الإصلاح → نولّد اقتراحات
                r.item.el.style.textDecoration = 'line-through';
                r.item.el.style.opacity = '0.6';
                r.item.el.title = 'رابط مكسور — اضغط ⋯ للتفاصيل';

                var suggestions = await findWorkingSuggestions(r.item.abs);

                broken.push({
                    el: r.item.el,
                    href: r.item.href,
                    abs: r.item.abs,
                    suggestions: suggestions
                });
            }
        }

        console.log('%c🔗 [link-checker] انتهى — سليم: ' +
                    (links.length - fixed.length - broken.length) +
                    ' | مُصلَح: ' + fixed.length +
                    ' | مكسور: ' + broken.length,
                    'color:#7ee787;font-weight:700');

        if (fixed.length) {
            console.log('🔧 تم إصلاح:', fixed);
        }
        if (broken.length) {
            console.warn('⚠️ روابط مكسورة:');
            broken.forEach(function (b) {
                console.warn('   • ' + b.abs);
                if (b.suggestions.length) {
                    b.suggestions.forEach(function (s) {
                        console.warn('       💡 ' + s);
                    });
                } else {
                    console.warn('       ❌ لا اقتراحات');
                }
            });
            showPanel(broken);
        }
    }

    /* ─────────────────────────────────────────────────────────────
       🎬 التشغيل
       ───────────────────────────────────────────────────────────── */
    function start() {
        if (IS_APK) {
            console.log('📱 [link-checker] وضع APK');
        }
        scanAll().catch(function (e) {
            console.warn('⚠️ [link-checker] خطأ:', e);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            if (CFG.autoRun) setTimeout(start, CFG.runDelay);
        });
    } else {
        if (CFG.autoRun) setTimeout(start, CFG.runDelay);
    }

    /* ─────────────────────────────────────────────────────────────
       🌐 API عام
       ───────────────────────────────────────────────────────────── */
    window.WahaLinkChecker = {
        scan:              scanAll,
        probe:             probe,
        tryFix:            tryAutoFix,
        suggest:           findWorkingSuggestions,
        hide:              hidePanel,
        copy:              copyToClipboard,
        version:           '2.0'
    };

    console.log('%c✅ /js/link-checker.js v2.0 جاهز',
                'color:#ffd700;font-weight:700;background:#0d1117;padding:2px 6px;border-radius:4px');

})();