/* ============================================================
   lang-switch.js — زر تبديل اللغة الفاخر
   يعمل تلقائياً على كل صفحة تحتوي على .txt[data-ar][data-en]
   ============================================================ */
(function() {
  'use strict';
  
  const STORAGE_KEY = 'jabri_lang';
  const AR = 'ar';
  const EN = 'en';
  
  // 1) اقرأ اللغة المحفوظة
  function getLang() {
    try { return localStorage.getItem(STORAGE_KEY) || AR; } catch (e) { return AR; }
  }
  
  function setLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }
  
  // 2) بدّل النصوص + الاتجاه + اللغة
  function applyLang(lang) {
    const isEN = lang === EN;
    
    // عناصر البيانات
    document.querySelectorAll('.txt[data-ar][data-en]').forEach(el => {
      const val = isEN ? el.dataset.en : el.dataset.ar;
      if (val != null) el.textContent = val;
    });
    
    // placeholder inputs
    document.querySelectorAll('[data-ar-placeholder][data-en-placeholder]').forEach(el => {
      el.placeholder = isEN ? el.dataset.enPlaceholder : el.dataset.arPlaceholder;
    });
    
    // title / aria-label
    document.querySelectorAll('[data-ar-label][data-en-label]').forEach(el => {
      el.setAttribute('aria-label', isEN ? el.dataset.enLabel : el.dataset.arLabel);
    });
    
    // الاتجاه واللغة
    document.documentElement.lang = lang;
    document.documentElement.dir = isEN ? 'ltr' : 'rtl';
    document.body.classList.toggle('lang-en', isEN);
    
    // حدّث الزر
    updateButton(lang);
  }
  
  // 3) أنشئ الزر
  function createButton() {
    const btn = document.createElement('button');
    btn.id = 'lang-switch-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Switch language / تبديل اللغة');
    btn.innerHTML = `
      <span class="lang-flag">🇾🇪</span>
      <span class="lang-text">عربي</span>
      <span class="lang-divider">|</span>
      <span class="lang-flag">🇬🇧</span>
      <span class="lang-text">EN</span>
    `;
    
    // الأنماط — فاخرة
    btn.style.cssText = `
      position: fixed;
      top: 78px;
      left: 16px;
      z-index: 2147483646;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, rgba(20,20,35,0.92), rgba(10,10,15,0.95));
      color: #e8e8f0;
      border: 1.5px solid rgba(212,175,55,0.4);
      border-radius: 30px;
      font-family: 'Cairo','Tajawal',Arial,sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.15) inset;
      transition: all 0.3s ease;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    `;
    
    // Hover
    btn.addEventListener('mouseenter', () => {
      btn.style.borderColor = 'rgba(212,175,55,0.9)';
      btn.style.boxShadow = '0 6px 24px rgba(212,175,55,0.35), 0 0 0 1px rgba(212,175,55,0.3) inset';
      btn.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.borderColor = 'rgba(212,175,55,0.4)';
      btn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.15) inset';
      btn.style.transform = 'translateY(0)';
    });
    
    // Click
    btn.addEventListener('click', () => {
      const next = getLang() === AR ? EN : AR;
      setLang(next);
      applyLang(next);
      // رعشة صغيرة للتأكيد
      btn.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(0.92)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' }
      );
    });
    
    document.body.appendChild(btn);
    return btn;
  }
  
  // 4) تحديث شكل الزر حسب اللغة الحالية
  function updateButton(lang) {
    const btn = document.getElementById('lang-switch-btn');
    if (!btn) return;
    const isEN = lang === EN;
    const flags = btn.querySelectorAll('.lang-flag');
    const texts = btn.querySelectorAll('.lang-text');
    // أبرز اللغة النشطة
    flags[0].style.opacity = isEN ? '0.35' : '1';
    flags[1].style.opacity = isEN ? '1' : '0.35';
    texts[0].style.opacity = isEN ? '0.35' : '1';
    texts[1].style.opacity = isEN ? '1' : '0.35';
    texts[0].style.fontWeight = isEN ? '500' : '800';
    texts[1].style.fontWeight = isEN ? '800' : '500';
  }
  
  // 5) شغّل عند التحميل
  function init() {
    createButton();
    const saved = getLang();
    applyLang(saved);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();