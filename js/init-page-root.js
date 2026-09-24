// init-page-root.js — v7.3.2 (No White Screen + Safe 404)
(function(){
  'use strict';
  console.log('🛡️ [init] v7.3.2...');

  const IS_APK = location.protocol === 'file:' || navigator.userAgent.includes('wv');

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
    return 'full'; // ✅ full افتراضياً
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
  // fail-safe لا يترك شاشة بيضاء أبداً
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

  // تحميل لا يخرب التصميم
  function loadHTMLFile(id, file, onOk){
    const ph=document.getElementById(id);
    if(!ph){ onOk?.(); return; }
    const url = asset(file);

    // هيكل مؤقت يمنع التخربش
    if(!ph.innerHTML.trim()) ph.innerHTML = '<div style="height:60px"></div>';

    fetch(url + (IS_APK?'':'?_t='+Date.now()), {cache:'no-store'})
     .then(r=>{ if(!r.ok) throw new Error(r.status); return r.text(); })
     .then(html=>{
        ph.innerHTML = html;
        ph.dataset.loaded='true';
        // تنفيذ السكربتات بالترتيب
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

  // ✅ v7.3.2: لا يتدخل إذا المسار .html
  function handle404NonBlocking(){
    const path = location.pathname;

    // ✅ ① إذا المسار ينتهي بـ .html → تخطي (الصفحة موجودة)
    if (path.endsWith('.html')) {
      console.log('ℹ️ [404] مسار .html — تخطي');
      return;
    }

    // ✅ ② روابط خاصة
    if(['/','/ar','/ar/','/en','/en/'].includes(path)) return;

    // ✅ ③ استخرج المسار النظيف
    const clean = path.replace(/^\/(ar|en)(\/|$)/i,'/');
    if(clean==='/' || clean==='') return;

    // ✅ ④ حماية ضد loop
    const key='waha_404_'+path;
    try{ if(sessionStorage.getItem(key)) return; sessionStorage.setItem(key,'1'); }catch(e){}

    // ✅ ⑤ المرشحات في الثلاثي (مع + بدون .html)
    const bases = [`/ar${clean}`, `/en${clean}`, clean];
    let candidates = [];
    bases.forEach(b=>{
      if(b===path) return;
      candidates.push(b);                    // /about-waha
      candidates.push(b + '.html');          // /about-waha.html
      candidates.push(b + '/index.html');    // /about-waha/index.html
    });
    candidates = [...new Set(candidates)].slice(0,8);

    console.log('🔍 [404] تجرب:', candidates);

    setTimeout(()=>{
      let i=0;
      const tryNext=()=>{
        if(i>=candidates.length) return;
        fetch(asset(candidates[i]), {method:'HEAD', cache:'no-store'})
        .then(r=>{
           if(r.ok){
             console.log('✅ وجدتها:', candidates[i]);
             location.replace(candidates[i]+location.search+location.hash);
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

      handle404NonBlocking(); // ✅ غير معطل للصفحة

    }catch(e){ console.error(e); hideSplash(); }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();