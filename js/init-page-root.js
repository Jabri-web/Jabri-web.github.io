// ================================================================
//  init-page-root.js - v5.9
//  Heaven Al-Jabri | واحة الجبري
//  ─────────────────────────────────────────────────────────────
//  🆕 v5.9 (إصلاح الشاشة المعطلة + أزرار Auth):
//    • ✨ hideSplash() قسري حتى لو فشل header.html
//    • ✨ updateAuthUI() — إظهار/إخفاء أزرار login حسب الحالة
//    • ✨ fallback مؤقت 3.5s للويب / 2.5s للـ APK
//    • ✨ حدث waha:auth-changed لتحديث كل الأزرار
//    • ✨ data-auth="loggedIn" / "loggedOut" للتحكم
//    • 🛡️ AUTH_USERS محذوفة — لا كلمات سر في الفرونت
//    • loginLocal / loginGoogle معطّلة رسمياً
//    • Smart 404 نظيف: يضيف .html + يجرب ar/en/ فقط
//    • switchLanguage فوري — صفر فحوصات، صفر انتظار
//    • لا شاشة بيضاء أبداً — splash يبقى أثناء الفحص
// ================================================================

(function() {
  'use strict';
  console.log('🛡️ [init] الدرع المطلق (v5.9 - Fixed Splash + Auth UI)...');

  // ✅ كشف البيئة
  const PROTO = window.location.protocol;
  const IS_FILE = (PROTO === 'file:');
  const IS_WV   = (navigator.userAgent || '').indexOf('wv') !== -1;
  const IS_APK  = IS_FILE || IS_WV ||
                  (PROTO !== 'http:' && PROTO !== 'https:' &&
                   (location.hostname || '').indexOf('vercel') === -1 &&
                   (location.hostname || '').indexOf('github') === -1);

  console.log('🌍 [init] البيئة:', IS_APK ? '📱 APK' : '🌐 Web', '| Proto:', PROTO);

  let splashHidden = false;
  let splashAutoHideTimer = null;

  /* ================================================================
     📡 Network Monitor — v5.9 (كامل)
     ================================================================ */
  function initNetworkMonitor() {
    var banner = null;
    var hideTimer = null;

    function ensureBanner() {
      if (banner) return banner;
      banner = document.createElement('div');
      banner.id = 'waha-network-banner';
      banner.style.cssText =
        'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
        'z-index:999999;padding:12px 24px;border-radius:30px;' +
        'font-family:"Cairo","Tajawal",sans-serif;font-weight:700;' +
        'font-size:14px;direction:rtl;' +
        'box-shadow:0 8px 30px rgba(0,0,0,0.5);' +
        'transition:opacity 0.3s,transform 0.3s;' +
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

    function hideBanner() {
      if (banner) {
        banner.style.opacity = '0';
        banner.style.pointerEvents = 'none';
        banner.style.transform = 'translateX(-50%) translateY(20px)';
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
        var downlink = navigator.connection.downlink;
        console.log('📡 [network] connection:', type, '| downlink:', downlink, 'Mbps');
        if (type === '2g' || type === 'slow-2g') {
          showBanner('🟡 الاتصال بطيء — قد يتأخر التحميل', 'slow');
        }
      });
    }

    if (!navigator.onLine) {
      showBanner('🔴 أنت غير متصل بالإنترنت', 'offline');
    }

    window.WAHA_NETWORK = {
      isOnline: function() { return navigator.onLine; },
      getConnectionType: function() {
        return navigator.connection ? navigator.connection.effectiveType : 'unknown';
      },
      showBanner: showBanner,
      hideBanner: hideBanner
    };

    console.log('📡 [network] Network Monitor جاهز');
  }

  /* ================================================================
     🔒 WahaAuth — نظام الدخول + Auth UI
     ─────────────────────────────────────────────────────────────
     ⚠️ لا كلمات سر مكشوفة.
     ⚠️ المصادقة الحقيقية تحتاج backend (Supabase/Firebase/…).
     ================================================================ */
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

  // 🆕 v5.9 — تحديث واجهة الأزرار حسب حالة الدخول
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
    } catch (e) {
      console.warn('⚠️ [auth] فشل تحديث الواجهة:', e);
    }
  }

  window.WahaAuth = {
    getUser: function() {
      return _currentUser ? Object.assign({}, _currentUser) : null;
    },
    isLoggedIn: function() {
      return !!_currentUser;
    },
    hasRole: function(role) {
      return !!_currentUser && _currentUser.role === role;
    },

    loginLocal: function(username, password) {
      console.warn('🔒 [auth] loginLocal معطّلة — لا مصادقة محلية في الفرونت');
      return {
        ok: false,
        error: 'المصادقة المحلية معطّلة. النظام سيتوفر قريباً عبر خادم آمن.'
      };
    },

    loginGoogle: function() {
      console.warn('🔒 [auth] loginGoogle معطّلة — تحتاج backend OAuth');
      return {
        ok: false,
        error: 'الدخول عبر Google سيتوفر قريباً عبر خادم آمن.'
      };
    },

    logout: function() {
      _currentUser = null;
      _persistAuth();
      return { ok: true };
    },

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

  // 🆕 v5.9 — استمع للأحداث لتحديث الواجهة
  document.addEventListener('headerLoaded', updateAuthUI);
  window.addEventListener('waha:auth-changed', updateAuthUI);

  /* ================================================================
     ✅ Lang Switcher — v5.9 (تحويل فوري)
     ================================================================ */
  const LANG_KEY = 'waha_lang';
  const SUPPORTED_LANGS = ['ar', 'en'];

  function _getCurrentLang() {
    const p = window.location.pathname.toLowerCase();
    if (p.startsWith('/en/') || p === '/en') return 'en';
    if (p.startsWith('/ar/') || p === '/ar') return 'ar';
    const s = localStorage.getItem(LANG_KEY);
    if (SUPPORTED_LANGS.indexOf(s) !== -1) return s;
    return document.documentElement.lang === 'en' ? 'en' : 'ar';
  }

  function _getCurrentFile() {
    let p = window.location.pathname;
    p = p.replace(/^\/(ar|en)(\/|$)/i, '/');
    p = p.replace(/\/+$/, '');
    if (p === '' || p === '/') return 'index.html';
    const f = p.split('/').pop();
    if (!f || f.indexOf('.') === -1) return 'index.html';
    return f;
  }

  let _switching = false;
  function switchLanguage() {
    if (_switching) return;
    _switching = true;

    const current = _getCurrentLang();
    const target  = current === 'ar' ? 'en' : 'ar';
    const file    = _getCurrentFile();

    try { localStorage.setItem(LANG_KEY, target); } catch (e) {}

    if (IS_APK) {
      const relUrl = target + '/' + file;
      console.log('🌐 [lang/APK]', current, '→', target, '|', file, '→', relUrl);
      window.location.href = relUrl;
      return;
    }

    const newUrl = '/' + target + '/' + file;
    console.log('🌐 [lang]', current, '→', target, '|', file, '→', newUrl);
    window.location.href = newUrl;
  }

  function initLang() {
    const lang = _getCurrentLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (document.body) {
      document.body.classList.toggle('lang-en', lang === 'en');
      document.body.classList.toggle('lang-ar', lang === 'ar');
    }
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    const label = document.getElementById('langLabel');
    if (label) label.textContent = lang === 'ar' ? 'English' : 'عربي';
  }

  function initTheme() {
    const t = localStorage.getItem('theme') || 'night';
    const d = localStorage.getItem('device') || 'desktop';
    if (!document.body) return;
    document.body.classList.remove('day', 'night', 'device-desktop', 'device-phone');
    document.body.classList.add(t, 'device-' + d);
  }

  window.switchLanguage = switchLanguage;
  window.toggleLang = switchLanguage;
  window.getCurrentLanguage = _getCurrentLang;

  /* ================================================================
     ✨ Smart 404 Handler — نظيف
     ================================================================ */
  const _EXISTS_CACHE = new Map();

  function _pathExists(url) {
    if (_EXISTS_CACHE.has(url)) return Promise.resolve(_EXISTS_CACHE.get(url));
    if (IS_APK) {
      return _xhrProbe(url).then(function(ok) {
        _EXISTS_CACHE.set(url, ok);
        return ok;
      });
    }
    return fetch(url, { method: 'HEAD', cache: 'no-cache', redirect: 'follow' })
      .then(function(r) {
        const ok = r.ok;
        _EXISTS_CACHE.set(url, ok);
        return ok;
      })
      .catch(function() {
        _EXISTS_CACHE.set(url, false);
        return false;
      });
  }

  function _xhrProbe(url) {
    return new Promise(function(resolve) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 2000;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            var ok = (xhr.status === 200) || (xhr.status === 0 && xhr.responseText);
            resolve(!!ok);
          }
        };
        xhr.ontimeout = function() { resolve(false); };
        xhr.onerror = function() { resolve(false); };
        xhr.send();
      } catch (e) { resolve(false); }
    });
  }

  function unique(arr) {
    var seen = {};
    return arr.filter(function(x) {
      if (!x || seen[x]) return false;
      seen[x] = 1;
      return true;
    });
  }

  function detect404() {
    if (document.body && document.body.dataset && document.body.dataset.waha404 === 'true') {
      console.log('✅ [404] تم الاكتشاف عبر data-waha-404');
      return true;
    }

    if (document.title && /404/i.test(document.title)) return true;

    const bodyHTML = (document.body && document.body.innerHTML) || '';
    if (/404\s*Not\s*Found/i.test(bodyHTML)) return true;
    if (/Page\s*Not\s*Found/i.test(bodyHTML)) return true;
    if (/NOT_FOUND/i.test(bodyHTML)) return true;
    if (/لا\s*توجد\s*هذه\s*الصفحة/.test(bodyHTML)) return true;
    if (/هذا\s*الدرب\s*غير\s*موجود/.test(bodyHTML)) return true;

    if (window.performance) {
      try {
        const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
        if (nav && nav.responseStatus === 404) return true;
      } catch (e) {}
      const entries = performance.getEntries();
      const href = location.href;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].name === href && entries[i].responseStatus === 404) {
          return true;
        }
      }
    }

    return false;
  }

  function generateCandidates(pathname) {
    var path = String(pathname || '/').split('?')[0].split('#')[0];
    path = path.replace(/\/+$/, '') || '/';

    var candidates = [];

    var parts = path.split('/').filter(function(x) { return x; });
    var lastRaw = parts.length ? parts[parts.length - 1] : '';
    var dir = parts.slice(0, -1).join('/');
    var dirPrefix = dir ? dir + '/' : '';

    var hasExt = /\.(html?|php|xml|json|css|js|png|jpe?g|gif|webp|svg|ico|mp3|mp4|webm|pdf|txt|md|apk|zip)$/i.test(lastRaw);
    var file = lastRaw;
    if (!file) file = 'index.html';
    else if (!hasExt) file = file + '.html';

    candidates.push('/' + dirPrefix + file);

    var langMatch = dir.match(/^(ar|en)(\/|$)/);
    if (langMatch) {
      var lang = langMatch[1];
      var other = lang === 'ar' ? 'en' : 'ar';
      var rest = dir.slice(lang.length + 1);
      var restPrefix = rest ? rest + '/' : '';

      candidates.push('/' + other + '/' + restPrefix + file);
      candidates.push('/' + restPrefix + file);
    } else {
      candidates.push('/ar/' + dirPrefix + file);
      candidates.push('/en/' + dirPrefix + file);
      if (dir) {
        candidates.push('/' + file);
        candidates.push('/ar/' + file);
        candidates.push('/en/' + file);
      }
    }

    candidates = unique(candidates).filter(function(c) {
      return c && c !== path && c.indexOf('//') === -1;
    });

    return candidates;
  }

  function updateSplashText(text) {
    var el = document.querySelector('#splashScreen .splash-sub');
    if (el) el.textContent = text;
  }

  async function handle404Smart() {
    var currentUrl = location.pathname + location.search;

    var guardKey = 'waha_404_' + currentUrl;
    try {
      if (sessionStorage.getItem(guardKey)) {
        console.log('🔁 [404] محاولة مكررة — تخطي للرئيسية');
        navigateReplace('/index.html');
        return;
      }
      sessionStorage.setItem(guardKey, '1');
    } catch (e) {}

    console.log('🔍 [404] صفحة مفقودة:', currentUrl);

    if (document.getElementById('splashScreen')) {
      updateSplashText('🔎 جارٍ البحث عن الصفحة...');
    }

    var candidates = generateCandidates(location.pathname);
    console.log('🔍 [404] المسارات المرشحة:', candidates);

    for (var i = 0; i < candidates.length; i++) {
      var candidate = candidates[i];
      var testUrl = candidate + location.search;
      var exists = await _pathExists(testUrl);

      if (exists) {
        console.log('✅ [404] وُجد البديل:', candidate);

        if (document.getElementById('splashScreen')) {
          updateSplashText('✨ وجدناها! جارٍ التحويل...');
        }

        setTimeout(function() {
          navigateReplace(testUrl);
        }, 180);
        return;
      }
    }

    console.log('❌ [404] لا يوجد بديل — الرئيسية');
    if (document.getElementById('splashScreen')) {
      updateSplashText('🏝️ العودة إلى الواحة...');
    }
    setTimeout(function() {
      navigateReplace('/index.html');
    }, 300);
  }

  function navigateReplace(url) {
    try {
      var absolute = new URL(url, location.href).href;
      location.replace(absolute);
    } catch (e) {
      location.replace(url);
    }
  }

  /* ================================================================
     ✅ Splash Screen — v5.9
     ================================================================ */
  function createSplash() {
    if (document.getElementById('splashScreen')) return;
    var html =
      '<div id="splashScreen">' +
        '<img src="/icon-192.png" alt="واحة الجبري" class="splash-logo" />' +
        '<div class="splash-title">واحة الجبري</div>' +
        '<div class="splash-sub">تراث اليمن العريق · نظرية السندباد الموحدة</div>' +
        '<div class="spinner"></div>' +
        '<style>' +
          '#splashScreen{position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0a0f;' +
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'z-index:999999;transition:opacity 0.6s ease;font-family:"Cairo",sans-serif;}' +
          '#splashScreen.hidden{opacity:0;pointer-events:none;}' +
          '.splash-logo{width:120px;height:120px;border-radius:50%;border:3px solid #c9a84c;' +
            'box-shadow:0 0 60px rgba(201,168,76,0.5);object-fit:cover;' +
            'animation:splashPulse 1.8s ease-in-out infinite;margin-bottom:22px;}' +
          '.splash-title{color:#6ae3ff;font-size:2.5rem;font-weight:900;letter-spacing:1px;}' +
          '.splash-sub{color:#888;font-size:1.1rem;margin-top:8px;min-height:1.5em;}' +
          '.spinner{width:40px;height:40px;margin-top:30px;' +
            'border:3px solid rgba(106,227,255,0.1);border-top:3px solid #6ae3ff;' +
            'border-radius:50%;animation:spin 1s linear infinite;}' +
          '@keyframes splashPulse{0%,100%{transform:scale(1);box-shadow:0 0 60px rgba(201,168,76,0.5);}50%{transform:scale(1.06);box-shadow:0 0 90px rgba(201,168,76,0.9);}}' +
          '@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}' +
          '@media (max-width:600px){.splash-logo{width:96px;height:96px;}.splash-title{font-size:1.8rem;}.splash-sub{font-size:0.95rem;}}' +
        '</style>' +
      '</div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.prepend(div.firstElementChild);
  }

  function hideSplash() {
    if (splashHidden) return;
    if (splashAutoHideTimer) clearTimeout(splashAutoHideTimer);
    var el = document.getElementById('splashScreen');
    if (el) el.classList.add('hidden');
    splashHidden = true;
    setTimeout(function() { if (el) el.remove(); }, 800);
  }

  function bustCache(url) {
    if (IS_APK) return url;
    var sep = url.indexOf('?') !== -1 ? '&' : '?';
    return url + sep + '_t=' + Date.now();
  }

  function safelyExecuteScripts(container) {
    var scripts = Array.prototype.slice.call(container.querySelectorAll('script'));
    scripts.forEach(function(oldScript) {
      try {
        // 🆕 v5.9 — تخطي menu.js إذا كان مُستدعى من الخارج
        var src = oldScript.src || '';
        if (src.indexOf('menu.js') !== -1) {
          console.log('⏭️ [init] تخطي إعادة تشغيل menu.js');
          return;
        }
        var newScript = document.createElement('script');
        Array.prototype.slice.call(oldScript.attributes).forEach(function(attr) {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.src) {
          newScript.src = bustCache(oldScript.src);
        } else {
          newScript.textContent = oldScript.textContent;
        }
        document.head.appendChild(newScript);
        oldScript.remove();
      } catch (e) {
        console.warn('⚠️ [init] تخطي سكربت:', e.message);
      }
    });
  }

  function loadHTMLFile(placeholder, filename, onSuccess, onFail) {
    if (!placeholder) {
      if (onFail) onFail(new Error('placeholder not found'));
      return;
    }
    if (placeholder.dataset.loaded === 'true') {
      if (onSuccess) onSuccess();
      return;
    }

    console.log('📄 [' + filename + '] جارٍ التحميل... (' + (IS_APK ? 'APK' : 'Web') + ')');

    var xhr = new XMLHttpRequest();
    var url = IS_APK ? filename : bustCache(filename);

    xhr.open('GET', url, true);
    xhr.timeout = IS_APK ? 8000 : 5000;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var successStatus = (xhr.status === 200) || (xhr.status === 0 && xhr.responseText);
        if (successStatus) {
          try {
            placeholder.innerHTML = xhr.responseText;
            placeholder.dataset.loaded = 'true';
            safelyExecuteScripts(placeholder);
            console.log('✅ [' + filename + '] تم التحميل');
            if (onSuccess) onSuccess();
          } catch (e) {
            console.error('❌ [' + filename + '] خطأ:', e);
            if (onFail) onFail(e);
          }
        } else {
          console.error('❌ [' + filename + '] فشل XHR: HTTP ' + xhr.status);
          if (onFail) onFail(new Error('HTTP ' + xhr.status));
        }
      }
    };
    xhr.ontimeout = function() {
      console.error('⏰ [' + filename + '] انتهت المهلة');
      if (onFail) onFail(new Error('Timeout'));
    };
    xhr.onerror = function() {
      console.error('❌ [' + filename + '] خطأ في الشبكة');
      if (onFail) onFail(new Error('Network error'));
    };

    try { xhr.send(); }
    catch (e) {
      console.error('❌ [' + filename + '] استثناء:', e);
      if (onFail) onFail(e);
    }
  }

  function loadHeader() {
    var placeholder = document.getElementById('header-placeholder');
    loadHTMLFile(
      placeholder,
      'header.html',
      function() {
        document.dispatchEvent(new CustomEvent('headerLoaded'));
        // 🆕 v5.9 — إخفاء الـ splash مباشرة بعد نجاح الهيدر
        setTimeout(hideSplash, 200);
      },
      function(err) {
        console.warn('⚠️ [header] تخطي:', err.message);
        // 🆕 v5.9 — لا تترك الشاشة معطلة حتى لو فشل الهيدر
        var ph = document.getElementById('header-placeholder');
        if (ph) ph.innerHTML = '<div style="height:60px"></div>';
        setTimeout(hideSplash, 300);
      }
    );
  }

  function loadFooter() {
    var placeholder = document.getElementById('footer-placeholder');
    loadHTMLFile(
      placeholder,
      'footer.html',
      function() { document.dispatchEvent(new CustomEvent('footerLoaded')); },
      function(err) { console.warn('⚠️ [footer] تخطي:', err.message); }
    );
  }

  function addDynamicLinks() {
    var currentFile = (window.location.pathname.split('/').pop() || 'index.html');
    var pageLinks = {
      'Page1.html': { prev: null, next: 'Page2.html', up: 'research.html' },
      'Page2.html': { prev: 'Page1.html', next: 'Page3.html', up: 'research.html' },
      'Page3.html': { prev: 'Page2.html', next: 'Page4.html', up: 'research.html' },
      'Page4.html': { prev: 'Page3.html', next: 'Page5.html', up: 'research.html' },
      'Page5.html': { prev: 'Page4.html', next: 'Page6.html', up: 'research.html' },
      'Page6.html': { prev: 'Page5.html', next: 'Page7.html', up: 'research.html' },
      'Page7.html': { prev: 'Page6.html', next: 'Page8.html', up: 'research.html' },
      'Page8.html': { prev: 'Page7.html', next: 'Page9.html', up: 'research.html' },
      'Page9.html': { prev: 'Page8.html', next: 'Page10.html', up: 'research.html' },
      'Page10.html': { prev: 'Page9.html', next: 'Page11.html', up: 'research.html' },
      'Page11.html': { prev: 'Page10.html', next: 'Page12.html', up: 'research.html' },
      'Page12.html': { prev: 'Page11.html', next: null, up: 'research.html' },
      'Sanaa.html': { prev: null, next: 'Shibam.html', up: 'yemen-photo.html' },
      'Shibam.html': { prev: 'Sanaa.html', next: 'Soqatra.html', up: 'yemen-photo.html' },
      'Soqatra.html': { prev: 'Shibam.html', next: null, up: 'yemen-photo.html' }
    };
    var links = pageLinks[currentFile];
    if (!links) return;
    var head = document.head;
    ['prev', 'next', 'up'].forEach(function(rel) {
      if (links[rel]) {
        var link = document.querySelector('link[rel="' + rel + '"]');
        if (!link) {
          link = document.createElement('link');
          link.rel = rel;
          head.appendChild(link);
        }
        link.href = IS_APK ? links[rel] : 'https://jabri-com.vercel.app/' + links[rel];
      }
    });
  }

  function setDynamicCanonical() {
    if (IS_APK) return;
    var currentUrl = window.location.href.split('?')[0].split('#')[0];
    var canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;
  }

  function init() {
    initLang();
    initTheme();

    initNetworkMonitor();

    createSplash();

    var quick404 = false;
    try { quick404 = detect404(); } catch (e) { quick404 = false; }

    if (!IS_APK && quick404) {
      console.log('🚨 [init] 404 مكتشف — معالج ذكي');
      if (splashAutoHideTimer) clearTimeout(splashAutoHideTimer);
      handle404Smart();
      return;
    }

    if (!IS_APK) {
      setTimeout(function() {
        try {
          if (detect404() && !splashHidden) {
            console.log('🚨 [init] 404 (متأخر) — معالج ذكي');
            if (splashAutoHideTimer) clearTimeout(splashAutoHideTimer);
            handle404Smart();
          }
        } catch (e) {}
      }, 120);
    }

    var hasHeaderPH = !!document.getElementById('header-placeholder');
    var hasFooterPH = !!document.getElementById('footer-placeholder');

    if (hasHeaderPH) {
      loadHeader();
    } else {
      console.log('ℹ️ [init] لا يوجد header-placeholder');
      setTimeout(hideSplash, 300);
    }

    if (hasFooterPH) {
      loadFooter();
    } else {
      console.log('ℹ️ [init] لا يوجد footer-placeholder');
    }

    document.addEventListener('headerLoaded', function() {
      setDynamicCanonical();
      addDynamicLinks();
      initLang();
      updateAuthUI();
    });

    // 🆕 v5.9 — إخفاء قسري بعد 3.5s (ويب) أو 2.5s (APK)
    splashAutoHideTimer = setTimeout(function() {
      if (!splashHidden) {
        console.warn('⏰ [init] إخفاء الـ splash قسرياً (v5.9)');
        hideSplash();
      }
    }, IS_APK ? 2500 : 3500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('✅ init-page-root.js جاهز (v5.9 - Fixed Splash + Auth UI)');
})();