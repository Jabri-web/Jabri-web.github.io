// ================================================================
//  init-page-root.js - الإصدار النهائي (الدرع المطلق + 404)
//  يحاصر 404 في كل الأحوال
// ================================================================

(function() {
  'use strict';
  console.log('🛡️ [init] تفعيل الدرع المطلق (v4.0.0)...');

  let splashHidden = false;

  // ===== شاشة الترحيب =====
  function createSplash() {
    if (document.getElementById('splashScreen')) return;
    const html = `
      <div id="splashScreen">
        <div class="splash-title">🌊 واحة الجبري</div>
        <div class="splash-sub">الدالة الأم · نظرية السندباد الموحدة</div>
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
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + '_t=' + Date.now();
  }

  function safelyExecuteScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      try {
        const src = oldScript.src || '';
        const content = oldScript.textContent || '';
        if (src) {
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

  function loadHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) {
      console.warn('⚠️ [header] placeholder غير موجود');
      setTimeout(hideSplash, 500);
      return;
    }
    if (placeholder.dataset.loaded === 'true') {
      setTimeout(hideSplash, 500);
      return;
    }
    console.log('📄 [header] جاري التحميل...');
    fetch(bustCache('header.html'))
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(html => {
        placeholder.innerHTML = html;
        placeholder.dataset.loaded = 'true';
        safelyExecuteScripts(placeholder);
        console.log('✅ [header] تم التحميل');
        document.dispatchEvent(new CustomEvent('headerLoaded'));
        setTimeout(hideSplash, 300);
      })
      .catch(err => {
        console.error('❌ [header] فشل:', err);
        placeholder.innerHTML = `<div style="color:#ff6a6a;padding:20px;text-align:center;">⚠️ فشل تحميل الهيدر</div>`;
        setTimeout(hideSplash, 500);
      });
  }

  function loadFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;
    if (placeholder.dataset.loaded === 'true') return;
    console.log('📄 [footer] جاري التحميل...');
    fetch(bustCache('footer.html'))
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(html => {
        placeholder.innerHTML = html;
        placeholder.dataset.loaded = 'true';
        safelyExecuteScripts(placeholder);
        console.log('✅ [footer] تم التحميل');
        document.dispatchEvent(new CustomEvent('footerLoaded'));
      })
      .catch(err => {
        console.error('❌ [footer] فشل:', err);
        placeholder.innerHTML = `<div style="color:#ff6a6a;padding:10px;text-align:center;">⚠️ فشل الفوتر</div>`;
      });
  }

  // ===== الروابط الديناميكية =====
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
      '/Soqatra.html': { prev: '/Shibam.html', next: null, up: '/yemen-photo.html' },
      '/theory-ar.html': { prev: null, next: '/theory-en.html', up: '/' },
      '/theory-en.html': { prev: '/theory-ar.html', next: null, up: '/' }
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

  // ===== ضبط Canonical =====
  function setDynamicCanonical() {
    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;
    console.log('🔗 Canonical: ' + currentUrl);
  }

  // ================================================================
  //  🚨 كاشف 404 التلقائي + معالجته (الحصار المطلق)
  // ================================================================

  function detect404AndHandle() {
    // 1) كشف عبر العنوان
    const title = document.title || '';
    const bodyText = document.body ? document.body.innerHTML : '';
    const is404 = title.includes('404') || bodyText.includes('404') || bodyText.includes('Not Found') || bodyText.includes('الصفحة غير موجودة');

    // 2) كشف عبر performance
    let status404 = false;
    try {
      if (window.performance && window.performance.getEntries) {
        const entries = window.performance.getEntries();
        for (let entry of entries) {
          if (entry.name === window.location.href && entry.responseStatus === 404) {
            status404 = true;
            break;
          }
        }
      }
    } catch(e) {}

    // 3) كشف عبر XMLHttpRequest (في حالة فشل التحميل)
    if (!is404 && !status404) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', window.location.href, false);
        xhr.send();
        if (xhr.status === 404) {
          status404 = true;
        }
      } catch(e) {}
    }

    // 4) كشف عبر كائن document (حالة الاستجابة)
    try {
      if (document.readyState === 'complete' && document.documentElement && document.documentElement.outerHTML) {
        const htmlContent = document.documentElement.outerHTML;
        if (htmlContent.includes('404') || htmlContent.includes('Not Found')) {
          // تم الكشف
        }
      }
    } catch(e) {}

    if (is404 || status404) {
      console.warn('🚨 [404] تم كشف خطأ 404 - حصار فوري');
      handle404Error();
      return true;
    }
    return false;
  }

  function handle404Error() {
    // منع التكرار
    if (sessionStorage.getItem('jabri404Handled')) return;
    sessionStorage.setItem('jabri404Handled', 'true');

    // إخفاء السبلاش
    hideSplash();

    // إزالة أي محتوى موجود
    document.body.innerHTML = '';

    // تشغيل موسيقى
    try {
      const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      audio.volume = 0.15;
      audio.loop = true;
      audio.play().catch(() => {});
    } catch(e) {}

    // عدد الزوار
    let count = localStorage.getItem('jabriVisitorCount');
    if (count === null) count = Math.floor(Math.random() * 80) + 20;
    else count = Number(count);

    // عرض صفحة 404 مخصصة
    const div = document.createElement('div');
    div.id = 'jabri-404-overlay';
    div.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #0a0a0f; color: #f0e6d3;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: 'Cairo', sans-serif; z-index: 999999;
      text-align: center; padding: 20px;
      direction: rtl;
    `;
    div.innerHTML = `
      <div style="max-width: 500px;">
        <div style="font-size: 6rem; margin-bottom: 10px;">🏝️</div>
        <h1 style="color: #ffd700; font-size: 2.5rem; margin-bottom: 10px;">عذرًا، هذا الدرب غير موجود</h1>
        <p style="color: #94a3b8; font-size: 1.2rem; margin-bottom: 20px;">في واحة الجبري، كل درب يؤدي إلى الحكمة... لكن هذا الدرب لم يُخلق بعد</p>
        <div style="background: #1e293b80; padding: 20px; border-radius: 16px; border: 1px solid #d4af3740; margin-bottom: 20px;">
          <p style="color: #6ae3ff; font-size: 1rem;">🌌 الدالة الأم: Z(x) = x⁵ ln(x) sin(2π/x) exp(-x/xp)</p>
          <p style="color: #ffd700; font-size: 1rem;">🔗 Zx = Z + C + A | Z + C + A = 1</p>
          <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 8px;">👥 الزوار: <strong style="color: #6affb5;">${count}</strong></p>
        </div>
        <a href="/" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #ffd700, #f0a500); color: #0a0a0f; border-radius: 40px; text-decoration: none; font-weight: bold; font-size: 1.2rem; transition: 0.3s; border: none; cursor: pointer;" 
           onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          🏠 العودة إلى الواحة
        </a>
        <p style="color: #666; font-size: 0.8rem; margin-top: 20px;">🎵 نغمات السندباد تعزف لك...</p>
        <p style="color: #444; font-size: 0.7rem; margin-top: 10px;">سيتم تحويلك تلقائيًا خلال 10 ثوانٍ</p>
      </div>
    `;
    document.body.appendChild(div);

    // التوجيه إلى الواحة بعد 10 ثوانٍ
    setTimeout(() => {
      window.location.href = '/';
    }, 10000);
  }

  // ===== المراقبة المستمرة للـ 404 =====
  function watchFor404() {
    // مراقبة التغييرات في DOM
    const observer = new MutationObserver(function() {
      const bodyText = document.body ? document.body.innerText || '' : '';
      const titleText = document.title || '';
      if (bodyText.includes('404') || bodyText.includes('Not Found') || titleText.includes('404')) {
        console.warn('🚨 [404] تم كشف 404 عبر المراقبة');
        handle404Error();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

    // مراقبة تغيير عنوان الصفحة
    const titleObserver = new MutationObserver(function() {
      if (document.title && document.title.includes('404')) {
        console.warn('🚨 [404] تم كشف 404 عبر عنوان الصفحة');
        handle404Error();
        titleObserver.disconnect();
      }
    });
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleObserver.observe(titleElement, { characterData: true, subtree: true });
    }

    // مراقبة أخطاء fetch
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return originalFetch.apply(this, args).catch(function(err) {
        console.warn('🚨 [fetch] خطأ في الطلب:', err);
        return Promise.reject(err);
      });
    };
  }

  // ===== دالة init الرئيسية =====
  function init() {
    createSplash();

    // الكشف الفوري عن 404
    if (detect404AndHandle()) {
      return; // توقف التنفيذ إذا تم كشف 404
    }

    loadHeader();
    loadFooter();

    document.addEventListener('headerLoaded', function() {
      setDynamicCanonical();
      addDynamicLinks();
    });

    // المراقبة المستمرة
    setTimeout(watchFor404, 100);

    // مهلة أمان لإخفاء السبلاش
    setTimeout(function() {
      if (!splashHidden) {
        console.warn('⏰ انتهاء المهلة، إخفاء الشاشة قسراً');
        hideSplash();
      }
    }, 5000);

    console.log('✅ init-page-root.js - النسخة النهائية مع حصار 404');
  }

  // ===== تشغيل =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ===== حماية إضافية: إعادة الكشف عند تغيير URL =====
  let lastUrl = window.location.href;
  setInterval(function() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(function() {
        detect404AndHandle();
      }, 500);
    }
  }, 2000);

  console.log('🛡️ الدرع المطلق مفعل - يحاصر 404 في كل الأحوال');
  console.log('📜 الدالة الأم: Z(x) = x⁵ ln(x) sin(2π/x) exp(-x/xp)');
  console.log('🌌 Zx = Z + C + A | Z + C + A = 1');
  console.log('🇾🇪 من صنعاء إلى الكون');
})();