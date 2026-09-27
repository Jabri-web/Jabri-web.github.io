// ============================================================
//   menu.js - القائمة الذكية الشاملة - واحة الجبري
//   الإصدار: 4.0.1 - 18 أغسطس 2026
//   يتحكم في: القائمة، الأزرار، الموسيقى، الزوار، اللغة
//   مع تحسين موضع القائمة لتظهر خلف الأزرار
// ============================================================

(function() {
    'use strict';

    // ============================================================
    //   🎯 تحديد اللغة والمسار
    // ============================================================
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

    // ============================================================
    //   📋 بناء القائمة الرئيسية في الهيدر
    // ============================================================
    const MENU_ITEMS = [
        { name: 'الرئيسية', nameEn: 'Home', href: `${langDir}/` },
        { name: 'صنعاء', nameEn: 'Sana\'a', href: `${langDir}/Sanaa.html` },
        { name: 'شبام', nameEn: 'Shibam', href: `${langDir}/Shibam.html` },
        { name: 'سقطرى', nameEn: 'Socotra', href: `${langDir}/Soqatra.html` },
        { name: 'المجلة', nameEn: 'Journal', href: `${langDir}/journal.html` },
        { name: 'تجربتي مع الـ AI', nameEn: 'My AI Experience', href: `${langDir}/journal2.html` },
        { name: 'البحوث', nameEn: 'Research', href: `${langDir}/research.html` },
        { name: 'المكتبة', nameEn: 'Library', href: `${langDir}/Office.html` },
        { name: 'السيرة', nameEn: 'CV', href: `${langDir}/Author-cv.html` },
        { name: 'عن الواحة', nameEn: 'About', href: `${langDir}/about.html` },
        { name: 'المشاريع', nameEn: 'Projects', href: `${langDir}/jabri-projects.html` },
    ];

    function buildMainMenu() {
        const nav = document.querySelector('#main-menu');
        if (!nav) return;

        nav.innerHTML = '';

        MENU_ITEMS.forEach(item => {
            const link = document.createElement('a');
            link.href = item.href;
            link.textContent = isArabic ? item.name : item.nameEn;
            link.style.cssText = `
                color: #d6d1c8;
                text-decoration: none;
                font-size: 0.95rem;
                padding: 4px 8px;
                border-bottom: 2px solid transparent;
                transition: 0.3s;
                font-family: 'Cairo', 'Tahoma', sans-serif;
            `;
            link.addEventListener('mouseenter', function() {
                if (this.style.borderBottom !== '2px solid #b5977a') {
                    this.style.color = '#e3b58a';
                }
            });
            link.addEventListener('mouseleave', function() {
                if (this.style.borderBottom !== '2px solid #b5977a') {
                    this.style.color = '#d6d1c8';
                }
            });
            nav.appendChild(link);
        });

        highlightActiveLink();
    }

    function highlightActiveLink() {
        const links = document.querySelectorAll('#main-menu a');
        const current = window.location.pathname.split('/').pop() || 'index.html';

        links.forEach(link => {
            const href = link.getAttribute('href').split('/').pop();
            if (href === current || (current === '' && href === 'index.html')) {
                link.style.borderBottom = '2px solid #b5977a';
                link.style.color = '#f0dec6';
            }
        });
    }

    // ============================================================
    //   🎵 التحكم في الموسيقى
    // ============================================================
    let audioElement = null;
    let isMusicPlaying = false;

    function initMusic() {
        const btn = document.getElementById('musicToggleBtn');
        if (!btn) return;

        audioElement = new Audio('../image/music.mp3');
        audioElement.loop = true;
        audioElement.volume = 0.3;

        btn.addEventListener('click', function() {
            if (isMusicPlaying) {
                audioElement.pause();
                isMusicPlaying = false;
                this.querySelector('#music-status').textContent = 'موسيقى';
                this.style.background = 'rgba(255,215,0,0.08)';
                this.style.color = '#d6d1c8';
                localStorage.setItem('jabri_music_state', 'paused');
            } else {
                audioElement.play().catch(() => {});
                isMusicPlaying = true;
                this.querySelector('#music-status').textContent = '🔊';
                this.style.background = 'rgba(255,215,0,0.25)';
                this.style.color = '#ffd700';
                localStorage.setItem('jabri_music_state', 'playing');
            }
        });

        if (localStorage.getItem('jabri_music_state') === 'playing') {
            setTimeout(() => {
                audioElement.play().catch(() => {});
                isMusicPlaying = true;
                btn.querySelector('#music-status').textContent = '🔊';
                btn.style.background = 'rgba(255,215,0,0.25)';
                btn.style.color = '#ffd700';
            }, 500);
        }
    }

    // ============================================================
    //   👥 عداد الزوار
    // ============================================================
    function initVisitorCounter() {
        const numberDisplay = document.getElementById('visitor-number');
        if (!numberDisplay) return;

        let count = parseInt(localStorage.getItem('jabri_visitor_count') || '0', 10);
        count += 1;
        localStorage.setItem('jabri_visitor_count', count);
        numberDisplay.textContent = count.toLocaleString('ar-EG');
    }

    // ============================================================
    //   🌐 تبديل اللغة
    // ============================================================
    function initLanguageSwitcher() {
        const arBtn = document.getElementById('lang-ar');
        const enBtn = document.getElementById('lang-en');

        if (!arBtn || !enBtn) return;

        function setLanguage(lang) {
            if (lang === 'ar') {
                arBtn.style.background = 'rgba(255,215,0,0.12)';
                arBtn.style.color = '#ffd700';
                arBtn.style.borderColor = '#ffd700';
                enBtn.style.background = 'transparent';
                enBtn.style.color = '#888';
                enBtn.style.borderColor = '#444';
                document.documentElement.dir = 'rtl';
                document.documentElement.lang = 'ar';
                isArabic = true;
                localStorage.setItem('jabri_lang', 'ar');
            } else {
                enBtn.style.background = 'rgba(255,215,0,0.12)';
                enBtn.style.color = '#ffd700';
                enBtn.style.borderColor = '#ffd700';
                arBtn.style.background = 'transparent';
                arBtn.style.color = '#888';
                arBtn.style.borderColor = '#444';
                document.documentElement.dir = 'ltr';
                document.documentElement.lang = 'en';
                isArabic = false;
                localStorage.setItem('jabri_lang', 'en');
            }
            buildMainMenu();
            // تحديث زر القائمة
            const menuBtn = document.getElementById('hamburger-menu');
            if (menuBtn) {
                const span = menuBtn.querySelector('span:last-child');
                if (span) span.textContent = isArabic ? 'القائمة' : 'Menu';
            }
        }

        arBtn.addEventListener('click', () => setLanguage('ar'));
        enBtn.addEventListener('click', () => setLanguage('en'));

        const savedLang = localStorage.getItem('jabri_lang');
        if (savedLang) {
            setLanguage(savedLang);
        }
    }

    // ============================================================
    //   🍔 زر القائمة المنسدلة (الجانبية) - معدل الموضع
    // ============================================================
    function buildHamburgerMenu() {
        const menuContainer = document.createElement('div');
        menuContainer.id = 'hamburger-menu';
        menuContainer.style.cssText = `
            position: fixed !important;
            top: 75px !important;
            right: 20px !important;
            z-index: 9999999 !important;
            cursor: pointer !important;
            background: linear-gradient(135deg, #ffd700, #f0a500) !important;
            color: #0a0a0f !important;
            border: none !important;
            padding: 8px 14px !important;
            border-radius: 10px !important;
            font-size: 13px !important;
            font-weight: bold !important;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            backdrop-filter: blur(6px) !important;
            border: 1px solid rgba(255, 215, 0, 0.2) !important;
            font-family: 'Cairo', 'Tahoma', sans-serif !important;
            user-select: none !important;
        `;

        menuContainer.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:3px;width:20px;height:14px;justify-content:center;flex-shrink:0;">
                <span style="display:block;height:2px;background:#0a0a0f;border-radius:3px;"></span>
                <span style="display:block;height:2px;background:#0a0a0f;border-radius:3px;"></span>
                <span style="display:block;height:2px;background:#0a0a0f;border-radius:3px;"></span>
            </div>
            <span style="font-size:12px;color:#0a0a0f;font-weight:bold;">${isArabic ? 'القائمة' : 'Menu'}</span>
        `;

        // القائمة المنسدلة - موضعها تحت الزر مباشرة
        const dropdown = document.createElement('div');
        dropdown.id = 'menu-dropdown';
        dropdown.style.cssText = `
            display: none !important;
            position: fixed !important;
            top: 125px !important;
            right: 20px !important;
            background: rgba(10, 10, 20, 0.97) !important;
            backdrop-filter: blur(16px) !important;
            border: 2px solid #ffd700 !important;
            border-radius: 16px !important;
            padding: 18px 16px !important;
            min-width: 260px !important;
            max-height: 70vh !important;
            overflow-y: auto !important;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9) !important;
            z-index: 9999998 !important;
            flex-direction: column !important;
            gap: 2px !important;
            direction: ${isArabic ? 'rtl' : 'ltr'} !important;
            font-family: 'Cairo', 'Tahoma', sans-serif !important;
        `;

        // بناء محتوى القائمة المنسدلة
        let dropdownHTML = `
            <div style="display:flex; gap:8px; justify-content:center; padding-bottom:12px; border-bottom:2px solid rgba(255,215,0,0.12); margin-bottom:10px; flex-wrap:wrap;">
                <a href="/" style="color:${isArabic ? '#ffd700' : '#888'}; padding:4px 14px; border:1px solid ${isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; transition:0.3s; font-size:0.85rem;">🇾🇪 عربي</a>
                <a href="/en/" style="color:${!isArabic ? '#ffd700' : '#888'}; padding:4px 14px; border:1px solid ${!isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${!isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; transition:0.3s; font-size:0.85rem;">🇬🇧 English</a>
            </div>
        `;

        MENU_ITEMS.forEach(item => {
            dropdownHTML += `
                <a href="${item.href}" style="color:#fff;padding:8px 12px;border-radius:8px;text-decoration:none;display:flex;align-items:center;gap:10px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.04);font-size:0.9rem;">
                    <span style="font-size:1.1rem;">📄</span> ${isArabic ? item.name : item.nameEn}
                </a>
            `;
        });

        dropdownHTML += `
            <div style="border-top:2px solid #ffd700; margin:12px 0 8px 0; padding-top:10px;">
                <div style="color:#ffd700; font-size:0.7rem; font-weight:bold; text-align:center; letter-spacing:1px; margin-bottom:6px;">
                    ⭐ ${isArabic ? 'إنجازات اليوم - 18 أغسطس 2026' : 'Today\'s Achievements — Aug 18, 2026'}
                </div>
                <div style="display:flex; flex-direction:column; gap:4px; font-size:0.78rem; color:#ccc; padding:0 4px;">
                    <div style="display:flex; align-items:center; gap:8px; background:rgba(255,215,0,0.04); padding:5px 10px; border-radius:6px; border-right:3px solid #ffd700;">
                        <span>🧮</span> <span>${isArabic ? 'الدالة الأم - اشتقاق ثابت الجاذبية' : 'Mother Function — Gravitational Constant'}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; background:rgba(255,215,0,0.04); padding:5px 10px; border-radius:6px; border-right:3px solid #ffd700;">
                        <span>🌌</span> <span>${isArabic ? 'النظرية الموحدة Zx = Z + C + A' : 'Unified Theory Zx = Z + C + A'}</span>
                    </div>
                </div>
            </div>
            <div style="border-top:1px solid rgba(255,215,0,0.08); margin:6px 0 4px 0; padding-top:6px;"></div>
            <a href="https://en.wikipedia.org/wiki/User:Jabri2026" target="_blank" style="color:#fff;padding:8px 12px;border-radius:8px;text-decoration:none;display:flex;align-items:center;gap:10px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.04);font-size:0.9rem;">
                <span style="font-size:1.1rem;">🌐</span> Wikipedia
            </a>
            <a href="https://github.com/jabri-com" target="_blank" style="color:#fff;padding:8px 12px;border-radius:8px;text-decoration:none;display:flex;align-items:center;gap:10px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.04);font-size:0.9rem;">
                <span style="font-size:1.1rem;">🐙</span> GitHub
            </a>
            <a href="https://orcid.org/0009-0003-3319-3822" target="_blank" style="color:#fff;padding:8px 12px;border-radius:8px;text-decoration:none;display:flex;align-items:center;gap:10px;transition:0.3s;font-size:0.9rem;">
                <span style="font-size:1.1rem;">🆔</span> ORCID
            </a>
        `;

        dropdown.innerHTML = dropdownHTML;
        document.body.appendChild(menuContainer);
        document.body.appendChild(dropdown);

        // التحكم في الفتح/الإغلاق
        let isOpen = false;
        let closeTimer;

        menuContainer.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isOpen) {
                dropdown.style.display = 'none';
                isOpen = false;
                clearTimeout(closeTimer);
            } else {
                dropdown.style.display = 'flex';
                isOpen = true;
                clearTimeout(closeTimer);
                closeTimer = setTimeout(() => {
                    dropdown.style.display = 'none';
                    isOpen = false;
                }, 15000);
            }
        });

        document.addEventListener('click', function(e) {
            if (!menuContainer.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
                isOpen = false;
                clearTimeout(closeTimer);
            }
        });

        dropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.background = 'rgba(255, 215, 0, 0.08)';
                link.style.color = '#ffd700';
                link.style.transform = isArabic ? 'translateX(-4px)' : 'translateX(4px)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.background = 'transparent';
                link.style.color = '#fff';
                link.style.transform = 'translateX(0)';
            });
        });
    }

    // ============================================================
    //   🚀 التهيئة النهائية
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🌴 menu.js v4.0.1 - القائمة تحت الأزرار');

        buildMainMenu();
        initMusic();
        initVisitorCounter();
        initLanguageSwitcher();
        buildHamburgerMenu();

        console.log('📅 18 أغسطس 2026');
        console.log('📜 Zx = Z + C + A | Z + C + A = 1');
        console.log('🧮 Z(x) = x^5 ln(x) sin(2π/x) exp(-x/xp)');
        console.log('🇾🇪 اليمن - صنعاء');
    });

})();