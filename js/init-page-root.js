// ================================================================
//  🛡️ init-page-root.js
//  Version: 7.0.0 — "Full Process + Smart Redirect"
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
    detect404:    true,
    version:      true,
    music:        true,
    autoFixLinks: true,
    autoHideSplashAfter: 5000,
    auto404TryAfter: 2000,
    allLinksPath: '/all-links.html',
    indexPath:    '/index.html',
    wahaPath:     '/Page11.html'
  };
  const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.JABRI_CONFIG || {});

  console.log(`🛡️ [init] v${VERSION} — config:`, CONFIG);

  let splashHidden = false;

  // ================================================================
  //  🔧 أدوات
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

    if (await fileExists(clean)) return clean;

    if (!clean.endsWith('.html')) {
      const withHtml = clean + '.html';
      if (await fileExists(withHtml)) return withHtml;
    }

    const dir = clean.substring(0, clean.lastIndexOf('/') + 1);
    const fallback = dir + 'all-links.html';
    if (await fileExists(fallback)) return fallback;

    return null;
  }

  function autoFixLinks() {
    if (!CONFIG.autoFixLinks) return;
    let fixed = 0;
    document.querySelectorAll('a[href]').forEach(a => {
      const orig = a.getAttribute('href');
      if (!orig) return;
      const trimmed = orig.trim();
      if (/^(https?:|\/\/|mailto:|tel:|javascript:|#)/i.test(trimmed)) return;
      if (/\.[a-z0-9]{2,5}([?#]|$)/i.test(trimmed)) return;
      if (trimmed.endsWith('/')) return;
      const pathPart = trimmed.split(/[?#]/)[0];
      if (!pathPart) return;
      const qs = trimmed.substring(pathPart.length);
      const corrected = pathPart + '.html' + qs;
      a.setAttribute('href', corrected);
      fixed++;
    });
    if (fixed > 0) console.log(`✅ [links] fixed ${fixed}`);
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
          </style>
        </div>`;
      const div = document.createElement('div');
      div.innerHTML = html;
      document.body.prepend(div.firstElementChild);
      setTimeout(hideSplash, CONFIG.autoHideSplashAfter);
    } catch (e) { hideSplash(); }
  }

  function hideSplash() {
    if (splashHidden) return;
    splashHidden = true;
    const el = document.getElementById('splashScreen');
    if (el) el.remove();
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
  //  🚨 show404Overlay — الشاشة الكاملة مع Process
  // ================================================================
  function show404Overlay() {
    if (document.getElementById('jabri-404-overlay')) return;
    if (sessionStorage.getItem('jabri404Handled')) return;
    sessionStorage.setItem('jabri404Handled', 'true');

    hideSplash();

    try {
      const audio = new Audio(BASE_URL + '/image/music1.mp3');
      audio.volume = 0.15;
      audio.loop = true;
      audio.play().catch(() => {});
    } catch (e) {}

    let count = localStorage.getItem('jabriVisitorCount');
    if (count === null) count = Math.floor(Math.random() * 80) + 20;
    else count = Number(count) + 1;
    localStorage.setItem('jabriVisitorCount', count);

    const currentPath = location.pathname;
    const hasHtml = currentPath.toLowerCase().endsWith('.html');

    let targetPath;
    if (!hasHtml) {
      targetPath = currentPath + '.html';
    } else {
      const file = currentPath.split('/').filter(Boolean).pop();
      targetPath = '/' + file;
    }

    const div = document.createElement('div');
    div.id = 'jabri-404-overlay';
    div.style.cssText = `
      position:fixed;inset:0;
      background: linear-gradient(145deg, #0b1a2e, #1a2f44);
      color:#f0e6d3;
      z-index:999999;
      display:flex;justify-content:center;align-items:center;
      font-family:'Cairo',sans-serif;
      direction:rtl;padding:20px;overflow-y:auto;
    `;

    div.innerHTML = `
      <style>
        #jabri-404-overlay .ov-container {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          padding: 30px 22px;
          border-radius: 30px;
          border: 1px solid rgba(255,215,150,0.2);
          max-width: 540px;
          width: 100%;
          box-shadow: 0 30px 50px rgba(0,0,0,0.6);
          text-align: center;
        }
        #jabri-404-overlay .ov-404-num {
          font-size: 5.5rem;
          font-weight: 900;
          color: #b48b5a;
          text-shadow: 0 0 60px rgba(180,139,90,0.5);
          line-height: 1;
          margin-bottom: 8px;
        }
        #jabri-404-overlay .ov-title {
          font-size: 1.3rem;
          color: #f0e6d3;
          margin-bottom: 22px;
          line-height: 1.6;
        }
        #jabri-404-overlay .ov-box {
          background: #0b1a2e;
          border: 1px solid #b48b5a;
          border-radius: 14px;
          padding: 10px 14px;
          margin: 8px 0;
          text-align: right;
        }
        #jabri-404-overlay .ov-label {
          font-size: 0.72rem;
          color: #b48b5a;
          margin-bottom: 5px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        #jabri-404-overlay .ov-value {
          font-family: 'Courier New', monospace;
          font-size: 0.82rem;
          color: #6ae3ff;
          direction: ltr;
          text-align: left;
          word-break: break-all;
          padding: 6px 10px;
          background: rgba(106,227,255,0.05);
          border-radius: 6px;
          border: 1px solid rgba(106,227,255,0.2);
          min-height: 28px;
        }
        #jabri-404-overlay #ovResult { color: #ffd166; }
        #jabri-404-overlay #ovResult.ok  { color: #06d6a0; }
        #jabri-404-overlay #ovResult.err { color: #ff6b6b; }
        #jabri-404-overlay .network-log {
          background: #000;
          border: 1px solid #6ae3ff;
          border-radius: 12px;
          padding: 10px 14px;
          margin: 12px 0;
          max-height: 160px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          text-align: left;
          direction: ltr;
        }
        #jabri-404-overlay .network-log-title {
          color: #6ae3ff;
          font-size: 10px;
          margin-bottom: 6px;
          padding-bottom: 5px;
          border-bottom: 1px solid rgba(106,227,255,0.3);
          font-weight: 700;
          letter-spacing: 1px;
        }
        #jabri-404-overlay .log-line {
          padding: 3px 0;
          color: #8aa5b5;
          line-height: 1.5;
          word-break: break-all;
        }
        #jabri-404-overlay .log-line.info { color: #6ae3ff; }
        #jabri-404-overlay .log-line.ok   { color: #06d6a0; }
        #jabri-404-overlay .log-line.err  { color: #ff6b6b; }
        #jabri-404-overlay .log-line.warn { color: #ffd166; }
        #jabri-404-overlay .log-line.step { color: #b48b5a; font-weight: 700; }
        #jabri-404-overlay .ov-visitors {
          margin: 14px auto;
          background: linear-gradient(135deg, #b48b5a, #8b6a3f);
          color: #0a0a0f;
          border-radius: 40px;
          padding: 9px 20px;
          font-weight: 700;
          font-size: 0.95rem;
          display: inline-block;
        }
        #jabri-404-overlay .ov-visitors span {
          color: #0a0a0f; font-weight: 900; font-size: 1.15rem;
        }
        #jabri-404-overlay .loader {
          margin: 12px auto;
          width: 38px; height: 38px;
          border: 4px solid #b48b5a;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin404 0.9s linear infinite;
        }
        @keyframes spin404 { to { transform: rotate(360deg); } }
        #jabri-404-overlay .ov-countdown {
          margin: 8px 0;
          font-size: 0.95rem;
          color: #6ae3ff;
          font-family: monospace;
          font-weight: 700;
        }
        #jabri-404-overlay .ov-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 18px;
        }
        #jabri-404-overlay .ov-btn {
          padding: 12px 10px;
          border: none;
          border-radius: 14px;
          font-size: 0.82rem;
          font-weight: 900;
          font-family: inherit;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: transform 0.2s ease;
        }
        #jabri-404-overlay .ov-btn:hover { transform: scale(1.05); }
        #jabri-404-overlay .ov-btn-map  { background: linear-gradient(135deg, #6ae3ff, #3aa0c4); color: #0a0a0f; }
        #jabri-404-overlay .ov-btn-home { background: linear-gradient(135deg, #ffd700, #f0a500); color: #0a0a0f; }
        #jabri-404-overlay .ov-btn-waha { background: linear-gradient(135deg, #06d6a0, #05b98a); color: #0a0a0f; }
        #jabri-404-overlay .ov-btn-exit { background: linear-gradient(135deg, #ff6b6b, #e85555); color: #fff; }
        #jabri-404-overlay .ov-footer {
          margin-top: 16px; font-size: 0.82rem; color: #b48b5a;
        }
        #jabri-404-overlay .ov-version {
          margin-top: 6px; font-size: 11px; color: #444;
          font-family: monospace;
        }
        @media (max-width: 500px) {
          #jabri-404-overlay .ov-404-num { font-size: 4rem; }
          #jabri-404-overlay .ov-title { font-size: 1.1rem; }
          #jabri-404-overlay .ov-btn { font-size: 0.72rem; padding: 11px 6px; }
        }
      </style>

      <div class="ov-container">
        <div class="ov-404-num">404</div>
        <div class="ov-title">🏝️ عذرًا، هذا الدرب غير موجود</div>

        <div class="ov-box">
          <div class="ov-label">🔍 CURRENT PATH</div>
          <div class="ov-value" id="ovCurrent">${currentPath}</div>
        </div>

        <div class="ov-box">
          <div class="ov-label">➡️ TARGET PATH</div>
          <div class="ov-value" id="ovTarget">${targetPath}</div>
        </div>

        <div class="ov-box">
          <div class="ov-label">📊 RESULT</div>
          <div class="ov-value" id="ovResult">⏳ Initializing...</div>
        </div>

        <div class="network-log" id="networkLog">
          <div class="network-log-title">🌐 PROCESS LOG</div>
        </div>

        <div class="ov-visitors">
          👥 عدد الزوار: <span>${count}</span>
        </div>

        <div class="loader"></div>

        <div class="ov-countdown" id="ovCountdown">⏱️ 7s</div>

        <div class="ov-options">
          <a href="${CONFIG.allLinksPath}" class="ov-btn ov-btn-map">🗺️ خريطة</a>
          <a href="${CONFIG.indexPath}" class="ov-btn ov-btn-home">🏠 افتتاح</a>
          <a href="${CONFIG.wahaPath}" class="ov-btn ov-btn-waha">🏝️ الواحة</a>
          <button onclick="exitPage()" class="ov-btn ov-btn-exit">🚪 خروج</button>
        </div>

        <div class="ov-footer">🏛️ من صنعاء إلى الكون 🇾🇪</div>
        <div class="ov-version">v${VERSION}</div>
      </div>
    `;
    document.body.prepend(div);

    if (window.gtag) {
      window.gtag('event', 'page_not_found', {
        page_path: location.pathname,
        page_location: location.href
      });
    }

    // ⏰ عدّاد تنازلي
    let seconds = 7;
    const countdownEl = document.getElementById('ovCountdown');
    const countdownInterval = setInterval(() => {
      seconds--;
      if (countdownEl) countdownEl.textContent = `⏱️ ${seconds}s`;
      if (seconds <= 0) clearInterval(countdownInterval);
    }, 1000);

    // ⏰ بدء المنطق بعد ثانيتين
    setTimeout(() => {
      handle404Redirect();
    }, CONFIG.auto404TryAfter);
  }

  // ================================================================
  //  📊 logStep — يُسجّل خطوة في Process Log
  // ================================================================
  function logStep(step, message, type) {
    type = type || 'info';
    const logEl = document.getElementById('networkLog');
    if (!logEl) return;
    const line = document.createElement('div');
    line.className = 'log-line ' + type;
    const prefix = step ? `[${step}] ` : '';
    line.textContent = prefix + message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
    console.log(`🌐 [${step}] ${message}`);
  }

  function updateResult(text, cls) {
    const resultEl = document.getElementById('ovResult');
    if (!resultEl) return;
    resultEl.textContent = text;
    resultEl.className = 'ov-value';
    if (cls) resultEl.classList.add(cls);
  }

  // ================================================================
  //  🚪 exitPage
  // ================================================================
  function exitPage() {
    logStep('EXIT', 'User chose to exit', 'warn');
    try { window.close(); } catch (e) {}
    setTimeout(() => { try { window.history.back(); } catch (e) {} }, 200);
    setTimeout(() => { if (document.getElementById('jabri-404-overlay')) window.location.href = 'about:blank'; }, 600);
    setTimeout(() => { if (document.getElementById('jabri-404-overlay')) window.location.href = '/'; }, 1200);
  }
  window.exitPage = exitPage;

  // ================================================================
  //  🎯 handle404Redirect — IF / ELSE مع Process Log
  // ================================================================
  async function handle404Redirect() {
    const path = location.pathname;
    const hasHtml = path.toLowerCase().endsWith('.html');
    const targetEl = document.getElementById('ovTarget');

    logStep('1/4', 'Starting 404 handler', 'step');
    logStep('1/4', 'Path: ' + path, 'info');
    logStep('1/4', 'Has .html: ' + hasHtml, 'info');

    // ═══════════════════════════════════════════════════════
    //  IF: بدون .html
    // ═══════════════════════════════════════════════════════
    if (!hasHtml) {
      const newPath = path + '.html';
      if (targetEl) targetEl.textContent = newPath;
      logStep('2/4', 'IF branch: adding .html', 'warn');
      logStep('2/4', 'New path: ' + newPath, 'info');
      updateResult('🔍 GET ' + newPath + ' ...', 'info');

      logStep('3/4', 'GET ' + newPath, 'info');
      const exists = await fileExists(newPath);

      if (exists) {
        logStep('3/4', '  → 200 OK', 'ok');
        logStep('4/4', '✅ FOUND → Redirecting', 'ok');
        updateResult('✅ 200 OK → Redirecting', 'ok');
        setTimeout(() => { window.location.href = newPath; }, 1200);
      } else {
        logStep('3/4', '  → 404 NOT FOUND', 'err');
        logStep('4/4', '❌ Fallback → /all-links.html', 'err');
        updateResult('❌ 404 → /all-links.html', 'err');
        setTimeout(() => { window.location.href = CONFIG.allLinksPath; }, 1500);
      }
      return;
    }

    // ═══════════════════════════════════════════════════════
    //  ELSE: ينتهي بـ .html
    // ═══════════════════════════════════════════════════════
    const file = path.split('/').filter(Boolean).pop();
    const rootPath = '/' + file;
    if (targetEl) targetEl.textContent = rootPath;
    logStep('2/4', 'ELSE branch: path ends with .html', 'warn');
    logStep('2/4', 'Extracted file: ' + file, 'info');
    logStep('2/4', 'Root path: ' + rootPath, 'info');
    updateResult('🔍 GET ' + rootPath + ' ...', 'info');

    logStep('3/4', 'GET ' + rootPath, 'info');
    const existsInRoot = await fileExists(rootPath);

    if (existsInRoot) {
      logStep('3/4', '  → 200 OK', 'ok');
      logStep('4/4', '✅ FOUND in root → Redirecting', 'ok');
      updateResult('✅ 200 OK (root) → Redirecting', 'ok');
      setTimeout(() => { window.location.href = rootPath; }, 1200);
      return;
    }

    logStep('3/4', '  → 404 NOT FOUND', 'err');
    logStep('4/4', '❌ Fallback → /all-links.html', 'err');
    updateResult('❌ 404 (root) → /all-links.html', 'err');
    setTimeout(() => { window.location.href = CONFIG.allLinksPath; }, 1500);
  }

  // ================================================================
  //  🎯 detect404 — متعدد الطبقات
  // ================================================================
  async function detect404() {
    if (!CONFIG.detect404) return;

    let isReal404 = false;
    let reason = '';

    // 1) data-waha-404
    if (document.body && document.body.dataset.waha404 === 'true') {
      isReal404 = true;
      reason = 'data-waha-404';
    }

    // 2) Navigation API
    if (!isReal404 && window.performance && window.performance.getEntriesByType) {
      try {
        const nav = window.performance.getEntriesByType('navigation');
        if (nav.length > 0 && nav[0].responseStatus === 404) {
          isReal404 = true;
          reason = 'nav API 404';
        }
      } catch (e) {}
    }

    // 3) HEAD request
    if (!isReal404) {
      try {
        const res = await fetch(location.href, {
          method: 'HEAD',
          cache: 'no-store',
          redirect: 'manual'
        });
        console.log(`📡 [404] HEAD status: ${res.status}`);
        if (res.status === 404) {
          isReal404 = true;
          reason = 'HEAD 404';
        }
      } catch (e) {}
    }

    // 4) title
    if (!isReal404) {
      const t = (document.title || '').toLowerCase();
      if (t.includes('404') || t.includes('not found')) {
        isReal404 = true;
        reason = 'document.title';
      }
    }

    if (isReal404) {
      console.warn(`🚨 [404] detected via ${reason}`);
      show404Overlay();
    } else {
      console.log('✅ [404] page OK');
    }
  }

  // ================================================================
  //  🌐 toggleLang
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
  //  🔗 Canonical
  // ================================================================
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

    const start = () => {
      if (isMusicPlaying) return;
      musicAudio.play().catch(() => {});
      document.removeEventListener('click', start);
      document.removeEventListener('touchstart', start);
    };
    document.addEventListener('click', start);
    document.addEventListener('touchstart', start);
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
        setTimeout(forceReload, 3000);
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
    if (CONFIG.detect404) detect404();
    if (CONFIG.music) initMusic();

    if (CONFIG.header) loadPartial('header-placeholder', 'header.html', 'headerLoaded', true);
    else setTimeout(hideSplash, 300);

    if (CONFIG.footer) loadPartial('footer-placeholder', 'footer.html', 'footerLoaded', false);
    if (CONFIG.version) checkForNewVersion();
    if (CONFIG.autoFixLinks) autoFixLinks();

    document.addEventListener('headerLoaded', () => setCanonical());

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
    forceReload: forceReload,
    show404Overlay: show404Overlay,
    handle404Redirect: handle404Redirect,
    exitPage: exitPage
  };

  window.switchLanguage = toggleLang;
  window.toggleLanguage = toggleLang;

  console.log(`✅ الدرع المطلق v${VERSION} ready`);
})();