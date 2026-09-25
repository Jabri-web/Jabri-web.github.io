// init-page-root.js — v8.5 "Fixed Regex + Smart Fallback + Polished"
// Auto-Load FileList + Full Fallback + Triple Focus + Safe Inject
(function(){
  'use strict';
  console.log('👁️ [init] v8.5 — polished & armed');

  const IS_APK = location.protocol === 'file:' || location.hostname === '' || !!window.AndroidBridge;

  /* ============ 0) المصفوفة الاحتياطية الكاملة ============ */
  const FALLBACK_LIST = [
    // الجذر الرئيسي
    "index.html", "logo.html", "catalog.html", "all-links.html", "table-all.html", "monitor.html",
    "Page1.html", "Page2.html", "Page3.html", "Page4.html", "Page5.html", "Page6.html",
    "Page7.html", "Page8.html", "Page9.html", "Page10.html", "Page11.html", "Page12.html",
    "about.html", "about-ar.html", "about-en.html", "about-waha.html",
    "Author-cv.html", "author-history.html", "cv-2026a.html", "cv-2026e.html", "founder.html", "profile.html", "profile-en.html",
    "theory-ar.html", "theory-en.html", "Sindbad-theory.html", "Sindbad-Brdoni.html",
    "research.html", "research-deep.html", "Pages-Researches.html",
    "Sanaa.html", "Shibam.html", "Soqatra.html", "Yemen-library.html", "gallery.html", "yemen-photo.html", "yemen-photo2.html", "yemen-photo-api.html", "yemen-photo-php.html",
    "journal.html", "journal2.html", "journal3.html", "journal4.html", "History-pdf.html",
    "calculator.html", "handsa.html", "char-balance.html", "Check.html", "magic-translator.html", "diagnose.html", "link-checker.html",
    "Dbase.html", "Dbase-deep.html", "microtik.html", "microtik-deep.html",
    "Office.html", "source.html", "citations.html", "music.html", "taraif.html", "Nezar.html", "wonder.html", "heaven-info.html", "visitor.html", "who-we.html", "project.html", "project-ar.html", "poster.html",
    "contact.html", "FAQPage.html", "FAQPage-en.html", "privacy-policy.html", "404.html",
    "file-structure.html", "file-structure2.html", "Router-all.html", "repos-auto.html", "repos-sqr.html", "current-auto.html",
    "kfupm-msg.html", "explore.html",
    // مجلد ar
    "ar/index.html", "ar/about.html", "ar/contact.html", "ar/journal.html", "ar/profile.html", "ar/project.html", "ar/Router-all.html", "ar/Page4.html", "ar/Page10.html", "ar/Page11.html", "ar/Page12.html",
    // مجلد en
    "en/index.html", "en/about.html", "en/contact.html", "en/journal.html", "en/profile.html", "en/project.html", "en/Router-all.html", "en/Page4.html", "en/Page10.html", "en/Page11.html", "en/Page12.html",
    // مجلدات فرعية أخرى
    "game/game-auto.html", "publish/publish.html",
    // ملفات محدثة
    "technical-guide.html", "all-link-doc.html", "update-tracker.html"
  ];

  let FILE_LIST = [];
  let fileListReady = false;

  /* ============ 1) أدوات المسار ============ */
  function asset(path){
    const clean = String(path||'').replace(/^\//,'');
    return IS_APK ? clean : '/' + clean;
  }

  /* ============ 2) تحميل قائمة الملفات آلياً ============ */
  async function loadFileList(){
    if(IS_APK){
      FILE_LIST = FALLBACK_LIST;
      fileListReady = true;
      console.log('📁 [APK] المصفوفة الاحتياطية:', FILE_LIST.length, 'ملف');
      return;
    }
    try{
      const res = await fetch(asset('file-all3.txt') + '?_t=' + Date.now(), {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const set = new Set();

      // ✅ إصلاح: إضافة g لمنع الحلقة اللانهائية
      const regex = /^\s*\d{1,4}[\.\)\-]\s*([a-z0-9\/\-_]+\.(?:html|txt|json|xml|js|css))\b/gim;
      let m;
      while((m = regex.exec(text)) !== null){
        const f = m[1].trim();
        if(!f.includes('dashboard.html')) set.add(f);
      }

      // طريقة احتياطية ثانية لو التنسيق مختلف
      if(set.size < 10){
        text.split('\n').forEach(line => {
          const t = line.trim();
          if(!t || t.startsWith('#')) return;
          const clean = t.split(/\s+/).pop();
          if(/\.html$/i.test(clean) && !clean.includes('dashboard.html')) set.add(clean);
        });
      }

      FILE_LIST = set.size > 10 ? [...set] : FALLBACK_LIST;
      console.log(`✅ [FileList] ${FILE_LIST.length} ملف من file-all3.txt`);
    }catch(e){
      console.warn('⚠️ [FileList] فشل، استخدام المصفوفة الكاملة:', e.message);
      FILE_LIST = FALLBACK_LIST;
    }
    fileListReady = true;
  }

  /* ============ 3) وضع الصفحة ============ */
  function detectPageMode(){
    const s = document.currentScript;
    const m = [document.body?.dataset?.pageMode, document.documentElement?.dataset?.pageMode, s?.dataset?.pageMode]
     .map(v => String(v||'').toLowerCase()).find(v => ['safe','full','minimal'].includes(v));
    if(m) return m;
    if(s?.hasAttribute('data-no-splash')) return 'safe';
    if(location.pathname.toLowerCase().startsWith('/app/catalog')) return 'safe';
    return 'full';
  }
  const PAGE_MODE = detectPageMode();

  /* ============ 4) شاشة الانتظار ============ */
  let splashEl = null;
  function createSplash(msg){
    if(PAGE_MODE !== 'full' || document.getElementById('splashScreen')) return;
    const style = document.createElement('style');
    style.textContent = `#splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;transition:opacity .5s}#splashScreen.hidden{opacity:0;pointer-events:none}#splashScreen .msg{color:#6ae3ff;font-weight:900;margin-top:15px;font-size:15px;text-align:center;padding:0 20px}#splashScreen .bar{width:180px;height:3px;background:#1a1a25;border-radius:3px;margin-top:14px;overflow:hidden}#splashScreen .bar::after{content:'';display:block;height:100%;width:40%;background:#c9a84c;animation:sp 1.2s infinite ease-in-out}@keyframes sp{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`;
    document.head.appendChild(style);
    const d = document.createElement('div'); d.id='splashScreen';
    d.innerHTML = `<img src="${asset('icon-192.png')}" style="width:90px;height:90px;border-radius:50%;border:3px solid #c9a84c" onerror="this.remove()"><div class="msg" id="splashMsg">${msg||'جارٍ التحميل...'}</div><div class="bar"></div>`;
    document.body.prepend(d); splashEl = d;
  }
  const setSplashMsg = (m) => { const e = document.getElementById('splashMsg'); if(e) e.textContent = m; };
  const hideSplash = () => { if(!splashEl) return; const el = splashEl; splashEl = null; el.classList.add('hidden'); setTimeout(()=>el.remove(), 700); };
  window.addEventListener('load', () => setTimeout(hideSplash, 800));
  setTimeout(hideSplash, 5000);

  /* ============ 5) تحميل HTML (مبسط) ============ */
  async function loadHTMLFile(id, file){
    const ph = document.getElementById(id);
    if(!ph) return false;
    try{
      const res = await fetch(asset(file) + '?_t=' + Date.now(), {cache:'no-store'});
      if(!res.ok) throw new Error(res.status);
      const html = await res.text();
      ph.innerHTML = html;
      ph.dataset.loaded = 'true';
      ph.querySelectorAll('script').forEach(old => {
        if(old.src && old.src.toLowerCase().includes('menu.js')) return;
        const s = document.createElement('script');
        [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));
        s.textContent = old.textContent;
        if(old.src) s.src = old.src;
        old.replaceWith(s);
      });
      return true;
    }catch{ return false; }
  }

  /* ============ 6) fileExists مع Cache ============ */
  const existsCache = new Map();
  async function fileExists(url){
    if(IS_APK) return false;
    const key = url.toLowerCase();
    if(existsCache.has(key)) return existsCache.get(key);
    try{
      const r = await fetch(asset(url), {method:'GET', cache:'no-store'});
      const ok = r.ok;
      existsCache.set(key, ok);
      return ok;
    }catch{ existsCache.set(key, false); return false; }
  }

  /* ============ 7) المطابقة الذكية v3 ============ */
  function findInArray(requestPath){
    if(!fileListReady || !FILE_LIST.length) return null;
    let clean = requestPath.replace(/^\/+/, '').replace(/\.html$/i, '').toLowerCase().trim();
    if(clean.length < 2) return null;
    const lower = FILE_LIST.map(f => f.toLowerCase());

    // 1. مطابقة مباشرة 100%
    let idx = lower.indexOf(clean + '.html');
    if(idx !== -1) return FILE_LIST[idx];
    idx = lower.indexOf(clean);
    if(idx !== -1) return FILE_LIST[idx];

    // 2. مطابقة بعد إزالة ar/en/ (يحافظ على اللغة)
    let withoutLang = clean.replace(/^(ar|en)\//, '');
    if(withoutLang !== clean){
      idx = lower.indexOf(withoutLang + '.html');
      if(idx !== -1) return FILE_LIST[idx];
    }

    // 3. مطابقة اسم الملف الأساسي
    let base = withoutLang.split('/').pop();
    idx = lower.findIndex(f => f.toLowerCase().split('/').pop().replace('.html', '') === base);
    return idx !== -1 ? FILE_LIST[idx] : null;
  }

  /* ============ 8) Smart 404 ============ */
  async function smart404(){
    if(IS_APK) return;
    const path = location.pathname;
    const pathClean = path.replace(/\/+$/, '') || '/';

    if(['/','/ar','/en','/index.html','/index','/ar/index','/en/index'].includes(pathClean.toLowerCase())) return;
    if(/\.(js|css|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|map|json|txt|xml|pdf|mp3|mp4|webm|php)$/i.test(path)) return;
    if(/^\/(image|images|assets|css|js|fonts|uploads|media)\//i.test(pathClean) && !pathClean.includes('.')) return;

    if(document.getElementById('header-placeholder')?.dataset?.loaded === 'true') return;
    if(document.getElementById('footer-placeholder')?.dataset?.loaded === 'true') return;
    if(document.querySelector('main')?.children.length >= 3) return;

    const key = 'waha_404_' + pathClean;
    try{ if(sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); }catch(e){}

    if(!splashEl) createSplash('🔍 جارٍ البحث...');
    else document.getElementById('splashScreen')?.classList.remove('hidden');
    setSplashMsg('🔍 جارٍ البحث عن الصفحة...');

    // 1. البحث في المصفوفة
    const found = findInArray(pathClean);
    if(found && await fileExists('/' + found)){
      setSplashMsg('✅ وجدناها!');
      console.log('🎯 [404] مصفوفة:', found);
      location.replace('/' + found + location.search + location.hash);
      return;
    }

    // 2. إضافة .html تلقائياً
    if(!path.toLowerCase().endsWith('.html') && await fileExists(pathClean + '.html')){
      setSplashMsg('✅ وجدناها!');
      console.log('🔄 [404] .html:', pathClean + '.html');
      location.replace(pathClean + '.html' + location.search + location.hash);
      return;
    }

    // 3. خريطة الموقع
    setSplashMsg('🗺️ خريطة الموقع...');
    for(const c of ['/all-links.html','/ar/all-links.html','/en/all-links.html']){
      if(c.replace(/\/+$/,'') !== pathClean && await fileExists(c)){
        location.replace(c);
        return;
      }
    }

    // 4. الرئيسية
    setSplashMsg('🏠 العودة للرئيسية...');
    setTimeout(() => {
      const lang = path.toLowerCase().startsWith('/en') ? 'en' : 'ar';
      location.replace(`/${lang}/` + location.search + location.hash);
    }, 600);
  }

  /* ============ 9) تبديل اللغة ============ */
  window.switchLanguage = window.toggleLanguage = function(){
    const path = location.pathname;
    const clean = path.replace(/^\/(ar|en)(\/|$)/i, '/') || '/';
    const isAr = /^\/ar(\/|$)/i.test(path);
    location.href = (isAr ? '/en' : '/ar') + (clean === '/' ? '/' : clean) + location.search + location.hash;
  };

  /* ============ 10) التهيئة ============ */
  async function init(){
    try{
      const lang = location.pathname.toLowerCase().startsWith('/en') ? 'en' : 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      if(PAGE_MODE === 'full') createSplash('جارٍ التحميل...');

      setSplashMsg('📋 تحميل قائمة الملفات...');
      await loadFileList();

      setSplashMsg('📥 تحميل الهيدر...');
      await loadHTMLFile('header-placeholder', 'header.html');
      await loadHTMLFile('footer-placeholder', 'footer.html');

      // ✅ تشغيل smart404 قبل إخفاء الـ splash
      await smart404();

      setSplashMsg('✨ جاهز');
      setTimeout(hideSplash, 200);
    }catch(e){
      console.error('❌ init error:', e);
      hideSplash();
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();