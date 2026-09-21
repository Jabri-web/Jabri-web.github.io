// ================================================================
//  init-page-root.js - v5.5.0
//  Heaven Al-Jabri | واحة الجبري
//  ─────────────────────────────────────────────────────────────
//  ✨ جديد v5.5:
//    • Smart 404 Handler — يصلّح الرابط تلقائياً
//    • No White Screen — splash يبقى ظاهراً طوال الفحص
//    • فحص /ar/ و /en/ و / قبل التحويل للرئيسية
//    • إضافة .html تلقائياً لو ناقص
// ================================================================

(function() {
  'use strict';
  console.log('🛡️ [init] الدرع المطلق (v5.5.0 - Smart 404)...');

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
     ✅ WahaAuth — نظام الدخول الموحّد
     ================================================================ */
  const AUTH_KEY = 'waha_user';
  const AUTH_USERS = {
    'admin':     { password: '12345',   role: 'admin',     name: 'المدير'  },
    'moderator': { password: 'mod123',  role: 'moderator', name: 'مشرف'   },
    'user':      { password: 'user123', role: 'user',      name: 'مستخدم' },
    'guest':     { password: 'guest',   role: 'guest',     name: 'زائر'   }
  };

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
    loginLocal: function(username, password) {
      username = String(username || '').trim();
      password = String(password || '').trim();
      if (!username || !password) {
        return { ok: false, error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' };
      }
      const u = AUTH_USERS[username];
      if (u && u.password === password) {
        _currentUser = {
          name: u.name, role: u.role, username: username,
          provider: 'local', since: Date.now()
        };
        _persistAuth();
        return { ok: true, user: Object.assign({}, _currentUser) };
      }
      return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    },
    loginGoogle: function() {
      _currentUser = {
        name: 'مستخدم Google', role: 'google',
        email: 'user@gmail.com', provider: 'google', since: Date.now()
      };
      _persistAuth();
      return { ok: true, user: Object.assign({}, _currentUser) };
    },
    logout: function() {
      _currentUser = null;
      _persistAuth();
      return { ok: true };
    }
  };

  /* ================================================================
     ✅ Lang Switcher
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
    // APK: نستخدم XHR (fetch ممنوع على file://)
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

  function _findFirstExisting(paths) {
    return paths.reduce(function(p, cur) {
      return p.then(function(found) {
        if (found) return found;
        return _pathExists(cur).then(function(ok) { return ok ? cur : null; });
      });
    }, Promise.resolve(null));
  }

  function _showLangLoader() {
    let el = document.getElementById('waha-lang-loader');
    if (!el) {
      el = document.createElement('div');
      el.id = 'waha-lang-loader';
      el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(10,15,13,0.9);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;color:#c9a84c;font-family:Cairo,Tajawal,sans-serif;font-size:1.1rem;font-weight:900;';
      el.innerHTML =
        '<div style="text-align:center;">' +
          '<img src="/icon-192.png" alt="واحة الجبري" ' +
               'style="width:96px;height:96px;border-radius:50%;' +
                      'border:3px solid #c9a84c;' +
                      'box-shadow:0 0 40px rgba(201,168,76,0.5);' +
                      'animation:waha-pulse 1.6s ease-in-out infinite;' +
                      'object-fit:cover;">' +
          '<div style="margin-top:20px;">جاري تبديل اللغة...</div>' +
          '<div style="margin-top:6px;font-size:0.8rem;opacity:0.6;font-weight:400;">Switching language...</div>' +
          '<div style="margin-top:18px;display:flex;justify-content:center;gap:6px;">' +
            '<span style="width:8px;height:8px;border-radius:50%;background:#c9a84c;animation:waha-dot 1.4s ease-in-out infinite;"></span>' +
            '<span style="width:8px;height:8px;border-radius:50%;background:#c9a84c;animation:waha-dot 1.4s ease-in-out infinite;animation-delay:0.2s;"></span>' +
            '<span style="width:8px;height:8px;border-radius:50%;background:#c9a84c;animation:waha-dot 1.4s ease-in-out infinite;animation-delay:0.4s;"></span>' +
          '</div>' +
        '</div>' +
        '<style>' +
          '@keyframes waha-pulse {0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(201,168,76,0.5);}50%{transform:scale(1.08);box-shadow:0 0 70px rgba(201,168,76,0.9);}}' +
          '@keyframes waha-dot {0%,80%,100%{opacity:0.3;transform:scale(0.8);}40%{opacity:1;transform:scale(1.2);}}' +
        '</style>';
      document.body.appendChild(el);
    }
    el.style.display = 'flex';
  }

  let _switching = false;
  function switchLanguage() {
    if (_switching) return;
    _switching = true;
    const current = _getCurrentLang();
    const target = current === 'ar' ? 'en' : 'ar';
    const file = _getCurrentFile();
    try { localStorage.setItem(LANG_KEY, target); } catch (e) {}

    const t = setTimeout(_showLangLoader, 280);

    // على APK: مسار نسبي مباشر
    if (IS_APK) {
      clearTimeout(t);
      _showLangLoader();
      setTimeout(function() {
        window.location.href = target + '/' + file;
      }, 400);
      return;
    }

    const candidates = [
      '/' + target + '/' + file,
      '/' + target + '/index.html',
      '/' + target + '/',
      '/'
    ];

    const safety = setTimeout(function() {
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
     ✨ [v5.5] Smart 404 Handler
     ─────────────────────────────────────────────────────────────
     المبدأ: لا شاشة بيضاء أبداً — splash يبقى، نفحص بهدوء، ننتقل فوراً
     ================================================================ */

  // كشف 404 عبر: العنوان + محتوى الصفحة + Performance API
  function detect404() {
    if (document.title && /404/i.test(document.title)) return true;

    const bodyHTML = (document.body && document.body.innerHTML) || '';
    if (/404\s*Not\s*Found/i.test(bodyHTML)) return true;
    if (/Page\s*Not\s*Found/i.test(bodyHTML)) return true;
    if (/This\s*page\s*could\s*not\s*be\s*found/i.test(bodyHTML)) return true;
    if (/NOT_FOUND/i.test(bodyHTML)) return true;
    if (/لا\s*توجد\s*هذه\s*الصفحة/.test(bodyHTML)) return true;

    // Performance API
    if (window.performance && window.performance.getEntries) {
      const href = location.href;
      const entries = window.performance.getEntries();
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].name === href && entries[i].responseStatus === 404) {
          return true;
        }
      }
    }
    return false;
  }

  // توليد المسارات المرشحة
  function generateCandidates(pathname) {
    var path = String(pathname || '/').split('?')[0].split('#')[0];
    path = path.replace(/\/+$/, '') || '/';

    // استخرج اسم الملف والمجلد
    var parts = path.split('/').filter(function(x) { return x; });
    var file = parts.length ? parts[parts.length - 1] : 'index.html';
    var dir  = parts.slice(0, -1).join('/');

    // لو ما فيه امتداد معروف → أضف .html
    var hasExt = /\.(html?|php|xml|json|css|js|png|jpe?g|gif|webp|svg|ico|mp3|mp4|webm|pdf|txt|md|apk|zip)$/i.test(file);
    if (!hasExt) {
      // لو الفايل فاضي من الأصل → index.html
      if (!file) file = 'index.html';
      else file = file + '.html';
    }

    var dirPrefix = dir ? dir + '/' : '';
    var candidates = [];

    // ① المسار الحالي كما هو
    candidates.push('/' + dirPrefix + file);

    // هل نحن داخل /ar/ أو /en/؟
    var langMatch = dir.match(/^(ar|en)(\/|$)/);
    if (langMatch) {
      var lang = langMatch[1];
      var other = lang === 'ar' ? 'en' : 'ar';
      var rest = dir.slice(lang.length + 1);
      var restPrefix = rest ? rest + '/' : '';

      // ② نفس الملف في اللغة الأخرى
      candidates.push('/' + other + '/' + restPrefix + file);
      // ③ نفس الملف في الجذر
      candidates.push('/' + restPrefix + file);
    } else {
      // ④ في ar/
      candidates.push('/ar/' + dirPrefix + file);
      // ⑤ في en/
      candidates.push('/en/' + dirPrefix + file);
      // ⑥ لو كنا في مجلد فرعي → جرّب الجذر
      if (dir) {
        candidates.push('/' + file);
        candidates.push('/ar/' + file);
        candidates.push('/en/' + file);
      }
    }

    // إزالة التكرار مع الحفاظ على الترتيب
    var seen = {};
    return candidates.filter(function(c) {
      if (seen[c]) return false;
      seen[c] = 1;
      return true;
    });
  }

  // تحديث نص الـ splash (بدون إخفاء)
  function updateSplashText(text) {
    var el = document.querySelector('#splashScreen .splash-sub');
    if (el) el.textContent = text;
  }
  function updateSplashTitle(text) {
    var el = document.querySelector('#splashScreen .splash-title');
    if (el) el.textContent = text;
  }

  // ✨ المعالج الذكي
  async function handle404Smart() {
    var currentUrl = location.pathname + location.search;

    // حماية ضد الحلقات — مفتاح لكل URL
    var guardKey = 'waha_404_' + currentUrl;
    try {
      if (sessionStorage.getItem(guardKey)) {
        console.log('🔁 [404] محاولة مكررة لنفس الرابط — تخطي');
        // لو مكرر → حوّل للرئيسية بهدوء
        navigateReplace('/index.html');
        return;
      }
      sessionStorage.setItem(guardKey, '1');
    } catch (e) {}

    console.log('🔍 [404] صفحة مفقودة:', currentUrl);

    // ✅ نُبقي splash ظاهراً
    if (document.getElementById('splashScreen')) {
      updateSplashText('🔎 جارٍ البحث عن الصفحة...');
    }

    var candidates = generateCandidates(location.pathname);
    console.log('🔍 [404] المسارات المرشحة:', candidates);

    // ✅ نفحص كل مرشح بهدوء
    for (var i = 0; i < candidates.length; i++) {
      var candidate = candidates[i];
      // ما نجرّب نفس الرابط الحالي
      if (candidate === location.pathname) continue;

      var testUrl = candidate + location.search;
      var exists = await _pathExists(testUrl);

      if (exists) {
        console.log('✅ [404] وُجد البديل:', candidate);

        if (document.getElementById('splashScreen')) {
          updateSplashText('✨ وجدناها! جارٍ التحويل...');
        }

        // ✅ انتقال فوري بهدوء — بدون overlay
        setTimeout(function() {
          navigateReplace(testUrl);
        }, 180);
        return;
      }
    }

    // ❌ ما لقينا شيء → الرئيسية بهدوء
    console.log('❌ [404] لا يوجد بديل — العودة للرئيسية');
    if (document.getElementById('splashScreen')) {
      updateSplashText('🏝️ العودة إلى الواحة...');
    }
    setTimeout(function() {
      navigateReplace('/index.html');
    }, 300);
  }

  // انتقال بدون إضافة history entry
  function navigateReplace(url) {
    try {
      var absolute = new URL(url, location.href).href;
      location.replace(absolute);
    } catch (e) {
      location.replace(url);
    }
  }

  /* ================================================================
     ✅ Splash Screen
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

  // ================================================================
  //  تحميل HTML — XHR آمن
  // ================================================================
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
        setTimeout(hideSplash, 300);
      },
      function(err) {
        console.warn('⚠️ [header] تخطي:', err.message);
        setTimeout(hideSplash, 500);
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

  // ================================================================
  //  init الرئيسية
  // ================================================================
  function init() {
    initLang();
    initTheme();

    // ✅ ① splash أولاً — قبل أي شيء (درع ضد الأبيض)
    createSplash();

    // ✅ ② فحص 404 فوراً — قبل تحميل header/footer
    var quick404 = false;
    try {
      quick404 = detect404();
    } catch (e) { quick404 = false; }

    if (!IS_APK && quick404) {
      console.log('🚨 [init] 404 مكتشف — تشغيل المعالج الذكي');
      // أوقف الإخفاء التلقائي للـ splash
      if (splashAutoHideTimer) clearTimeout(splashAutoHideTimer);
      handle404Smart();
      return; // ← لا نكمل التهيئة العادية
    }

    // ✅ ③ تأخير الفحص عبر Performance API (بعد 100ms)
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

    // ✅ ④ تحميل header/footer
    var hasHeaderPH = !!document.getElementById('header-placeholder');
    var hasFooterPH = !!document.getElementById('footer-placeholder');

    if (hasHeaderPH) {
      loadHeader();
    } else {
      console.log('ℹ️ [init] لا يوجد header-placeholder — header مضمّن');
      setTimeout(hideSplash, 300);
    }

    if (hasFooterPH) {
      loadFooter();
    } else {
      console.log('ℹ️ [init] لا يوجد footer-placeholder — footer مضمّن');
    }

    document.addEventListener('headerLoaded', function() {
      setDynamicCanonical();
      addDynamicLinks();
      initLang();
    });

    // ✅ ⑤ مؤقت إخفاء الـ splash (احتياطي)
    splashAutoHideTimer = setTimeout(function() {
      if (!splashHidden) {
        console.warn('⏰ إخفاء الـ splash قسراً');
        hideSplash();
      }
    }, IS_APK ? 2500 : 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('✅ init-page-root.js جاهز (v5.5.0 - Smart 404 + No White)');
})();