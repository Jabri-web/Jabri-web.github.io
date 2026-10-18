// ================================================================
// 🛡️ init-page-root.js
// Version: 8.4.2 — "المدير الواحد" + NET system كامل
// Build:   2026-10-18
// IDEA:    Single Entry Point — Z + C + A = 1
// ================================================================
//
// 📋 ماذا تفعل هذه المرعبة (كل الوظائف):
// ────────────────────────────────────────────────────────────────
//
// 🎬 1) SPLASH SCREEN
//    • يعرض شاشة تحميل "واحة الجبري" مع spinner
//    • يخفيها تلقائياً بعد autoHideSplashAfter (1500ms)
//    • يخفيها فوراً عند أول نقرة/لمسة أو اكتمال load
//    • يخفيها عند فشل الهيدر (لا تعليق)
//
// 📦 2) SCRIPT LOADER
//    • يحمّل /js/config.js (إصلاح المسارات المطلقة)
//    • يحمّل /js/file.js (فهرس الملفات WAHA_FILE_LOADER)
//    • يحمّل /js/menu.js (يُؤجَّل بعد الهيدر)
//    • يحمّل /js/diag.js شرطياً (فقط على الرئيسية + ?diag أو localStorage)
//    • withVersion(): يضيف ?v=8.4.2 لكل سكربت (كسر الكاش)
//
// 🎯 3) HEADER + FOOTER LOADER
//    • يجلب /header.html → #header-placeholder
//    • يجلب /footer.html → #footer-placeholder
//    • bustCache(): يضيف ?_t=timestamp (كسر كاش قوي)
//    • safelyExecuteScripts(): ينفّذ <script> داخل الـ partial
//    • إعادة محاولة واحدة عند فشل الشبكة (retry بعد 1.5s)
//    • dataset.loaded='true' دائماً (حتى عند الفشل) — لا تعليق
//    • dataset.version='8.4.2' أو '8.4.2-fallback'
//
// 🛡️ 4) HEADER-EVENT GUARD
//    • fireHeaderLoaded('ok' | 'fallback') — يُطلق ONCE فقط
//    • _headerLoadedFired flag يمنع الإطلاق المزدوج
//    • يُؤجَّل الإطلاق إلى ما بعد تحميل menu.js — ليلتقطه menu.js
//    • إصلاح لمشكلة "زر القائمة لا يظهر"
//
// 📡 5) NETWORK TOASTS (netToasts — كان flag ميت)
//    • 🔴 "لا يوجد اتصال" عند التحميل بدون شبكة
//    • 🔴 "انقطع الاتصال" عند حدث offline
//    • 🟢 "تم استعادة الاتصال" عند حدث online
//    • 🐢 "اتصال بطيء (>5s)" عند fetch بطيء (fetch wrapper)
//    • ⚠️ "فشل تحميل: [filename]" عند فشل fetch
//    • ⏳ "جاري تحميل [name]..." عند بدء كل partial
//    • ✅ "تم تحميل [name]" إذا استغرق >3s
//    • 🐢 "اتصال 2G/slow-2g" من navigator.connection
//    • 5 ألوان: info/ok/warn/err/offline
//    • زر ✕ لكل toast + auto-dismiss
//    • fetch wrapper عالمي يكتشف Slow + Failed
//
// ✅ 6) FILE EXISTS / FILE LIST
//    • fileExists(): HEAD ثم Range:bytes=0-0 (يعمل على Vercel)
//    • timeouts: 1.5s HEAD + 2s Range (لا تجمد)
//    • loadFileList(): يجلب /file-all4.txt أو WAHA_FILE_LOADER()
//    • ينظّف السطور من ⛔ ... ⭐ أرقام
//    • cache في localStorage (TTL: 1 ساعة)
//    • FILE_LIST.lowerMap: بحث غير حساس للحالة
//
// 🎯 7) RESOLVE FILE SMART
//    • generateVariants(): يجرّب:
//      - exact match
//      - lowercase
//      - /AR-file → /file-ar.html (+ _ar)
//      - /file-AR.html → /file-ar.html (+ _ar)
//      - /ar/file.html → /file.html (root)
//    • resolveFileSmart():
//      1. ابحث في FILE_LIST.lowerMap (سريع)
//      2. وإلا — fileExists() لكل variant (بطيء لكن دقيق)
//    • يُستخدم في: detect404, handle404Redirect
//
// 🔗 8) AUTO FIX LINKS
//    • يحوّل /about → /about.html تلقائياً
//    • لا يلمس: http(s), //, mailto:, tel:, javascript:, #
//    • لا يلمس: /api/, /image/, /hadrami
//    • لا يلمس: أي رابط فيه extension
//    • لا يلمس: ما ينتهي بـ /
//
// 🚨 9) DETECT 404 (4 طبقات)
//    • ① document.body.dataset.waha404 === 'true'
//    • ② document.title فيه "404"
//    • ③ body.innerText < 200 حرف && فيه "404"
//    • ④ fetch(location.href, Range) → status === 404
//    • عند اكتشاف 404 → handle404Redirect():
//      - resolveFileSmart أولاً
//      - إن لم يوجد → CONFIG.allLinksPath
//    • يُشغَّل بعد 800ms من init (يمنع الإنذارات الكاذبة)
//
// 🌐 10) TOGGLE LANGUAGE (AR ↔ EN)
//    • يكتشف اللغة الحالية من /ar/ /en/ أو html.lang
//    • يجرّب 6 مستويات:
//      L1: /ar/file.html (lang folder)
//      L2: /file.html (root)
//      L3: /file-ar.html (suffix)
//      L4: /file-en.html
//      L5: fileInList() من الفهرس
//      L6: fileExists() live check
//    • fallback: /all-links.html
//    • يُصدَّر كـ: window.toggleLang, switchLanguage, toggleLanguage
//
// 🎵 11) HOURLY AUDIO (المرعبة الصوتية)
//    • 6 ملفات: jabri.mp4, sindbad-brdoni.mp4, zamel2.mp4,
//               heaven3.mp4, zaml.mp4, hadrami.mp3
//    • 3 أنماط: rotate (افتراضي), hourly, random
//    • ينتظر أول click/touch (سياسة المتصفح)
//    • sessionKey: يخزن آخر ملف في sessionStorage
//    • يحترم jabri_sound_off في localStorage
//    • video أو audio حسب الامتداد
//    • el.volume=0.7, playsinline, يخفي العنصر
//    • API: play(), stop(), enable(), resetRotation()
//    • يُصدَّر: window.Jabri.HOURLY_AUDIO
//
// 🎨 12) INJECT BAR FIX (CSS)
//    • يثبت #header-placeholder أعلى الصفحة (68px)
//    • يثبت .top-header-buttons (12px من الأعلى)
//    • body { padding-top: 68px } — لا تغطية للمحتوى
//    • يرفع z-index للأزرار العائمة
//    • يضبط أماكن lang-btn, music-btn-fixed, #visitorCounter
//    • استجابة للجوال (media query: max 600px)
//
// 🔤 13) SAFE SCRIPT EXECUTION
//    • safelyExecuteScripts(container):
//      - <script src> → يُنشأ عنصر جديد في head مع withVersion
//      - <script inline> → new Function().call(window)
//      - fallback: append لـ head لو Function فشلت
//    • يمنع تكرار السكربتات (CSS.escape)
//
// 🧹 14) SPLASH MANAGER
//    • hideSplash() — idempotent (لا يعمل مرتين)
//    • يُزيل العنصر من DOM بعد 400ms
//    • يُستدعى من: init, load, click, touchstart, loadPartial
//
// 🌍 15) EXPORT API (window.Jabri)
//    • version, buildDate, config
//    • fileExists, resolveFileSmart, generateVariants
//    • handle404Redirect
//    • loadPartial, loadFileList, fileInList
//    • hideSplash, autoFixLinks
//    • FILE_LIST, toggleLang, HOURLY_AUDIO
//    • fireHeaderLoaded
//    • showNetToast, removeToast, dismissLoadToasts
//    • network: NET (كائن كامل)
//    + window.toggleLang / switchLanguage / toggleLanguage
//
// 🚀 16) INIT SEQUENCE (الترتيب المضبوط)
//    1. createSplash() — أول شيء
//    2. injectBarFix() — CSS فوري
//    3. initNetworkWatcher() — قبل أي fetch
//    4. reportConnectionType() — تشخيص 2G/3G/4G
//    5. تحميل CORE_SCRIPTS — config.js + file.js
//    6. diag.js شرطياً (رئيسية + diag)
//    7. تحميل الهيدر (بدون إطلاق الحدث)
//    8. تحميل menu.js
//    9. fireHeaderLoaded() — الآن menu.js جاهز
//    10. تحميل الفوتر
//    11. HOURLY_AUDIO.arm() — انتظار تفاعل
//    12. autoFixLinks()
//    13. detect404() بعد 800ms
//    14. loadFileList() في الخلفية
//
// ────────────────────────────────────────────────────────────────
// 📊 COMPARISON: v8.4.1 → v8.4.2
// ────────────────────────────────────────────────────────────────
// v8.4.1:
//   ❌ headerLoaded يُطلق قبل menu.js → الزر مختفي
//   ❌ netToasts flag ميت (لا كود)
//   ❌ catch لا يفتح dataset.loaded عندما fallback=''
//   ❌ لا fetch wrapper
//   ❌ لا retry على شبكة متقطعة
//
// v8.4.2 (هذه النسخة):
//   ✅ headerLoaded يُطلق بعد menu.js (guard flag)
//   ✅ NET system كامل (6 مستويات إشعار)
//   ✅ fetch wrapper (slow + fail)
//   ✅ retry واحد على partials
//   ✅ dataset.loaded='true' دائماً
//   ✅ reportConnectionType (2G/3G/4G)
//   ✅ notifyLoadStart/End (progress toasts)
//
// ────────────────────────────────────────────────────────────────
// 🔧 DEPENDENCIES
// ────────────────────────────────────────────────────────────────
//   /js/config.js       — إصلاح المسارات المطلقة
//   /js/file.js         — WAHA_FILE_LOADER (فهرس الملفات)
//   /js/menu.js         — يبني #hamburger-menu
//   /js/diag.js         — تشخيص اختياري
//   /header.html        — الهيدر
//   /footer.html        — الفوتر
//   /file-all4.txt      — فهرس احتياطي
//   /404.html           — شبكة الأمان (يستقبل ?from=)
//
// ────────────────────────────────────────────────────────────────
// ⚠️ تحذيرات
// ────────────────────────────────────────────────────────────────
//   • لا تعدّل هذا الملف دون فهم الترتيب في init()
//   • fireHeaderLoaded يعمل ONCE — لا تحاول إطلاقه ثانية
//   • fetch wrapper عالمي — أي كود يستدعي fetch() سيمر عبره
//   • HOURLY_AUDIO ينتظر click — لا تعمل تلقائياً (سياسة المتصفح)
//   • fileExists مع redirect:'manual' — Vercel redirects=status 0
//     (يعتبرها موجودة — قد يسبب مشاكل في صفحات محذوفة redirect لـ 404)
//
// ════════════════════════════════════════════════════════════════
// IDEA: Z + C + A = 1 — "المدير الواحد"
// ════════════════════════════════════════════════════════════════

(function() {
  'use strict';
  const VERSION    = '8.4.2';
  const BUILD_DATE = '2026-10-18';
  const BASE_URL   = 'https://jabri-com.vercel.app';

  const CORE_SCRIPTS = ['/js/config.js', '/js/file.js'];

  const DEFAULT_CONFIG = {
    splash:true, header:true, footer:true, detect404:true,
    version:true, music:true, autoFixLinks:true, netToasts:true,
    autoHideSplashAfter:1500, auto404TryAfter:1500,
    allLinksPath:'/all-links.html', indexPath:'/index.html', wahaPath:'/Page11.html',
    fileListTTL: 1000 * 60 * 60
  };
  const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.JABRI_CONFIG || {});
  let splashHidden = false;

  let _headerLoadedFired = false;
  function fireHeaderLoaded(reason){
    if(_headerLoadedFired) return;
    _headerLoadedFired = true;
    try{
      document.dispatchEvent(new CustomEvent('headerLoaded', {
        detail: { version: VERSION, reason }
      }));
      console.log(`🛡️ headerLoaded fired [${reason}]`);
    }catch(e){}
  }

  function withVersion(url){
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + 'v=' + VERSION;
  }
  function bustCache(url){
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + 'v=' + VERSION + '&_t=' + Date.now();
  }

  function loadScript(src) {
    return new Promise(resolve => {
      if (document.querySelector(`script[src^="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = withVersion(src);
      s.defer = true;
      s.onload = () => { console.log(`📦 محمّل: ${src}`); resolve(); };
      s.onerror = () => { console.warn(`⚠️ فشل تحميل: ${src}`); resolve(); };
      document.head.appendChild(s);
    });
  }

  async function fileExists(url){
    try{
      const c = new AbortController();
      const tid = setTimeout(() => c.abort(), 1500);
      const res = await fetch(url, { method:'HEAD', cache:'no-store', signal:c.signal });
      clearTimeout(tid);
      if(res.ok || res.status === 206) return true;
      if(res.status === 404) return false;
    }catch(e){}
    try{
      const c = new AbortController();
      const tid = setTimeout(() => c.abort(), 2000);
      const res = await fetch(url, { method:'GET', headers:{ 'Range':'bytes=0-0' }, signal:c.signal, cache:'no-store' });
      clearTimeout(tid); c.abort();
      return res.ok || res.status === 206;
    }catch(e){ return false; }
  }

  const FILE_LIST = { files:new Set(), loaded:false, loading:null, lowerMap:new Map() };

  async function loadFileList(){
    if(FILE_LIST.loaded)  return FILE_LIST.files;
    if(FILE_LIST.loading) return FILE_LIST.loading;
    FILE_LIST.loading = (async () => {
      try{
        try{
          const cached     = localStorage.getItem('jabri_filelist_v841');
          const cachedTime = parseInt(localStorage.getItem('jabri_filelist_time_v841') || '0', 10);
          if(cached && (Date.now() - cachedTime < CONFIG.fileListTTL)){
            JSON.parse(cached).forEach(p => {
              const full = p.startsWith('/') ? p : '/' + p;
              FILE_LIST.files.add(full);
              FILE_LIST.lowerMap.set(full.toLowerCase(), full);
            });
            FILE_LIST.loaded = true;
            return FILE_LIST.files;
          }
        }catch(e){}

        let listArr = [];
        if(typeof window.WAHA_FILE_LOADER === 'function'){
          const r = await window.WAHA_FILE_LOADER();
          if(Array.isArray(r)) listArr = r;
        } else {
          const res  = await fetch(bustCache('/file-all4.txt'), { cache:'no-store' });
          const text = await res.text();
          listArr = text.split(/\r?\n/).map(l => {
            l = l.trim();
            if(!l || l.startsWith('#') || l.includes('⛔') || l.includes('...')) return null;
            l = l.replace(/^[A-Z]?\d+\.\s+/, '').replace(/\s*⭐.*$/, '').split(/\s+/)[0].replace(/["']/g, '');
            if(!/\.\w{2,5}$/.test(l)) return null;
            return l.startsWith('/') ? l : '/' + l;
          }).filter(Boolean);
        }

        listArr.forEach(full => {
          if(!full) return;
          const f = full.startsWith('/') ? full : '/' + full;
          FILE_LIST.files.add(f);
          FILE_LIST.lowerMap.set(f.toLowerCase(), f);
        });

        try{
          localStorage.setItem('jabri_filelist_v841', JSON.stringify([...FILE_LIST.files]));
          localStorage.setItem('jabri_filelist_time_v841', String(Date.now()));
        }catch(e){}

        FILE_LIST.loaded = true;
        return FILE_LIST.files;
      }catch(e){
        FILE_LIST.loaded = true;
        return FILE_LIST.files;
      }
    })();
    return FILE_LIST.loading;
  }

  function fileInList(path){
    if(!FILE_LIST.loaded || FILE_LIST.files.size === 0) return null;
    return FILE_LIST.files.has(path);
  }

  function generateVariants(rawPath){
    const variants = new Set();
    let clean = rawPath.trim();
    if(!clean.startsWith('/')) clean = '/' + clean;
    variants.add(clean);
    variants.add(clean.toLowerCase());
    let m = clean.match(/^\/(AR|EN)[-_](.+)/i);
    if(m){
      const rest = m[2].replace(/\.html$/i,'');
      variants.add('/' + rest + '-' + m[1].toLowerCase() + '.html');
      variants.add('/' + rest + '_' + m[1].toLowerCase() + '.html');
    }
    m = clean.match(/^\/(.+)[-_](AR|EN)\.html$/i);
    if(m){
      const base = m[1];
      variants.add('/' + base.toLowerCase() + '-' + m[2].toLowerCase() + '.html');
      variants.add('/' + base.toLowerCase() + '_' + m[2].toLowerCase() + '.html');
    }
    const langPrefix = clean.match(/^\/(ar|en)\/(.+)$/i);
    if(langPrefix) variants.add('/' + langPrefix[2]);
    return [...variants];
  }

  async function resolveFileSmart(rawPath){
    await loadFileList();
    const vars = generateVariants(rawPath);
    for(const v of vars){
      const found = FILE_LIST.lowerMap.get(v.toLowerCase());
      if(found) return found;
    }
    for(const v of vars){
      if(await fileExists(v)) return v;
    }
    return null;
  }

  const NET = {
    container: null,
    toastTimeout: 4000,
    slowThreshold: 5000,
    offlineShown: false,
    slowTimer: null,
    loadStart: {},
    autoDismissTimers: {}
  };

  function ensureNetContainer(){
    if(NET.container && document.body.contains(NET.container)) return NET.container;
    const c = document.createElement('div');
    c.id = 'jabri-net-toasts';
    c.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:999998;display:flex;flex-direction:column;gap:8px;pointer-events:none;font-family:Cairo,system-ui,sans-serif;direction:rtl;max-width:90vw;';
    document.body.appendChild(c);
    NET.container = c;
    return c;
  }

  function showNetToast(message, type, duration){
    if(!CONFIG.netToasts) return null;
    if(!document.body) return null;
    type = type || 'info';
    duration = duration === undefined ? NET.toastTimeout : duration;

    const colors = {
      info:    { bg: 'linear-gradient(135deg,#6ae3ff,#3aa0c4)', fg: '#0a0a0f' },
      ok:      { bg: 'linear-gradient(135deg,#06d6a0,#05b98a)', fg: '#0a0a0f' },
      warn:    { bg: 'linear-gradient(135deg,#ffd166,#f0a500)', fg: '#0a0a0f' },
      err:     { bg: 'linear-gradient(135deg,#ff6b6b,#e85555)', fg: '#fff' },
      offline: { bg: 'linear-gradient(135deg,#8b0000,#5c0000)', fg: '#fff' }
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.style.cssText = `background:${c.bg};color:${c.fg};padding:12px 22px;border-radius:30px;font-weight:700;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:auto;display:flex;align-items:center;gap:8px;opacity:0;transform:translateY(-20px);transition:opacity .3s,transform .3s;white-space:nowrap;max-width:90vw;overflow:hidden;text-overflow:ellipsis;`;

    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'flex:1;text-align:right';
    toast.appendChild(text);

    const close = document.createElement('span');
    close.textContent = '✕';
    close.style.cssText = 'cursor:pointer;opacity:.7;font-size:16px;padding-right:6px';
    close.onclick = () => removeToast(toast);
    toast.appendChild(close);

    ensureNetContainer().appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    if(duration > 0) setTimeout(() => removeToast(toast), duration);
    return toast;
  }

  function removeToast(toast){
    if(!toast || !toast.parentNode) return;
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => { try { toast.remove(); } catch(e){} }, 300);
  }

  function dismissLoadToasts(name){
    if(!NET.container) return;
    NET.container.querySelectorAll('div').forEach(t => {
      const txt = t.textContent || '';
      if(txt.includes('جاري تحميل') && (!name || txt.includes(name))) removeToast(t);
    });
  }

  function initNetworkWatcher(){
    if(!CONFIG.netToasts) return;

    if(!navigator.onLine){
      showNetToast('🔴 لا يوجد اتصال بالإنترنت', 'offline', 0);
      NET.offlineShown = true;
    }

    window.addEventListener('online', () => {
      console.log('🟢 [net] online');
      showNetToast('🟢 تم استعادة الاتصال', 'ok', 3000);
      NET.offlineShown = false;
      if(NET.container){
        NET.container.querySelectorAll('div').forEach(t => {
          if(t.textContent && t.textContent.includes('لا يوجد اتصال')) removeToast(t);
        });
      }
    });

    window.addEventListener('offline', () => {
      console.log('🔴 [net] offline');
      showNetToast('🔴 انقطع الاتصال بالإنترنت', 'offline', 0);
      NET.offlineShown = true;
    });

    if(window.fetch && !window.__jabriFetchWrapped){
      const origFetch = window.fetch.bind(window);
      window.fetch = async function(...args){
        const url = (args[0] && args[0].url) || args[0] || '';
        const start = Date.now();
        try{
          const res = await origFetch(...args);
          const dur = Date.now() - start;
          if(dur > NET.slowThreshold){
            console.warn(`🐢 [net] slow: ${url} (${dur}ms)`);
            showNetToast(`🐢 اتصال بطيء (${(dur/1000).toFixed(1)}s)`, 'warn', 3000);
          }
          return res;
        }catch(e){
          console.error(`❌ [net] failed: ${url}`, e.message);
          if(!navigator.onLine){
            showNetToast('🔴 فشل الاتصال — تحقق من الشبكة', 'offline', 4000);
          }else{
            const name = String(url).split('/').pop().split('?')[0];
            showNetToast(`⚠️ فشل تحميل: ${name}`, 'err', 4000);
          }
          throw e;
        }
      };
      window.__jabriFetchWrapped = true;
      console.log('🌐 [net] fetch wrapped');
    }
  }

  function notifyLoadStart(name){
    if(!CONFIG.netToasts) return;
    NET.loadStart[name] = Date.now();
    clearTimeout(NET.slowTimer);
    NET.slowTimer = setTimeout(() => {
      showNetToast(`⏳ جاري تحميل ${name}...`, 'info', 0);
    }, 1500);
    clearTimeout(NET.autoDismissTimers[name]);
    NET.autoDismissTimers[name] = setTimeout(() => dismissLoadToasts(name), 4000);
  }

  function notifyLoadEnd(name, success){
    if(!CONFIG.netToasts) return;
    clearTimeout(NET.slowTimer);
    clearTimeout(NET.autoDismissTimers[name]);
    dismissLoadToasts(name);
    const dur = NET.loadStart[name] ? Date.now() - NET.loadStart[name] : 0;
    if(success){
      console.log(`✅ [net] ${name} loaded in ${dur}ms`);
      if(dur > 3000) showNetToast(`✅ تم تحميل ${name} (${(dur/1000).toFixed(1)}s)`, 'ok', 2000);
    }else{
      console.warn(`⚠️ [net] ${name} failed after ${dur}ms`);
      showNetToast(`⚠️ تعذّر تحميل ${name}`, 'err', 4000);
    }
  }

  function reportConnectionType(){
    if(!CONFIG.netToasts) return;
    try{
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if(!conn) return;
      const type = conn.effectiveType || 'unknown';
      const down = conn.downlink ? `${conn.downlink} Mb/s` : '';
      console.log(`📶 [net] connection: ${type} ${down}`);
      if(type === 'slow-2g' || type === '2g'){
        showNetToast(`🐢 اتصال ${type.toUpperCase()} — قد يكون التحميل بطيئاً`, 'warn', 5000);
      }
    }catch(e){}
  }

  function autoFixLinks(){
    if(!CONFIG.autoFixLinks) return;
    document.querySelectorAll('a[href]').forEach(a => {
      const orig = a.getAttribute('href');
      if(!orig) return;
      const trimmed = orig.trim();
      if(/^(https?:|\/\/|mailto:|tel:|javascript:|#)/i.test(trimmed)) return;
      if(trimmed.startsWith('/api/') || trimmed.startsWith('/image/') || trimmed.startsWith('/hadrami')) return;
      if(/\.[a-z0-9]{2,5}([?#]|$)/i.test(trimmed)) return;
      if(trimmed.endsWith('/')) return;
      const pathPart = trimmed.split(/[?#]/)[0];
      if(!pathPart) return;
      if(/\.html?$/i.test(pathPart)) return;
      const qs = trimmed.substring(pathPart.length);
      const target = pathPart + '.html';
      const inList = fileInList(target);
      if(inList === false) return;
      a.setAttribute('href', target + qs);
    });
  }

  async function handle404Redirect(){
    const path  = location.pathname;
    const fixed = await resolveFileSmart(path);
    if(fixed && fixed !== path){ location.replace(fixed); return; }
    location.replace(CONFIG.allLinksPath);
  }

  async function detect404(){
    if(!CONFIG.detect404 || window.__jabri404Standalone) return;
    if(/\/404\.html?$/i.test(location.pathname)) return;

    let is404 = false;
    if(document.body && document.body.dataset.waha404 === 'true') is404 = true;
    if(!is404 && document.title.toLowerCase().includes('404'))     is404 = true;
    if(!is404 && document.body &&
       document.body.innerText.length < 200 &&
       document.body.innerText.includes('404')) is404 = true;
    if(!is404){
      try{
        const c = new AbortController();
        const tid = setTimeout(() => c.abort(), 2000);
        const res = await fetch(location.href, { method:'GET', headers:{ 'Range':'bytes=0-0' }, signal:c.signal, cache:'no-store' });
        clearTimeout(tid); c.abort();
        if(res.status === 404) is404 = true;
      }catch(e){}
    }

    if(!is404) return;

    try {
      sessionStorage.setItem('jabri404From', location.pathname);
      sessionStorage.removeItem('jabri404Count');
    } catch(e){}
    console.log('📄 [404] → /404.html?from=' + location.pathname);
    location.replace('/404.html?from=' + encodeURIComponent(location.pathname));
  }

  function injectBarFix(){
    const style = document.createElement('style');
    style.id = 'jabri-bar-fix-v842';
    style.textContent = `
      #header-placeholder{position:fixed!important;top:0!important;left:0!important;right:0!important;height:68px!important;z-index:10001!important;background:rgba(10,10,15,0.92)!important;backdrop-filter:blur(8px);}
      .top-header-buttons{position:fixed!important;top:12px!important;left:12px!important;right:12px!important;width:auto!important;height:44px!important;z-index:10002!important;background:transparent!important;display:flex!important;justify-content:space-between!important;align-items:center!important;}
      body{padding-top:68px!important;}
      #hamburger-menu{top:70px!important;right:12px!important;}
      .lang-btn, .music-btn-fixed, #visitorCounter{top:80px!important;z-index:10005!important;}
      @media (max-width:600px){.lang-btn, .music-btn-fixed, #visitorCounter{top:76px!important;}}
      .brand-card, .btn-b{position:relative!important;z-index:5!important;}
      #site-footer{z-index:2!important;padding-bottom:90px!important;}
      .bottom-bar{z-index:10000!important;}
      #splashScreen.hidden{display:none!important;pointer-events:none!important;}
    `;
    document.head.appendChild(style);
  }

  function hideSplash(){
    if(splashHidden) return;
    splashHidden = true;
    const el = document.getElementById('splashScreen');
    if(el){
      el.classList.add('hidden');
      setTimeout(() => { try{ el.remove(); }catch(e){} }, 400);
    }
  }

  function createSplash(){
    if(!CONFIG.splash || !document.body || document.getElementById('splashScreen')) return;
    const html = `<div id="splashScreen"><div class="splash-title">واحة الجبري</div><div class="splash-sub">تراث اليمن العريق</div><div class="spinner"></div><div class="splash-version">v${VERSION}</div><style>#splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10003;transition:opacity .4s ease}#splashScreen.hidden{opacity:0;pointer-events:none}#splashScreen .splash-title{color:#6ae3ff;font-size:2.5rem;font-weight:900}.splash-sub{color:#888;font-size:1.1rem;margin-top:8px}.spinner{width:40px;height:40px;margin-top:30px;border:3px solid rgba(106,227,255,.1);border-top:3px solid #6ae3ff;border-radius:50%;animation:spin 1s linear infinite}.splash-version{position:absolute;bottom:20px;color:#444;font-size:12px}@keyframes spin{to{transform:rotate(360deg)}}</style></div>`;
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.prepend(div.firstElementChild);
    setTimeout(hideSplash, CONFIG.autoHideSplashAfter);
  }

  function safelyExecuteScripts(container){
    container.querySelectorAll('script').forEach(old => {
      try{
        if(old.src){
          const src = withVersion(old.src);
          if(document.querySelector(`script[src="${CSS.escape(src)}"]`)) return;
          const s = document.createElement('script');
          s.src   = src;
          s.async = false;
          document.head.appendChild(s);
        } else if(old.textContent.trim()){
          try{ new Function(old.textContent).call(window); }
          catch(e){
            const s = document.createElement('script');
            s.textContent = old.textContent;
            document.head.appendChild(s);
          }
        }
      }catch(err){}
    });
  }

  async function loadPartial(id, fileName, evt, isHeader){
    const el = document.getElementById(id);
    if(!el || el.dataset.loaded === 'true'){ if(isHeader) setTimeout(hideSplash, 500); return true; }

    const label = fileName.replace(/^\//, '').replace('.html', '');
    notifyLoadStart(label);

    async function attempt(){
      const res = await fetch(bustCache(fileName), { cache:'no-store' });
      if(!res.ok) throw new Error(res.status);
      return await res.text();
    }

    try{
      let html;
      try{ html = await attempt(); }
      catch(e1){
        if(!navigator.onLine) throw e1;
        console.warn(`🔄 إعادة محاولة: ${fileName}`);
        await new Promise(r => setTimeout(r, 1500));
        html = await attempt();
      }
      el.innerHTML       = html;
      el.dataset.loaded  = 'true';
      el.dataset.version = VERSION;
      el.style.display   = '';
      safelyExecuteScripts(el);
      if(CONFIG.autoFixLinks) autoFixLinks();
      notifyLoadEnd(label, true);
      if(!isHeader) document.dispatchEvent(new CustomEvent(evt, { detail:{ version:VERSION } }));
      if(isHeader) setTimeout(hideSplash, 300);
      return true;
    }catch(e){
      el.dataset.loaded  = 'true';
      el.dataset.version = VERSION + '-fallback';
      notifyLoadEnd(label, false);
      console.warn(`⚠️ loadPartial(${fileName}) فشل:`, e && e.message);
      if(isHeader) setTimeout(hideSplash, 500);
      return false;
    }
  }

  function getBasePath(){
    const p = location.pathname;
    const m = p.match(/^(.*?)\/(ar|en)(\/|$)/i);
    if(m) return m[1];
    return p.substring(0, p.lastIndexOf('/'));
  }
  function getFileName(){
    const p = location.pathname;
    const b = getBasePath();
    const w = p.substring(b.length).replace(/^\/(ar|en)(\/|$)/i, '/').replace(/^\/+/, '');
    return w || 'all-links.html';
  }
  async function toggleLang(){
    const path  = location.pathname;
    const qs    = location.search + location.hash;
    const lang  = document.documentElement.lang;
    const base  = getBasePath();
    const file  = getFileName();
    const lower = path.toLowerCase();

    let targetLang = lower.includes('/en/') ? 'ar'
                   : lower.includes('/ar/') ? 'en'
                   : (lang === 'ar' ? 'en' : 'ar');

    await loadFileList();
    const isArSuffix = /-ar\.html$/i.test(file);
    let candidates = [];

    if(targetLang === 'ar'){
      candidates.push(file.replace(/-e?n?\.html$/i, '-ar.html'));
      candidates.push(file.replace(/\.html$/i, '-ar.html'));
    } else {
      if(isArSuffix){
        candidates.push(file.replace(/-ar\.html$/i, '.html'));
        candidates.push(file.replace(/-ar\.html$/i, '-en.html'));
      } else {
        candidates.push(file.replace(/\.html$/i, '-en.html'));
      }
    }
    candidates.push(base + '/' + targetLang + '/' + file);
    candidates.push('/' + targetLang + '/' + file);
    candidates.push('/' + file);
    candidates = [...new Set(candidates)];

    for(let cand of candidates){
      if(!cand.startsWith('/')) cand = '/' + cand;
      if(fileInList(cand) === true){ location.href = cand + qs; return; }
      if(fileInList(cand) === null && await fileExists(cand)){ location.href = cand + qs; return; }
    }
    location.href = CONFIG.allLinksPath;
  }

  const HOURLY_AUDIO = {
    files: ['/image/jabri.mp4','/image/sindbad-brdoni.mp4','/image/zamel2.mp4','/image/heaven3.mp4','/image/zaml.mp4','/hadrami.mp3'],
    mode: 'rotate', sessionKey: 'jabri_audio_idx_v842', played: false, userDisabled: false, currentEl: null,
    getFileForNow(){
      if(this.mode === 'hourly') return this.files[Math.min(Math.floor(new Date().getHours() / 4), this.files.length - 1)];
      if(this.mode === 'random') return this.files[Math.floor(Math.random() * this.files.length)];
      let idx = 0;
      try{
        const stored = sessionStorage.getItem(this.sessionKey);
        if(stored !== null) idx = (parseInt(stored, 10) + 1) % this.files.length;
        sessionStorage.setItem(this.sessionKey, String(idx));
      }catch(e){ idx = Math.floor(Math.random() * this.files.length); }
      return this.files[idx];
    },
    play(file){
      if(this.played || !file || this.userDisabled || !CONFIG.music) return;
      try{ if(localStorage.getItem('jabri_sound_off') === '1'){ this.userDisabled = true; return; } }catch(e){}
      this.played = true;
      try{
        const isVideo = /\.mp4$/i.test(file);
        const el = document.createElement(isVideo ? 'video' : 'audio');
        el.src = withVersion(file); el.preload = 'auto'; el.autoplay = true; el.volume = 0.7; el.muted = false;
        el.setAttribute('playsinline', ''); el.setAttribute('webkit-playsinline', '');
        Object.assign(el.style, { position:'fixed', left:'-9999px', top:'-9999px', width:'1px', height:'1px', opacity:'0', pointerEvents:'none' });
        document.body.appendChild(el);
        this.currentEl = el;
        const p = el.play();
        if(p && typeof p.catch === 'function') p.catch(err => console.warn('🎵 المتصفح منع التشغيل:', err));
        el.addEventListener('ended', () => { try{ el.remove(); }catch(e){} this.currentEl = null; }, { once:true });
        console.log('🎵 تشغيل [' + this.mode + ']:', file);
      }catch(e){ console.warn('🎵 خطأ:', e); }
    },
    arm(){
      const events = ['click', 'touchstart'];
      const handler = () => {
        setTimeout(() => this.play(this.getFileForNow()), 300);
        events.forEach(ev => window.removeEventListener(ev, handler, false));
      };
      events.forEach(ev => window.addEventListener(ev, handler, { capture:false, passive:true }));
      console.log(`🎵 HOURLY_AUDIO v842 — ${this.mode} — بانتظار تفاعل`);
    },
    stop(){ if(this.currentEl){ try{ this.currentEl.pause(); this.currentEl.remove(); }catch(e){} } this.currentEl = null; this.played = true; this.userDisabled = true; try{ localStorage.setItem('jabri_sound_off', '1'); }catch(e){} },
    enable(){ try{ localStorage.removeItem('jabri_sound_off'); }catch(e){} this.played = false; this.userDisabled = false; this.arm(); },
    resetRotation(){ try{ sessionStorage.removeItem(this.sessionKey); }catch(e){} console.log('🔄 تم إعادة تعيين الدور'); }
  };

  async function init(){
    if(/\/404\.html?$/i.test(location.pathname)){
      console.log('📄 [init] على 404.html — تخطي init-page-root');
      return;
    }

    try { sessionStorage.removeItem('jabri404Count'); } catch(e){}

    createSplash();
    injectBarFix();

    initNetworkWatcher();
    reportConnectionType();

    for (const script of CORE_SCRIPTS) {
      await loadScript(script);
    }

    const isHomePage = location.pathname === '/' || location.pathname.endsWith('/index.html') || location.pathname.endsWith('/index');
    let isDiagEnabled = false;
    try { isDiagEnabled = localStorage.getItem('jabri_diag_on') === '1'; } catch(e) {}
    const hasDiagParam = new URLSearchParams(location.search).has('diag');
    if (isHomePage && (hasDiagParam || isDiagEnabled)) {
      await loadScript('/js/diag.js');
    }

    let headerOk = false;
    if(CONFIG.header) {
      headerOk = await loadPartial('header-placeholder', '/header.html', 'headerLoaded', true);
    }

    await loadScript('/js/menu.js');

    if(CONFIG.header) {
      fireHeaderLoaded(headerOk ? 'ok' : 'fallback');
    }

    if(CONFIG.footer) {
      await loadPartial('footer-placeholder', '/footer.html', 'footerLoaded', false);
    }

    if(CONFIG.music) HOURLY_AUDIO.arm();
    if(CONFIG.autoFixLinks) autoFixLinks();
    setTimeout(() => detect404(), 800);

    window.addEventListener('load', () => setTimeout(hideSplash, 800));
    document.addEventListener('click', () => { if(!splashHidden) hideSplash(); }, { once:true });
    document.addEventListener('touchstart', () => { if(!splashHidden) hideSplash(); }, { once:true });

    loadFileList();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.Jabri = {
    version: VERSION, buildDate: BUILD_DATE, config: CONFIG,
    fileExists, resolveFileSmart, generateVariants, handle404Redirect,
    loadPartial, loadFileList, fileInList, hideSplash, autoFixLinks,
    FILE_LIST, toggleLang, HOURLY_AUDIO,
    fireHeaderLoaded,
    showNetToast, removeToast, dismissLoadToasts, network: NET
  };
  window.toggleLang     = toggleLang;
  window.switchLanguage = toggleLang;
  window.toggleLanguage = toggleLang;

  console.log(`✅ v${VERSION} — "المدير الواحد" + NET كامل — ${BUILD_DATE}`);
})();