// ============================================================
//   menu.js - القائمة الذكية الشاملة - واحة الجبري
//   الإصدار: 5.0.3 - 19 أغسطس 2026
//   المستويات: العلوي (أساسيات) | الوسطى (نظرية) | السفلي (محادثات ديناميكي)
//   جميع عناصر المحادثات قابلة للنقر وتفتح prompt
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
    //   📋 المستوى العلوي: الأساسيات
    // ============================================================
    const MENU_TOP = [
        { name: 'الرئيسية', nameEn: 'Home', href: `${langDir}/`, icon: '🏠' },
        // 🎓 تمت إضافة رسالة الجامعة هنا
        { name: 'رسالة جامعة KFUPM', nameEn: 'KFUPM Alumni Letter', href: `${langDir}/kfupm-msg.html`, icon: '🎓' },
        { name: 'صنعاء', nameEn: "Sana'a", href: `${langDir}/Sanaa.html`, icon: '🏛️' },
        { name: 'شبام', nameEn: 'Shibam', href: `${langDir}/Shibam.html`, icon: '🏗️' },
        { name: 'سقطرى', nameEn: 'Socotra', href: `${langDir}/Soqatra.html`, icon: '🌴' },
        { name: 'المجلة', nameEn: 'Journal', href: `${langDir}/journal.html`, icon: '📰' },
        { name: 'تجربتي مع الـ AI', nameEn: 'My AI Experience', href: `${langDir}/journal2.html`, icon: '🤖' },
        { name: 'فهرس مشاريع الجبري', nameEn: 'Jabri Projects', href: `${langDir}/jabri-projects.html`, icon: '🤖' },
        { name: 'رسالة من صنعاء', nameEn: 'Sanaa msg', href: `${langDir}/journal3.html`, icon: '🤖' },


    ];

    // ============================================================
    //   📋 المستوى الوسطى: النظرية
    // ============================================================
    const MENU_MIDDLE = [
        { name: 'البحوث', nameEn: 'Research', href: `${langDir}/research.html`, icon: '🔬' },
        { name: 'الدالة الأم Z(x)', nameEn: 'Mother Function Z(x)', href: `${langDir}/theory-ar.html`, icon: '📐' },
        { name: 'نظرية السندباد الموحدة', nameEn: 'Sinbad Unified Theory', href: `${langDir}/unified-theory.html`, icon: '🌌' },
        { name: 'المكتبة', nameEn: 'Library', href: `${langDir}/Office.html`, icon: '📚' },
    ];

    // ============================================================
    //   📋 المستوى السفلي: المحادثات وسجلها (ديناميكي)
    // ============================================================
    let MENU_BOTTOM = [];

    // ===== دالة لجلب المحادثات من localStorage =====
    function getChatHistory() {
        try {
            const chats = JSON.parse(localStorage.getItem('jabri_chat_history') || '[]');
            return chats.slice(0, 10);
        } catch(e) {
            return [];
        }
    }

    // ===== دالة لحفظ محادثة جديدة =====
    window.saveChatMessage = function(message, sender = 'زائر') {
        try {
            const chats = JSON.parse(localStorage.getItem('jabri_chat_history') || '[]');
            const now = new Date();
            const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('ar-EG');
            chats.push({
                sender: sender,
                message: message,
                time: time,
                date: date,
                timestamp: now.getTime()
            });
            if (chats.length > 50) chats.shift();
            localStorage.setItem('jabri_chat_history', JSON.stringify(chats));
            updateBottomMenu();
        } catch(e) {
            console.warn('⚠️ فشل حفظ المحادثة:', e);
        }
    };

    // ===== دالة لتحديث القائمة السفلية =====
    function updateBottomMenu() {
        const chatHistory = getChatHistory();
        MENU_BOTTOM = chatHistory.map((chat, index) => {
            const summary = chat.message.length > 30 ? chat.message.substring(0, 30) + '...' : chat.message;
            return {
                name: `💬 ${summary}`,
                nameEn: `💬 ${summary}`,
                href: '#',
                icon: '💬',
                isChat: true,
                chatData: chat
            };
        });

        if (MENU_BOTTOM.length === 0) {
            MENU_BOTTOM = [
                { name: '💬 اضغط هنا لبدء المحادثة', nameEn: '💬 Click here to start chatting', href: '#', icon: '💬', isChat: true },
            ];
        }

        buildDropdownMenu();
        buildMainMenu();
    }

    // ============================================================
    //   📋 بناء عنصر القائمة (مع دعم النقر للمحادثات)
    // ============================================================
    function buildMenuItem(item) {
        const isActive = window.location.pathname.includes(item.href.split('/').pop()) && item.href !== '#';
        const activeStyle = isActive ? 'background:rgba(255,215,0,0.08);border-right:3px solid #ffd700;' : '';
        
        // عناصر المحادثات تفتح prompt
        const isChatItem = item.isChat === true;
        const onClick = isChatItem ? ` onclick="window.openChatPrompt(); return false;"` : '';
        const cursor = isChatItem ? 'cursor:pointer;' : '';
        
        return `
            <a href="${item.href}"${onClick} style="color:#fff;padding:6px 12px;border-radius:6px;text-decoration:none;display:flex;align-items:center;gap:8px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.03);font-size:0.85rem;${activeStyle}${cursor}">
                <span style="font-size:1rem;">${item.icon || '📄'}</span> ${isArabic ? item.name : item.nameEn}
            </a>
        `;
    }

    // ============================================================
    //   📋 بناء القائمة الرئيسية
    // ============================================================
    function buildMainMenu() {
        const nav = document.querySelector('#main-menu');
        if (!nav) return;

        let html = '';

        // ---- المستوى العلوي: الأساسيات ----
        html += `<div class="menu-section" style="border-bottom:2px solid rgba(255,215,0,0.2); padding-bottom:8px; margin-bottom:10px;">`;
        html += `<div style="color:#ffd700; font-size:0.7rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">📌 ${isArabic ? 'الأساسيات' : 'Essentials'}</div>`;
        MENU_TOP.forEach(item => {
            html += buildMenuItem(item);
        });
        html += `</div>`;

        // ---- المستوى الوسطى: النظرية ----
        html += `<div class="menu-section" style="border-bottom:2px solid rgba(106,227,255,0.2); padding-bottom:8px; margin-bottom:10px;">`;
        html += `<div style="color:#6ae3ff; font-size:0.7rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">🧠 ${isArabic ? 'النظرية' : 'Theory'}</div>`;
        MENU_MIDDLE.forEach(item => {
            html += buildMenuItem(item);
        });
        html += `</div>`;

        // ---- المستوى السفلي: المحادثات (ديناميكي) ----
        html += `<div class="menu-section" style="border-bottom:2px solid rgba(255,106,106,0.2); padding-bottom:8px; margin-bottom:10px;">`;
        html += `<div style="color:#ff6a6a; font-size:0.7rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">💬 ${isArabic ? 'آخر المحادثات' : 'Recent Chats'} <span style="font-size:0.6rem; opacity:0.6;">(${MENU_BOTTOM.length})</span></div>`;
        
        MENU_BOTTOM.forEach(item => {
            html += buildMenuItem(item);
        });
        html += `</div>`;

        // ---- إضافات ----
        html += `
            <div style="border-top:2px solid #ffd700; margin:12px 0 8px 0; padding-top:10px;">
                <div style="color:#ffd700; font-size:0.7rem; font-weight:bold; text-align:center; letter-spacing:1px; margin-bottom:6px;">
                    ⭐ ${isArabic ? 'إنجازات اليوم - 19 أغسطس 2026' : "Today's Achievements — Aug 19, 2026"}
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

        nav.innerHTML = html;
        highlightActiveLink();
    }

    function highlightActiveLink() {
        const links = document.querySelectorAll('#main-menu a');
        const current = window.location.pathname.split('/').pop() || 'Page11.html';

        links.forEach(link => {
            const href = link.getAttribute('href').split('/').pop();
            if (href === current || (current === '' && href === 'Page11.html')) {
                link.style.background = 'rgba(255, 215, 0, 0.08)';
                link.style.borderRight = '3px solid #ffd700';
                link.style.color = '#ffd700';
            }
        });
    }

    // ============================================================
    //   🍔 بناء القائمة المنسدلة
    // ============================================================
    function buildDropdownMenu() {
        const dropdown = document.getElementById('menu-dropdown');
        if (!dropdown) return;

        let html = `
            <div style="display:flex; gap:8px; justify-content:center; padding-bottom:12px; border-bottom:2px solid rgba(255,215,0,0.12); margin-bottom:10px; flex-wrap:wrap;">
                <a href="/" style="color:${isArabic ? '#ffd700' : '#888'}; padding:4px 14px; border:1px solid ${isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; transition:0.3s; font-size:0.85rem;">🇾🇪 عربي</a>
                <a href="/en/" style="color:${!isArabic ? '#ffd700' : '#888'}; padding:4px 14px; border:1px solid ${!isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${!isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; transition:0.3s; font-size:0.85rem;">🇬🇧 English</a>
            </div>
        `;

        // ---- المستوى العلوي ----
        html += `<div style="border-bottom:2px solid rgba(255,215,0,0.15); padding-bottom:6px; margin-bottom:8px;">`;
        html += `<div style="color:#ffd700; font-size:0.65rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">📌 ${isArabic ? 'الأساسيات' : 'Essentials'}</div>`;
        MENU_TOP.forEach(item => {
            html += `
                <a href="${item.href}" style="color:#fff;padding:5px 10px;border-radius:6px;text-decoration:none;display:flex;align-items:center;gap:8px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.03);font-size:0.82rem;">
                    <span style="font-size:0.9rem;">${item.icon || '📄'}</span> ${isArabic ? item.name : item.nameEn}
                </a>
            `;
        });
        html += `</div>`;

        // ---- المستوى الوسطى ----
        html += `<div style="border-bottom:2px solid rgba(106,227,255,0.15); padding-bottom:6px; margin-bottom:8px;">`;
        html += `<div style="color:#6ae3ff; font-size:0.65rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">🧠 ${isArabic ? 'النظرية' : 'Theory'}</div>`;
        MENU_MIDDLE.forEach(item => {
            html += `
                <a href="${item.href}" style="color:#fff;padding:5px 10px;border-radius:6px;text-decoration:none;display:flex;align-items:center;gap:8px;transition:0.3s;border-bottom:1px solid rgba(106,227,255,0.03);font-size:0.82rem;">
                    <span style="font-size:0.9rem;">${item.icon || '📄'}</span> ${isArabic ? item.name : item.nameEn}
                </a>
            `;
        });
        html += `</div>`;

        // ---- المستوى السفلي (ديناميكي) ----
        html += `<div style="border-bottom:2px solid rgba(255,106,106,0.15); padding-bottom:6px; margin-bottom:8px;">`;
        html += `<div style="color:#ff6a6a; font-size:0.65rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">💬 ${isArabic ? 'آخر المحادثات' : 'Recent Chats'} <span style="font-size:0.6rem; opacity:0.6;">(${MENU_BOTTOM.length})</span></div>`;
        
        if (MENU_BOTTOM.length === 0) {
            html += `
                <div onclick="window.openChatPrompt(); return false;" style="padding:4px 10px; border-radius:6px; border-bottom:1px solid rgba(255,106,106,0.05); font-size:0.75rem; color:#ff6a6a; cursor:pointer; text-align:center; transition:0.3s;">
                    💬 ${isArabic ? 'اضغط هنا لبدء المحادثة' : 'Click here to start chatting'}
                </div>
            `;
        } else {
            MENU_BOTTOM.forEach(item => {
                const chat = item.chatData || {};
                const time = chat.time || '';
                html += `
                    <div onclick="window.openChatPrompt(); return false;" style="padding:4px 10px; border-radius:6px; border-bottom:1px solid rgba(255,106,106,0.05); font-size:0.75rem; color:#ccc; display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:0.3s;">
                        <span style="flex:1;">💬 ${isArabic ? chat.message || item.name : chat.message || item.nameEn}</span>
                        <span style="font-size:0.6rem; color:#666; margin-right:8px;">${time}</span>
                    </div>
                `;
            });
        }
        html += `</div>`;

        // ---- الروابط الخارجية ----
        html += `
            <div style="border-top:1px solid rgba(255,215,0,0.08); margin:6px 0 4px 0; padding-top:6px;"></div>
            <a href="https://en.wikipedia.org/wiki/User:Jabri2026" target="_blank" style="color:#fff;padding:6px 10px;border-radius:6px;text-decoration:none;display:flex;align-items:center;gap:8px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.03);font-size:0.82rem;">
                <span style="font-size:0.9rem;">🌐</span> Wikipedia
            </a>
            <a href="https://github.com/jabri-com" target="_blank" style="color:#fff;padding:6px 10px;border-radius:6px;text-decoration:none;display:flex;align-items:center;gap:8px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.03);font-size:0.82rem;">
                <span style="font-size:0.9rem;">🐙</span> GitHub
            </a>
            <a href="https://orcid.org/0009-0003-3319-3822" target="_blank" style="color:#fff;padding:6px 10px;border-radius:6px;text-decoration:none;display:flex;align-items:center;gap:8px;transition:0.3s;font-size:0.82rem;">
                <span style="font-size:0.9rem;">🆔</span> ORCID
            </a>
        `;

        dropdown.innerHTML = html;
    }

    // ============================================================
    //   🍔 زر القائمة المنسدلة
    // ============================================================
    function buildHamburgerMenu() {
        const oldMenu = document.getElementById('hamburger-menu');
        if (oldMenu) oldMenu.remove();
        const oldDropdown = document.getElementById('menu-dropdown');
        if (oldDropdown) oldDropdown.remove();

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
            min-width: 300px !important;
            max-height: 70vh !important;
            overflow-y: auto !important;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9) !important;
            z-index: 9999998 !important;
            flex-direction: column !important;
            gap: 2px !important;
            direction: ${isArabic ? 'rtl' : 'ltr'} !important;
            font-family: 'Cairo', 'Tahoma', sans-serif !important;
        `;

        document.body.appendChild(menuContainer);
        document.body.appendChild(dropdown);

        buildDropdownMenu();

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
                }, 20000);
            }
        });

        document.addEventListener('click', function(e) {
            if (!menuContainer.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
                isOpen = false;
                clearTimeout(closeTimer);
            }
        });

        dropdown.querySelectorAll('a, div[onclick]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.background = 'rgba(255, 215, 0, 0.08)';
                el.style.color = '#ffd700';
            });
            el.addEventListener('mouseleave', () => {
                el.style.background = 'transparent';
                el.style.color = el.tagName === 'A' ? '#fff' : '';
            });
        });
    }

    // ============================================================
    //   💬 فتح محادثة جديدة مع prompt
    // ============================================================
    window.openChatPrompt = function() {
        const message = prompt('💬 اكتب رسالتك:');
        if (message && message.trim()) {
            if (window.saveChat) {
                window.saveChat(message.trim(), 'زائر');
                alert('✅ تم إرسال رسالتك بنجاح!');
            } else {
                try {
                    const chats = JSON.parse(localStorage.getItem('jabri_chat_history') || '[]');
                    const now = new Date();
                    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                    const date = now.toLocaleDateString('ar-EG');
                    chats.push({
                        sender: 'زائر',
                        message: message.trim(),
                        time: time,
                        date: date,
                        timestamp: now.getTime()
                    });
                    if (chats.length > 50) chats.shift();
                    localStorage.setItem('jabri_chat_history', JSON.stringify(chats));
                    if (window.updateChatMenu) {
                        window.updateChatMenu();
                    }
                    alert('✅ تم إرسال رسالتك بنجاح!');
                } catch (e) {
                    alert('❌ فشل إرسال الرسالة: ' + e.message);
                }
            }
        }
    };

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
            buildDropdownMenu();
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
    //   📝 تحديث القائمة السفلية ديناميكياً (كل 30 ثانية)
    // ============================================================
    setInterval(() => {
        updateBottomMenu();
    }, 30000);

    // ============================================================
    //   🚀 التهيئة النهائية
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🌴 menu.js v5.0.3 - القائمة الذكية مع المحادثات + رسالة KFUPM');

        updateBottomMenu();
        buildMainMenu();
        initMusic();
        initVisitorCounter();
        initLanguageSwitcher();
        buildHamburgerMenu();

        console.log('📅 19 أغسطس 2026');
        console.log('📜 Zx = Z + C + A | Z + C + A = 1');
        console.log('🧮 Z(x) = x^5 ln(x) sin(2π/x) exp(-x/xp)');
        console.log('🇾🇪 اليمن - صنعاء');
        console.log('🎓 رسالة جامعة KFUPM مضافة');
        console.log('💬 المحادثات:', MENU_BOTTOM.length);
    });

    // ============================================================
    //   جعل الدوال عامة
    // ============================================================
    window.updateChatMenu = updateBottomMenu;
    window.saveChat = window.saveChatMessage;

})();