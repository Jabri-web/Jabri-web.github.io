// ================================================================
// init-page-root.js — v7.2 (Triple Search — No .html)
// Heaven Al-Jabri | واحة الجبري
// ─────────────────────────────────────────────────────────────
// 🆕 v7.2:
//   ✅ Smart 404 Handler (يبحث في الثلاثي: /ar, /en, /)
//   ✅ لا يضيف .html تلقائياً
//   ✅ Network Monitor (offline / online / slow)
//   ✅ WahaAuth (نظام الدخول)
//   ✅ toggleLang (المسؤول الرسمي)
//   ✅ Splash Screen (full mode فقط)
//   ✅ Header/Footer Loader
//   ✅ Auto-Detect Page Mode (safe/full/minimal)
//   ✅ Safe Mode (لا شاشة بيضاء أبداً)
// ================================================================
(function() {
  'use strict';
  console.log('🛡️ [init] v7.2 — Triple Search...');

  const IS_APK = location.protocol === 'file:' || navigator.userAgent.includes('wv');

  // ══════════════════════════════════════════════════════════════
  //   ① كشف الوضع (safe / full / minimal)
  // ══════════════════════════════════════════════════════════════
  function detectPageMode() {
    const s = document.currentScript;
    const src = [document.body?.dataset?.pageMode, document.documentElement?.dataset?.pageMode, s?.dataset?.pageMode]
      .map(v=>String(v||'').toLowerCase())
      .find(v=>['safe','full','minimal'].includes(v));
    if(src) return src;
    if(s?.hasAttribute('data-no-splash')) return 'safe';
    const path = location.pathname.toLowerCase();
    if(['/admin','/test','/debug','/temp','/dev','/redirect','/app/catalog'].some(p=>path.startsWith(p))) return 'safe';
    return 'safe';
  }

  let PAGE_MODE = 'safe';
  let splashHidden = true;

  // ══════════════════════════════════════════════════════════════
  //   ② Splash Screen
  // ══════════════════════════════════════════════════════════════
  function hideSplash(){
    if(splashHidden) return;
    splashHidden = true;
    const el = document.getElementById('splashScreen');
    if(el){ el.classList.add('hidden'); setTimeout(()=>el.remove(), 600); }
  }
  setTimeout(hideSplash, 3500);

  function createSplash(){
    if(PAGE_MODE !== 'full') return;
    if(document.getElementById('splashScreen')) return;
    splashHidden = false;
    const style = document.createElement('style');
    style.textContent = `#splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;transition:opacity.5s}#splashScreen.hidden{opacity:0;pointer-events:none}.splash-logo{width:90px;height:90px;border-radius:50%;border:3px solid #c9a84c}`;
    document.head.appendChild(style);
    const div = document.createElement('div');
    div.id = 'splashScreen';
    div.innerHTML = `<img src="/icon-192.png" onerror="this.style.display='none'" class="splash-logo"><div style="color:#6ae3ff;font-weight:900;margin-top:15px">واحة الجبري</div>`;
    (document.body||document.documentElement).prepend(div);
  }

  // ══════════════════════════════════════════════════════════════
  //   ③ Header/Footer Loader
  // ══════════════════════════════════════════════════════════════
  function loadHTMLFile(id, file, onOk){
    const ph = document.getElementById(id);
    if(!ph){ onOk?.(); return; }
    if(ph.dataset.loaded === 'true'){ onOk?.(); return; }

    fetch(file+(IS_APK?'':'?_t='+Date.now()))
      .then(r=>{ if(!r.ok) throw new Error(r.status); return r.text(); })
      .then(html=>{
        ph.innerHTML = html;
        ph.dataset.loaded = 'true';
        [...ph.querySelectorAll('script')].forEach(old=>{
          if(old.src && old.src.includes('menu.js')) return;
          const s = document.createElement('script');
          [...old.attributes].forEach(a=>s.setAttribute(a.name, a.value));
          if(old.src){ s.src = old.src; old.replaceWith(s); }
          else { s.textContent = old.textContent; old.replaceWith(s); }
        });
        onOk?.();
      })
      .catch(()=>{
        ph.innerHTML = '<div style="height:60px"></div>';
        onOk?.();
        hideSplash();
      });
  }

  // ══════════════════════════════════════════════════════════════
  //   ④ Smart 404 Handler — v7.2 (Triple Search Only)
  //   ─────────────────────────────────────────────────────────────
  //   ⚠️ لا يضيف .html تلقائياً
  //   ✅ يبحث عن نفس المسار في الثلاثي:
  //      ① /ar/ + المسار
  //      ② /en/ + المسار
  //      ③ / + المسار (روت)
  //   الحماية: sessionStorage + حد محاولة واحدة
  // ══════════════════════════════════════════════════════════════
  function handle404() {
    var path = location.pathname;

    // روابط خاصة محمية
    if (path === '/' || path === '/ar' || path === '/ar/' ||
        path === '/en' || path === '/en/') {
      return false;
    }

    // استخراج اسم الملف (مع الامتداد إن وُجد)
    var segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return false;

    // اسم الملف الحقيقي (آخر جزء)
    var fileName = segments[segments.length - 1];
    if (!fileName) return false;

    // المسار بدون بادئة اللغة
    var cleanPath = path.replace(/^\/(ar|en)(\/|$)/i, '/');
    if (cleanPath === '/' || cleanPath === '') return false;

    // حماية ضد redirect loops
    var guardKey = 'waha_404_handled_' + path;
    try {
      if (sessionStorage.getItem(guardKey)) {
        console.log('🔁 [404] محاولة مكررة — تخطي');
        return false;
      }
      sessionStorage.setItem(guardKey, '1');
    } catch(e) {}

    // ═══ قائمة المرشحات في الثلاثي (بدون إضافة امتداد) ═══
    var candidates = [
      '/ar' + cleanPath,      // ① العربي
      '/en' + cleanPath,      // ② الإنجليزي
      cleanPath               // ③ الروت
    ];

    // إزالة التكرار + إزالة المسار الحالي
    candidates = candidates.filter(function(c, i, arr) {
      return c !== path && arr.indexOf(c) === i;
    });

    console.log('🔍 [404] البحث في الثلاثي:', candidates);

    // فحص كل مرشح بـ fetch HEAD
    var idx = 0;
    function tryNext() {
      if (idx >= candidates.length) {
        console.log('❌ [404] لا يوجد بديل');
        return;
      }
      var candidate = candidates[idx++];
      fetch(candidate, { method: 'HEAD' })
        .then(function(r) {
          if (r.ok) {
            console.log('✅ [404] وُجد:', candidate);
            location.replace(candidate + location.search + location.hash);
          } else {
            tryNext();
          }
        })
        .catch(function() {
          tryNext();
        });
    }

    tryNext();
    return true;
  }

  // ══════════════════════════════════════════════════════════════
  //   ⑤ Network Monitor (v7.0)
  // ══════════════════════════════════════════════════════════════
  function initNetworkMonitor() {
    if (PAGE_MODE === 'minimal') return;

    var banner = null;
    var hideTimer = null;

    function ensureBanner() {
      if (banner) return banner;
      banner = document.createElement('div');
      banner.id = 'waha-network-banner';
      banner.style.cssText =
        'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);' +
        'z-index:999998;padding:10px 20px;border-radius:30px;' +
        'font-family:"Cairo","Tajawal",sans-serif;font-weight:700;' +
        'font-size:13px;direction:rtl;' +
        'box-shadow:0 8px 30px rgba(0,0,0,0.5);' +
        'transition:opacity 0.3s, transform 0.3s;' +
        'opacity:0;pointer-events:none;text-align:center;' +
        'max-width:calc(100vw - 40px);';
      document.body.appendChild(banner);
      return banner;
    }

    function showBanner(text, type) {
      var b = ensureBanner();
      var colors = {
        'offline': { bg: '#2a0d0d', border: '#ff4444', color: '#ff7b72' },
        'online':  { bg: '#0f2417', border: '#2ea043', color: '#7ee787' },
        'slow':    { bg: '#2a1f00', border: '#ffd700', color: '#ffd700' }
      };
      var c = colors[type] || colors.offline;
      b.style.background = c.bg;
      b.style.border = '2px solid ' + c.border;
      b.style.color = c.color;
      b.textContent = text;
      b.style.opacity = '1';
      b.style.pointerEvents = 'auto';
      b.style.transform = 'translateX(-50%) translateY(0)';
      if (hideTimer) clearTimeout(hideTimer);
      if (type !== 'offline') {
        hideTimer = setTimeout(function() {
          b.style.opacity = '0';
          b.style.pointerEvents = 'none';
          b.style.transform = 'translateX(-50%) translateY(20px)';
        }, type === 'online' ? 2500 : 4000);
      }
    }

    window.addEventListener('offline', function() {
      console.log('📡 [network] offline');
      showBanner('🔴 أنت غير متصل بالإنترنت', 'offline');
    });

    window.addEventListener('online', function() {
      console.log('📡 [network] online');
      showBanner('🟢 عاد الاتصال بنجاح', 'online');
    });

    if (navigator.connection && navigator.connection.addEventListener) {
      navigator.connection.addEventListener('change', function() {
        var type = navigator.connection.effectiveType;
        console.log('📡 [network] connection:', type);
        if (type === '2g' || type === 'slow-2g') {
          showBanner('🟡 الاتصال بطيء — قد يتأخر التحميل', 'slow');
        }
      });
    }

    if (!navigator.onLine) {
      showBanner('🔴 أنت غير متصل بالإنترنت', 'offline');
    }

    console.log('📡 [network] Network Monitor جاهز');
  }

  // ══════════════════════════════════════════════════════════════
  //   ⑥ WahaAuth — نظام الدخول
  // ══════════════════════════════════════════════════════════════
  const AUTH_KEY = 'waha_user';
  let _currentUser = null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) _currentUser = JSON.parse(raw);
  } catch (e) { _currentUser = null; }

  function _persistAuth() {
    try {
      if (_currentUser) localStorage.setItem(AUTH_KEY, JSON.stringify(_currentUser));
      else localStorage.removeItem(AUTH_KEY);
    } catch (e) {}
    updateAuthUI();
    window.dispatchEvent(new CustomEvent('waha:auth-changed', {
      detail: { user: _currentUser ? Object.assign({}, _currentUser) : null }
    }));
  }

  function updateAuthUI() {
    try {
      const loggedIn = !!_currentUser;
      document.querySelectorAll('[data-auth="loggedIn"]').forEach(function(el) {
        el.style.display = loggedIn ? '' : 'none';
      });
      document.querySelectorAll('[data-auth="loggedOut"]').forEach(function(el) {
        el.style.display = !loggedIn ? '' : 'none';
      });
      const nameEl = document.getElementById('userNameLabel');
      if (nameEl) nameEl.textContent = loggedIn ? (_currentUser.name || '') : '';
    } catch (e) {}
  }

  window.WahaAuth = {
    getUser: function() { return _currentUser ? Object.assign({}, _currentUser) : null; },
    isLoggedIn: function() { return !!_currentUser; },
    hasRole: function(role) { return !!_currentUser && _currentUser.role === role; },
    loginLocal: function() {
      return { ok: false, error: 'المصادقة المحلية معطّلة. سيتوفر النظام قريباً عبر خادم آمن.' };
    },
    loginGoogle: function() {
      return { ok: false, error: 'الدخول عبر Google سيتوفر قريباً عبر خادم آمن.' };
    },
    logout: function() { _currentUser = null; _persistAuth(); return { ok: true }; },
    _setUser: function(user) {
      if (!user || typeof user !== 'object') return false;
      _currentUser = {
        name: String(user.name || 'مستخدم'),
        role: String(user.role || 'user'),
        username: user.username ? String(user.username) : undefined,
        email: user.email ? String(user.email) : undefined,
        provider: String(user.provider || 'backend'),
        since: Date.now()
      };
      _persistAuth();
      return true;
    }
  };

  document.addEventListener('headerLoaded', updateAuthUI);
  window.addEventListener('waha:auth-changed', updateAuthUI);

  // ══════════════════════════════════════════════════════════════
  //   ⑦ دوال اللغة (toggleLang + switchLanguage)
  // ══════════════════════════════════════════════════════════════
  function _getCurrentLang(){
    return location.pathname.toLowerCase().startsWith('/en/') ? 'en' : 'ar';
  }
  function _getCurrentFile(){
    let p = location.pathname.replace(/^\/(ar|en)(\/|$)/i, '/').replace(/\/+$/, '');
    if(p === '' || p === '/') return 'index.html';
    const f = p.split('/').pop();
    return (!f || f.indexOf('.') === -1) ? 'index.html' : f;
  }

  function switchLanguage(){
    const c = _getCurrentLang();
    const t = c === 'ar' ? 'en' : 'ar';
    location.href = '/' + t + '/' + _getCurrentFile();
  }

  window.toggleLang = function() {
    if (typeof window.__wahaBuildLangUrl === 'function') {
      try {
        var target = window.__wahaBuildLangUrl();
        console.log('🌐 [init/lang] menu.js →', target);
        location.href = target;
        return;
      } catch (e) {
        console.warn('⚠️ [init/lang] فشل menu.js:', e.message);
      }
    }
    console.log('🌐 [init/lang] switchLanguage → ar ⇄ en');
    switchLanguage();
  };

  window.switchLanguage = switchLanguage;
  window.getCurrentLanguage = _getCurrentLang;

  // ══════════════════════════════════════════════════════════════
  //   ⑧ Init
  // ══════════════════════════════════════════════════════════════
  function init(){
    try {
      PAGE_MODE = detectPageMode();
      window.__WAHA_PAGE_MODE = PAGE_MODE;
      document.documentElement.lang = _getCurrentLang();
      document.documentElement.dir = document.documentElement.lang === 'ar' ? 'rtl' : 'ltr';
      console.log('📋 [mode]', PAGE_MODE);

      // ✅ 404 Handler أولاً (قبل أي شيء آخر)
      if (handle404()) return;

      // ✅ Network Monitor (safe / full فقط)
      if (PAGE_MODE !== 'minimal') initNetworkMonitor();

      // ✅ Splash (full فقط)
      if (PAGE_MODE === 'full') createSplash();

      // ✅ Header/Footer
      let loaded = 0;
      const done = () => { if(++loaded >= 2) setTimeout(hideSplash, 200); };

      loadHTMLFile('header-placeholder', 'header.html', () => {
        document.dispatchEvent(new CustomEvent('headerLoaded'));
        done();
      });
      loadHTMLFile('footer-placeholder', 'footer.html', () => {
        document.dispatchEvent(new CustomEvent('footerLoaded'));
        done();
      });

      if (!document.getElementById('header-placeholder')) setTimeout(hideSplash, 100);

    } catch(e) {
      console.error('💥 [init] خطأ قاتل:', e);
      hideSplash();
    }
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();