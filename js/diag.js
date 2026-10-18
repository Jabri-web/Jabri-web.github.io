/* ============================================================
   /js/diag.js — أداة التشخيص v1.3 (محصنة للـ SEO + شاملة)
   - تخطي الروبوتات (Googlebot, etc.)
   - اعتراض Fetch + XHR + PerformanceObserver
   - حماية localStorage من أخطاء GSC
   - تفعيل بـ ?diag=1 أو DIAG.show()
   ============================================================ */
(function () {
  'use strict';

  // 1. 🛡️ حظر الروبوتات (لحماية GSC من الأخطاء)
  const UA = navigator.userAgent || '';
  const IS_BOT = /googlebot|bingbot|slurp|duckduckbot|yandexbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider/i.test(UA);

  if (IS_BOT) {
    window.DIAG = { show: function(){}, off: function(){}, version: '1.3-bot-skip' };
    return; // خروج آمن جداً للروبوتات
  }

  // 2. 🛡️ حماية localStorage
  let isDiagEnabled = false;
  try {
    isDiagEnabled = localStorage.getItem('jabri_diag_on') === '1';
  } catch (e) {}

  const hasDiagParam = new URLSearchParams(location.search).has('diag');
  const isHomePage = location.pathname === '/' || location.pathname.endsWith('/index.html') || location.pathname.endsWith('/index');
  
  // شرط التشغيل: الرئيسية أو طلب صريح
  const shouldRun = (isHomePage || hasDiagParam) && (hasDiagParam || isDiagEnabled);

  if (!shouldRun) {
    window.DIAG = {
      show: function() {
        try { localStorage.setItem('jabri_diag_on', '1'); } catch(e){}
        location.reload();
      },
      off: function() {
        try { localStorage.removeItem('jabri_diag_on'); } catch(e){}
        location.reload();
      },
      version: '1.3-off'
    };
    return;
  }

  if (window.__DIAG_LOADED) return;
  window.__DIAG_LOADED = true;

  const DIAG = {
    version: '1.3',
    net: { online: navigator.onLine, type: 'unknown', downlink: null, rtt: null, events: [] },
    requests: [],
    errors: [],
    timings: { dcl: 0, load: 0, headerLoaded: null, footerLoaded: null, firstInteraction: null },
    slowThreshold: 3000
  };
  window.DIAG = DIAG;

  // دالة مساعدة لتقصير الروابط
  function shortUrl(url) { return !url ? '' : url.split('/').slice(-2).join('/').slice(-40); }
  function pushRequest(rec) { 
    DIAG.requests.push(rec); 
    if (DIAG.requests.length > 150) DIAG.requests.shift(); 
    updateBadge(); 
  }

  // 3. 🌐 قراءة حالة الشبكة
  function readConnection() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return;
    DIAG.net.type = c.effectiveType || 'unknown';
    DIAG.net.downlink = c.downlink || null;
    DIAG.net.rtt = c.rtt || null;
  }
  readConnection();
  if (navigator.connection && navigator.connection.addEventListener) {
    navigator.connection.addEventListener('change', readConnection);
  }

  window.addEventListener('online', () => { DIAG.net.online = true; updateBadge(); });
  window.addEventListener('offline', () => { DIAG.net.online = false; updateBadge(); });

  // 4. 📡 اصطياد طلبات Fetch
  if (window.fetch && !window.__DIAG_FETCH_WRAPPED) {
    const origFetch = window.fetch.bind(window);
    window.fetch = async function (...args) {
      const req = args[0];
      const url = typeof req === 'string' ? req : (req && req.url) || '';
      const t0 = performance.now();
      try {
        const res = await origFetch(...args);
        const ms = Math.round(performance.now() - t0);
        pushRequest({ url: shortUrl(url), status: res.status, ok: res.ok, ms, type: 'fetch', slow: ms > DIAG.slowThreshold });
        return res;
      } catch (err) {
        const ms = Math.round(performance.now() - t0);
        pushRequest({ url: shortUrl(url), status: 0, ok: false, ms, type: 'fetch-ERR', error: err.message });
        throw err;
      }
    };
    window.__DIAG_FETCH_WRAPPED = true;
  }

  // 5. 📡 اصطياد طلبات XHR (مهم جداً لملف file.js)
  if (window.XMLHttpRequest && !window.__DIAG_XHR_WRAPPED) {
    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;
    
    XHR.open = function(method, url) {
      this._url = url;
      return open.apply(this, arguments);
    };
    
    XHR.send = function() {
      const t0 = performance.now();
      this.addEventListener('loadend', () => {
        const ms = Math.round(performance.now() - t0);
        const ok = this.status >= 200 && this.status < 300;
        pushRequest({ url: shortUrl(this._url), status: this.status, ok: ok, ms, type: 'xhr', slow: ms > DIAG.slowThreshold });
      });
      return send.apply(this, arguments);
    };
    window.__DIAG_XHR_WRAPPED = true;
  }

  // 6. 📡 اصطياد كل الموارد (صور، CSS، سكربتات سابقة)
  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // تجنب تكرار التسجيل للطلبات التي تم اصطيادها بـ fetch/xhr
        if (['fetch', 'xmlhttprequest'].includes(entry.initiatorType)) return;
        
        // إضافة السكربتات والصور
        if (entry.duration > 0) {
          pushRequest({
            url: shortUrl(entry.name),
            status: 200, // نفترض النجاح لأنها اكتملت
            ok: true,
            ms: Math.round(entry.duration),
            type: entry.initiatorType || 'resource',
            slow: entry.duration > DIAG.slowThreshold
          });
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  } catch (e) {}

  // 7. 🚨 اصطياد الأخطاء
  window.addEventListener('error', (e) => {
    if (e.target && ['IMG','VIDEO','AUDIO'].indexOf(e.target.tagName) !== -1) return;
    DIAG.errors.push({ msg: e.message || 'Unknown error', src: shortUrl(e.filename || ''), line: e.lineno || 0, col: e.colno || 0, time: Date.now() });
    updateBadge();
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    const msg = (e.reason && e.reason.message) || String(e.reason);
    DIAG.errors.push({ msg: 'Promise: ' + msg, src: '', line: 0, col: 0, time: Date.now() });
    updateBadge();
  });

  // 8. ⏱️ توقيتات التحميل
  document.addEventListener('DOMContentLoaded', () => { DIAG.timings.dcl = Math.round(performance.now()); });
  window.addEventListener('load', () => { DIAG.timings.load = Math.round(performance.now()); updateBadge(); });
  document.addEventListener('headerLoaded', () => { DIAG.timings.headerLoaded = Math.round(performance.now()); updateBadge(); });
  document.addEventListener('footerLoaded', () => { DIAG.timings.footerLoaded = Math.round(performance.now()); updateBadge(); });

  ['click','touchstart','keydown'].forEach(ev => {
    window.addEventListener(ev, function once() {
      if (!DIAG.timings.firstInteraction) DIAG.timings.firstInteraction = Math.round(performance.now());
      window.removeEventListener(ev, once);
    }, { once: true, passive: true });
  });

  // 9. 🎨 الشارة والواجهة
  let badge = null;
  function ensureBadge() {
    if (badge && document.body.contains(badge)) return badge;
    badge = document.createElement('div');
    badge.id = 'diag-badge';
    badge.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:2147483647;background:linear-gradient(135deg,#0a0a0f,#1a1a2e);border:1.5px solid #6ae3ff;color:#6ae3ff;padding:6px 12px;border-radius:20px;cursor:pointer;font-family:Courier New,monospace;font-size:11px;font-weight:700;box-shadow:0 4px 15px rgba(0,0,0,.5);display:flex;gap:8px;align-items:center;user-select:none;';
    badge.onclick = openPanel;
    document.body.appendChild(badge);
    updateBadge();
    return badge;
  }

  function updateBadge() {
    if (!badge) return;
    const netIcon = DIAG.net.online ? '🟢' : '🔴';
    const netType = DIAG.net.type !== 'unknown' ? DIAG.net.type : '';
    const fail = DIAG.requests.filter(r => !r.ok).length;
    const slow = DIAG.requests.filter(r => r.slow).length;
    badge.innerHTML = `<span>${netIcon} ${netType}</span>`
      + `<span>📡 ${DIAG.requests.length}</span>`
      + (fail ? `<span style="color:#ff6b6b">❌ ${fail}</span>` : '')
      + (slow ? `<span style="color:#ffd166">⚠️ ${slow}</span>` : '')
      + (DIAG.errors.length ? `<span style="color:#ff0044">💥 ${DIAG.errors.length}</span>` : '');
  }

  let panel = null;
  function openPanel() {
    if (panel && document.body.contains(panel)) { panel.remove(); panel = null; return; }
    const slowReqs = DIAG.requests.filter(r => r.slow).slice(-8).reverse();
    const failReqs = DIAG.requests.filter(r => !r.ok).slice(-8).reverse();
    const errs = DIAG.errors.slice(-5).reverse();
    
    panel = document.createElement('div');
    panel.id = 'diag-panel';
    panel.style.cssText = 'position:fixed;inset:20px;z-index:2147483646;background:linear-gradient(145deg,#0a0a0f,#1a1a2e);border:2px solid #6ae3ff;border-radius:16px;padding:20px;color:#e8e8f0;overflow-y:auto;font-family:Courier New,monospace;font-size:12px;direction:rtl;box-shadow:0 20px 60px rgba(0,0,0,.9);';
    
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;color:#6ae3ff;font-size:16px;">🔍 تشخيص واحة الجبري (v${DIAG.version})</h3>
        <div>
          <button id="diag-off" style="background:transparent;border:1px solid #ffd166;color:#ffd166;padding:4px 12px;border-radius:8px;cursor:pointer;font-weight:700;margin-left:8px;">🛑 إيقاف</button>
          <button id="diag-close" style="background:transparent;border:1px solid #ff6b6b;color:#ff6b6b;padding:4px 12px;border-radius:8px;cursor:pointer;font-weight:700;">✕ إغلاق</button>
        </div>
      </div>
      
      <div style="background:rgba(106,227,255,.05);padding:12px;border-radius:8px;margin-bottom:12px;border-right:3px solid #6ae3ff;">
        <div style="color:#6ae3ff;font-weight:700;margin-bottom:6px;">🌐 الشبكة [NET]</div>
        <div>${DIAG.net.online ? '<span style="color:#06d6a0">🟢 متصل</span>' : '<span style="color:#ff6b6b">🔴 غير متصل</span>'} — ${DIAG.net.type} ${DIAG.net.downlink ? '('+DIAG.net.downlink+'Mb/s, '+DIAG.net.rtt+'ms)' : ''}</div>
        <div style="margin-top:6px;font-size:11px;opacity:.7;">إجمالي الطلبات المرصودة: ${DIAG.requests.length} | فاشلة: ${DIAG.requests.filter(r=>!r.ok).length} | بطيئة: ${DIAG.requests.filter(r=>r.slow).length}</div>
      </div>

      ${failReqs.length ? `<div style="background:rgba(255,107,107,.1);padding:10px;border-radius:8px;margin-bottom:12px;border-right:3px solid #ff6b6b;"><div style="color:#ff6b6b;font-weight:700;margin-bottom:6px;">❌ طلبات فاشلة</div>${failReqs.map(r=>`<div>• [${r.type}] ${r.url} — ${r.status} — ${r.ms}ms</div>`).join('')}</div>` : ''}
      
      ${slowReqs.length ? `<div style="background:rgba(255,209,102,.1);padding:10px;border-radius:8px;margin-bottom:12px;border-right:3px solid #ffd166;"><div style="color:#ffd166;font-weight:700;margin-bottom:6px;">⚠️ طلبات بطيئة (+3 ثواني)</div>${slowReqs.map(r=>`<div>• [${r.type}] ${r.url} — ${r.ms}ms</div>`).join('')}</div>` : ''}
      
      ${errs.length ? `<div style="background:rgba(255,0,68,.1);padding:10px;border-radius:8px;margin-bottom:12px;border-right:3px solid #ff0044;"><div style="color:#ff0044;font-weight:700;margin-bottom:6px;">💥 أخطاء [CODE]</div>${errs.map(e=>`<div>• ${e.msg}<br><span style="opacity:.6;font-size:10px;">${e.src}:${e.line}</span></div>`).join('')}</div>` : ''}
      
      <div style="background:rgba(106,227,255,.05);padding:12px;border-radius:8px;border-right:3px solid #06d6a0;">
        <div style="color:#06d6a0;font-weight:700;margin-bottom:6px;">⏱️ توقيتات التحميل</div>
        <div>DCL (DOM جاهز): ${DIAG.timings.dcl}ms</div>
        <div>Load (تحميل كامل): ${DIAG.timings.load || '—'}ms</div>
        <div>Header جاهز: ${DIAG.timings.headerLoaded !== null ? DIAG.timings.headerLoaded + 'ms' : '⏳'}</div>
        <div>Footer جاهز: ${DIAG.timings.footerLoaded !== null ? DIAG.timings.footerLoaded + 'ms' : '⏳'}</div>
        <div>أول تفاعل: ${DIAG.timings.firstInteraction !== null ? DIAG.timings.firstInteraction + 'ms' : '—'}</div>
      </div>
    `;
    
    document.body.appendChild(panel);
    document.getElementById('diag-close').onclick = () => { panel.remove(); panel = null; };
    document.getElementById('diag-off').onclick = () => {
      try { localStorage.removeItem('jabri_diag_on'); } catch(e){}
      location.reload();
    };
  }

  function start() {
    ensureBadge();
    if (new URLSearchParams(location.search).get('diag') === '1') setTimeout(openPanel, 800);
    console.log('%c🔍 DIAG v1.3 جاهز (شامل Fetch + XHR + Performance)','color:#6ae3ff;font-weight:700');
  }
  
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();