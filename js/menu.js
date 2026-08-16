// ============================================================
//   menu.js - القائمة الذكية متعددة اللغات - واحة الجبري
//   الإصدار: 1.0.0 - 16 أغسطس 2026
//   الموقع: https://jabri-com.vercel.app
//   الرخصة: CC BY 4.0
// ============================================================

(function() {
  // ---------- تحديد اللغة والمسار ----------
  const currentPath = window.location.pathname;
  let langDir = '';
  let isArabic = true;
  
  if (currentPath.startsWith('/ar/')) {
    langDir = '/ar';
    isArabic = true;
  } else if (currentPath.startsWith('/en/')) {
    langDir = '/en';
    isArabic = false;
  } else {
    langDir = '';
    isArabic = true;
  }
  
  // ---------- زر القائمة ----------
  const menuContainer = document.createElement('div');
  menuContainer.id = 'hamburger-menu';
  menuContainer.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 9999999 !important;
    cursor: pointer !important;
    background: linear-gradient(135deg, #ffd700, #f0a500) !important;
    color: #0a0a0f !important;
    border: none !important;
    padding: 10px 16px !important;
    border-radius: 12px !important;
    font-size: 14px !important;
    font-weight: bold !important;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4) !important;
    transition: 0.3s !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    backdrop-filter: blur(6px) !important;
    border: 1px solid rgba(255, 215, 0, 0.2) !important;
  `;
  
  menuContainer.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:4px;width:24px;height:18px;justify-content:center;">
      <span style="display:block;height:2.5px;background:#0a0a0f;border-radius:4px;"></span>
      <span style="display:block;height:2.5px;background:#0a0a0f;border-radius:4px;"></span>
      <span style="display:block;height:2.5px;background:#0a0a0f;border-radius:4px;"></span>
    </div>
    <span style="font-size:13px;color:#0a0a0f;font-weight:bold;">${isArabic ? 'القائمة' : 'Menu'}</span>
  `;
  
  menuContainer.addEventListener('mouseenter', () => {
    menuContainer.style.transform = 'scale(1.05)';
    menuContainer.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.7)';
  });
  menuContainer.addEventListener('mouseleave', () => {
    menuContainer.style.transform = 'scale(1)';
    menuContainer.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
  });
  
  // ---------- القائمة المنسدلة ----------
  const dropdown = document.createElement('div');
  dropdown.id = 'menu-dropdown';
  dropdown.style.cssText = `
    display: none !important;
    position: fixed !important;
    top: 75px !important;
    right: 20px !important;
    background: rgba(10, 10, 20, 0.96) !important;
    backdrop-filter: blur(16px) !important;
    border: 2px solid #ffd700 !important;
    border-radius: 18px !important;
    padding: 20px 18px !important;
    min-width: 260px !important;
    max-height: 80vh !important;
    overflow-y: auto !important;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9) !important;
    z-index: 9999998 !important;
    flex-direction: column !important;
    gap: 2px !important;
  `;
  
  // ---------- محتوى القائمة ----------
  const staticContent = `
    <!-- تبديل اللغة -->
    <div style="display:flex; gap:10px; justify-content:center; padding-bottom:12px; border-bottom:2px solid rgba(255,215,0,0.15); margin-bottom:10px;">
      <a href="/ar/author-history.html" style="color:${isArabic ? '#ffd700' : '#888'}; padding:5px 16px; border:1px solid ${isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; transition:0.3s;">🇾🇪 عربي</a>
      <a href="/en/author-history.html" style="color:${!isArabic ? '#ffd700' : '#888'}; padding:5px 16px; border:1px solid ${!isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${!isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; transition:0.3s;">🇬🇧 English</a>
    </div>

    <!-- الروابط الرئيسية - عناوين رسمية -->
    <a href="${langDir}/" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">🏠</span> ${isArabic ? 'الصفحة الرئيسية' : 'Home'}
    </a>
    <a href="${langDir}/Sanaa.html" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">🏙️</span> ${isArabic ? 'صنعاء القديمة' : 'Old Sana\'a'}
    </a>
    <a href="${langDir}/Shibam.html" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">🏘️</span> ${isArabic ? 'شبام حضرموت' : 'Shibam Hadramawt'}
    </a>
    <a href="${langDir}/Soqatra.html" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">🌴</span> ${isArabic ? 'سقطرى' : 'Socotra'}
    </a>

    <!-- 📰 رسالة قوقل -->
    <a href="${langDir}/journal.html" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">📰</span> ${isArabic ? 'رسالة قوقل' : 'Google Message'}
    </a>

    <a href="${langDir}/research.html" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">🔬</span> ${isArabic ? 'البحوث' : 'Research'}
    </a>
    <a href="${langDir}/Office.html" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">📫</span> ${isArabic ? 'المكتبة' : 'Library'}
    </a>

    <!-- 🧑‍💼 السيرة الذاتية -->
    <a href="${langDir}/Author-cv.html" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">🧑‍💼</span> ${isArabic ? 'السيرة الذاتية' : 'CV'}
    </a>

    <a href="${langDir}/about.html" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">ℹ️</span> ${isArabic ? 'عن الواحة' : 'About Oasis'}
    </a>
    <a href="${langDir}/author-history.html" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">📜</span> ${isArabic ? 'التاريخ العلمي' : 'Scientific History'}
    </a>

    <!-- ===== ⭐ إنجازات اليوم ===== -->
    <div style="border-top:2px solid #ffd700; margin:12px 0 8px 0; padding-top:10px;">
      <div style="color:#ffd700; font-size:0.8rem; font-weight:bold; text-align:center; letter-spacing:1px; margin-bottom:8px;">
        ⭐ ${isArabic ? 'إنجازات اليوم - 16 أغسطس 2026' : 'Today\'s Achievements — Aug 16, 2026'}
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; font-size:0.85rem; color:#ccc; padding:0 4px;">
        <div style="display:flex; align-items:center; gap:10px; background:rgba(255,215,0,0.04); padding:6px 12px; border-radius:8px; border-right:3px solid #ffd700;">
          <span>🧮</span> <span>${isArabic ? 'الدالة الأم - اشتقاق ثابت الجاذبية' : 'Mother Function — Gravitational Constant Derivation'}</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; background:rgba(255,215,0,0.04); padding:6px 12px; border-radius:8px; border-right:3px solid #ffd700;">
          <span>🌌</span> <span>${isArabic ? 'النظرية الموحدة Zx = Z + C + A' : 'Unified Theory Zx = Z + C + A'}</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; background:rgba(255,215,0,0.04); padding:6px 12px; border-radius:8px; border-right:3px solid #ffd700;">
          <span>📐</span> <span>${isArabic ? 'ثابت الجاذبية من الأعداد الصرفة - دقة 99.95%' : 'Gravitational Constant from Pure Numbers — 99.95% Accuracy'}</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; background:rgba(255,215,0,0.04); padding:6px 12px; border-radius:8px; border-right:3px solid #ffd700;">
          <span>📜</span> <span>${isArabic ? 'التوثيق الرقمي للتراث اليمني' : 'Digital Documentation of Yemeni Heritage'}</span>
        </div>
      </div>
    </div>

    <!-- الروابط الخارجية -->
    <div style="border-top:1px solid rgba(255,215,0,0.1); margin:8px 0 4px 0; padding-top:8px;"></div>
    <a href="https://en.wikipedia.org/wiki/User:Jabri2026" target="_blank" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">🌐</span> Wikipedia
    </a>
    <a href="https://github.com/jabri-web" target="_blank" style="color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.06);">
      <span style="font-size:1.4rem;">🐙</span> GitHub
    </a>

    <!-- المحادثات الأخيرة -->
    <div style="border-top:1px solid rgba(255,215,0,0.1); margin:8px 0 4px 0; padding-top:8px;">
      <div style="color:#6ae3ff; padding:4px 6px; font-size:0.85rem; font-weight:bold;">
        💬 ${isArabic ? 'آخر الاستفسارات:' : 'Recent Inquiries:'}
      </div>
      <div id="dynamic-chats" style="display:flex;flex-direction:column;gap:4px;margin:4px 0;"></div>
    </div>

    <!-- زر مسح المحادثات -->
    <button id="clear-chats-btn" style="background: rgba(255, 0, 0, 0.08); color: #ff6b6b; border: 1px solid #ff6b6b; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-weight: bold; transition: 0.3s; width: 100%; text-align: center; margin-top:4px;">
      🗑️ ${isArabic ? 'مسح السجل' : 'Clear History'}
    </button>
  `;
  
  dropdown.innerHTML = staticContent;
  document.body.appendChild(menuContainer);
  document.body.appendChild(dropdown);
  
  // ---------- تحديث المحادثات ----------
  function updateChats() {
    let chats = JSON.parse(localStorage.getItem('jabri_chats')) || [];
    if (chats.length === 0) {
      chats = [
        { text: isArabic ? '🚀 استفسار حول اشتقاق ثابت الجاذبية' : '🚀 Inquiry about gravitational constant derivation', time: isArabic ? 'الآن' : 'now' },
        { text: isArabic ? '📜 توثيق النظرية الموحدة' : '📜 Unified Theory Documentation', time: isArabic ? 'منذ 10 دقائق' : '10 min ago' },
        { text: isArabic ? '🏛️ أرشيف صنعاء وشبام وسقطرى' : '🏛️ Sana\'a, Shibam & Socotra Archive', time: isArabic ? 'منذ ساعة' : '1 hour ago' }
      ];
      localStorage.setItem('jabri_chats', JSON.stringify(chats));
    }
    const recentChats = chats.slice(-5).reverse();
    const container = document.getElementById('dynamic-chats');
    if (container) {
      container.innerHTML = recentChats.map(chat => `
        <div style="padding:6px 12px; background:rgba(255,215,0,0.04); border-radius:8px; color:#ccc; font-size:0.85rem; border-right:3px solid #ffd700;">
          💬 ${chat.text}
          <span style="display:block;font-size:0.65rem;color:#666;margin-top:2px;">${chat.time}</span>
        </div>
      `).join('') || `<div style="color:#666;padding:6px 12px;">${isArabic ? 'لا توجد استفسارات' : 'No inquiries'}</div>`;
    }
  }
  
  updateChats();
  
  // ---------- إضافة استفسار جديد ----------
  window.addChat = function(text) {
    const chats = JSON.parse(localStorage.getItem('jabri_chats')) || [];
    chats.push({
      text: text,
      time: new Date().toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem('jabri_chats', JSON.stringify(chats));
    updateChats();
  };
  
  // ---------- مسح السجل ----------
  document.addEventListener('click', function(e) {
    if (e.target.id === 'clear-chats-btn' || e.target.closest('#clear-chats-btn')) {
      if (confirm(isArabic ? '🗑️ هل تريد مسح سجل الاستفسارات؟' : '🗑️ Clear inquiry history?')) {
        localStorage.removeItem('jabri_chats');
        updateChats();
        window.addChat(isArabic ? '✨ تم مسح السجل. بداية جديدة.' : '✨ History cleared. Fresh start.');
      }
    }
  });
  
  // ---------- تأثيرات التمرير ----------
  dropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.background = 'rgba(255, 215, 0, 0.08)';
      link.style.color = '#ffd700';
      link.style.transform = 'translateX(-4px)';
    });
    link.addEventListener('mouseleave', () => {
      link.style.background = 'transparent';
      link.style.color = '#fff';
      link.style.transform = 'translateX(0)';
    });
  });
  
  // ---------- التحكم في الفتح/الإغلاق ----------
  let isOpen = false;
  let closeTimer;
  
  menuContainer.addEventListener('click', function(e) {
    e.stopPropagation();
    if (isOpen) {
      dropdown.style.display = 'none';
      isOpen = false;
      clearTimeout(closeTimer);
    } else {
      updateChats();
      dropdown.style.display = 'flex';
      isOpen = true;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        dropdown.style.display = 'none';
        isOpen = false;
      }, 10000);
    }
  });
  
  document.addEventListener('click', function(e) {
    if (!menuContainer.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
      isOpen = false;
      clearTimeout(closeTimer);
    }
  });
  
  dropdown.querySelectorAll('a, #clear-chats-btn').forEach(el => {
    el.addEventListener('click', function() {
      if (this.id !== 'clear-chats-btn') {
        dropdown.style.display = 'none';
        isOpen = false;
        clearTimeout(closeTimer);
      }
    });
  });
  
  // ---------- رسالة ترحيبية ----------
  if (!localStorage.getItem('jabri_welcome_shown')) {
    setTimeout(() => {
      window.addChat(isArabic ? '👋 مرحباً بك في واحة الجبري - 16 أغسطس 2026' : '👋 Welcome to Al-Jabri Oasis - Aug 16, 2026');
    }, 2000);
    localStorage.setItem('jabri_welcome_shown', 'true');
  }
  
  console.log('🌴 واحة الجبري - القائمة جاهزة');
  console.log('📅 16 أغسطس 2026 - إنجازات اليوم');
  console.log('📜 Zx = Z + C + A | Z + C + A = 1');
  console.log('🧮 Z(x) = x^5 ln(x) sin(2π/x) exp(-x/xp)');
  console.log('🇾🇪 اليمن - صنعاء');
  
})();