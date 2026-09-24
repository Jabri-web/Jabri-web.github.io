// ============================================================
//   menu.js - v7.3 (Header-Compatible + Triple Lang Cycle)
//   Heaven Al-Jabri | واحة الجبري
//   ─────────────────────────────────────────────────────────
//   🆕 v7.3:
//     • ✅ زر اللغة يدور ثلاثي: root ⇄ ar ⇄ en ⇄ root
//     • ✅ زر واحد ذكي يعرض الوجهة التالية (لا دوخة)
//     • ✅ دالة __wahaGetLangCycle() للاستخدام العام
//     • ✅ توافق كامل مع init-page-root.js v6.0
//   ✅ v7.2 (محفوظ):
//     • ✅ ينتظر حدث headerLoaded إذا الزر غير موجود
//     • ✅ MutationObserver كحل احتياطي (3 ثواني)
//     • ✅ يعمل وحده أو مع init-page-root.js
//     • ✅ كل أزرار الهيدر شغالة (📖 ⚙️ 🔑)
// ============================================================

(function() {
    'use strict';

    // ============================================================
    //   🌍 كشف البيئة
    // ============================================================
    const UA = navigator.userAgent || '';
    const IS_BOT = /googlebot|bingbot|slurp|duckduckbot|yandexbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot/i.test(UA);

    console.log('🌍 [menu.js v7.3] Web' + (IS_BOT ? ' | 🤖 BOT' : ' | 👤 Human'));

    // ✅ النطاق الرسمي
    const SITE_URL = 'https://jabri-com.vercel.app';

    // ✅ اكتشاف اللغة من المسار
    const currentPath = location.pathname;
    let langDir = '';
    let isArabic = true;

    if (currentPath.indexOf('/ar/') === 0) {
        langDir = '/ar';
        isArabic = true;
    } else if (currentPath.indexOf('/en/') === 0) {
        langDir = '/en';
        isArabic = false;
    }

    // ============================================================
    //   🔗 بناء الروابط
    // ============================================================
    function buildUrl(path) {
        return SITE_URL + langDir + (path || '/');
    }

    // ============================================================
    //   🔄 زر اللغة — v7.3: دورة ثلاثية كاملة
    //   🎯 /  ⇄  /ar/  ⇄  /en/  ⇄  /
    //   ─────────────────────────────────────────────────────────
    //   المستخدم العربي:  /  →  /ar/  →  /en/  →  /
    //   المستخدم الإنجليزي: /  →  /en/  →  /ar/  →  /
    // ============================================================
    const LANG_KEY = 'waha_lang';

    function _getCurrentZone() {
        var p = window.location.pathname.toLowerCase();
        if (p.indexOf('/ar/') === 0 || p === '/ar') return 'ar';
        if (p.indexOf('/en/') === 0 || p === '/en') return 'en';
        return 'root';
    }

    function _getLangCycle() {
        // نحدد ترتيب الدورة حسب تفضيل المستخدم
        var prefAr = true;
        try {
            prefAr = (localStorage.getItem(LANG_KEY) !== 'en');
        } catch (e) {}
        return prefAr
            ? { 'root': 'ar', 'ar': 'en', 'en': 'root' }
            : { 'root': 'en', 'en': 'ar', 'ar': 'root' };
    }

    // 🆕 v7.3 — بناء رابط اللغة التالي في الدورة (بدون targetLang — يقرر بنفسه)
    function buildLangUrl() {
        var cycle = _getLangCycle();
        var currentZone = _getCurrentZone();
        var nextZone = cycle[currentZone];

        var path = window.location.pathname;
        var search = window.location.search;
        var hash = window.location.hash;

        // نستخرج المسار بدون بادئة اللغة
        var cleanPath = path.replace(/^\/(ar|en)(\/|$)/i, '/');
        if (cleanPath === '' || cleanPath === '/') cleanPath = '/';

        // نبني المسار الجديد
        var newPath;
        if (nextZone === 'root') {
            newPath = cleanPath;
        } else {
            newPath = '/' + nextZone + (cleanPath === '/' ? '/' : cleanPath);
        }

        // تنظيف الشرطات المزدوجة
        newPath = newPath.replace(/\/+/g, '/');

        return newPath + search + hash;
    }

    // 🆕 v7.3 — الحصول على الوجهة التالية (للعرض أو للاستخدام)
    function getNextZone() {
        var cycle = _getLangCycle();
        return cycle[_getCurrentZone()];
    }

    // ✅ نُعرّف toggleLang هنا كمان لو مش موجود في header.html
    // 🆕 v7.3 — يستخدم الدورة الثلاثية
    if (!window.toggleLang) {
        window.toggleLang = function() {
            var target = buildLangUrl();
            var currentZone = _getCurrentZone();
            var nextZone = getNextZone();
            console.log('🌐 [lang] دورة:', currentZone, '→', nextZone, '|', target);
            window.location.href = target;
        };
    }

    // 🆕 v7.3 — نصدّر الدوال للاستخدام من init-page-root أو أي مكان
    window.__wahaGetLangCycle = _getLangCycle;
    window.__wahaGetCurrentZone = _getCurrentZone;
    window.__wahaGetNextZone = getNextZone;
    window.__wahaBuildLangUrl = buildLangUrl;

    // ============================================================
    //   🛡️ تهريب HTML
    // ============================================================
    function esc(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ============================================================
    //   📋 القوائم الثابتة
    // ============================================================
    const MENU_TOP = [
        { name: 'الرئيسية', nameEn: 'Home', path: '/', icon: '🏠' },
        { name: 'رسالة جامعة KFUPM', nameEn: 'KFUPM Alumni Letter', path: '/kfupm-msg.html', icon: '🎓' },
        { name: 'صنعاء', nameEn: "Sana'a", path: '/Sanaa.html', icon: '🏛️' },
        { name: 'شبام', nameEn: 'Shibam', path: '/Shibam.html', icon: '🏗️' },
        { name: 'سقطرى', nameEn: 'Socotra', path: '/Soqatra.html', icon: '🌴' },
        { name: 'هندسة اعداد', nameEn: 'Number Engineering', path: '/handsa.html', icon: '🧮' },
        { name: 'المجلة', nameEn: 'Journal', path: '/journal.html', icon: '📰' },
        { name: 'تجربتي مع الـ AI', nameEn: 'My AI Experience', path: '/journal2.html', icon: '🤖' },
        { name: 'فهرس مشاريع الجبري', nameEn: 'Jabri Projects Index', path: '/jabri-projects.html', icon: '📦' },
        { name: 'الفاحص', nameEn: 'Diagnose', path: '/diagnose.html', icon: '🔍' },
        { name: 'واتساب الواحة', nameEn: 'Waha WhatsApp', path: '/publish/publish.html', icon: '💬' },
        { name: 'مستكشف الواحة', nameEn: 'Explore', path: '/explore.html', icon: '🗂️' },
        { name: 'رسالة من صنعاء', nameEn: 'Message from Sanaa', path: '/journal3.html', icon: '✉️' },
        { name: 'مختبر Z(x)', nameEn: 'Z(x) Lab', path: '/Pages-Researches.html', icon: '🧮' },
        { name: 'معرض صنعاء', nameEn: 'Sanaa Gallery', path: '/gallery.html', icon: '🖼️' },
        { name: '🎮 مركز الألعاب', nameEn: '🎮 Games Hub', path: '/game/game-auto.html', icon: '🎮' }
    ];

    const MENU_MIDDLE = [
        { name: 'البحوث', nameEn: 'Research', path: '/research.html', icon: '🔬' },
        { name: 'الدالة الأم Z(x)', nameEn: 'Mother Function Z(x)', path: '/theory-ar.html', icon: '📐' },
        { name: 'نظرية السندباد الموحدة', nameEn: 'Sinbad Unified Theory', path: '/Sindbad-theory.html', icon: '🌌' },
        { name: 'المكتبة', nameEn: 'Library', path: '/Office.html', icon: '📚' }
    ];

    const GAMES = [
        { name: '♟️ الشطرنج', nameEn: '♟️ Chess', path: '/game/chess.html', icon: '♟️' },
        { name: '❌⭕ تيك تاك تو', nameEn: '❌⭕ Tic Tac Toe', path: '/game/tic-tac-toe.html', icon: '❌' },
        { name: '🧠 لعبة الذاكرة', nameEn: '🧠 Memory Game', path: '/game/memory.html', icon: '🧠' },
        { name: '🧩 سودوكو', nameEn: '🧩 Sudoku', path: '/game/sudoku.html', icon: '🧩' },
        { name: '🎯 ألغاز الصور', nameEn: '🎯 Picture Puzzle', path: '/game/puzzle.html', icon: '🎯' },
        { name: '🪢 الرجل المشنوق', nameEn: '🪢 Hangman', path: '/game/hangman.html', icon: '🪢' }
    ];

    let MENU_BOTTOM = [];

    // ============================================================
    //   💬 سجل المحادثات
    // ============================================================
    function getChatHistory() {
        try {
            const raw = localStorage.getItem('jabri_chat_history');
            if (!raw) return [];
            const chats = JSON.parse(raw);
            if (!Array.isArray(chats)) return [];
            return chats.slice(0, 10).filter(function(c) {
                return c && typeof c === 'object';
            });
        } catch (e) {
            return [];
        }
    }

    window.saveChatMessage = function(message, sender) {
        if (typeof message !== 'string') return;
        message = message.trim();
        if (!message) return;
        if (message.length > 500) message = message.slice(0, 500);
        if (!sender || typeof sender !== 'string') {
            sender = isArabic ? 'زائر' : 'Visitor';
        }

        try {
            const chats = JSON.parse(localStorage.getItem('jabri_chat_history') || '[]');
            const safeChats = Array.isArray(chats) ? chats : [];
            const now = new Date();
            const time = now.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US',
                                                { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US');
            safeChats.push({
                sender: sender,
                message: message,
                time: time,
                date: date,
                timestamp: now.getTime()
            });
            if (safeChats.length > 50) safeChats.shift();
            localStorage.setItem('jabri_chat_history', JSON.stringify(safeChats));
            updateBottomMenu();
        } catch (e) {
            console.warn('⚠️ Save chat failed:', e);
        }
    };

    function updateBottomMenu() {
        try {
            const chatHistory = getChatHistory();
            MENU_BOTTOM = chatHistory.map(function(chat) {
                const msg = String(chat.message || '');
                const summary = msg.length > 30 ? msg.substring(0, 30) + '...' : msg;
                return {
                    name: '💬 ' + summary,
                    nameEn: '💬 ' + summary,
                    href: '#',
                    icon: '💬',
                    isChat: true,
                    chatData: chat
                };
            });

            if (MENU_BOTTOM.length === 0) {
                MENU_BOTTOM = [{
                    name: '💬 اضغط هنا لبدء المحادثة',
                    nameEn: '💬 Click here to start chatting',
                    href: '#',
                    icon: '💬',
                    isChat: true
                }];
            }

            renderDropdown();
        } catch (e) {
            console.warn('⚠️ [menu] فشل تحديث القائمة:', e);
        }
    }

    // ============================================================
    //   🎨 أنماط مشتركة
    // ============================================================
    const SECTION_STYLE = 'border-bottom:2px solid rgba(255,215,0,0.15);' +
                          ' padding-bottom:6px; margin-bottom:8px;';
    const SECTION_TITLE = 'color:#ffd700; font-size:0.68rem; font-weight:bold;' +
                          ' letter-spacing:1px; margin-bottom:4px;';
    const LINK_STYLE = 'color:#fff;padding:5px 10px;border-radius:6px;' +
                       'text-decoration:none;display:flex;align-items:center;gap:8px;' +
                       'border-bottom:1px solid rgba(255,215,0,0.03);font-size:0.82rem;' +
                       'transition:0.2s;';

    // ============================================================
    //   🧱 بناء عنصر رابط
    // ============================================================
    function buildLink(item) {
        var href = item.href || buildUrl(item.path || '/');
        var target = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        var onClick = item.isChat ? ' onclick="window.openChatPrompt(); return false;"'
                    : item.isWiki ? ' onclick="window.openWiki(); return false;"'
                    : '';
        var label = esc(isArabic ? item.name : item.nameEn);
        var icon = esc(item.icon || '📄');
        var hrefAttr = href === '#' ? '#' : esc(href);

        return '<a href="' + hrefAttr + '"' + target + onClick +
               ' style="' + LINK_STYLE + '">' +
               '<span style="font-size:0.9rem;">' + icon + '</span> ' + label +
               '</a>';
    }

    // ============================================================
    //   🌐 زر اللغة الذكي — v7.3
    //   ─────────────────────────────────────────────────────────
    //   زر واحد يعرض الوجهة التالية في الدورة:
    //   - من root  →  🇾🇪 عربي
    //   - من /ar/  →  🇬🇧 English
    //   - من /en/  →  🌐 الرئيسية
    // ============================================================
    function buildSmartLangButton() {
        var currentZone = _getCurrentZone();
        var nextZone = getNextZone();
        var targetUrl = buildLangUrl();

        // نص الزر حسب الوجهة
        var label, icon, color;
        if (nextZone === 'root') {
            icon = '🌐';
            label = isArabic ? 'الرئيسية' : 'Home';
            color = '#00ff88';
        } else if (nextZone === 'ar') {
            icon = '🇾🇪';
            label = 'عربي';
            color = '#ffd700';
        } else {
            icon = '🇬🇧';
            label = 'English';
            color = '#6ae3ff';
        }

        // مؤشر الموقع الحالي
        var zoneLabel;
        if (currentZone === 'root') zoneLabel = isArabic ? '🌐 روت' : '🌐 Root';
        else if (currentZone === 'ar') zoneLabel = '🇾🇪 عربي';
        else zoneLabel = '🇬🇧 English';

        return '<div style="display:flex; flex-direction:column; gap:6px;' +
            ' padding-bottom:12px; border-bottom:2px solid rgba(255,215,0,0.12);' +
            ' margin-bottom:10px;">' +
            // الموقع الحالي
            '<div style="text-align:center; font-size:0.65rem; color:#888;' +
            ' letter-spacing:1px;">' +
            (isArabic ? 'أنت الآن في: ' : 'You are in: ') +
            '<span style="color:#aaa; font-weight:bold;">' + zoneLabel + '</span>' +
            '</div>' +
            // الزر الذكي
            '<a href="' + esc(targetUrl) + '" ' +
            'style="display:flex; align-items:center; justify-content:center; gap:8px;' +
            ' color:' + color + '; padding:8px 18px; border:2px solid ' + color + ';' +
            ' border-radius:10px; text-decoration:none; font-weight:bold;' +
            ' background:rgba(255,215,0,0.08); font-size:0.9rem; transition:0.2s;' +
            ' text-align:center;">' +
            '<span style="font-size:1.1rem;">' + icon + '</span> ' +
            '<span>' + label + '</span>' +
            '</a>' +
            '</div>';
    }

    // ============================================================
    //   📋 بناء القائمة المنسدلة كاملة
    // ============================================================
    function renderDropdown() {
        var dropdown = document.getElementById('menu-dropdown');
        if (!dropdown) return;

        // 🆕 v7.3 — زر اللغة الذكي بدل زرين
        var html = buildSmartLangButton();

        // ─── الأساسيات ───
        html += '<div style="' + SECTION_STYLE + '">' +
                '<div style="' + SECTION_TITLE + '">📌 ' +
                (isArabic ? 'الأساسيات' : 'Essentials') + '</div>';
        MENU_TOP.forEach(function(item) { html += buildLink(item); });
        html += '</div>';

        // ─── الألعاب ───
        html += '<div style="' + SECTION_STYLE + '">' +
                '<div style="color:#00ff88; font-size:0.68rem; font-weight:bold;' +
                ' letter-spacing:1px; margin-bottom:4px;">🎮 ' +
                (isArabic ? 'مركز الألعاب' : 'Games Hub') + '</div>';
        GAMES.forEach(function(item) { html += buildLink(item); });
        html += '</div>';

        // ─── النظرية ───
        html += '<div style="' + SECTION_STYLE + '">' +
                '<div style="color:#6ae3ff; font-size:0.68rem; font-weight:bold;' +
                ' letter-spacing:1px; margin-bottom:4px;">🧠 ' +
                (isArabic ? 'النظرية' : 'Theory') + '</div>';
        MENU_MIDDLE.forEach(function(item) { html += buildLink(item); });
        html += '</div>';

        // ─── ويكيبيديا ───
        html += '<div style="' + SECTION_STYLE + '">' +
                '<div style="' + SECTION_TITLE + '">📖 ' +
                (isArabic ? 'ويكيبيديا' : 'Wikipedia') + '</div>' +
                buildLink({
                    name: '📖 عربي - ويكيبيديا',
                    nameEn: '📖 English - Wikipedia',
                    href: 'https://wikibin.org/articles/abdulla-mohammed-nasser-al-jabri.html',
                    icon: '📖',
                    isWiki: true,
                    external: true
                }) +
                '</div>';

        // ─── المحادثات ───
        html += '<div style="border-bottom:2px solid rgba(255,106,106,0.15);' +
                ' padding-bottom:6px; margin-bottom:8px;">' +
                '<div style="color:#ff6a6a; font-size:0.68rem; font-weight:bold;' +
                ' letter-spacing:1px; margin-bottom:4px;">💬 ' +
                (isArabic ? 'آخر المحادثات' : 'Recent Chats') +
                ' <span style="font-size:0.6rem; opacity:0.6;">(' + MENU_BOTTOM.length + ')</span>' +
                '</div>';

        if (MENU_BOTTOM.length === 0) {
            html += '<div onclick="window.openChatPrompt()" style="padding:4px 10px;' +
                    ' border-radius:6px; font-size:0.75rem; color:#ff6a6a; cursor:pointer;' +
                    ' text-align:center;">💬 ' +
                    (isArabic ? 'اضغط هنا لبدء المحادثة' : 'Click here to start chatting') +
                    '</div>';
        } else {
            MENU_BOTTOM.forEach(function(item) {
                var chat = item.chatData || {};
                var msgText = String(chat.message || '');
                var timeText = String(chat.time || '');
                html += '<div onclick="window.openChatPrompt()" style="padding:4px 10px;' +
                        ' border-radius:6px; font-size:0.75rem; color:#ccc; display:flex;' +
                        ' justify-content:space-between; cursor:pointer;' +
                        ' border-bottom:1px solid rgba(255,106,106,0.03);">' +
                        '<span style="flex:1; overflow:hidden; text-overflow:ellipsis;' +
                        ' white-space:nowrap;">💬 ' + esc(msgText) + '</span>' +
                        '<span style="font-size:0.6rem; color:#666; margin-inline-start:6px;">' +
                        esc(timeText) + '</span></div>';
            });
        }
        html += '</div>';

        // ─── الروابط الخارجية ───
        html +=
            '<div style="border-top:1px solid rgba(255,215,0,0.08); margin:6px 0 4px 0;' +
            ' padding-top:6px;"></div>' +
            '<a href="https://en.wikipedia.org/wiki/User:Jabri2026" target="_blank"' +
            ' rel="noopener noreferrer" style="' + LINK_STYLE + '">' +
            '<span style="font-size:0.9rem;">🌐</span> Wikipedia</a>' +
            '<a href="https://github.com/jabri-com" target="_blank"' +
            ' rel="noopener noreferrer" style="' + LINK_STYLE + '">' +
            '<span style="font-size:0.9rem;">🐙</span> GitHub</a>' +
            '<a href="https://orcid.org/0009-0003-3319-3822" target="_blank"' +
            ' rel="noopener noreferrer" style="' + LINK_STYLE + '">' +
            '<span style="font-size:0.9rem;">🆔</span> ORCID</a>';

        dropdown.innerHTML = html;
    }

    // ============================================================
    //   🧱 إنشاء Dropdown Container
    // ============================================================
    function createDropdown() {
        var dd = document.getElementById('menu-dropdown');
        if (dd) return dd;
        dd = document.createElement('div');
        dd.id = 'menu-dropdown';
        dd.style.cssText =
            'display: none;' +
            'position: fixed;' +
            'top: 75px;' +
            (isArabic ? 'right: 20px;' : 'left: 20px;') +
            'background: rgba(10, 10, 20, 0.97);' +
            'border: 2px solid #ffd700;' +
            'border-radius: 16px;' +
            'padding: 18px 16px;' +
            'min-width: 300px;' +
            'max-width: 90vw;' +
            'max-height: 70vh;' +
            'overflow-y: auto;' +
            'z-index: 9998;' +
            'flex-direction: column;' +
            'direction: ' + (isArabic ? 'rtl' : 'ltr') + ';' +
            "font-family: 'Cairo', 'Tahoma', sans-serif;" +
            'backdrop-filter: blur(16px);' +
            'box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9);';
        document.body.appendChild(dd);
        return dd;
    }

    // ============================================================
    //   🔗 ربط زر القائمة (☰) بالـ dropdown
    // ============================================================
    function bindMenuButton() {
        const btn = document.querySelector('.top-btn.menu');
        const dropdown = document.getElementById('menu-dropdown') || createDropdown();
        if (!btn) {
            console.log('⏳ [menu] الزر غير موجود بعد، سأنتظر...');
            return false;
        }
        if (btn.dataset.wahaBound === '1') return true;
        btn.dataset.wahaBound = '1';
        btn.removeAttribute('onclick');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
        });
        console.log('✅ [menu] زر ☰ مربوط بنجاح');
        return true;
    }

    // ============================================================
    //   🧱 بناء نظام القائمة الكامل
    // ============================================================
    function buildMenuSystem() {
        createDropdown();
        renderDropdown();

        if (!bindMenuButton()) {
            // 🆕 v7.2 — انتظر headerLoaded
            console.log('⏳ [menu] انتظار headerLoaded...');
            document.addEventListener('headerLoaded', function handler() {
                document.removeEventListener('headerLoaded', handler);
                console.log('🔄 [menu] headerLoaded وصل — إعادة بناء');
                if (!bindMenuButton()) {
                    // 🆕 حل احتياطي: MutationObserver
                    const observer = new MutationObserver(() => {
                        if (bindMenuButton()) observer.disconnect();
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                    // محاولة أخيرة بعد 3 ثواني
                    setTimeout(() => {
                        bindMenuButton();
                        observer.disconnect();
                    }, 3000);
                }
            });
        }

        // إغلاق القائمة عند الضغط خارجها
        document.addEventListener('click', (e) => {
            const dd = document.getElementById('menu-dropdown');
            if (dd && dd.style.display === 'flex' &&
                !dd.contains(e.target) &&
                !e.target.closest('.top-btn.menu')) {
                dd.style.display = 'none';
            }
        });

        // إغلاق بمفتاح Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const dd = document.getElementById('menu-dropdown');
                if (dd) dd.style.display = 'none';
            }
        });

        console.log('🌴 [menu.js v7.3] تم بناء نظام القائمة بنجاح');
    }

    // ============================================================
    //   🌐 دوال عامة
    // ============================================================
    window.openChatPrompt = function() {
        if (IS_BOT) return;
        var message = prompt(isArabic ? '💬 اكتب رسالتك:' : '💬 Write your message:');
        if (message && message.trim()) {
            window.saveChatMessage(message.trim());
            alert(isArabic ? '✅ تم إرسال رسالتك بنجاح!' : '✅ Message sent successfully!');
        }
    };

    window.openWiki = function() {
        window.open(
            'https://wikibin.org/articles/abdulla-mohammed-nasser-al-jabri.html',
            '_blank',
            'noopener,noreferrer'
        );
    };

    window.updateChatMenu = updateBottomMenu;
    window.saveChat = window.saveChatMessage;

    // ============================================================
    //   🚀 التهيئة — ذكية
    // ============================================================
    function init() {
        try {
            console.log('🌴 [menu] بدء التهيئة v7.3...');

            updateBottomMenu();
            buildMenuSystem();

            // 🆕 v7.2 — استمع لتحميل الهيدر المتأخر
            document.addEventListener('headerLoaded', function() {
                setTimeout(buildMenuSystem, 100);
            });

            console.log('✅ [menu] التهيئة اكتملت');
        } catch (e) {
            console.error('❌ [menu] خطأ في التشغيل:', e);
        }
    }

    // ✅ يشتغل في الحالتين: مستقل أو مع init-page-root
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();