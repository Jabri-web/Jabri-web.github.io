// ============================================================
//   menu.js - v5.1 - المرعبة الخفيفة (المدير الواحد)
//   الإصدار: 5.1 - 17 أكتوبر 2026
//   ✅ حارس التكرار (__jabriMenuLoaded)
//   ✅ انتظار headerLoaded قبل البناء
//   ✅ إزالة الصوت والعداد (نُقلا إلى init-root.js)
//   ✅ القائمة: GPU-friendly (opacity + transform)
//   ✅ Prefetch ذكي بـ throttle + isolation
// ============================================================

(function() {
    'use strict';

    // 🛡️ حارس المدير الواحد — لا تبني القائمة مرتين
    if (window.__jabriMenuLoaded) return;
    window.__jabriMenuLoaded = true;

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
    //   📋 عناصر القائمة
    // ============================================================
    const MENU_ITEMS = [
        { name: 'الرئيسية',        nameEn: 'Home',              href: `${langDir}/` },
        { name: 'صنعاء',           nameEn: 'Sana\'a',           href: `${langDir}/Sanaa.html` },
        { name: 'شبام',            nameEn: 'Shibam',            href: `${langDir}/Shibam.html` },
        { name: 'سقطرى',           nameEn: 'Socotra',           href: `${langDir}/Soqatra.html` },
        { name: 'المجلة',          nameEn: 'Journal',           href: `${langDir}/journal.html` },
        { name: 'تجربتي مع الـ AI', nameEn: 'My AI Experience',  href: `${langDir}/journal2.html` },
        { name: 'البحوث',          nameEn: 'Research',          href: `${langDir}/research.html` },
        { name: 'المكتبة',         nameEn: 'Library',           href: `${langDir}/Office.html` },
        { name: 'السيرة',          nameEn: 'CV',                href: `${langDir}/Author-cv.html` },
        { name: 'عن الواحة',       nameEn: 'About',             href: `${langDir}/about.html` },
        { name: 'المشاريع',        nameEn: 'Projects',          href: `${langDir}/jabri-projects.html` },
    ];

    // ============================================================
    //   🎨 حقن CSS للقائمة
    // ============================================================
    function injectStyles() {
        if (document.getElementById('waha-menu-styles')) return;

        const style = document.createElement('style');
        style.id = 'waha-menu-styles';
        style.textContent = `
            #main-menu a {
                color: #d6d1c8; text-decoration: none; font-size: 0.95rem;
                padding: 4px 8px; border-bottom: 2px solid transparent;
                transition: color .2s ease, border-color .2s ease;
                font-family: 'Cairo', 'Tahoma', sans-serif;
            }
            #main-menu a:hover { color: #e3b58a; }
            #main-menu a.active { border-bottom-color: #b5977a; color: #f0dec6; }

            #hamburger-menu {
                position: fixed !important; top: 12px !important; right: 12px !important;
                z-index: 2147483647 !important; display: inline-flex !important;
                align-items: center !important; visibility: visible !important;
                opacity: 1 !important; will-change: transform;
            }
            #hamburger-menu:hover { transform: translateY(-1px) !important; box-shadow: 0 0 28px rgba(255, 215, 0, 0.5) !important; }
            #hamburger-menu:active { transform: scale(0.97) !important; }

            #menu-dropdown {
                position: fixed !important; top: 52px !important; right: 12px !important;
                background: rgba(10, 10, 20, 0.98) !important; border: 2px solid #ffd700 !important;
                border-radius: 16px !important; padding: 18px 16px !important;
                min-width: 260px !important; max-height: 70vh !important; overflow-y: auto !important;
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9) !important; z-index: 2147483646 !important;
                display: flex !important; flex-direction: column !important; gap: 2px !important;
                font-family: 'Cairo', 'Tahoma', sans-serif !important;
                opacity: 0 !important; visibility: hidden !important;
                transform: translateY(-8px) scale(0.98) !important;
                transition: opacity .18s ease, transform .18s ease, visibility .18s !important;
                will-change: opacity, transform !important; contain: layout style paint;
                pointer-events: none !important;
            }
            #menu-dropdown.is-open {
                opacity: 1 !important; visibility: visible !important;
                transform: translateY(0) scale(1) !important; pointer-events: auto !important;
            }

            #menu-dropdown .menu-link {
                color: #fff !important; padding: 8px 12px !important; border-radius: 8px !important;
                text-decoration: none !important; display: flex !important; align-items: center !important;
                gap: 10px !important; transition: background .18s, color .18s, transform .18s !important;
                border-bottom: 1px solid rgba(255, 215, 0, 0.04) !important; font-size: 0.9rem !important;
            }
            #menu-dropdown .menu-link:hover { background: rgba(255, 215, 0, 0.08) !important; color: #ffd700 !important; }
            #menu-dropdown.rtl .menu-link:hover { transform: translateX(-4px) !important; }
            #menu-dropdown.ltr .menu-link:hover { transform: translateX(4px) !important; }
        `;
        document.head.appendChild(style);
    }

    // ============================================================
    //   📋 بناء القائمة الرئيسية
    // ============================================================
    function buildMainMenu() {
        const nav = document.querySelector('#main-menu');
        if (!nav) return;

        nav.innerHTML = '';

        MENU_ITEMS.forEach(item => {
            const link = document.createElement('a');
            link.href = item.href;
            link.textContent = isArabic ? item.name : item.nameEn;
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
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
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
                arBtn.style.background = 'rgba(255,215,0,0.12)'; arBtn.style.color = '#ffd700'; arBtn.style.borderColor = '#ffd700';
                enBtn.style.background = 'transparent'; enBtn.style.color = '#888'; enBtn.style.borderColor = '#444';
                document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar';
                isArabic = true;
                localStorage.setItem('jabri_lang', 'ar');
            } else {
                enBtn.style.background = 'rgba(255,215,0,0.12)'; enBtn.style.color = '#ffd700'; enBtn.style.borderColor = '#ffd700';
                arBtn.style.background = 'transparent'; arBtn.style.color = '#888'; arBtn.style.borderColor = '#444';
                document.documentElement.dir = 'ltr'; document.documentElement.lang = 'en';
                isArabic = false;
                localStorage.setItem('jabri_lang', 'en');
            }
            buildMainMenu();

            const menuBtn = document.getElementById('hamburger-menu');
            if (menuBtn) {
                const span = menuBtn.querySelector('span:last-child');
                if (span) span.textContent = isArabic ? 'القائمة' : 'Menu';
            }
            const dropdown = document.getElementById('menu-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('rtl', isArabic);
                dropdown.classList.toggle('ltr', !isArabic);
                dropdown.style.direction = isArabic ? 'rtl' : 'ltr';
            }
        }

        arBtn.addEventListener('click', () => setLanguage('ar'));
        enBtn.addEventListener('click', () => setLanguage('en'));

        const savedLang = localStorage.getItem('jabri_lang');
        if (savedLang) setLanguage(savedLang);
    }

    // ============================================================
    //   🍔 القائمة المنسدلة
    // ============================================================
    function buildHamburgerMenu() {
        if (document.getElementById('hamburger-menu')) return;

        const menuContainer = document.createElement('div');
        menuContainer.id = 'hamburger-menu';
        menuContainer.style.cssText = `
            position: fixed !important; top: 12px !important; right: 12px !important;
            z-index: 2147483647 !important; cursor: pointer !important;
            background: linear-gradient(135deg, #ffd700, #f0a500) !important;
            color: #0a0a0f !important; padding: 8px 14px !important; border-radius: 10px !important;
            font-size: 13px !important; font-weight: bold !important;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3) !important;
            transition: transform .2s cubic-bezier(.4,0,.2,1), box-shadow .2s !important;
            display: inline-flex !important; align-items: center !important; gap: 6px !important;
            border: 1px solid rgba(255, 215, 0, 0.2) !important;
            font-family: 'Cairo', 'Tahoma', sans-serif !important;
            user-select: none !important; visibility: visible !important; opacity: 1 !important;
            width: auto !important; height: auto !important;
        `;

        menuContainer.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:3px;width:20px;height:14px;justify-content:center;flex-shrink:0;">
                <span style="display:block;height:2px;background:#0a0a0f;border-radius:3px;"></span>
                <span style="display:block;height:2px;background:#0a0a0f;border-radius:3px;"></span>
                <span style="display:block;height:2px;background:#0a0a0f;border-radius:3px;"></span>
            </div>
            <span style="font-size:12px;color:#0a0a0f;font-weight:bold;">${isArabic ? 'القائمة' : 'Menu'}</span>
        `;

        const dropdown = document.createElement('div');
        dropdown.id = 'menu-dropdown';
        dropdown.className = isArabic ? 'rtl' : 'ltr';
        dropdown.style.direction = isArabic ? 'rtl' : 'ltr';

        let dropdownHTML = `
            <div style="display:flex; gap:8px; justify-content:center; padding-bottom:12px; border-bottom:2px solid rgba(255,215,0,0.12); margin-bottom:10px; flex-wrap:wrap;">
                <a href="/" style="color:${isArabic ? '#ffd700' : '#888'}; padding:4px 14px; border:1px solid ${isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; transition:.3s; font-size:.85rem;">🇾🇪 عربي</a>
                <a href="/en/" style="color:${!isArabic ? '#ffd700' : '#888'}; padding:4px 14px; border:1px solid ${!isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${!isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; transition:.3s; font-size:.85rem;">🇬🇧 English</a>
            </div>
        `;

        MENU_ITEMS.forEach(item => {
            dropdownHTML += `
                <a href="${item.href}" class="menu-link">
                    <span style="font-size:1.1rem;">📄</span> ${isArabic ? item.name : item.nameEn}
                </a>
            `;
        });

        dropdownHTML += `
            <div style="border-top:2px solid #ffd700; margin:12px 0 8px 0; padding-top:10px;">
                <div style="color:#ffd700; font-size:.7rem; font-weight:bold; text-align:center; letter-spacing:1px; margin-bottom:6px;">
                    ⭐ ${isArabic ? 'إنجازات اليوم - 18 أغسطس 2026' : "Today's Achievements — Aug 18, 2026"}
                </div>
                <div style="display:flex; flex-direction:column; gap:4px; font-size:.78rem; color:#ccc; padding:0 4px;">
                    <div style="display:flex; align-items:center; gap:8px; background:rgba(255,215,0,.04); padding:5px 10px; border-radius:6px; border-right:3px solid #ffd700;">
                        <span>🧮</span> <span>${isArabic ? 'الدالة الأم - اشتقاق ثابت الجاذبية' : 'Mother Function — Gravitational Constant'}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; background:rgba(255,215,0,.04); padding:5px 10px; border-radius:6px; border-right:3px solid #ffd700;">
                        <span>🌌</span> <span>${isArabic ? 'النظرية الموحدة Zx = Z + C + A' : 'Unified Theory Zx = Z + C + A'}</span>
                    </div>
                </div>
            </div>
            <div style="border-top:1px solid rgba(255,215,0,.08); margin:6px 0 4px 0; padding-top:6px;"></div>

            <a href="https://wikibin.org/articles/abdulla-mohammed-nasser-al-jabri.html" target="_blank" rel="noopener" class="menu-link">
                <span style="font-size:1.1rem;">🌐</span> Wikipedia
            </a>
            <a href="https://github.com/jabri-com" target="_blank" rel="noopener" class="menu-link">
                <span style="font-size:1.1rem;">🐙</span> GitHub
            </a>
            <a href="https://orcid.org/0009-0003-3319-3822" target="_blank" rel="noopener" class="menu-link">
                <span style="font-size:1.1rem;">🆔</span> ORCID
            </a>
        `;

        dropdown.innerHTML = dropdownHTML;
        document.body.appendChild(menuContainer);
        document.body.appendChild(dropdown);

        let isOpen = false;
        let closeTimer;

        function openMenu() {
            dropdown.classList.add('is-open');
            isOpen = true;
            clearTimeout(closeTimer);
            closeTimer = setTimeout(closeMenu, 15000);
        }

        function closeMenu() {
            dropdown.classList.remove('is-open');
            isOpen = false;
            clearTimeout(closeTimer);
        }

        menuContainer.addEventListener('click', function(e) {
            e.stopPropagation();
            isOpen ? closeMenu() : openMenu();
        });

        document.addEventListener('click', function(e) {
            if (!menuContainer.contains(e.target) && !dropdown.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) closeMenu();
        });
    }

    // ============================================================
    //   🚀 التهيئة النهائية (v5.1)
    // ============================================================
    function init() {
        injectStyles();

        // انتظر الهيدر — المدير يناديك بعد الهيدر
        if (!document.querySelector('#main-menu')) {
            document.addEventListener('headerLoaded', () => {
                buildMainMenu();
                buildHamburgerMenu();
                initLanguageSwitcher(); // تفعيل تبديل اللغة بعد بناء القائمة
            }, { once: true });
            return;
        }

        // إذا كان الهيدر جاهزاً مسبقاً (لأن المدير انتظر تحميله)
        buildMainMenu();
        buildHamburgerMenu();
        initLanguageSwitcher();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    console.log('%c🌴 menu.js v5.1 (المرعبة الخفيفة) جاهز',
                'color:#ffd700;font-weight:700;background:#0d1117;padding:2px 8px;border-radius:4px');

})();


// ============================================================
//   ⚡ Prefetch ذكي — نسخة v2 محسّنة (محمي من التكرار)
// ============================================================
(function prefetchLinks() {
    if (window.__jabriPrefetchLoaded) return;
    window.__jabriPrefetchLoaded = true;

    const seen = new Set();
    let lastRun = 0;
    let lastTarget = null;

    const SKIP_EXT = /\.(pdf|zip|mp4|mp3|webp|png|jpg|jpeg|svg|ico|woff2?|ttf|apk)$/i;

    function prefetch(href) {
        if (!href || seen.has(href)) return;
        if (seen.size > 30) return;
        if (SKIP_EXT.test(href)) return;
        seen.add(href);

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = 'document';
        document.head.appendChild(link);
    }

    function handler(e) {
        const now = performance.now();
        if (now - lastRun < 80) return;
        lastRun = now;

        const a = e.target.closest('a[href]');
        if (!a || a === lastTarget) return;
        lastTarget = a;

        try {
            const url = new URL(a.href, location.href);
            if (url.origin !== location.origin) return;
            prefetch(url.pathname);
        } catch (_) { /* تجاهل */ }
    }


document.addEventListener('click', handler, { passive: true });

})();