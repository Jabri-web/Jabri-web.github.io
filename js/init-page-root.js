// ================================================================
//  init-page-root.js - v5.7 (Secure + Smart 404 + Lang + Race-Fix)
//  Heaven Al-Jabri | واحة الجبري
// ================================================================

(function() {
  'use strict';
  console.log('🛡️ [init] تفعيل الدرع المطلق (v5.7 - Race-Fix + Smart 404)...');

  // ✅ كشف البيئة
  const IS_APK = window.location.protocol === 'file:' || 
                 navigator.userAgent.includes('wv') ||
                 (!window.location.hostname.includes('vercel') && 
                  !window.location.hostname.includes('github') &&
                  window.location.protocol !== 'http:' && 
                  window.location.protocol !== 'https:');

  console.log('🌍 [init] البيئة:', IS_APK ? '📱 APK' : '🌐 Web');

  let splashHidden = false;

  /* ================================================================
     ✅ [v5.5] WahaAuth — واجهة آمنة (بدون كلمات سر مكشوفة)
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
    window.dispatchEvent(new CustomEvent('waha:auth-changed', {
      detail: { user: _currentUser ? Object.assign({}, _currentUser) : null }
    }));
  }

  window.WahaAuth = {
    getUser: function() { return _currentUser ? Object.assign({}, _currentUser) : null; },
    isLoggedIn: function() { return !!_currentUser; },
    hasRole: function(role) { return !!_currentUser && _currentUser.role === role; },
    loginLocal: function() {
      console.warn('🔒 [v5.7] الدخول المحلي معطّل لأسباب أمنية');
      return { ok: false, error: 'الدخول المحلي معطّل حالياً.' };
    },
    loginGoogle: function() {
      console.warn('🔒 [v5.7] الدخول عبر Google — قيد التطوير');
      return { ok: false, error: 'الدخول عبر Google قيد التطوير.' };
    },
    logout: function() {
      _currentUser = null;
      _persistAuth();
      return { ok: true };
    },
    _setUser: function(user) {
      _currentUser = user;
      _persistAuth();
      return { ok: true, user: Object.assign({}, _currentUser) };
    }
  };

  /* ================================================================
     ✅ [v5.2] Lang Switcher
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

  const _EXISTS_CACHE = new Map();
  function _pathExists(url) {
    if (_EXISTS_CACHE.has(url)) return Promise.resolve(_EXISTS_CACHE.get(url));
    return fetch(url, { method: 'HEAD', cache: 'no-cache', redirect: 'follow' })
      .then(function(r) { _EXISTS_CACHE.set(url, r.ok); return r.ok; })
      .catch(function() { _EXISTS_CACHE.set(url, false); return false; });
  }

  function _findFirstExisting(paths) {
    return paths.reduce(function(p, cur) {
      return p.then(function(found) {
        if (found) return found;
        return _pathExists(cur).then(function(ok) { return ok ? cur : null; });
      });
    }, Promise.resolve(null));
  }

  /* ================================================================
     ✅ [v5.3] Lang Loader
     ================================================================ */
  function _showLangLoader() {
    let el = document.getElementById('waha-lang-loader');
    if (!el) {
      el = document.createElement('div');
      el.id = 'waha-lang-loader';
      el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(10,15,13,0.9);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;color:#c9a84c;font-family:Cairo,Tajawal,sans-serif;font-size:1.1rem;font-weight:900;';
      el.innerHTML = `
        <div style="text-align:center;">
          <img src="/icon-192.png" alt="واحة الجبري"
               style="width:96px;height:96px;border-radius:50%;border:3px solid #c9a84c;box-shadow:0 0 40px rgba(201,168,76,0.5);animation:waha-pulse 1.6s ease-in-out infinite;object-fit:cover;">
          <div style="margin-top:20px;">جاري تبديل اللغة...</div>
          <div style="margin-top:6px;font-size:0.8rem;opacity:0.6;font-weight:400;">Switching language...</div>
          <div style="margin-top:18px;display:flex;justify-content:center;gap:6px;">
            <span style="width:8px;height:8px;border-radius:50%;background:#c9a84c;animation:waha-dot 1.4s ease-in-out infinite;animation-delay:0s;"></span>
            <span style="width:8px;height:8px;border-radius:50%;background:#c9a84c;animation:waha-dot 1.4s ease-in-out infinite;animation-delay:0.2s;"></span>
            <span style="width:8px;height:8px;border-radius:50%;background:#c9a84c;animation:waha-dot 1.4s ease-in-out infinite;animation-delay:0.4s;"></span>
          </div>
        </div>
        <style>
          @keyframes waha-pulse { 0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(201,168,76,0.5);} 50%{transform:scale(1.08);box-shadow:0 0 70px rgba(201,168,76,0.9);} }
          @keyframes waha-dot { 0%,80%,100%{opacity:0.3;transform:scale(0.8);} 40%{opacity:1;transform:scale(1.2);} }
        </style>
      `;
      document.body.appendChild(el);
    }
    el.style.display = 'flex';
  }

  /* ================================================================
     ✅ [v5.6] switchLanguage
     ================================================================ */
  let _switching = false;
  function switchLanguage() {
    if (_switching) return;
    _switching = true;

    const current = _getCurrentLang();
    const target = current === 'ar' ? 'en' : 'ar';
    const file = _getCurrentFile();

    localStorage.setItem(LANG_KEY, target);

    const t = setTimeout(_showLangLoader, 280);

    const candidates = [
      '/' + target + '/' + file,
      '/' + file,
      '/' + target + '/index.html',
      '/' + target + '/',
      '/'
    ];

    const safety = setTimeout(function() {
      console.warn('⏰ [lang] timeout - تحويل مباشر');
      window.location.href = '/' + target + '/';
    }, 3000);

    _findFirstExisting(candidates).then(function(url) {
      clearTimeout(t);
      clearTimeout(safety);
      url = url || '/' + target + '/';
      console.log('🌐 [lang]', current, '→', target, '|', file, '→', url);
      window.location.href = url;
    }).catch(function() {
      clearTimeout(t);
      clearTimeout(safety);
      window.location.href = '/' + target + '/';
    });
  }

  function initLang() {
    const lang = _getCurrentLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-en', lang === 'en');
    document.body.classList.toggle('lang-ar', lang === 'ar');
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}

    const label = document.getElementById('langLabel');
    if (label) label.textContent = lang === 'ar' ? 'English' : 'عربي';
  }

  function initTheme() {
    const t = localStorage.getItem('theme') || 'night';
    const d = localStorage.getItem('device') || 'desktop';
    document.body.classList.remove('day', 'night', 'device-desktop', 'device-phone');
    document.body.classList.add(t, 'device-' + d);
  }

  window.switchLanguage = switchLanguage;
  window.toggleLang = switchLanguage;
  window.getCurrentLanguage = _getCurrentLang;

  /* ================================================================
     ✅ [v5.3.1] Splash Screen
     ================================================================ */
  function createSplash() {
    if (document.getElementById('splashScreen')) return;
    const html = `
      <div id="splashScreen">
        <img src="/icon-192.png" alt="واحة الجبري" class="splash-logo" />
        <div class="splash-title">واحة الجبري</div>
        <div class="splash-sub">تراث اليمن العريق · نظرية السندباد الموحدة</div>
        <div class="spinner"></div>
        <style>
          #splashScreen { position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;transition:opacity 0.4s ease;font-family:'Cairo',sans-serif; }
          #splashScreen.hidden { opacity:0; pointer-events:none; }
          .splash-logo { width:120px;height:120px;border-radius:50%;border:3px solid #c9a84c;box-shadow:0 0 60px rgba(201,168,76,0.5);object-fit:cover;animation:splashPulse 1.8s ease-in-out infinite;margin-bottom:22px; }
          .splash-title { color:#6ae3ff;font-size:2.5rem;font-weight:900;letter-spacing:1px; }
          .splash-sub { color:#888;font-size:1.1rem;margin-top:8px; }
          .spinner { width:40px;height:40px;margin-top:30px;border:3px solid rgba(106,227,255,0.1);border-top:3px solid #6ae3ff;border-radius:50%;animation:spin 1s linear infinite; }
          @keyframes splashPulse { 0%,100%{transform:scale(1);box-shadow:0 0 60px rgba(201,168,76,0.5);} 50%{transform:scale(1.06);box-shadow:0 0 90px rgba(201,168,76,0.9);} }
          @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
          @media (max-width:600px) { .splash-logo{width:96px;height:96px;} .splash-title{font-size:1.8rem;} .splash-sub{font-size:0.95rem;} }
        </style>
      </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.prepend(div.firstElementChild);
  }

  /* ✅ [v5.7] hideSplash — محسّن ضد Race */
  function hideSplash() {
    if (splashHidden) return;
    splashHidden = true;
    const el = document.getElementById('splashScreen');
    if (el) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      setTimeout(function() { if (el && el.parentNode) el.remove(); }, 400);
    }
  }

  /* ================================================================
     ✅ [v5.5] bustCache
     ================================================================ */
  function bustCache(url) {
    if (IS_APK) {
      const sep = url.includes('?') ? '&' : '?';
      return url + sep + '_t=' + Date.now();
    }
    return url;
  }

  function safelyExecuteScripts(container) {
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach(oldScript => {
      try {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
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

  /* ✅ [v5.7] loadHTMLFile — timeout 8s */
  function loadHTMLFile(placeholder, filename, onSuccess, onFail) {
    if (!placeholder) {
      if (onFail) onFail(new Error('placeholder not found'));
      return;
    }
    if (placeholder.dataset.loaded === 'true') {
      if (onSuccess) onSuccess();
      return;
    }

    console.log(`📄 [${filename}] جاري التحميل...`);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', bustCache(filename), true);
    xhr.timeout = 8000;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          try {
            placeholder.innerHTML = xhr.responseText;
            placeholder.dataset.loaded = 'true';
            safelyExecuteScripts(placeholder);
            console.log(`✅ [${filename}] تم التحميل عبر XHR`);
            if (onSuccess) onSuccess();
          } catch(e) {
            console.error(`❌ [${filename}] خطأ في المعالجة:`, e);
            if (onFail) onFail(e);
          }
        } else {
          console.error(`❌ [${filename}] فشل XHR: HTTP ${xhr.status}`);
          if (onFail) onFail(new Error('HTTP ' + xhr.status));
        }
      }
    };

    xhr.ontimeout = function() {
      console.error(`⏰ [${filename}] انتهت المهلة`);
      if (onFail) onFail(new Error('Timeout'));
    };

    xhr.onerror = function() {
      console.error(`❌ [${filename}] خطأ في الشبكة`);
      if (onFail) onFail(new Error('Network error'));
    };

    xhr.send();
  }

  function loadHeader() {
    const placeholder = document.getElementById('header-placeholder');
    loadHTMLFile(
      placeholder,
      'header.html',
      function() {
        document.dispatchEvent(new CustomEvent('headerLoaded'));
        setTimeout(hideSplash, 200);
      },
      function(err) {
        console.warn('⚠️ [header] تخطي التحميل:', err.message);
        setTimeout(hideSplash, 300);
      }
    );
  }

  function loadFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    loadHTMLFile(
      placeholder,
      'footer.html',
      function() {
        document.dispatchEvent(new CustomEvent('footerLoaded'));
      },
      function(err) {
        console.warn('⚠️ [footer] تخطي التحميل:', err.message);
      }
    );
  }

  function addDynamicLinks() {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';

    const pageLinks = {
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

    const links = pageLinks[currentFile];
    if (!links) return;
    const head = document.head;

    ['prev', 'next', 'up'].forEach(rel => {
      if (links[rel]) {
        let link = document.querySelector('link[rel="' + rel + '"]');
        if (!link) {
          link = document.createElement('link');
          link.rel = rel;
          head.appendChild(link);
        }
        link.href = IS_APK ? links[rel] : 'https://jabri-com.vercel.app/' + links[rel];
      }
    });

    console.log('🔗 روابط ديناميكية مضافة لـ ' + currentFile);
  }

  /* ================================================================
     ✅ [v5.5] setDynamicCanonical
     ================================================================ */
  function setDynamicCanonical() {
    if (document.title.includes('404') ||
        document.body.innerHTML.includes('404 Not Found') ||
        document.body.innerHTML.includes('Page Not Found')) {
      console.log('⏭️ [canonical] تم التخطي (صفحة 404)');
      return;
    }

    const path = window.location.pathname;
    if (path === '/' || path === '/index.html' || path === '') {
      console.log('⏭️ [canonical] تم التخطي (الصفحة الرئيسية)');
      return;
    }

    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;
  }

  /* ================================================================
     ✅ [v5.4] كاشف 404
     ================================================================ */
  function detect404AndHandle() {
    if (IS_APK) return;

    const is404 = document.title.includes('404') ||
                  document.body.innerHTML.includes('404 Not Found') ||
                  document.body.innerHTML.includes('Page Not Found');

    let status404 = false;
    if (window.performance && window.performance.getEntries) {
      const entries = window.performance.getEntries();
      for (let entry of entries) {
        if (entry.name === window.location.href && entry.responseStatus === 404) {
          status404 = true;
          break;
        }
      }
    }

    if (is404 || status404) {
      console.warn('🚨 [404] تم كشف خطأ 404');
      handle404Error();
    }
  }

  function handle404Error() {
    tryToFixUrl(function(fixed) {
      if (fixed) {
        console.log('✨ [404] تم إصلاح URL تلقائياً');
        return;
      }
      show404Overlay();
    });
  }

  /* ================================================================
     ✅ [v5.6] tryToFixUrl
     ================================================================ */
  function tryToFixUrl(callback) {
    var path = window.location.pathname;
    var lastSegment = path.split('/').pop();

    if (/^\/(ar|en)$/i.test(path)) {
      var lang = path.substring(1);
      var langIndex = '/' + lang + '/index.html';
      fetch(langIndex, { method: 'HEAD', cache: 'no-cache' })
        .then(function(res) {
          if (res.ok) {
            window.location.replace(langIndex);
          } else {
            window.location.replace('/');
          }
          callback(true);
        })
        .catch(function() {
          window.location.replace('/');
          callback(true);
        });
      return;
    }

    var hasExtension = lastSegment && lastSegment.indexOf('.') !== -1;
    var isRoot = (path === '/' || path === '');

    if (hasExtension || isRoot) {
      callback(false);
      return;
    }

    var isInLangFolder = /^\/(ar|en)\//i.test(path);
    var langMatch = path.match(/^\/(ar|en)\/(.+)$/i);

    var candidates = [];

    if (isInLangFolder && langMatch) {
      var lang = langMatch[1];
      var fileName = langMatch[2];
      candidates.push('/' + lang + '/' + fileName + '.html');
      candidates.push('/' + fileName + '.html');
      candidates.push('/' + lang + '/' + fileName + '/index.html');
    } else {
      if (path.endsWith('/')) {
        var clean = path.slice(0, -1);
        candidates.push(path + 'index.html');
        candidates.push(clean + '.html');
      } else {
        candidates.push(path + '.html');
        candidates.push(path + '/index.html');
      }
    }

    console.log('🔧 [404-Fix]', path, '→', candidates);

    (function tryNext(i) {
      if (i >= candidates.length) {
        callback(false);
        return;
      }
      var url = candidates[i];
      fetch(url, { method: 'HEAD', cache: 'no-cache', redirect: 'follow' })
        .then(function(res) {
          if (res.ok) {
            console.log('✅ [404-Fix] وُجد:', url);
            window.location.replace(url);
            callback(true);
          } else {
            tryNext(i + 1);
          }
        })
        .catch(function() {
          tryNext(i + 1);
        });
    })(0);
  }

  /* ================================================================
     ✅ [v5.4] show404Overlay
     ================================================================ */
  function show404Overlay() {
    if (sessionStorage.getItem('jabri404Handled')) return;
    sessionStorage.setItem('jabri404Handled', 'true');

    hideSplash();

    let count = localStorage.getItem('jabriVisitorCount');
    if (count === null) count = Math.floor(Math.random() * 80) + 20;
    else count = Number(count);

    const div = document.createElement('div');
    div.id = 'jabri-404-overlay';
    div.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#0b1a2e;color:#f0e6d3;padding:20px 30px;border-radius:40px;border:1px solid #b48b5a;font-size:20px;z-index:999999;box-shadow:0 15px 40px rgba(0,0,0,0.8);text-align:center;font-family:Cairo,sans-serif;backdrop-filter:blur(12px);direction:rtl;max-width:90%;';
    div.innerHTML = '🏝️ عذرًا، هذا الدرب غير موجود في واحة الجبري.<br>🌊 سيتم تحويلك إلى <strong>الواحة الرئيسية</strong> بعد 7 ثوانٍ<br>👥 عدد الزوار: <strong>' + count + '</strong>';
    document.body.prepend(div);

    setTimeout(function() {
      window.location.href = 'index.html';
    }, 7000);
  }

  /* ================================================================
     ✅ [v5.7] init — محسّن ضد Race
     ================================================================ */
  function init() {
    initLang();
    initTheme();

    createSplash();

    /* ⭐ حماية 1: إخفاء قسري بعد 2.5 ثانية (أياً كان السبب) */
    setTimeout(function() {
      if (!splashHidden) {
        console.warn('🚨 [Splash] إخفاء قسري بعد 2.5s');
        hideSplash();
      }
    }, 2500);

    /* ⭐ حماية 2: إخفاء فوري لو DOM جاهز */
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(hideSplash, 600);
    }

    /* ⭐ حماية 3: إخفاء عند الخروج */
    window.addEventListener('beforeunload', hideSplash);
    window.addEventListener('pagehide', hideSplash);

    if (!IS_APK) {
      setTimeout(detect404AndHandle, 500);
    }

    loadHeader();

    /* ⭐ حماية 4: تأخير تحميل الفوتر لتقليل التنافس */
    setTimeout(loadFooter, 250);

    document.addEventListener('headerLoaded', function() {
      setDynamicCanonical();
      addDynamicLinks();
      initLang();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('✅ init-page-root.js جاهز (v5.7 - Race-Fix + Smart 404)');
})();