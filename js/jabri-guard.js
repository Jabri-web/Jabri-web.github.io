/* ═══════════════════════════════════════════════════════════════
   🛡️ jabri-guard.js — v1.1.0
   "الجابري الحارس"
   ─────────────────────────────────────────────────────────────
   📌 الوظائف:
      1. منع الشاشة البيضاء (Splash عالق / body مخفي)
      2. إزالة 404 overlay الكاذب
      3. ضمان ظهور كل شيء دائماً
   ─────────────────────────────────────────────────────────────
   📌 يعمل في:
      ✅ Chrome / Safari / Firefox
      ✅ APK (TWA / WebView)
      ✅ PWA / Home Screen
      ✅ bfcache (Back/Forward)
   ─────────────────────────────────────────────────────────────
   📌 الاستخدام:
      <script src="/js/jabri-guard.js" defer></script>
      ضعه بعد menu.js
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';
  
  // ═══════════════════════════════════════════════════
  //  🛡️ once-guard — منع التشغيل المزدوج
  // ═══════════════════════════════════════════════════
  if (window.__jabriGuardActive) {
    console.warn('⏩ [guard] محمّل مسبقاً — تجاهل');
    return;
  }
  window.__jabriGuardActive = true;
  
  var VERSION = '1.1.0';
  
  console.log('🛡️ [guard v' + VERSION + '] booting...');
  
  // ═══════════════════════════════════════════════════
  //  🎯 الدالة الرئيسية
  // ═══════════════════════════════════════════════════
  function ensureVisible() {
    try {
      // ─────────────────────────────────────────────
      // 1) Splash العالق
      // ─────────────────────────────────────────────
      var splash = document.getElementById('splashScreen');
      if (splash) {
        var cs = getComputedStyle(splash);
        var opacity = parseFloat(cs.opacity);
        var pe = cs.pointerEvents;
        
        if (opacity > 0.05 && pe !== 'none') {
          console.warn('🛡️ [guard] إزالة Splash العالق');
          splash.style.transition = 'none';
          splash.style.opacity = '0';
          splash.style.pointerEvents = 'none';
          splash.style.display = 'none';
          
          setTimeout(function() {
            try { splash.remove(); } catch (e) {}
          }, 150);
          
          // إذا المرعبة عرّفت hideSplash
          if (typeof window.hideSplash === 'function') {
            try { window.hideSplash(); } catch (e) {}
          }
        }
      }
      
      // ─────────────────────────────────────────────
      // 2) 404 overlay الكاذب
      // ─────────────────────────────────────────────
      var ov = document.getElementById('jabri-404-overlay');
      if (ov) {
        var title = (document.title || '').toLowerCase();
        var isReal404 =
          /\b404\b|not found|غير موجود/i.test(title) ||
          (document.body && document.body.dataset.waha404 === 'true') ||
          location.pathname.indexOf('404') !== -1;
        
        if (!isReal404) {
          console.warn('🛡️ [guard] إزالة 404 overlay كاذب');
          ov.remove();
        }
      }
      
      // ─────────────────────────────────────────────
      // 3) body ظاهر
      // ─────────────────────────────────────────────
      if (document.body) {
        var bcs = getComputedStyle(document.body);
        
        if (bcs.visibility === 'hidden') {
          document.body.style.visibility = 'visible';
          console.log('🛡️ [guard] body كان hidden — أُصلح');
        }
        
        if (parseFloat(bcs.opacity) < 0.01) {
          document.body.style.opacity = '1';
          console.log('🛡️ [guard] body كان شفافاً — أُصلح');
        }
        
        if (bcs.display === 'none') {
          document.body.style.display = '';
          console.log('🛡️ [guard] body كان مخفياً — أُصلح');
        }
      }
      
      // ─────────────────────────────────────────────
      // 4) html ظاهر
      // ─────────────────────────────────────────────
      if (document.documentElement) {
        var hcs = getComputedStyle(document.documentElement);
        
        if (hcs.visibility === 'hidden') {
          document.documentElement.style.visibility = 'visible';
        }
        
        if (parseFloat(hcs.opacity) < 0.01) {
          document.documentElement.style.opacity = '1';
        }
      }
      
      // ─────────────────────────────────────────────
      // 5) net toasts — لا تُكثر
      // ─────────────────────────────────────────────
      var toasts = document.getElementById('jabri-net-toasts');
      if (toasts && toasts.children.length > 5) {
        console.warn('🛡️ [guard] تقليص الإشعارات');
        while (toasts.children.length > 2) {
          toasts.firstChild.remove();
        }
      }
      
    } catch (e) {
      console.warn('🛡️ [guard] خطأ داخلي:', e.message);
    }
  }
  
  // ═══════════════════════════════════════════════════
  //  🚀 نقاط التشغيل
  // ═══════════════════════════════════════════════════
  
  // ─────────────────────────────────────────────
  //  ① فوراً (حتى قبل DOM كامل)
  // ─────────────────────────────────────────────
  if (document.body) {
    ensureVisible();
  } else {
    var earlyTimer = setInterval(function() {
      if (document.body) {
        ensureVisible();
        clearInterval(earlyTimer);
      }
    }, 50);
    setTimeout(function() { clearInterval(earlyTimer); }, 2000);
  }
  
  // ─────────────────────────────────────────────
  //  ② عند DOMContentLoaded
  // ─────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureVisible);
  }
  
  // ─────────────────────────────────────────────
  //  ③ دورياً — 15 محاولة × 400ms = 6 ثوان
  // ─────────────────────────────────────────────
  var attempts = 0;
  var MAX_ATTEMPTS = 15;
  var timer = setInterval(function() {
    ensureVisible();
    attempts++;
    if (attempts >= MAX_ATTEMPTS) {
      clearInterval(timer);
      console.log('🛡️ [guard] ✅ انتهى الفحص الدوري');
    }
  }, 400);
  
  // ─────────────────────────────────────────────
  //  ④ عند load الكامل
  // ─────────────────────────────────────────────
  window.addEventListener('load', function() {
    ensureVisible();
    setTimeout(ensureVisible, 500);
    setTimeout(ensureVisible, 1500);
    setTimeout(ensureVisible, 3000);
  });
  
  // ─────────────────────────────────────────────
  //  ⑤ عند pageshow (Back/Forward + bfcache)
  // ─────────────────────────────────────────────
  window.addEventListener('pageshow', function(e) {
    console.log('🛡️ [guard] pageshow — persisted:', e.persisted);
    ensureVisible();
    setTimeout(ensureVisible, 200);
    setTimeout(ensureVisible, 800);
  });
  
  // ─────────────────────────────────────────────
  //  ⑥ عند visibilitychange (رجوع من الخلفية)
  // ─────────────────────────────────────────────
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      console.log('🛡️ [guard] visibilitychange');
      ensureVisible();
    }
  });
  
  // ─────────────────────────────────────────────
  //  ⑦ عند focus
  // ─────────────────────────────────────────────
  window.addEventListener('focus', function() {
    ensureVisible();
  });
  
  // ═══════════════════════════════════════════════════
  //  ✅ API عام
  // ═══════════════════════════════════════════════════
  window.jabriEnsureVisible = ensureVisible;
  
  console.log('✅ [jabri-guard v' + VERSION + '] ready');
  
})();