// ================================================================
//  🛡️ init-page-root.js
//  Version: 7.0.0 — "Core Only" (404 logic moved to 404.html)
//  Build:   2025-01-XX
//  Author:  Jabri-Com
// ================================================================

(function() {
  'use strict';

  const VERSION      = '7.0.0';
  const BUILD_DATE   = '2025-01-XX';
  const BASE_URL     = 'https://jabri-com.vercel.app';
  const VERSION_FILE = '/version.json';

  // ================================================================
  //  ⚙️ CONFIG
  // ================================================================
  const DEFAULT_CONFIG = {
    splash:       true,
    header:       true,
    footer:       true,
    version:      true,
    music:        true,
    autoFixLinks: true,
    autoHideSplashAfter: 5000
  };
  const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.JABRI_CONFIG || {});

  console.log(`🛡️ [init] v${VERSION} — config:`, CONFIG);

  let splashHidden = false;

  // ================================================================
  //  🔧 أدوات مساعدة
  // ================================================================

  function bustCache(url) {
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + 'v=' + VERSION + '&_t=' + Date.now();
  }

  function withVersion(url) {
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + 'v=' + VERSION;
  }

  async function fileExists(url) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        redirect: 'manual'
      });
      return res.status >= 200 && res.status < 300;
    } catch (e) {
      return false;
    }
  }

  async function resolveFile(rawPath) {
    let clean = (rawPath || '').trim();
    if (!clean) return null;

    if (await fileExists(clean)) {
      console.log('✅ [resolve] found:', clean);
      return clean;
    }

    if (!clean.endsWith('.html')) {
      const withHtml = clean + '.html';
      if (await fileExists(withHtml)) {
        console.log('✅ [resolve] + .html:', withHtml);
        return withHtml;
      }
    }

    const dir = clean.substring(0, clean.lastIndexOf('/') + 1);
    const fallback = dir + 'all-links.html';
    if (await fileExists(fallback)) {
      console.warn('⚠️ [resolve] fallback →', fallback);
      return fallback;
    }

    console.error('❌ [resolve] not found:', rawPath);
    return null;
  }

  // ================================================================
  //  🔧 autoFixLinks
  // ================================================================
  function autoFixLinks() {
    if (!CONFIG.autoFixLinks) return;

    let fixed = 0;
    document.querySelectorAll('a[href]').forEach(a => {
      const original = a.getAttribute('href');
      if (!original) return;

      const trimmed = original.trim();
      if (/^(https?:|\/\/|mailto:|tel:|javascript:|#)/i.test(trimmed)) return;
      if (/\.[a-z0-9]{2,5}([?#]|$)/i.test(trimmed)) return;
      if (trimmed.endsWith('/')) return;

      const pathPart = trimmed.split(/[?#]/)[0];
      if (!pathPart) return;

      const qs = trimmed.substring(pathPart.length);
      const corrected = pathPart + '.html' + qs;

      a.setAttribute('href', corrected);
      fixed++;
      console.log(`🔧 [link] ${original} → ${corrected}`);
    });

    if (fixed > 0) console.log(`✅ [links] fixed ${fixed} link(s)`);
  }

  // ================================================================
  //  🎬 Splash
  // ================================================================

  function createSplash() {
    if (!CONFIG.splash) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', createSplash, { once: true });
      return;
    }
    if (document.getElementById('splashScreen')) return;

    try {
      const html = `
        <div id="splashScreen">
          <div class="splash-title">واحة الجبري</div>
          <div class="splash-sub">تراث اليمن العريق · نظرية السندباد الموحدة</div>
          <div class="spinner"></div>
          <div class="splash-version">v${VERSION}</div>
          <style>
            #splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;transition:opacity .6s ease;font-family:'Cairo',sans-serif}
            #splashScreen.hidden{opacity:0;pointer-events:none}
            .splash-title{color:#6ae3ff;font-size:2.5rem;font-weight:900}
            .splash-sub{color:#888;font-size:1.1rem;margin-top:8px}
            .spinner{width:40px;height:40px;margin-top:30px;border:3px solid rgba(106,227,255,.1);border-top:3px solid #6ae3ff;border-radius:50%;animation:spin 1s linear infinite}
            .splash-version{position:absolute;bottom:20px;color:#444;font-size:12px;font-family:monospace}
            @keyframes spin{to{transform:rotate(360deg)}}
            @media(max-width:600px){.splash-title{font-size:1.8rem}.splash-sub{font-size:.95rem}}
          </style>
        </div>`;
      const div = document.createElement('div');
      div.innerHTML = html;
      document.body.prepend(div.firstElementChild);
      setTimeout(hideSplash, CONFIG.autoHideSplashAfter);
    } catch (e) {
      console.error('❌ splash error:', e);
      hideSplash();
    }
  }

  function hideSplash() {
    if (splashHidden) return;
    splashHidden = true;
    const el = document.getElementById('splashScreen');
    if (!el) return;
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    el.style.display = 'none';
    setTimeout(() => el.remove(), 300);
  }

  // ================================================================
  //  🌐 Helpers
  // ================================================================

  function getBasePath() {
    const path = location.pathname;
    const m = path.match(/^(.*?)\/(ar|en)(\/|$)/i);
    if (m) return m[1];
    return path.substring(0, path.lastIndexOf('/'));
  }

  function getFileName() {
    const path = location.pathname;
    const base = getBasePath();
    const without = path.substring(base.length);
    const pure = without.replace(/^\/(ar|en)(\/|$)/i, '/').replace(/^\/+/, '');
    return pure || 'all-links.html';
  }

  // ================================================================
  //  🌐 Language Switcher
  // ================================================================
  async function toggleLang() {
    const path = location.pathname;
    const qs   = location.search + location.hash;
    const lang = document.documentElement.lang;
    const base = getBasePath();
    const file = getFileName();

    const lower = path.toLowerCase();
    let targetLang;
    if (lower.includes('/en/')) targetLang = 'ar';
    else if (lower.includes('/ar/')) targetLang = 'en';
    else targetLang = (lang === 'ar') ? 'en' : 'ar';

    window.location.href = base + '/' + targetLang + '/' + file + qs;
  }

  // ================================================================
  //  📥 Load Partial
  // ================================================================
  function safelyExecuteScripts(container) {
    container.querySelectorAll('script').forEach(oldScript => {
      try {
        const src = oldScript.src || '';
        const content = oldScript.textContent || '';
        if (src) {
          const vsrc = withVersion(src);
          if (!document.querySelector(`script[src="${vsrc}"]`)) {
            const s = document.createElement('script');
            s.src = vsrc;
            s.async = false;
            document.head.appendChild(s);
          }
        } else if (content.trim()) {
          const s = document.createElement('script');
          s.textContent = content;
          document.head.appendChild(s);
        }
      } catch (e) {}
    });
  }

  async function loadPartial(id, fileName, evt, isHeader) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.dataset.loaded === 'true') {
      if (isHeader) setTimeout(hideSplash, 500);
      return;
    }
    const fallbackHTML = el.innerHTML.trim();
    const resolved = await resolveFile(fileName);

    if (!resolved) {
      if (fallbackHTML) el.dataset.loaded = 'true';
      else el.style.display = 'none';
      if (isHeader) setTimeout(hideSplash, 500);
      return;
    }

    try {
      const res = await fetch(bustCache(resolved), {
        cache: 'no-store', headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      el.innerHTML = await res.text();
      el.dataset.loaded = 'true';
      el.dataset.version = VERSION;
      safelyExecuteScripts(el);
      if (CONFIG.autoFixLinks) autoFixLinks();
      document.dispatchEvent(new CustomEvent(evt, { detail: { version: VERSION } }));
      if (isHeader) setTimeout(hideSplash, 300);
    } catch (e) {
      console.error(`❌ [${fileName}] failed:`, e);
      if (!fallbackHTML) el.style.display = 'none';
      if (isHeader) setTimeout(hideSplash, 500);
    }
  }

  // ================================================================
  //  🔗 Dynamic Links + Canonical
  // ================================================================
  const PAGE_LINKS = {
    '/Page1.html':  { prev: null,           next: '/Page2.html',  up: '/research.html' },
    '/Page2.html':  { prev: '/Page1.html',  next: '/Page3.html',  up: '/research.html' },
    '/Page3.html':  { prev: '/Page2.html',  next: '/Page4.html',  up: '/research.html' },
    '/Page4.html':  { prev: '/Page3.html',  next: '/Page5.html',  up: '/research.html' },
    '/Page5.html':  { prev: '/Page4.html',  next: '/Page6.html',  up: '/research.html' },
    '/Page6.html':  { prev: '/Page5.html',  next: '/Page7.html',  up: '/research.html' },
    '/Page7.html':  { prev: '/Page6.html',  next: '/Page8.html',  up: '/research.html' },
    '/Page8.html':  { prev: '/Page7.html',  next: '/Page9.html',  up: '/research.html' },
    '/Page9.html':  { prev: '/Page8.html',  next: '/Page10.html', up: '/research.html' },
    '/Page10.html': { prev: '/Page9.html',  next: '/Page11.html', up: '/research.html' },
    '/Page11.html': { prev: '/Page10.html', next: '/Page12.html', up: '/research.html' },
    '/Page12.html': { prev: '/Page11.html', next: null,           up: '/research.html' },
    '/Sanaa.html':  { prev: null,           next: '/Shibam.html', up: '/yemen-photo.html' },
    '/Shibam.html': { prev: '/Sanaa.html',  next: '/Soqatra.html',up: '/yemen-photo.html' },
    '/Soqatra.html':{ prev: '/Shibam.html', next: null,           up: '/yemen-photo.html' }
  };

  function addDynamicLinks() {
    const links = PAGE_LINKS[location.pathname];
    if (!links) return;
    ['prev', 'next', 'up'].forEach(rel => {
      const url = links[rel];
      if (!url) return;
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = BASE_URL + withVersion(url);
    });
  }

  function setCanonical() {
    const url = location.href.split('?')[0].split('#')[0];
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  // ================================================================
  //  🎵 Music
  // ================================================================
  const MUSIC_FILES = ['music1.mp3', 'music2.mp3', 'music3.mp3', 'music4.mp3', 'music5.mp3'];
  const MUSIC_NAMES = ['🎵 تراث اليمن', '🎵 سندباد', '🎵 صنعاء', '🎵 شبام', '🎵 سقطرى'];
  let musicIndex = 0;
  let isMusicPlaying = false;
  let musicAudio = null;
  let musicBtn = null;
  let musicTrack = null;

  function initMusic() {
    if (!CONFIG.music) return;
    musicAudio = document.getElementById('bgMusic');
    musicBtn   = document.getElementById('musicBtn');
    musicTrack = document.getElementById('trackName');
    if (!musicAudio || !musicBtn) return;

    musicAudio.src = '/image/' + MUSIC_FILES[0];
    if (musicTrack) musicTrack.textContent = MUSIC_NAMES[0];

    musicAudio.addEventListener('ended', () => {
      musicIndex = (musicIndex + 1) % MUSIC_FILES.length;
      musicAudio.src = '/image/' + MUSIC_FILES[musicIndex];
      if (musicTrack) musicTrack.textContent = MUSIC_NAMES[musicIndex];
      musicAudio.play().catch(() => {});
    });
    musicAudio.addEventListener('play',  () => { musicBtn.textContent = '🔊'; isMusicPlaying = true; });
    musicAudio.addEventListener('pause', () => { musicBtn.textContent = '🔇'; isMusicPlaying = false; });

    const startOnInteraction = () => {
      if (isMusicPlaying) return;
      musicAudio.play().catch(() => {});
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('touchstart', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
    };
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('touchstart', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
  }

  function toggleMusic() {
    if (!musicAudio) musicAudio = document.getElementById('bgMusic');
    if (!musicAudio) return;
    if (isMusicPlaying) musicAudio.pause();
    else musicAudio.play().catch(() => {});
  }
  window.toggleMusic = toggleMusic;

  // ================================================================
  //  🔄 Version Check
  // ================================================================
  async function checkForNewVersion() {
    if (!CONFIG.version) return;
    try {
      const res = await fetch(VERSION_FILE + '?_t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.version && data.version !== VERSION) {
        const toast = document.createElement('div');
        toast.style.cssText = `
          position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
          background:#06d6a0;color:#0a0a0f;padding:12px 24px;
          border-radius:30px;font-weight:700;font-size:14px;
          z-index:999999;box-shadow:0 8px 24px rgba(6,214,160,.4);
          font-family:'Cairo',sans-serif;direction:rtl;cursor:pointer`;
        toast.textContent = `🔄 نسخة جديدة (v${data.version}) — اضغط للتحديث`;
        toast.onclick = forceReload;
        document.body.appendChild(toast);
        setTimeout(forceReload, 30000);
      }
    } catch (e) {}
  }

  function forceReload() {
    if ('caches' in window) caches.keys().then(names => names.forEach(n => caches.delete(n)));
    const url = new URL(location.href);
    url.searchParams.set('_v', Date.now());
    location.href = url.toString();
  }

  // ================================================================
  //  🚀 init
  // ================================================================
  function init() {
    console.log('⚙️ [init] running with config:', CONFIG);
    if (CONFIG.splash) createSplash();
    if (CONFIG.music) initMusic();

    if (CONFIG.header) loadPartial('header-placeholder', 'header.html', 'headerLoaded', true);
    else setTimeout(hideSplash, 300);

    if (CONFIG.footer) loadPartial('footer-placeholder', 'footer.html', 'footerLoaded', false);
    if (CONFIG.version) checkForNewVersion();
    if (CONFIG.autoFixLinks) autoFixLinks();

    document.addEventListener('headerLoaded', () => {
      setCanonical();
      addDynamicLinks();
    });

    window.addEventListener('error', () => hideSplash());
    window.addEventListener('load', () => setTimeout(hideSplash, 1000));
    document.addEventListener('click', () => { if (!splashHidden) hideSplash(); }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ================================================================
  //  🌍 API
  // ================================================================
  window.Jabri = {
    version: VERSION,
    config: CONFIG,
    resolveFile: resolveFile,
    fileExists: fileExists,
    toggleLang: toggleLang,
    toggleMusic: toggleMusic,
    autoFixLinks: autoFixLinks,
    hideSplash: hideSplash,
    forceReload: forceReload
  };

  window.switchLanguage = toggleLang;
  window.toggleLanguage = toggleLang;

  console.log(`✅ الدرع المطلق v${VERSION} (Core) ready`);
})();