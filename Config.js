// file=Config.js
const CFG = {
  logo: './Logo.png',
  base: window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, ''),
  PAGES: {
    'sindbad': { file: 'Sindbad.html', ar: 'السندباد', en: 'Sindbad Home' }, // = شاشة الموقع الرئيسية
    'yemen-sindbad': { file: 'Yemen-Sindbad.html', ar: 'سندباد اليمن', en: 'Yemen Sindbad' },
    'yemen-bird': { file: 'Yemen-bird.html', ar: 'طائر اليمن', en: 'Yemen Bird' },
    'yemen-ankboot': { file: 'Yemen-Ankboot.html', ar: 'عنكبوت اليمن', en: 'Yemen Ankboot' },
    'pages-researches': { file: 'Pages-Researches.html', ar: 'البحوث', en: 'Pages A2 Researches3' },
    'yemen-library': { file: 'Yemen-library.html', ar: 'مكتبتي', en: 'My Library' }
  },
  go: function(key) {
    const page = this.PAGES[key.toLowerCase()];
    if (page) {
      window.location.href = this.base + '/' + page.file;
    } else {
      alert('الصفحة غير موجودة: ' + key);
    }
  },
  exit: function() {
    if (window.history.length > 1) window.history.back();
    else alert('اغلق الصفحة يدوياً');
  },
  
  list: function(lang = 'ar', targetId = null) {
    const pages = Object.entries(this.PAGES);
    const items = pages.map(([key, page]) => {
      const name = lang === 'en' ? page.en : page.ar; // اختار اللغة صح
      return `<li style="margin:8px 0;"><button onclick="CFG.go('${key}')">${name}</button></li>`;
    }).join('');
    
    const html = `<ul style="list-style:none; padding:0; margin:0;">${items}</ul>`;
    
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) el.innerHTML = html;
      return;
    }
    return html;
  }
};
