// ================================================================
//  init-page-root.js - v5.1 (APK Ready)
// ================================================================

(function() {
  'use strict';
  console.log('🛡️ [init] تفعيل الدرع المطلق (v5.1.0 - APK Ready)...');

  // ✅ كشف البيئة
  const IS_APK = window.location.protocol === 'file:' || 
                 navigator.userAgent.includes('wv') ||
                 (!window.location.hostname.includes('vercel') && 
                  !window.location.hostname.includes('github') &&
                  window.location.protocol !== 'http:' && 
                  window.location.protocol !== 'https:');

  console.log('🌍 [init] البيئة:', IS_APK ? '📱 APK' : '🌐 Web');

  let splashHidden = false;

  // ===== شاشة الترحيب =====
  function createSplash() {
    if (document.getElementById('splashScreen')) return;
    const html = `
      <div id="splashScreen">
        <div class="splash-title">واحة الجبري</div>
        <div class="splash-sub">تراث اليمن العريق · نظرية السندباد الموحدة</div>
        <div class="spinner"></div>
        <style>
          #splashScreen { position: fixed; top:0; left:0; width:100%; height:100%; background:#0a0a0f; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:999999; transition: opacity 0.6s ease; font-family: 'Cairo', sans-serif; }
          #splashScreen.hidden { opacity:0; pointer-events:none; }
          .splash-title { color:#6ae3ff; font-size:2.5rem; font-weight:900; }
          .splash-sub { color:#888; font-size:1.1rem; margin-top:8px; }
          .spinner { width:40px; height:40px; margin-top:30px; border:3px solid rgba(106,227,255,0.1); border-top:3px solid #6ae3ff; border-radius:50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
          @media (max-width:600px) { .splash-title { font-size:1.8rem; } .splash-sub { font-size:0.95rem; } }
        </style>
      </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.prepend(div.firstElementChild);
  }

  function hideSplash() {
    if (splashHidden) return;
    const el = document.getElementById('splashScreen');
    if (el) el.classList.add('hidden');
    splashHidden = true;
    setTimeout(() => { if (el) el.remove(); }, 800);
  }

  function bustCache(url) {
    if (IS_APK) return url;
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + '_t=' + Date.now();
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

  // ================================================================
  //  ✅ تحميل HTML مع XHR + timeout
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

    console.log(`📄 [${filename}] جاري التحميل...`);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', bustCache(filename), true);
    xhr.timeout = 5000;
    
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
      () => {
        document.dispatchEvent(new CustomEvent('headerLoaded'));
        setTimeout(hideSplash, 300);
      },
      (err) => {
        console.warn('⚠️ [header] تخطي التحميل:', err.message);
        setTimeout(hideSplash, 500);
      }
    );
  }

  function loadFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    loadHTMLFile(
      placeholder, 
      'footer.html',
      () => {
        document.dispatchEvent(new CustomEvent('footerLoaded'));
      },
      (err) => {
        console.warn('⚠️ [footer] تخطي التحميل:', err.message);
      }
    );
  }

  // ===== الروابط الديناميكية =====
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
        let link = document.querySelector(`link[rel="${rel}"]`);
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

  function setDynamicCanonical() {
    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;
  }

  // ===== كاشف 404 (فقط على الويب) =====
  function detect404AndHandle() {
    if (IS_APK) {
      console.log('⏭️ [404] تم تخطي كاشف 404 (بيئة APK)');
      return;
    }

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
    if (sessionStorage.getItem('jabri404Handled')) return;
    sessionStorage.setItem('jabri404Handled', 'true');

    hideSplash();

    let count = localStorage.getItem('jabriVisitorCount');
    if (count === null) count = Math.floor(Math.random() * 80) + 20;
    else count = Number(count);

    const div = document.createElement('div');
    div.id = 'jabri-404-overlay';
    div.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: #0b1a2e; color: #f0e6d3; padding: 20px 30px;
      border-radius: 40px; border: 1px solid #b48b5a;
      font-size: 20px; z-index: 999999;
      box-shadow: 0 15px 40px rgba(0,0,0,0.8);
      text-align: center; font-family: 'Cairo', sans-serif;
      backdrop-filter: blur(12px); direction: rtl;
      max-width: 90%;
    `;
    div.innerHTML = `
      🏝️ عذرًا، هذا الدرب غير موجود في واحة الجبري.<br>
      🌊 سيتم تحويلك إلى <strong>الواحة الرئيسية</strong> بعد 7 ثوانٍ<br>
      👥 عدد الزوار: <strong>${count}</strong>
    `;
    document.body.prepend(div);

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 7000);
  }

  // ===== init الرئيسية =====
  function init() {
    createSplash();
    
    if (!IS_APK) {
      setTimeout(detect404AndHandle, 500);
    }
    
    loadHeader();
    loadFooter();

    document.addEventListener('headerLoaded', function() {
      setDynamicCanonical();
      addDynamicLinks();
    });

    setTimeout(function() {
      if (!splashHidden) {
        console.warn('⏰ انتهاء المهلة، إخفاء الشاشة قسراً');
        hideSplash();
      }
    }, IS_APK ? 2000 : 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('✅ init-page-root.js جاهز (v5.1 - APK Ready)');
})();