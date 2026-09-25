// init-page-root.js — v8.3.9 "المرعبة FBI — Triple Focus"
// Smart 404 + Sequential Boot + Tri-Lang + Network Diagnostics + Splash Recovery
// + 🆕 Triple Focus: البحث فقط في (/, /ar/, /en/) + رفض /image/ فوراً
(function(){
  'use strict';
  console.log('👁️ [init] v8.3.9 — FBI Triple Focus... locked & armed');

  const IS_APK = location.protocol === 'file:' || navigator.userAgent.includes('wv');

  /* ============ 1) أدوات المسار ============ */
  function asset(path){
    const clean = String(path||'').replace(/^\//,'');
    return IS_APK? clean : '/' + clean;
  }

  /* ============ 2) وضع الصفحة ============ */
  function detectPageMode(){
    const s = document.currentScript;
    const m = [document.body?.dataset?.pageMode,
               document.documentElement?.dataset?.pageMode,
               s?.dataset?.pageMode]
     .map(v=>String(v||'').toLowerCase())
     .find(v=>['safe','full','minimal'].includes(v));
    if(m) return m;
    if(s?.hasAttribute('data-no-splash')) return 'safe';
    if(location.pathname.toLowerCase().startsWith('/app/catalog')) return 'safe';
    return 'full';
  }
  const PAGE_MODE = detectPageMode();
  window.__WAHA_PAGE_MODE = PAGE_MODE;

  /* ============ 3) شاشة الانتظار - محصنة ============ */
  let splashEl = null;
  function createSplash(msg){
    if(PAGE_MODE!== 'full' || document.getElementById('splashScreen')) return;
    const st = document.createElement('style');
    st.id = 'splash-style';
    st.textContent = `
      #splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;
        align-items:center;justify-content:center;z-index:999999;transition:opacity.5s ease}
      #splashScreen.hidden{opacity:0;pointer-events:none}
      #splashScreen.msg{color:#6ae3ff;font-weight:900;margin-top:15px;font-size:15px;min-height:22px;text-align:center;padding:0 20px}
      #splashScreen.bar{width:180px;height:3px;background:#1a1a25;border-radius:3px;margin-top:14px;overflow:hidden}
      #splashScreen.bar::after{content:'';display:block;height:100%;width:40%;background:#c9a84c;
        animation:sp 1.2s infinite ease-in-out}
      @keyframes sp{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
    `;
    document.head.appendChild(st);
    const d = document.createElement('div');
    d.id = 'splashScreen';
    d.innerHTML = `
      <img src="${asset('icon-192.png')}" style="width:90px;height:90px;border-radius:50%;border:3px solid #c9a84c" onerror="this.style.display='none'">
      <div class="msg" id="splashMsg">${msg || 'جارٍ التحميل...'}</div>
      <div class="bar"></div>
    `;
    document.body.prepend(d);
    splashEl = d;
  }
  function setSplashMsg(msg){
    const el = document.getElementById('splashMsg');
    if(el) el.textContent = msg;
  }
  function hideSplash(){
    if(!splashEl) return;
    const el = splashEl;
    splashEl = null;
    el.classList.add('hidden');
    setTimeout(()=>{
      el.remove();
      document.getElementById('splash-style')?.remove();
    }, 700);
  }
  window.addEventListener('load', ()=> setTimeout(hideSplash, 1000));
  setTimeout(hideSplash, 6000);

  /* ============ 4) تحميل HTML مع فلترة menu.js ============ */
  function loadHTMLFile(id, file){
    return new Promise(resolve=>{
      const ph = document.getElementById(id);
      if(!ph){ resolve(false); return; }
      const url = asset(file) + (IS_APK? '' : '?_t=' + Date.now());
      if(!ph.innerHTML.trim()) ph.innerHTML = '<div style="height:60px"></div>';

      fetch(url, {cache:'no-store'})
       .then(r=>{ if(!r.ok) throw new Error(r.status); return r.text(); })
       .then(html=>{
          ph.innerHTML = html;
          ph.dataset.loaded = 'true';
          const scripts = [...ph.querySelectorAll('script')];
          scripts.forEach(old=>{
            if(old.src && old.src.toLowerCase().includes('menu.js')){ old.remove(); return; }
            const s = document.createElement('script');
            [...old.attributes].forEach(a=>s.setAttribute(a.name, a.value));
            s.textContent = old.textContent;
            if(old.src) s.src = old.src;
            old.replaceWith(s);
          });
          resolve(true);
        })
       .catch(()=> resolve(false));
    });
  }

  /* ============ 5) اكتشاف 404 — FBI Triple Focus ============ */
  async function fileExists(url){
    if(IS_APK) return true;
    try{
      let r = await fetch(asset(url), {method:'HEAD', cache:'no-store'});
      if(!r.ok && [400, 405, 501].includes(r.status)){
        r = await fetch(asset(url), {method:'GET', cache:'no-store'});
      }
      return r.ok;
    }catch(e){ return false; }
  }

  async function smart404(){
    const path = location.pathname;
    const pathClean = path.replace(/\/+$/, '') || '/';

    // تجاهل الصفحات الرئيسية
    if(['/','/ar','/en','/index.html','/index','/ar/index','/en/index'].includes(pathClean.toLowerCase())) return;

    // 🛡️ حماية الملفات الثابتة
    if(/\.(js|css|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|map|json|txt|xml|pdf|mp3|mp4|webm|php)$/i.test(path)) return;

    // 🆕 رفض المسارات غير المرغوبة (مثل /image/ أو /assets/) فوراً
    if(/^\/(image|images|assets|css|js|fonts|uploads|media)(\/|$)/i.test(pathClean)) {
      console.log('🚫 [404] مسار غير مرغوب، توجيه للرئيسية:', pathClean);
      const lang = path.toLowerCase().startsWith('/en') ? 'en' : 'ar';
      location.replace(`/${lang}/` + location.search + location.hash);
      return;
    }

    const key = 'waha_404_' + pathClean;
    try{
      if(sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key,'1');
    }catch(e){}

    // تنظيف بسيط (إزالة /ar أو /en)
    const clean = pathClean.replace(/^\/(ar|en)(\/|$)/i, '/') || '/';
    if(clean === '/' || clean === '') return;

    // هل الصفحة فيها محتوى حقيقي؟
    const hasHeader = document.getElementById('header-placeholder')?.dataset?.loaded === 'true';
    const hasFooter = document.getElementById('footer-placeholder')?.dataset?.loaded === 'true';
    const hasMain = document.querySelector('main')?.children.length >= 3;
    if(hasHeader || hasFooter || hasMain) return;

    if(!splashEl){
      createSplash('🔍 جارٍ البحث عن الصفحة...');
    } else {
      document.getElementById('splashScreen')?.classList.remove('hidden');
    }
    setSplashMsg('🔍 جارٍ البحث عن الصفحة...');

    const hasHtml = clean.toLowerCase().endsWith('.html');
    const basePath = hasHtml? clean.slice(0, -5) : clean;

    // 🆕 الحل السحري: ar-page → ar-page.html
    if(!hasHtml){
      const directHtml = clean + '.html';
      if(await fileExists(directHtml)){
        setSplashMsg('✅ وجدناها! جارٍ الفتح...');
        console.log('🔄 [404] إضافة .html تلقائياً:', directHtml);
        location.replace(directHtml + location.search + location.hash);
        return;
      }
    }

    // 🆕 البحث فقط في الثلاثي: /, /ar/, /en/
    let candidates;
    if(hasHtml){
      candidates = ['/ar' + basePath + '.html', '/en' + basePath + '.html', basePath + '.html'];
    } else {
      candidates = [
        basePath + '.html',
        '/ar' + basePath + '.html',
        '/en' + basePath + '.html',
        basePath,
        '/ar' + basePath,
        '/en' + basePath,
      ];
    }
    candidates = [...new Set(candidates)].filter(c => c.replace(/\/+$/,'') !== pathClean);

    console.log('%c🔎 [smart404] غير موجودة:', 'color:#f59e0b;font-weight:bold', pathClean, candidates);

    for(const c of candidates){
      if(await fileExists(c)){
        setSplashMsg('✅ وجدناها! جارٍ الفتح...');
        location.replace(c + location.search + location.hash);
        return;
      }
    }

    // خريطة الموقع
    setSplashMsg('🗺️ فتح خريطة الموقع...');
    for(const c of ['/all-links.html','/ar/all-links.html','/en/all-links.html']){
      if(c.replace(/\/+$/,'') !== pathClean && await fileExists(c)){
        location.replace(c);
        return;
      }
    }

    // العودة للرئيسية
    setSplashMsg('🏠 العودة للرئيسية...');
    setTimeout(()=>{
      const lang = path.toLowerCase().startsWith('/en')? 'en' : 'ar';
      location.replace(`/${lang}/` + location.search + location.hash);
    }, 600);
  }

  /* ============ 6) toggleLanguage ============ */
  window.switchLanguage = window.toggleLang = window.toggleLanguage = function(){
    const path = location.pathname;
    const clean = path.replace(/^\/(ar|en)(\/|$)/i, '/') || '/';
    const isAr = /^\/ar(\/|$)/i.test(path);
    const newPath = (isAr? '/en' : '/ar') + (clean === '/'? '/' : clean);
    location.href = newPath + location.search + location.hash;
  };

  /* ============ 7) تشخيص الشبكة — IT Analyst ============ */
  (function networkNotifier(){
    if(!('onLine' in navigator) || document.getElementById('netBar')) return;
    const st = document.createElement('style');
    st.id = 'netBar-style';
    st.textContent = `#netBar{position:fixed;top:0;left:0;right:0;z-index:999998;padding:9px 14px;text-align:center;font-weight:900;font-size:13px;color:#fff;font-family:system-ui;transform:translateY(-100%);transition:transform.35s cubic-bezier(.4,0,.2,1);box-shadow:0 2px 12px rgba(0,0,0,.35);pointer-events:none}#netBar.show{transform:translateY(0)}`;
    document.head.appendChild(st);
    const bar = document.createElement('div'); bar.id='netBar'; document.body.appendChild(bar);
    let hideTimer=null;
    const LOG_KEY='waha_net_log'; const MAX_LOG=100;
    function logEvent(m){ try{ const l=JSON.parse(sessionStorage.getItem(LOG_KEY)||'[]'); l.push({t:new Date().toISOString(),m}); if(l.length>MAX_LOG) l.shift(); sessionStorage.setItem(LOG_KEY,JSON.stringify(l)); }catch(e){} }
    function getLog(){ try{ return JSON.parse(sessionStorage.getItem(LOG_KEY)||'[]'); }catch(e){ return []; } }
    function show(msg,bg,autoHide){ bar.textContent=msg; bar.style.background=bg; bar.classList.add('show'); clearTimeout(hideTimer); if(autoHide) hideTimer=setTimeout(()=>bar.classList.remove('show'),autoHide); logEvent(msg); }
    async function checkRealInternet(){
      if(IS_APK) return navigator.onLine;
      try{ const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),3000); await fetch(asset('favicon.ico')+'?_='+Date.now(),{method:'HEAD',cache:'no-store',signal:ctrl.signal}); clearTimeout(timer); return true; }catch(e){ return false; }
    }
    async function measureSpeed(){
      try{ const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),5000); const t0=performance.now(); await fetch(asset('favicon.ico')+'?_='+Date.now(),{cache:'no-store',signal:ctrl.signal}); clearTimeout(timer); return Math.round(performance.now()-t0); }catch(e){ return -1; }
    }
    let lastState=null, checking=false;
    async function updateStatus(){
      if(checking) return; checking=true;
      const online=await checkRealInternet(); checking=false;
      if(lastState===null){ lastState=online; if(!online) show('⚠️ لا يوجد اتصال بالإنترنت','linear-gradient(90deg,#b91c1c,#dc2626)',0); return; }
      if(online===lastState) return; lastState=online;
      if(online) show('✅ عاد الاتصال بالإنترنت','linear-gradient(90deg,#059669,#10b981)',2500);
      else show('⚠️ لا يوجد اتصال بالإنترنت','linear-gradient(90deg,#b91c1c,#dc2626)',0);
    }
    window.addEventListener('online', ()=>setTimeout(updateStatus,300));
    window.addEventListener('offline', ()=>setTimeout(updateStatus,300));
    setInterval(updateStatus,20000); setTimeout(updateStatus,2000);

    window.__testNetBar={
      offline:()=>show('⚠️ لا يوجد اتصال بالإنترنت','linear-gradient(90deg,#b91c1c,#dc2626)',0),
      online:()=>show('✅ عاد الاتصال بالإنترنت','linear-gradient(90deg,#059669,#10b981)',2500),
      slow:()=>show('🐌 الاتصال بطيء — قد يتأخر التحميل','linear-gradient(90deg,#b45309,#f59e0b)',3500),
      hide:()=>bar.classList.remove('show'),
      check:()=>updateStatus(),
      speed: async()=>{ const ms=await measureSpeed(); if(ms<0){ show('❌ فشل قياس السرعة','linear-gradient(90deg,#b91c1c,#dc2626)',2500); return -1; } const label=ms<200?'⚡ سريع':ms<800?'👍 جيد':'🐌 بطيء'; show(`${label} — ${ms}ms`,'linear-gradient(90deg,#0369a1,#0ea5e9)',3000); return ms; },
      log:()=>{ const log=getLog(); if(!log.length){ console.log('📋 السجل فارغ'); return []; } console.table(log); return log; },
      clear:()=>{ try{sessionStorage.removeItem(LOG_KEY);}catch(e){} console.log('🗑️ تم مسح السجل'); },
      status: async()=>{ const online=await checkRealInternet(); const ms=online?await measureSpeed():-1; const info={online,latency_ms:ms,effectiveType:navigator.connection?.effectiveType||'unknown',downlink:navigator.connection?.downlink||'unknown',log_count:getLog().length,protocol:location.protocol}; console.table(info); return info; }
    };
  })();

  /* ============ 8) التهيئة ============ */
  async function init(){
    try{
      const lang = location.pathname.toLowerCase().startsWith('/en')? 'en' : 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar'? 'rtl' : 'ltr';
      if(PAGE_MODE === 'full') createSplash('جارٍ التحميل...');

      setSplashMsg('📥 تحميل الهيدر...');
      const headerOK = await loadHTMLFile('header-placeholder', 'header.html');
      document.dispatchEvent(new CustomEvent('headerLoaded', {detail:{ok:headerOK}}));

      setSplashMsg('📥 تحميل الفوتر...');
      await loadHTMLFile('footer-placeholder', 'footer.html');

      if(!document.getElementById('header-placeholder') &&!document.getElementById('footer-placeholder')){
        hideSplash();
      } else {
        setSplashMsg('✨ جاهز');
        setTimeout(hideSplash, 250);
      }
      await smart404();
    }catch(e){
      console.error('❌ init error:', e);
      hideSplash();
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();