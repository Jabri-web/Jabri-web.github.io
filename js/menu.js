// ============================================================
//   menu.js - v5.0.0 - القائمة الذكية الشاملة - واحة الجبري
//   الإصدار: 5.0.0 - 10 أكتوبر 2026
//   ✅ GPU-friendly (opacity+transform بدل display)
//   ✅ backdrop-filter خفيف
//   ✅ Prefetch ذكي بـ throttle + isolation
//   ✅ will-change + contain
//   ✅ Inline styles مركزية بدل تكرار
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
    //   🎨 حقن الـ CSS المركزي (مرة واحدة فقط)
    // ============================================================
    function injectStyles() {
        if (document.getElementById('waha-menu-styles')) return;

        const style = document.createElement('style');
        style.id = 'waha-menu-styles';
        style.textContent = `
            /* ─── القائمة الأفقية ─── */
            #main-menu a {
                color: #d6d1c8;
                text-decoration: none;
                font-size: 0.95rem;
                padding: 4px 8px;
                border-bottom: 2px solid transparent;
                transition: color .2s ease, border-color .2s ease;
                font-family: 'Cairo', 'Tahoma', sans-serif;
            }
            #main-menu a:hover { color: #e3b58a; }
            #main-menu a.active {
                border-bottom-color: #b5977a;
                color: #f0dec6;
            }

            /* ─── زر الهامبرغر ─── */
            #hamburger-menu {
                position: fixed;
                top: 12px;
                right: 12px;
                z-index: 99999;
                cursor: pointer;
                background: linear-gradient(135deg, #ffd700, #f0a500);
                color: #0a0a0f;
                padding: 8px 14px;
                border-radius: 10px;
                font-size: 13px;
                font-weight: bold;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                transition: transform .2s cubic-bezier(.4,0,.2,1), box-shadow .2s;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border: 1px solid rgba(255, 215, 0, 0.2);
                font-family: 'Cairo', 'Tahoma', sans-serif;
                user-select: none;
                will-change: transform;
            }
            #hamburger-menu:hover {
                transform: translateY(-1px);
                box-shadow: 0 0 28px rgba(255, 215, 0, 0.5);
            }
            #hamburger-menu:active {
                transform: scale(0.97);
            }

            /* ─── القائمة المنسدلة ─── */
            #menu-dropdown {
                position: fixed;
                top: 52px;
                right: 12px;
                background: rgba(10, 10, 20, 0.98);
                border: 2px solid #ffd700;
                border-radius: 16px;
                padding: 18px 16px;
                min-width: 260px;
                max-height: 70vh;
                overflow-y: auto;
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9);
                z-index: 9998;
                display: flex;
                flex-direction: column;
                gap: 2px;
                font-family: 'Cairo', 'Tahoma', sans-serif;
                /* ─── GPU: opacity + transform بدل display ─── */
                opacity: 0;
                visibility: hidden;
                transform: translateY(-8px) scale(0.98);
                transition: opacity .18s ease,
                            transform .18s ease,
                            visibility .18s;
                will-change: opacity, transform;
                contain: layout style paint;
                pointer-events: none;
            }
            #menu-dropdown.is-open {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            /* ─── روابط القائمة المنسدلة ─── */
            #menu-dropdown .menu-link {
                color: #fff;
                padding: 8px 12px;
                border-radius: 8px;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: background .18s, color .18s, transform .18s;
                border-bottom: 1px solid rgba(255, 215, 0, 0.04);
                font-size: 0.9rem;
            }
            #menu-dropdown .menu-link:hover {
                background: rgba(255, 215, 0, 0.08);
                color: #ffd700;
            }
            #menu-dropdown.rtl .menu-link:hover { transform: translateX(-4px); }
            #menu-dropdown.ltr .menu-link:hover { transform: translateX(4px); }
        `;
        document.head.appendChild(style);
    }

    // ============================================================
    //   📋 بناء القائمة الرئيسية في الهيدر
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
            const status = this.querySelector('#music-status');
            if (isMusicPlaying) {
                audioElement.pause();
                isMusicPlaying = false;
                if (status) status.textContent = 'موسيقى';
                this.style.background = 'rgba(255,215,0,0.08)';
                this.style.color = '#d6d1c8';
                localStorage.setItem('jabri_music_state', 'paused');
            } else {
                audioElement.play().catch(() => {});
                isMusicPlaying = true;
                if (status) status.textContent = '🔊';
                this.style.background = 'rgba(255,215,0,0.25)';
                this.style.color = '#ffd700';
                localStorage.setItem('jabri_music_state', 'playing');
            }
        });

        if (localStorage.getItem('jabri_music_state') === 'playing') {
            setTimeout(() => {
                audioElement.play().catch(() => {});
                isMusicPlaying = true;
                const status = btn.querySelector('#music-status');
                if (status) status.textContent = '🔊';
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
        // ─── زر الهامبرغر ───
        const menuContainer = document.createElement('div');
        menuContainer.id = 'hamburger-menu';
        menuContainer.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:3px;width:20px;height:14px;justify-content:center;flex-shrink:0;">
                <span style="display:block;height:2px;background:#0a0a0f;border-radius:3px;"></span>
                <span style="display:block;height:2px;background:#0a0a0f;border-radius:3px;"></span>
                <span style="display:block;height:2px;background:#0a0a0f;border-radius:3px;"></span>
            </div>
            <span style="font-size:12px;color:#0a0a0f;font-weight:bold;">${isArabic ? 'القائمة' : 'Menu'}</span>
        `;

        // ─── القائمة المنسدلة ───
        const dropdown = document.createElement('div');
        dropdown.id = 'menu-dropdown';
        dropdown.className = isArabic ? 'rtl' : 'ltr';
        dropdown.style.direction = isArabic ? 'rtl' : 'ltr';

        // بناء المحتوى
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
                    ⭐ ${isArabic ? 'إنجازات اليوم - 18 أغسطس 2026' : 'Today\\'s Achievements — Aug 18, 2026'}
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

        // ─── التحكم في الفتح/الإغلاق (GPU-friendly) ───
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

        // إغلاق بـ Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) closeMenu();
        });
    }

    // ============================================================
    //   🚀 التهيئة النهائية
    // ============================================================
    function init() {
        injectStyles();
        buildMainMenu();
        initMusic();
        initVisitorCounter();
        initLanguageSwitcher();
        buildHamburgerMenu();

        console.log('%c🌴 menu.js v5.0.0 — GPU-friendly',
                    'color:#ffd700;font-weight:700;background:#0d1117;padding:2px 8px;border-radius:4px');
        console.log('📅 10 أكتوبر 2026');
        console.log('📜 Zx = Z + C + A | Z + C + A = 1');
        console.log('🧮 Z(x) = x^5 ln(x) sin(2π/x) exp(-x/xp)');
        console.log('🇾🇪 اليمن - صنعاء');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

})();


// ============================================================
//   ⚡ Prefetch ذكي — نسخة v2 محسّنة
//   ✅ pointerover (يشتغل mouse+touch+pen)
//   ✅ throttle 80ms
//   ✅ نفس الأصل فقط
//   ✅ يستبعد الوسائط والأرشيف
//   ✅ سقف 30 رابط
// ============================================================
(function prefetchLinks() {
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
        if (now - lastRun < 80) return;    // throttle
        lastRun = now;

        const a = e.target.closest('a[href]');
        if (!a || a === lastTarget) return;
        lastTarget = a;

        // نفس الأصل فقط
        try {
            const url = new URL(a.href, location.href);
            if (url.origin !== location.origin) return;
            prefetch(url.pathname);
        } catch (_) { /* تجاهل */ }
    }

    document.addEventListener('pointerover', handler, { passive: true });
})();