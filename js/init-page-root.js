// init-page-root.js — v7.3.2 (No White Screen + Safe 404 + Clean URLs)
(function(){
  'use strict';
  console.log('🛡️ [init] v7.3.2 (المرعبة المصححة)...');

  const IS_APK = location.protocol === 'file:' || navigator.userAgent.includes('wv');

  // 🛡️ حماية فورية: تنظيف الرابط من أي سلاش مزدوج (//) قبل أي عملية
  if (location.pathname.includes('//')) {
      const cleanUrl = location.pathname.replace(/\/+/g, '/');
      window.history.replaceState(null, '', cleanUrl + location.search + location.hash);
      console.log('🧹 [المرعبة] تم تنظيف الرابط المزدوج:', cleanUrl);
  }

  // حل مشكلة المسارات
  function asset(path){
    const clean = path.replace(/^\//,'');
    return IS_APK? clean : '/' + clean;
  }

  function detectPageMode(){
    const s = document.currentScript;
    const m = [document.body?.dataset?.pageMode, document.documentElement?.dataset?.pageMode, s?.dataset?.pageMode]
     .map(v=>String(v||'').toLowerCase()).find(v=>['safe','full','minimal'].includes(v));
    if(m) return m;
    if(s?.hasAttribute('data-no-splash')) return 'safe';
    if(location.pathname.toLowerCase().startsWith('/app/catalog')) return 'safe';
    return 'full'; 
  }

  let PAGE_MODE = detectPageMode();
  window.__WAHA_PAGE_MODE = PAGE_MODE;
  let splashHidden = true;

  function hideSplash(){
    if(splashHidden) return;
    splashHidden = true;
    const el = document.getElementById('splashScreen');
    if(el){ el.classList.add('hidden'); setTimeout(()=>{ el.remove(); document.getElementById('splash-style')?.remove(); },700); }
  }
  
  window.addEventListener('load', ()=> setTimeout(hideSplash, 800));
  setTimeout(hideSplash, 3500);

  function createSplash(){
    if(PAGE_MODE!== 'full' || document.getElementById('splashScreen')) return;
    splashHidden = false;
    const st = document.createElement('style');
    st.id='splash-style';
    st.textContent=`#splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;transition:opacity.5s}#splashScreen.hidden{opacity:0;pointer-events:none}`;
    document.head.appendChild(st);
    const d=document.createElement('div');
    d.id='splashScreen';
    d.innerHTML=`<img src="${asset('icon-192.png')}" style="width:90px;height:90px;border-radius:50%;border:3px solid #c9a84c"><div style="color:#6ae3ff;font-weight:900;margin-top:15px">واحة الجبري</div>`;
    document.body.prepend(d);
  }

  function loadHTMLFile(id, file, onOk){
    const ph=document.getElementById(id);
    if(!ph){ onOk?.(); return; }
    const url = asset(file);

    if(!ph.innerHTML.trim()) ph.innerHTML = '<div style="height:60px"></div>';

    fetch(url + (IS_APK?'':'?_t='+Date.now()), {cache:'no-store'})
     .then(r=>{ if(!r.ok) throw new Error(r.status); return r.text(); })
     .then(html=>{
        ph.innerHTML = html;
        ph.dataset.loaded='true';
        const scripts=[...ph.querySelectorAll('script')];
        scripts.forEach(old=>{
          if(old.src && old.src.includes('menu.js')) return;
          const s=document.createElement('script');
          [...old.attributes].forEach(a=>s.setAttribute(a.name,a.value));
          s.textContent = old.textContent;
          if(old.src) s.src = old.src;
          old.replaceWith(s);
        });
        onOk?.();
      })
     .catch(()=>{ onOk?.(); });
  }

  // ✅ دالة 404 المصححة (تمنع السلاش المزدوج نهائياً)
  function handle404NonBlocking(){
    const path = location.pathname;
    
    // 1. إذا كان الرابط ينتهي بـ .html أو صفحة رئيسية، لا تتدخل
    if (path.endsWith('.html') || ['/', '/ar','/ar/','/en','/en/'].includes(path)) {
      return;
    }

    // 2. استخرج المسار النظيف (بدون /ar أو /en)
    let clean = path.replace(/^\/(ar|en)(\/|$)/i,'/');
    if(clean==='/' || clean==='') return;

    // 3. تنظيف المسار من أي سلاش مزدوج
    clean = clean.replace(/\/+/g, '/');

    const key='waha_404_'+path;
    try{ if(sessionStorage.getItem(key)) return; sessionStorage.setItem(key,'1'); }catch(e){}

    // 4. بناء المرشحات بشكل ذكي
    let candidates = [];
    
    const addCandidate = (c) => {
        let safe = c.replace(/\/+/g, '/'); // إزالة أي سلاش مزدوج
        if (!safe.startsWith('/')) safe = '/' + safe;
        if (safe !== path) candidates.push(safe);
    };

    // إضافة المرشحات: كما هو، مع .html، مع index.html
    addCandidate(clean);
    addCandidate(clean + '.html');
    addCandidate(clean + '/index.html');

    // إضافة مرشحات اللغات فقط إذا لم تكن موجودة في الرابط الأصلي
    if (!path.startsWith('/ar/') && !path.startsWith('/en/')) {
        addCandidate('/ar' + clean);
        addCandidate('/ar' + clean + '.html');
        addCandidate('/en' + clean);
        addCandidate('/en' + clean + '.html');
    }

    // إزالة التكرارات وأي رابط يحتوي على //
    candidates = [...new Set(candidates)]
        .filter(c => !c.includes('//'))
        .slice(0, 8);

    console.log('🔍 [المرعبة] تجرب:', candidates);

    setTimeout(()=>{
      let i=0;
      const tryNext=()=>{
        if(i>=candidates.length) return;
        fetch(asset(candidates[i]), {method:'HEAD', cache:'no-store'})
        .then(r=>{
           if(r.ok){
             console.log('✅ وجدتها:', candidates[i]);
             // تأكد من نظافة الرابط النهائي قبل الانتقال
             const finalUrl = candidates[i].replace(/\/+/g, '/');
             location.replace(finalUrl + location.search + location.hash);
           }else{ i++; tryNext(); }
         })
        .catch(()=>{ i++; tryNext(); });
      };
      tryNext();
    }, 700);
  }

  // اللغة - تحافظ على المسار الفرعي
  window.switchLanguage = function(){
    const isEn = location.pathname.toLowerCase().startsWith('/en');
    const target = isEn? 'ar' : 'en';
    let p = location.pathname;
    if(/^\/(ar|en)(\/|$)/i.test(p)){
      p = p.replace(/^\/(ar|en)/i, '/'+target);
    } else {
      p = `/${target}${p.startsWith('/')?p:'/'+p}`;
    }
    location.href = p + location.search + location.hash;
  };
  window.toggleLang = window.switchLanguage;

  function init(){
    try{
      document.documentElement.lang = location.pathname.toLowerCase().startsWith('/en')?'en':'ar';
      document.documentElement.dir = document.documentElement.lang==='ar'?'rtl':'ltr';

      if(PAGE_MODE==='full') createSplash();

      loadHTMLFile('header-placeholder','header.html',()=>{
        document.dispatchEvent(new CustomEvent('headerLoaded'));
        if(PAGE_MODE==='full') setTimeout(hideSplash, 200);
      });
      loadHTMLFile('footer-placeholder','footer.html',()=>{
        if(PAGE_MODE!=='full') hideSplash();
      });

      if(!document.getElementById('header-placeholder')) hideSplash();

      handle404NonBlocking(); 

    }catch(e){ console.error(e); hideSplash(); }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();