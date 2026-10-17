/* ============================================================
   /js/diag.js — أداة التشخيص v1.1
   - يُحمَّل فقط في index.html
   - البوابة مغلقة افتراضياً (5 أسطر فقط)
   - تفعيل بـ ?diag=1 أو DIAG.show()
   - إيقاف بـ DIAG.off() أو زر "إيقاف" في اللوحة
   ============================================================ */
(function () {
  'use strict';

  // ✅ إصلاح: === '1' بدل truthy
  const shouldRun = new URLSearchParams(location.search).has('diag') 
                 || localStorage.getItem('jabri_diag_on') === '1';

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
      version: '1.1-off'
    };
    console.log('🔍 للتشخيص: أضف ?diag=1 أو نفّذ DIAG.show()');
    return;
  }

  if (window.__DIAG_LOADED) return;
  window.__DIAG_LOADED = true;

  const DIAG = {
    version: '1.1',
    net: { online: navigator.onLine, type: 'unknown', downlink: null, rtt: null, events: [] },
    requests: [],
    errors: [],
    timings: { dcl: 0, load: 0, headerLoaded: null, footerLoaded: null, firstInteraction: null },
    slowThreshold: 3000
  };
  window.DIAG = DIAG;

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

  window.addEventListener('online', () => {
    DIAG.net.online = true;
    DIAG.net.events.push({ t: Date.now(), kind: 'online' });
    updateBadge();
  });
  window.addEventListener('offline', () => {
    DIAG.net.online = false;
    DIAG.net.events.push({ t: Date.now(), kind: 'offline' });
    updateBadge();
  });

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
    const slowReqs = DIAG.requests.filter(r => r.slow).slice(0, 5);
    const failReqs = DIAG.requests.filter(r => !r.ok).slice(0, 5);
    const errs = DIAG.errors.slice(-5).reverse();
    panel = document.createElement('div');
    panel.id = 'diag-panel';
    panel.style.cssText = 'position:fixed;inset:20px;z-index:2147483646;background:linear-gradient(145deg,#0a0a0f,#1a1a2e);border:2px solid #6ae3ff;border-radius:16px;padding:20px;color:#e8e8f0;overflow-y:auto;font-family:Courier New,monospace;font-size:12px;direction:rtl;box-shadow:0 20px 60px rgba(0,0,0,.9);';
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;color:#6ae3ff;font-size:16px;">🔍 تشخيص واحة الجبري</h3>
        <div>
          <button id="diag-off" style="background:transparent;border:1px solid #ffd166;color:#ffd166;padding:4px 12px;border-radius:8px;cursor:pointer;font-weight:700;margin-left:8px;">🛑 إيقاف</button>
          <button id="diag-close" style="background:transparent;border:1px solid #ff6b6b;color:#ff6b6b;padding:4px 12px;border-radius:8px;cursor:pointer;font-weight:700;">✕ إغلاق</button>
        </div>
      </div>
      <div style="background:rgba(106,227,255,.05);padding:12px;border-radius:8px;margin-bottom:12px;border-right:3px solid #6ae3ff;">
        <div style="color:#6ae3ff;font-weight:700;margin-bottom:6px;">🌐 الشبكة [NET]</div>
        <div>${DIAG.net.online ? '<span style="color:#06d6a0">🟢 متصل</span>' : '<span style="color:#ff6b6b">🔴 غير متصل</span>'} — ${DIAG.net.type} ${DIAG.net.downlink ? '('+DIAG.net.downlink+'Mb/s, '+DIAG.net.rtt+'ms)' : ''}</div>
        <div style="margin-top:6px;font-size:11px;opacity:.7;">طلبات: ${DIAG.requests.length} | فاشلة: ${DIAG.requests.filter(r=>!r.ok).length} | بطيئة: ${DIAG.requests.filter(r=>r.slow).length}</div>
      </div>
      ${failReqs.length ? `<div style="background:rgba(255,107,107,.1);padding:10px;border-radius:8px;margin-bottom:12px;border-right:3px solid #ff6b6b;"><div style="color:#ff6b6b;font-weight:700;margin-bottom:6px;">❌ فاشلة [NET/مسار]</div>${failReqs.map(r=>`<div>• ${r.url} — ${r.status} — ${r.ms}ms</div>`).join('')}</div>` : ''}
      ${slowReqs.length ? `<div style="background:rgba(255,209,102,.1);padding:10px;border-radius:8px;margin-bottom:12px;border-right:3px solid #ffd166;"><div style="color:#ffd166;font-weight:700;margin-bottom:6px;">⚠️ بطيئة [NET]</div>${slowReqs.map(r=>`<div>• ${r.url} — ${r.ms}ms</div>`).join('')}</div>` : ''}
      ${errs.length ? `<div style="background:rgba(255,0,68,.1);padding:10px;border-radius:8px;margin-bottom:12px;border-right:3px solid #ff0044;"><div style="color:#ff0044;font-weight:700;margin-bottom:6px;">💥 أخطاء [CODE]</div>${errs.map(e=>`<div>• ${e.msg}<br><span style="opacity:.6;font-size:10px;">${e.src}:${e.line}</span></div>`).join('')}</div>` : ''}
      <div style="background:rgba(106,227,255,.05);padding:12px;border-radius:8px;border-right:3px solid #06d6a0;">
        <div style="color:#06d6a0;font-weight:700;margin-bottom:6px;">⏱️ توقيتات [INIT]</div>
        <div>DCL: ${DIAG.timings.dcl}ms</div>
        <div>Load: ${DIAG.timings.load || '—'}ms</div>
        <div>Header: ${DIAG.timings.headerLoaded !== null ? DIAG.timings.headerLoaded + 'ms' : '⏳'}</div>
        <div>Footer: ${DIAG.timings.footerLoaded !== null ? DIAG.timings.footerLoaded + 'ms' : '⏳'}</div>
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

  function shortUrl(url) { return !url ? '' : url.split('/').slice(-2).join('/').slice(-40); }
  function pushRequest(rec) { DIAG.requests.push(rec); if (DIAG.requests.length > 100) DIAG.requests.shift(); updateBadge(); }

  DIAG.show = openPanel;
  DIAG.off = () => {
    try { localStorage.removeItem('jabri_diag_on'); } catch(e){}
    console.log('🛑 التشخيص سيُوقف');
    location.reload();
  };
  DIAG.hide = () => { if (panel) { panel.remove(); panel = null; } };
  DIAG.report = () => ({
    network: DIAG.net,
    timings: DIAG.timings,
    failed: DIAG.requests.filter(r=>!r.ok),
    slow: DIAG.requests.filter(r=>r.slow),
    errors: DIAG.errors
  });

  function start() {
    ensureBadge();
    if (new URLSearchParams(location.search).get('diag') === '1') setTimeout(openPanel, 800);
    console.log('%c🔍 DIAG v1.1 جاهز','color:#6ae3ff;font-weight:700');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();