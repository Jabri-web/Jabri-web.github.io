// ============================================================
//   menu.js - القائمة الذكية الشاملة - واحة الجبري
//   الإصدار: 5.0.5 - 29 أغسطس 2026 - ثنائي اللغة
// ============================================================

(function() {
    'use strict';

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

    const MENU_TOP = [
        { name: 'الرئيسية', nameEn: 'Home', href: `${langDir}/`, icon: '🏠' },
        { name: 'رسالة جامعة KFUPM', nameEn: 'KFUPM Alumni Letter', href: `${langDir}/kfupm-msg.html`, icon: '🎓' },
        { name: 'صنعاء', nameEn: "Sana'a", href: `${langDir}/Sanaa.html`, icon: '🏛️' },
        { name: 'شبام', nameEn: 'Shibam', href: `${langDir}/Shibam.html`, icon: '🏗️' },
        { name: 'سقطرى', nameEn: 'Socotra', href: `${langDir}/Soqatra.html`, icon: '🌴'
        },
        { name: 'هندسة اعداد', nameEn: 'Numbers', href: `${langDir}/handsa.html`, icon: '📰' },
        { name: 'المجلة', nameEn: 'Journal', href: `${langDir}/journal.html`, icon: '📰' },
        { name: 'تجربتي مع الـ AI', nameEn: 'My AI Experience', href: `${langDir}/journal2.html`, icon: '🤖' },
        { name: 'فهرس مشاريع الجبري', nameEn: 'Jabri Projects', href: `${langDir}/jabri-projects.html`, icon: '📦' },
        { name: 'الفاحص', nameEn: 'Diagnose', href: `${langDir}/diagnose.html`, icon: '🔍' },
        { name: 'واتساب الواحة', nameEn: 'Waha WhatsApp', href: `${langDir}/publish/publish.html`, icon: '💬' },
        { name: 'رسالة من صنعاء', nameEn: 'Message from Sanaa', href: `${langDir}/journal3.html`, icon: '✉️' },
        // اعمالنا الاخيرة
        { name: 'مختبر Z(x)', nameEn: 'Z(x) Lab', href: `${langDir}/z-lab.html`, icon: '🧮' },
        { name: 'حاسبة النظرية الموحدة', nameEn: 'Unified Theory Calculator', href: `${langDir}/unified-calc.html`, icon: '🌌' },
        { name: 'معرض صنعاء', nameEn: 'Sanaa Gallery', href: `${langDir}/gallery-sanaa.html`, icon: '🖼️' },
    ];

    const MENU_MIDDLE = [
        { name: 'البحوث', nameEn: 'Research', href: `${langDir}/research.html`, icon: '🔬' },
        { name: 'الدالة الأم Z(x)', nameEn: 'Mother Function Z(x)', href: `${langDir}/theory-ar.html`, icon: '📐' },
        { name: 'نظرية السندباد الموحدة', nameEn: 'Sinbad Unified Theory', href: `${langDir}/unified-theory.html`, icon: '🌌' },
        { name: 'المكتبة', nameEn: 'Library', href: `${langDir}/Office.html`, icon: '📚' },
    ];

    let MENU_BOTTOM = [];

    function getChatHistory() {
        try {
            const chats = JSON.parse(localStorage.getItem('jabri_chat_history') || '[]');
            return chats.slice(0, 10);
        } catch(e) {
            return [];
        }
    }

    window.saveChatMessage = function(message, sender = isArabic ? 'زائر' : 'Visitor') {
        try {
            const chats = JSON.parse(localStorage.getItem('jabri_chat_history') || '[]');
            const now = new Date();
            const time = now.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US');
            chats.push({ sender, message, time, date, timestamp: now.getTime() });
            if (chats.length > 50) chats.shift();
            localStorage.setItem('jabri_chat_history', JSON.stringify(chats));
            updateBottomMenu();
        } catch(e) {
            console.warn('⚠️ Save chat failed:', e);
        }
    };

    function updateBottomMenu() {
        const chatHistory = getChatHistory();
        MENU_BOTTOM = chatHistory.map((chat) => {
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

    function buildMenuItem(item) {
        const isActive = window.location.pathname.includes(item.href.split('/').pop()) && item.href !== '#';
        const activeStyle = isActive ? 'background:rgba(255,215,0,0.08);border-right:3px solid #ffd700;' : '';
        
        const isChatItem = item.isChat === true;
        const isDownloadItem = item.isDownload === true;
        const onClick = isChatItem ? ` onclick="window.openChatPrompt(); return false;"` : isDownloadItem ? ` onclick="window.downloadWaha('${item.type}'); return false;"` : '';
        const cursor = (isChatItem || isDownloadItem) ? 'cursor:pointer;' : '';
        
        return `
            <a href="${item.href}"${onClick} style="color:#fff;padding:6px 12px;border-radius:6px;text-decoration:none;display:flex;align-items:center;gap:8px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.03);font-size:0.85rem;${activeStyle}${cursor}">
                <span style="font-size:1rem;">${item.icon || '📄'}</span> ${isArabic ? item.name : item.nameEn}
            </a>
        `;
    }

    function buildMainMenu() {
        const nav = document.querySelector('#main-menu');
        if (!nav) return;

        let html = '';
        html += `<div class="menu-section" style="border-bottom:2px solid rgba(255,215,0,0.2); padding-bottom:8px; margin-bottom:10px;">`;
        html += `<div style="color:#ffd700; font-size:0.7rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">📌 ${isArabic ? 'الأساسيات' : 'Essentials'}</div>`;
        MENU_TOP.forEach(item => { html += buildMenuItem(item); });
        html += `</div>`;

        html += `<div class="menu-section" style="border-bottom:2px solid rgba(106,227,255,0.2); padding-bottom:8px; margin-bottom:10px;">`;
        html += `<div style="color:#6ae3ff; font-size:0.7rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">🧠 ${isArabic ? 'النظرية' : 'Theory'}</div>`;
        MENU_MIDDLE.forEach(item => { html += buildMenuItem(item); });
        html += `</div>`;

        html += `<div class="menu-section" style="border-bottom:2px solid rgba(0,255,128,0.2); padding-bottom:8px; margin-bottom:10px;">`;
        html += `<div style="color:#00ff80; font-size:0.7rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">⬇️ ${isArabic ? 'تنزيل الواحة' : 'Download Waha'}</div>`;
        html += buildMenuItem({ name: 'تنزيل APK', nameEn: 'Download APK', href: '#', icon: '📱', isDownload: true, type: 'apk' });
        html += buildMenuItem({ name: 'تنزيل ZIP', nameEn: 'Download ZIP', href: '#', icon: '📦', isDownload: true, type: 'zip' });
        html += `</div>`;

        html += `<div class="menu-section" style="border-bottom:2px solid rgba(255,106,106,0.2); padding-bottom:8px; margin-bottom:10px;">`;
        html += `<div style="color:#ff6a6a; font-size:0.7rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">💬 ${isArabic ? 'آخر المحادثات' : 'Recent Chats'} <span style="font-size:0.6rem; opacity:0.6;">(${MENU_BOTTOM.length})</span></div>`;
        MENU_BOTTOM.forEach(item => { html += buildMenuItem(item); });
        html += `</div>`;

        html += `
            <div style="border-top:2px solid #ffd700; margin:12px 0 8px 0; padding-top:10px;">
                <div style="color:#ffd700; font-size:0.7rem; font-weight:bold; text-align:center; letter-spacing:1px; margin-bottom:6px;">
                    ⭐ ${isArabic ? 'إنجازات اليوم - 29 أغسطس 2026' : "Today's Achievements — Aug 29, 2026"}
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
        const current = window.location.pathname.split('/').pop() || 'index.html';
        links.forEach(link => {
            const href = link.getAttribute('href').split('/').pop();
            if (href === current || (current === '' && href === 'index.html')) {
                link.style.background = 'rgba(255, 215, 0, 0.08)';
                link.style.borderRight = '3px solid #ffd700';
                link.style.color = '#ffd700';
            }
        });
    }

    function buildDropdownMenu() {
        const dropdown = document.getElementById('menu-dropdown');
        if (!dropdown) return;

        let html = `
            <div style="display:flex; gap:8px; justify-content:center; padding-bottom:12px; border-bottom:2px solid rgba(255,215,0,0.12); margin-bottom:10px; flex-wrap:wrap;">
                <a href="${currentPath.replace('/en/','/ar/') || '/ar/'}" style="color:${isArabic ? '#ffd700' : '#888'}; padding:4px 14px; border:1px solid ${isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; font-size:0.85rem;">🇾🇪 عربي</a>
                <a href="${currentPath.replace('/ar/','/en/') || '/en/'}" style="color:${!isArabic ? '#ffd700' : '#888'}; padding:4px 14px; border:1px solid ${!isArabic ? '#ffd700' : '#444'}; border-radius:8px; text-decoration:none; font-weight:bold; background:${!isArabic ? 'rgba(255,215,0,0.12)' : 'transparent'}; font-size:0.85rem;">🇬🇧 English</a>
            </div>
        `;

        html += `<div style="border-bottom:2px solid rgba(255,215,0,0.15); padding-bottom:6px; margin-bottom:8px;">`;
        html += `<div style="color:#ffd700; font-size:0.65rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">📌 ${isArabic ? 'الأساسيات' : 'Essentials'}</div>`;
        MENU_TOP.forEach(item => {
            html += `<a href="${item.href}" style="color:#fff;padding:5px 10px;border-radius:6px;text-decoration:none;display:flex;align-items:center;gap:8px;transition:0.3s;border-bottom:1px solid rgba(255,215,0,0.03);font-size:0.82rem;">
                        <span style="font-size:0.9rem;">${item.icon}</span> ${isArabic ? item.name : item.nameEn}
                     </a>`;
        });
        html += `</div>`;

        html += `<div style="border-bottom:2px solid rgba(106,227,255,0.15); padding-bottom:6px; margin-bottom:8px;">`;
        html += `<div style="color:#6ae3ff; font-size:0.65rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">🧠 ${isArabic ? 'النظرية' : 'Theory'}</div>`;
        MENU_MIDDLE.forEach(item => {
            html += `<a href="${item.href}" style="color:#fff;padding:5px 10px;border-radius:6px;text-decoration:none;display:flex;align-items:center;gap:8px;transition:0.3s;border-bottom:1px solid rgba(106,227,255,0.03);font-size:0.82rem;">
                        <span style="font-size:0.9rem;">${item.icon}</span> ${isArabic ? item.name : item.nameEn}
                     </a>`;
        });
        html += `</div>`;

        html += `<div style="border-bottom:2px solid rgba(0,255,128,0.15); padding-bottom:6px; margin-bottom:8px;">`;
        html += `<div style="color:#00ff80; font-size:0.65rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">⬇️ ${isArabic ? 'تنزيل الواحة' : 'Download Waha'}</div>`;
        html += `<div onclick="window.downloadWaha('apk')" style="color:#fff;padding:5px 10px;border-radius:6px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.82rem;">
                    <span>📱</span> ${isArabic ? 'تنزيل APK' : 'Download APK'}
                 </div>`;
        html += `<div onclick="window.downloadWaha('zip')" style="color:#fff;padding:5px 10px;border-radius:6px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.82rem;">
                    <span>📦</span> ${isArabic ? 'تنزيل ZIP' : 'Download ZIP'}
                 </div>`;
        html += `</div>`;

        html += `<div style="border-bottom:2px solid rgba(255,106,106,0.15); padding-bottom:6px; margin-bottom:8px;">`;
        html += `<div style="color:#ff6a6a; font-size:0.65rem; font-weight:bold; letter-spacing:1px; margin-bottom:4px;">💬 ${isArabic ? 'آخر المحادثات' : 'Recent Chats'} <span style="font-size:0.6rem; opacity:0.6;">(${MENU_BOTTOM.length})</span></div>`;
        if (MENU_BOTTOM.length === 0) {
            html += `<div onclick="window.openChatPrompt()" style="padding:4px 10px; border-radius:6px; font-size:0.75rem; color:#ff6a6a; cursor:pointer; text-align:center;">
                        💬 ${isArabic ? 'اضغط هنا لبدء المحادثة' : 'Click here to start chatting'}
                     </div>`;
        } else {
            MENU_BOTTOM.forEach(item => {
                const chat = item.chatData || {};
                html += `<div onclick="window.openChatPrompt()" style="padding:4px 10px; border-radius:6px; font-size:0.75rem; color:#ccc; display:flex; justify-content:space-between; cursor:pointer;">
                            <span style="flex:1;">💬 ${isArabic ? chat.message || item.name : chat.message || item.nameEn}</span>
                            <span style="font-size:0.6rem; color:#666;">${chat.time || ''}</span>
                         </div>`;
            });
        }
        html += `</div>`;
        dropdown.innerHTML = html;
    }

    function buildHamburgerMenu() {
        const oldMenu = document.getElementById('hamburger-menu');
        if (oldMenu) oldMenu.remove();
        const oldDropdown = document.getElementById('menu-dropdown');
        if (oldDropdown) oldDropdown.remove();

        const menuContainer = document.createElement('div');
        menuContainer.id = 'hamburger-menu';
        menuContainer.style.cssText = `position: fixed !important; top: 75px !important; right: 20px !important; z-index: 9999 !important; cursor: pointer !important; background: linear-gradient(135deg, #ffd700, #f0a500) !important; color: #0a0a0f !important; padding: 8px 14px !important; border-radius: 10px !important; font-size: 13px !important; font-weight: bold !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; font-family: 'Cairo', 'Tahoma', sans-serif !important;`;
        menuContainer.innerHTML = `<div style="display:flex;flex-direction:column;gap:3px;width:20px;height:14px;justify-content:center;"><span style="display:block;height:2px;background:#0a0a0f;"></span><span style="display:block;height:2px;background:#0a0a0f;"></span><span style="display:block;height:2px;background:#0a0a0f;"></span></div><span>${isArabic ? 'القائمة' : 'Menu'}</span>`;

        const dropdown = document.createElement('div');
        dropdown.id = 'menu-dropdown';
        dropdown.style.cssText = `display: none !important; position: fixed !important; top: 125px !important; right: 20px !important; background: rgba(10, 10, 20, 0.97) !important; border: 2px solid #ffd700 !important; border-radius: 16px !important; padding: 18px 16px !important; min-width: 300px !important; max-height: 70vh !important; overflow-y: auto !important; z-index: 9998 !important; flex-direction: column !important; direction: ${isArabic ? 'rtl' : 'ltr'} !important; font-family: 'Cairo', 'Tahoma', sans-serif !important;`;

        document.body.appendChild(menuContainer);
        document.body.appendChild(dropdown);
        buildDropdownMenu();

        let isOpen = false;
        menuContainer.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.style.display = isOpen ? 'none' : 'flex';
            isOpen = !isOpen;
        });
        document.addEventListener('click', function(e) {
            if (!menuContainer.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
                isOpen = false;
            }
        });
    }

    window.openChatPrompt = function() {
        const message = prompt(isArabic ? '💬 اكتب رسالتك:' : '💬 Write your message:');
        if (message && message.trim()) {
            window.saveChatMessage(message.trim());
            alert(isArabic ? '✅ تم إرسال رسالتك بنجاح!' : '✅ Message sent successfully!');
        }
    };

    window.downloadWaha = function(type) {
        const defaultName = type === 'apk' ? 'Waha-AlJabri.apk' : 'Waha-AlJabri.zip';
        const folder = prompt(isArabic ? '📁 ادخل اسم المجلد للحفظ:' : '📁 Enter folder name to save:', 'Download');
        if (folder === null) return;
        const filename = prompt(isArabic ? '📝 ادخل اسم الملف:' : '📝 Enter file name:', defaultName);
        if (filename === null) return;

        // غير الرابطين هذي لروابطك
        const downloadUrl = type === 'apk' 
            ? 'https://github.com/jabri-com/waha/releases/download/v1.0/Waha-AlJabri.apk' 
            : 'https://github.com/jabri-com/waha/archive/refs/heads/main.zip';

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        alert(isArabic 
            ? `✅ بدأ التنزيل!\nالمجلد: ${folder}\nالملف: ${filename}` 
            : `✅ Download started!\nFolder: ${folder}\nFile: ${filename}`);
    };

    document.addEventListener('DOMContentLoaded', function() {
        updateBottomMenu();
        buildMainMenu();
        buildHamburgerMenu();
        console.log('🌴 menu.js v5.0.5 - Bilingual + Download');
    });

    window.updateChatMenu = updateBottomMenu;
    window.saveChat = window.saveChatMessage;

})();