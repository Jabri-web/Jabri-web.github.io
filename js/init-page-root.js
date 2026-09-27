// ================================================================
//  init-page-root.js - v5.0 FINAL (الدرع المطلق + البحث الذكي + 404)
//  يجمع: SEO (Canonical + prev/next/up) + FALLBACK + Smart Routing
// ================================================================

(function() {
  'use strict';
  console.log('🛡️ [init] v5.0 FINAL — الدرع المطلق + البحث الذكي');

  // ===== 0) الكشف عن البيئة =====
  const IS_APK = location.protocol === 'file:' || location.hostname === '' || !!window.AndroidBridge;

  function asset(p) {
    const c = String(p || '').replace(/^\//, '');
    return IS_APK ? c : '/' + c;
  }

  function bustCache(url) {
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + '_t=' + Date.now();
  }

  // ===== 1) المصفوفة الاحتياطية الكاملة من file-all4.txt =====
  const FALLBACK_LIST = [
    "index.html", "logo.html", "catalog.html", "all-links.html", "table-all.html", "monitor.html",
    "Page1.html", "Page2.html", "Page3.html", "Page4.html", "Page5.html", "Page6.html",
    "Page7.html", "Page8.html", "Page9.html", "Page10.html", "Page11.html", "Page12.html",
    "about.html", "about-ar.html", "about-en.html", "about-waha.html",
    "Author-cv.html", "author-history.html", "cv-2026a.html", "cv-2026e.html", "founder.html", "profile.html", "profile-en.html",
    "theory-ar.html", "theory-en.html", "Sindbad-theory.html", "Sindbad-Brdoni.html",
    "research.html", "research-deep.html", "Pages-Researches.html",
    "Sanaa.html", "Shibam.html", "Soqatra.html", "Yemen-library.html", "gallery.html", "yemen-photo.html", "yemen-photo2.html",
    "journal.html", "journal2.html", "journal3.html", "journal4.html", "History-pdf.html",
    "calculator.html", "handsa.html", "char-balance.html", "Check.html", "magic-translator.html", "diagnose.html",
    "Dbase.html", "Dbase-deep.html", "microtik.html", "Office.html", "source.html", "citations.html", "music.html",
    "taraif.html", "Nezar.html", "wonder.html", "heaven-info.html", "visitor.html", "who-we.html", "project.html", "poster.html",
    "contact.html", "FAQPage.html", "FAQPage-en.html", "privacy-policy.html", "404.html",
    "file-structure.html", "Router-all.html", "repos-auto.html", "explore.html",
    "dashboard.html", "dashboard-pro.html", "catalogue.html", "dbase-mirror.html",
    "ar/index.html", "ar/about.html", "ar/about-waha.html", "ar/contact.html", "ar/journal.html", "ar/profile.html", "ar/project.html", "ar/Router-all.html", "ar/Page4.html", "ar/Page10.html", "ar/Page11.html", "ar/Page12.html", "ar/dashboard.html", "ar/all-links.html",
    "en/index.html", "en/about.html", "en/about-waha.html", "en/contact.html", "en/journal.html", "en/profile.html", "en/project.html", "en/Router-all.html", "en/Page4.html", "en/Page10.html", "en/Page11.html", "en/Page12.html", "en/dashboard.html", "en/all-links.html",
    "game/game-auto.html", "publish/publish.html",
    "technical-guide.html", "all-link-doc.html", "update-tracker.html"
  ];

  // ===== 2) مصفوفة الذاكرة السريعة (للملفات الحرجة) =====
  const MEMORY = [
    "about-waha.html", "ar/about-waha.html", "en/about-waha.html",
    "all-links.html", "ar/all-links.html", "en/all-links.html",
    "index.html", "Sanaa.html", "Shibam.html", "dbase-mirror.html"
  ];

  // ===== 3) شاشة الترحيب =====
  let splashEl = null;
  let splashHidden = false;

  function createSplash(msg) {
    if (document.getElementById('splashScreen')) return;
    const style = document.createElement('style');
    style.textContent = `
      #splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;transition:opacity.5s;font-family:'Cairo',sans-serif}
      #splashScreen.hidden{opacity:0;pointer-events:none}
      .splash-title{color:#6ae3ff;font-size:2.5rem;font-weight:900}
      .splash-sub{color:#888;font-size:1.1rem;margin-top:8px}
      .splash-msg{color:#6ae3ff;font-weight:900;margin-top:15px;font-size:15px;text-align:center;padding:0 20px}
      .spinner{width:40px;height:40px;margin-top:30px;border:3px solid rgba(106,227,255,0.1);border-top:3px solid #6ae3ff;border-radius:50%;animation:spin 1s linear infinite}
      @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      @media(max-width:600px){.splash-title{font-size:1.8rem}.splash-sub{font-size:0.95rem}}
    `;
    document.head.appendChild(style);
    const d = document.createElement('div');
    d.id = 'splashScreen';
    d.innerHTML = `
      <div class="splash-title">واحة الجبري</div>
      <div class="splash-sub">تراث اليمن العريق · نظرية السندباد الموحدة</div>
      <div class="spinner"></div>
      <div class="splash-msg" id="splashMsg">${msg || 'جارٍ التحميل...'}</div>
    `;
    document.body.prepend(d);
    splashEl = d;
  }

  const setSplashMsg = (m) => {
    const e = document.getElementById('splashMsg');
    if (e) e.textContent = m;
  };

  const hideSplash = () => {
    if (splashHidden) return;
    const el = document.getElementById('splashScreen');
    if (el) el.classList.add('hidden');
    splashHidden = true;
    setTimeout(() => { if (el) el.remove(); }, 800);
  };

  // ===== 4) تحميل قائمة الملفات آلياً =====
  let FILE_LIST = [];
  let fileListReady = false;

  async function loadFileList() {
    if (IS_APK) {
      FILE_LIST = FALLBACK_LIST;
      fileListReady = true;
      console.log('📁 [APK] المصفوفة:', FILE_LIST.length);
      return;
    }
    try {
      let res = await fetch(bustCache(asset('file-all4.txt')), { cache: 'no-store' });
      if (!res.ok) res = await fetch(bustCache(asset('file-all3.txt')), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const set = new Set();
      const regex = /^\s*\d{1,4}[\.\)\-]\s*([a-z0-9\/\-_]+\.(?:html|txt|json|xml|js|css))\b/gim;
      let m;
      while ((m = regex.exec(text)) !== null) {
        const f = m[1].trim();
        if (!f.includes('dashboard-pro')) set.add(f);
      }
      if (set.size < 10) {
        text.split('\n').forEach(line => {
          const t = line.trim();
          if (!t || t.startsWith('#')) return;
          const clean = t.split(/\s+/).pop();
          if (/\.html$/i.test(clean)) set.add(clean);
        });
      }
      FILE_LIST = set.size > 10 ? [...set] : FALLBACK_LIST;
      console.log(`✅ [FileList] ${FILE_LIST.length} ملف من file-all4.txt`);
    } catch (e) {
      console.warn('⚠️ [FileList] fallback:', e.message);
      FILE_LIST = FALLBACK_LIST;
    }
    fileListReady = true;
  }

  // ===== 5) تحميل الهيدر والفوتر =====
  function safelyExecuteScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      try {
        const src = oldScript.src || '';
        const content = oldScript.textContent || '';
        if (src) {
          if (src.toLowerCase().includes('menu.js')) return;
          const existing = document.querySelector(`script[src="${src}"]`);
          if (!existing) {
            const newScript = document.createElement('script');
            newScript.src = src;
            newScript.async = false;
            document.head.appendChild(newScript);
          }
        } else if (content.trim()) {
          const newScript = document.createElement('script');
          newScript.textContent = content;
          document.head.appendChild(newScript);
        }
      } catch (e) {
        console.warn('⚠️ [init] تخطي سكربت:', e.message);
      }
    });
  }

  async function loadHTMLFile(id, file) {
    const ph = document.getElementById(id);
    if (!ph) return false;
    if (ph.dataset.loaded === 'true') return true;
    try {
      const res = await fetch(bustCache(asset(file)), { cache: 'no-store' });
      if (!res.ok) throw new Error(res.status);
      ph.innerHTML = await res.text();
      ph.dataset.loaded = 'true';
      safelyExecuteScripts(ph);
      return true;
    } catch (e) {
      console.warn(`⚠️ [${id}] فشل:`, e.message);
      ph.innerHTML = `<div style="color:#ff6a6a;padding:20px;text-align:center;">⚠️ فشل تحميل ${id}</div>`;
      return false;
    }
  }

  // ===== 6) الروابط الديناميكية (SEO) =====
  function addDynamicLinks() {
    const currentPath = window.location.pathname;
    const pageLinks = {
      '/Page1.html': { prev: null, next: '/Page2.html', up: '/research.html' },
      '/Page2.html': { prev: '/Page1.html', next: '/Page3.html', up: '/research.html' },
      '/Page3.html': { prev: '/Page2.html', next: '/Page4.html', up: '/research.html' },
      '/Page4.html': { prev: '/Page3.html', next: '/Page5.html', up: '/research.html' },
      '/Page5.html': { prev: '/Page4.html', next: '/Page6.html', up: '/research.html' },
      '/Page6.html': { prev: '/Page5.html', next: '/Page7.html', up: '/research.html' },
      '/Page7.html': { prev: '/Page6.html', next: '/Page8.html', up: '/research.html' },
      '/Page8.html': { prev: '/Page7.html', next: '/Page9.html', up: '/research.html' },
      '/Page9.html': { prev: '/Page8.html', next: '/Page10.html', up: '/research.html' },
      '/Page10.html': { prev: '/Page9.html', next: '/Page11.html', up: '/research.html' },
      '/Page11.html': { prev: '/Page10.html', next: '/Page12.html', up: '/research.html' },
      '/Page12.html': { prev: '/Page11.html', next: null, up: '/research.html' },
      '/Sanaa.html': { prev: null, next: '/Shibam.html', up: '/yemen-photo.html' },
      '/Shibam.html': { prev: '/Sanaa.html', next: '/Soqatra.html', up: '/yemen-photo.html' },
      '/Soqatra.html': { prev: '/Shibam.html', next: null, up: '/yemen-photo.html' }
    };
    const links = pageLinks[currentPath];
    if (!links) return;
    const head = document.head;
    if (links.prev) {
      let link = document.querySelector('link[rel="prev"]');
      if (!link) { link = document.createElement('link'); link.rel = 'prev'; head.appendChild(link); }
      link.href = 'https://jabri-com.vercel.app' + links.prev;
    }
    if (links.next) {
      let link = document.querySelector('link[rel="next"]');
      if (!link) { link = document.createElement('link'); link.rel = 'next'; head.appendChild(link); }
      link.href = 'https://jabri-com.vercel.app' + links.next;
    }
    if (links.up) {
      let link = document.querySelector('link[rel="up"]');
      if (!link) { link = document.createElement('link'); link.rel = 'up'; head.appendChild(link); }
      link.href = 'https://jabri-com.vercel.app' + links.up;
    }
    console.log('🔗 روابط ديناميكية مضافة لـ ' + currentPath);
  }

  // ===== 7) Canonical تلقائي =====
  function setDynamicCanonical() {
    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;
    console.log('🔗 Canonical مضبوط على: ' + currentUrl);
  }

  // ===== 8) البحث الذكي + 404 =====
  const existsCache = new Map();
  const visitedTargets = new Set();

  async function fileExists(url) {
    const clean = url.replace(/^\//, '').toLowerCase().split('?')[0].split('#')[0];
    if (existsCache.has(clean)) return existsCache.get(clean);
    const inMem = MEMORY.map(f => f.toLowerCase()).includes(clean) ||
                  FALLBACK_LIST.map(f => f.toLowerCase()).includes(clean);
    if (inMem) { existsCache.set(clean, true); return true; }
    if (IS_APK) { existsCache.set(clean, false); return false; }
    try {
      const r = await fetch(asset(url), { method: 'GET', cache: 'no-store' });
      existsCache.set(clean, r.ok);
      return r.ok;
    } catch {
      existsCache.set(clean, false);
      return false;
    }
  }

  function buildTripleCandidates(requestPath) {
    let clean = requestPath.replace(/^\/+/, '').trim();
    let folder = '';
    let name = clean;
    if (clean.includes('/')) {
      const parts = clean.split('/');
      name = parts.pop() || '';
      folder = parts.join('/') + '/';
    }
    let baseName = name.replace(/\.html$/i, '').toLowerCase();
    if (!baseName) return [];
    const cands = [];
    cands.push(`${baseName}.html`);
    cands.push(`ar/${baseName}.html`);
    cands.push(`en/${baseName}.html`);
    if (folder) cands.push(`${folder}${baseName}.html`);
    return [...new Set(cands)];
  }

  function findInTriple(requestPath) {
    if (!fileListReady || !FILE_LIST.length) return null;
    const cands = buildTripleCandidates(requestPath);
    const lowerList = FILE_LIST.map(f => f.toLowerCase());
    for (const cand of cands) {
      const idx = lowerList.indexOf(cand.toLowerCase());
      if (idx !== -1) return FILE_LIST[idx];
      const base = cand.split('/').pop();
      const idx2 = lowerList.findIndex(f => f.toLowerCase().split('/').pop() === base.toLowerCase());
      if (idx2 !== -1) return FILE_LIST[idx2];
    }
    return null;
  }

  async function smart404() {
    if (IS_APK) return;
    const path = location.pathname;
    const pathClean = path.replace(/\/+$/, '') || '/';
    const lowerPath = pathClean.toLowerCase();

    // استثناءات
    if (['', '/', '/ar', '/en', '/index.html', '/ar/index.html', '/en/index.html',
         '/ar/all-links.html', '/en/all-links.html', '/all-links.html'].includes(lowerPath)) return;
    if (/\.(js|css|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|map|json|txt|xml|pdf|mp3|mp4|webm|php)$/i.test(path)) return;

    // منع الحلقات
    const loopKey = 'waha_404_' + lowerPath;
    try {
      if (sessionStorage.getItem(loopKey) || visitedTargets.has(lowerPath)) {
        console.warn('⛔ [Anti-Loop] تمت زيارته:', lowerPath);
        return;
      }
      sessionStorage.setItem(loopKey, Date.now().toString());
      visitedTargets.add(lowerPath);
    } catch (e) {}

    if (lowerPath.includes('all-links')) return;

    // عرض شاشة البحث
    if (!splashEl) createSplash('🔍 جارٍ البحث...');
    else {
      const el = document.getElementById('splashScreen');
      if (el) el.classList.remove('hidden');
    }
    setSplashMsg('🔍 نبحث في /, /ar, /en...');

    // 1) البحث في القائمة المدمجة
    const found = findInTriple(pathClean);
    if (found) {
      const target = '/' + found;
      if (target.toLowerCase() !== lowerPath && !visitedTargets.has(target.toLowerCase())) {
        setSplashMsg('✅ وجدناها! ' + found);
        console.log('✅ [Triple] →', target);
        location.replace(target + location.search + location.hash);
        return;
      }
    }

    // 2) البحث في المرشحين مع fetch
    const candidates = buildTripleCandidates(pathClean);
    for (const cand of candidates) {
      const t = '/' + cand;
      if (t.toLowerCase() === lowerPath) continue;
      if (await fileExists(t)) {
        setSplashMsg('✅ وجدناها! ' + cand);
        location.replace(t + location.search + location.hash);
        return;
      }
    }

    // 3) الفشل → all-links.html (وليس index.html)
    setSplashMsg('🗺️ نفتح خريطة الموقع...');
    const lang = lowerPath.startsWith('/en') ? 'en' : 'ar';
    const allLinksCandidates = [
      `/${lang}/all-links.html`,
      '/all-links.html',
      '/ar/all-links.html',
      '/en/all-links.html'
    ];
    for (const c of allLinksCandidates) {
      if (c.toLowerCase() === lowerPath) continue;
      if (await fileExists(c)) {
        console.log('🗺️ [404] →', c);
        location.replace(c + '?from=' + encodeURIComponent(pathClean));
        return;
      }
    }

    // 4) الحل الأخير: الرئيسية
    setSplashMsg('🏠 العودة للرئيسية...');
    setTimeout(() => {
      const targetLang = lowerPath.startsWith('/en') ? 'en' : 'ar';
      const target = `/${targetLang}/` + location.search + location.hash;
      if (target.toLowerCase() !== lowerPath) location.replace(target);
      else hideSplash();
    }, 700);
  }

  // ===== 9) تبديل اللغة =====
  window.switchLanguage = window.toggleLanguage = function() {
    const path = location.pathname;
    const clean = path.replace(/^\/(ar|en)(\/|$)/i, '/') || '/';
    const isAr = /^\/ar(\/|$)/i.test(path);
    location.href = (isAr ? '/en' : '/ar') + (clean === '/' ? '/' : clean) + location.search + location.hash;
  };

  // ===== 10) التهيئة =====
  async function init() {
    try {
      const lang = location.pathname.toLowerCase().startsWith('/en') ? 'en' : 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

      createSplash('جارٍ التحميل...');
      setSplashMsg('📋 تحميل قائمة الملفات...');
      await loadFileList();

      setSplashMsg('📥 تحميل الهيدر...');
      await loadHTMLFile('header-placeholder', 'header.html');

      setSplashMsg('📥 تحميل الفوتر...');
      await loadHTMLFile('footer-placeholder', 'footer.html');

      setSplashMsg('🔗 إعداد SEO...');
      setDynamicCanonical();
      addDynamicLinks();

      await smart404();

      setSplashMsg('✨ جاهز');
      setTimeout(hideSplash, 200);

      document.dispatchEvent(new CustomEvent('headerLoaded'));
      document.dispatchEvent(new CustomEvent('footerLoaded'));
    } catch (e) {
      console.error('❌ init error:', e);
      hideSplash();
    }

    // مهلة أمان
    setTimeout(() => { if (!splashHidden) hideSplash(); }, 6000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();