// ============================================================
//   menu.js - v7.1 (Header-Compatible Edition)
//   Heaven Al-Jabri | واحة الجبري
//   ─────────────────────────────────────────────────────────
//   🆕 v7.1:
//     • ✅ يستدعى مرة واحدة فقط — مفيش Polling — مفيش تعليق
//     • ✅ زر اللغة منسّق مع زر اللغة في الهيدر (نفس المنطق)
//     • ✅ زر اللغة يقلب المجلد فقط (/ar/ ⇄ /en/) — بدون fetch
//     • ✅ كل أزرار الهيدر شغالة زي ما هي (📖 ⚙️ 🔑)
// ============================================================

(function() {
    'use strict';

    // ============================================================
    //   🌍 كشف البيئة
    // ============================================================
    const UA = navigator.userAgent || '';
    const IS_BOT = /googlebot|bingbot|slurp|duckduckbot|yandexbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot/i.test(UA);

    console.log('🌍 [menu.js v7.1] Web' + (IS_BOT ? ' | 🤖 BOT' : ' | 👤 Human'));

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
    //   🔄 زر اللغة: يقلب المجلد فقط — بدون قراءة ملفات
    //   ✅ منسّق مع window.toggleLang في header.html
    // ============================================================
    function buildLangUrl(targetLang) {
        var path = window.location.pathname;
        var search = window.location.search;
        var hash = window.location.hash;
        var newPath;

        if (path.indexOf('/ar/') === 0) {
            newPath = path.replace('/ar/', '/' + targetLang + '/');
        } else if (path.indexOf('/en/') === 0) {
            newPath = path.replace('/en/', '/' + targetLang + '/');
        } else {
            newPath = '/' + targetLang + '/';
        }

        return newPath + search + hash;
    }

    // ✅ نُعرّف toggleLang هنا كمان لو مش موجود في header.html
    if (!window.toggleLang) {
        window.toggleLang = function() {
            var target = isArabic ? 'en' : 'ar';
            window.location.href = buildLangUrl(target);
        };
    }

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
    //   📋 بناء القائمة المنسدلة كاملة
    // ============================================================
    function renderDropdown() {
        var dropdown = document.getElementById('menu-dropdown');
        if (!dropdown) return;

        // ✅ زر اللغة — منسّق مع الهيدر (يقلب المجلد بس)
        var arHref = buildLangUrl('ar');
        var enHref = buildLangUrl('en');

        var html =
            '<div style="display:flex; gap:8px; justify-content:center; padding-bottom:12px;' +
            ' border-bottom:2px solid rgba(255,215,0,0.12); margin-bottom:10px; flex-wrap:wrap;">' +
                '<a href="' + esc(arHref) + '" style="color:' +
                (isArabic ? '#ffd700' : '#888') + '; padding:4px 14px; border:1px solid ' +
                (isArabic ? '#ffd700' : '#444') + '; border-radius:8px; text-decoration:none;' +
                ' font-weight:bold; background:' +
                (isArabic ? 'rgba(255,215,0,0.12)' : 'transparent') +
                '; font-size:0.85rem;">🇾🇪 عربي</a>' +
                '<a href="' + esc(enHref) + '" style="color:' +
                (!isArabic ? '#ffd700' : '#888') + '; padding:4px 14px; border:1px solid ' +
                (!isArabic ? '#ffd700' : '#444') + '; border-radius:8px; text-decoration:none;' +
                ' font-weight:bold; background:' +
                (!isArabic ? 'rgba(255,215,0,0.12)' : 'transparent') +
                '; font-size:0.85rem;">🇬🇧 English</a>' +
            '</div>';

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
    //   ☰ بناء نظام القائمة
    // ============================================================
    function buildMenuSystem() {
        // ① إنشاء القائمة المنسدلة مرة واحدة
        var dropdown = document.getElementById('menu-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'menu-dropdown';
            dropdown.style.cssText =
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
            document.body.appendChild(dropdown);
        }

        // ② بناء محتوى القائمة
        renderDropdown();

        // ③ ربط زر القائمة (☰) — مرة واحدة بس
        var btn = document.querySelector('.top-btn.menu');
        if (btn && btn.dataset.wahaBound !== '1') {
            btn.dataset.wahaBound = '1';
            btn.removeAttribute('onclick');
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                var isOpen = dropdown.style.display === 'flex';
                dropdown.style.display = isOpen ? 'none' : 'flex';
            });
            console.log('✅ [menu] زر ☰ مربوط');
        } else if (!btn) {
            console.warn('⚠️ [menu] زر .top-btn.menu غير موجود في الهيدر');
        }

        // ④ إغلاق القائمة عند الضغط خارجها
        document.addEventListener('click', function(e) {
            if (dropdown.style.display === 'flex' &&
                !dropdown.contains(e.target) &&
                !e.target.closest('.top-btn.menu')) {
                dropdown.style.display = 'none';
            }
        });

        // ⑤ إغلاق بمفتاح Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') dropdown.style.display = 'none';
        });

        console.log('🌴 [menu.js v7.1] تم بناء نظام القائمة بنجاح');
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
    //   🚀 التهيئة — مرة واحدة فقط
    // ============================================================
    function init() {
        try {
            console.log('🌴 [menu] بدء التهيئة v7.1...');

            updateBottomMenu();
            buildMenuSystem();

            console.log('✅ [menu] التهيئة اكتملت');
        } catch (e) {
            console.error('❌ [menu] خطأ في التشغيل:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();