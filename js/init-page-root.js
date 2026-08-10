// ================================================================
//  init-page-root.js - الإصدار النهائي (الدرع المطلق + 404)
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

  // ===== الروابط الديناميكية (prev/next/up) =====
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
      '/Soqatra.html': { prev: '/Shibam.html', next: null, up: '/yemen-photo.html' }
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

  // ===== ضبط Canonical تلقائياً =====
  function setDynamicCanonical() {
    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;
    console.log('🔗 Canonical مضبوط على: ' + currentUrl);
  }

  // ================================================================
  //  🚨 كاشف 404 التلقائي + معالجته
  // ================================================================

  function detect404AndHandle() {
    // 1) كشف عبر العنوان أو المحتوى
    const is404 = document.title.includes('404') || document.body.innerHTML.includes('404');

    // 2) كشف عبر أداء الصفحة (performance)
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
    // منع التكرار
    if (sessionStorage.getItem('jabri404Handled')) return;
    sessionStorage.setItem('jabri404Handled', 'true');

    // إخفاء السبلاش لو ظاهر
    hideSplash();

    // تشغيل موسيقى
    try {
      const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      audio.volume = 0.15;
      audio.loop = true;
      audio.play().catch(() => {});
    } catch(e) {}

    // جلب عدد الزوار من localStorage
    let count = localStorage.getItem('jabriVisitorCount');
    if (count === null) count = Math.floor(Math.random() * 80) + 20;
    else count = Number(count);

    // عرض رسالة خطأ فوق كل شيء
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
      <div style="margin-top:12px; font-size:14px; color:#bbaa88;">🎵 نغمات السندباد تعزف لك...</div>
    `;
    document.body.prepend(div);

    // التوجيه إلى الواحة بعد 7 ثوانٍ
    setTimeout(() => {
      window.location.href = '/';
    }, 7000);
  }

  // ===== دالة init الرئيسية =====
  function init() {
    createSplash();
    detect404AndHandle();   // كشف 404 فوراً
    loadHeader();
    loadFooter();

    document.addEventListener('headerLoaded', function() {
      setDynamicCanonical();
      addDynamicLinks();
    });

    // مهلة أمان لإخفاء السبلاش
    setTimeout(function() {
      if (!splashHidden) {
        console.warn('⏰ انتهاء المهلة، إخفاء الشاشة قسراً');
        hideSplash();
      }
    }, 5000);
  }

  // ===== تشغيل =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('✅ init-page-root.js جاهز (النسخة النهائية مع 404)');
})();