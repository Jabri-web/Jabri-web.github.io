// init-page-root.js — v8.3.6 "المرعبة FBI — Splash Recovery Edition"
// Smart 404 + Sequential Boot + Tri-Lang Toggle + Network Diagnostics
// + Static File Guard + HEAD→GET Fallback + all-links.html Fallback
// + .html Fix + Real Internet Check + Event Log + 🆕 Splash Recovery
(function(){
  'use strict';
  console.log('👁️ [init] v8.3.6 — المرعبة FBI (Splash Recovery)... locked & armed');

  const IS_APK = location.protocol === 'file:' || navigator.userAgent.includes('wv');

  /* ============ 1) أدوات المسار ============ */
  function asset(path){
    const clean = path.replace(/^\//,'');
    return IS_APK ? clean : '/' + clean;
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
  let PAGE_MODE = detectPageMode();
  window.__WAHA_PAGE_MODE = PAGE_MODE;

  /* ============ 3) شاشة الانتظار ============ */
  let splashHidden = true;
  function hideSplash(){
    if(splashHidden) return;
    splashHidden = true;
    const el = document.getElementById('splashScreen');
    if(el){
      el.classList.add('hidden');
      setTimeout(()=>{
        el.remove();
        document.getElementById('splash-style')?.remove();
      }, 700);
    }
  }
  window.addEventListener('load', ()=> setTimeout(hideSplash, 1000));
  setTimeout(hideSplash, 5000);

  function createSplash(msg){
    if(PAGE_MODE !== 'full' || document.getElementById('splashScreen')) return;
    splashHidden = false;
    const st = document.createElement('style');
    st.id = 'splash-style';
    st.textContent = `
      #splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;
        align-items:center;justify-content:center;z-index:999999;transition:opacity .5s}
      #splashScreen.hidden{opacity:0;pointer-events:none}
      #splashScreen .msg{color:#6ae3ff;font-weight:900;margin-top:15px;font-size:15px;min-height:22px}
      #splashScreen .bar{width:180px;height:3px;background:#1a1a25;border-radius:3px;margin-top:14px;overflow:hidden}
      #splashScreen .bar::after{content:'';display:block;height:100%;width:40%;background:#c9a84c;
        animation:sp 1.2s infinite ease-in-out}
      @keyframes sp{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
    `;
    document.head.appendChild(st);
    const d = document.createElement('div');
    d.id = 'splashScreen';
    d.innerHTML = `
      <img src="${asset('icon-192.png')}" style="width:90px;height:90px;border-radius:50%;border:3px solid #c9a84c">
      <div class="msg" id="splashMsg">${msg || 'جارٍ التحميل...'}</div>
      <div class="bar"></div>
    `;
    document.body.prepend(d);
  }
  function setSplashMsg(msg){
    const el = document.getElementById('splashMsg');
    if(el) el.textContent = msg;
  }

  /* ============ 4) تحميل HTML مع فلترة menu.js ============ */
  function loadHTMLFile(id, file){
    return new Promise(resolve=>{
      const ph = document.getElementById(id);
      if(!ph){ resolve(false); return; }
      const url = asset(file) + (IS_APK ? '' : '?_t=' + Date.now());

      if(!ph.innerHTML.trim()) ph.innerHTML = '<div style="height:60px"></div>';

      fetch(url, {cache:'no-store'})
        .then(r=>{ if(!r.ok) throw new Error(r.status); return r.text(); })
        .then(html=>{
          ph.innerHTML = html;
          ph.dataset.loaded = 'true';

          const scripts = [...ph.querySelectorAll('script')];
          scripts.forEach(old=>{
            if(old.src && old.src.includes('menu.js')){ old.remove(); return; }
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

  /* ============ 5) اكتشاف 404 — FBI Edition ============ */
  async function fileExists(url){
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
    if(['/','/ar','/ar/','/en','/en/','/index.html',
        '/index','/ar/index','/en/index'].includes(pathClean)) return;

    // 🛡️ حماية الملفات الثابتة
    if(/\.(js|css|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|map|json|txt|xml|pdf|mp3|mp4|webm|php|asp|aspx|jsp)$/i.test(path)) return;

    // منع التكرار
    const key = 'waha_404_' + pathClean;
    try{
      if(sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key,'1');
    }catch(e){}

    const clean = pathClean.replace(/^\/(ar|en)(\/|$)/i, '/') || '/';
    if(clean === '/' || clean === '') return;

    // هل الصفحة فيها محتوى حقيقي؟
    const hasHeader = document.getElementById('header-placeholder')?.dataset?.loaded === 'true';
    const hasFooter = document.getElementById('footer-placeholder')?.dataset?.loaded === 'true';
    const hasMain = document.querySelector('main')?.children.length >= 3;
    if(hasHeader || hasFooter || hasMain) return;

    /* 🆕 إعادة إظهار splash لو اختفى */
    if(splashHidden){
      createSplash('🔍 جارٍ البحث عن الصفحة...');
      splashHidden = false;
      document.getElementById('splashScreen')?.classList.remove('hidden');
    }
    setSplashMsg('🔍 جارٍ البحث عن الصفحة...');

    // منطق .html
    const hasHtml = clean.toLowerCase().endsWith('.html');
    const basePath = hasHtml ? clean : clean.replace(/\.html$/i, '');

    let candidates;
    if(hasHtml){
      candidates = [
        '/ar' + basePath,
        '/en' + basePath,
        basePath,
      ];
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

    candidates = candidates.filter(c => {
      const cClean = c.replace(/\/+$/, '');
      return cClean !== pathClean && cClean !== path;
    });

    for(const c of candidates){
      if(await fileExists(c)){
        setSplashMsg('✅ وجدناها! جارٍ الفتح...');
        console.log('🔄 [404] تحويل إلى:', c);
        location.replace(c + location.search + location.hash);
        return;
      }
    }

    // آخر مرشح: all-links.html
    setSplashMsg('🗺️ فتح خريطة الموقع...');
    console.log('🗺️ [404] تحويل إلى خريطة الموقع');

    const linksFallback = [
      '/all-links.html',
      '/ar/all-links.html',
      '/en/all-links.html',
    ].filter(c => {
      const cClean = c.replace(/\/+$/, '');
      return cClean !== pathClean;
    });

    for(const c of linksFallback){
      if(await fileExists(c)){
        location.replace(c);
        return;
      }
    }

    // آخر آخر خيار: الأندكس
    setSplashMsg('🏠 العودة للرئيسية...');
    setTimeout(()=>{
      const lang = path.toLowerCase().startsWith('/en') ? 'en' : 'ar';
      location.replace(`/${lang}/` + location.search + location.hash);
    }, 600);
  }

  /* ============ 6) toggleLanguage ============ */
  window.switchLanguage = function(){
    const path = location.pathname;
    const clean = path.replace(/^\/(ar|en)(\/|$)/i, '/') || '/';

    let newPath;
    if(/^\/ar(\/|$)/i.test(path)){
      newPath = '/en' + (clean === '/' ? '/' : clean);
    } else if(/^\/en(\/|$)/i.test(path)){
      newPath = clean;
    } else {
      newPath = '/ar' + (clean === '/' ? '/' : clean);
    }
    location.href = newPath + location.search + location.hash;
  };
  window.toggleLang = window.switchLanguage;
  window.toggleLanguage = window.switchLanguage;

  /* ============ 7) أدوات تشخيص الشبكة — IT Analyst ============ */
  (function networkNotifier(){
    if(!('onLine' in navigator)) return;
    if(document.getElementById('netBar')) return;

    const st = document.createElement('style');
    st.id = 'netBar-style';
    st.textContent = `
      #netBar{
        position:fixed;top:0;left:0;right:0;z-index:999998;
        padding:9px 14px;text-align:center;
        font-weight:900;font-size:13px;color:#fff;
        font-family:system-ui,-apple-system,sans-serif;
        transform:translateY(-100%);
        transition:transform .35s cubic-bezier(.4,0,.2,1);
        box-shadow:0 2px 12px rgba(0,0,0,.35);
        pointer-events:none;
      }
      #netBar.show{transform:translateY(0)}
    `;
    document.head.appendChild(st);

    const bar = document.createElement('div');
    bar.id = 'netBar';
    document.body.appendChild(bar);

    let hideTimer = null;
    function show(msg, bg, autoHide){
      bar.textContent = msg;
      bar.style.background = bg;
      bar.classList.add('show');
      clearTimeout(hideTimer);
      if(autoHide){
        hideTimer = setTimeout(()=>{
          bar.classList.remove('show');
        }, autoHide);
      }
      logEvent(msg);
    }
    function hide(){ bar.classList.remove('show'); }

    /* سجل الأحداث */
    const LOG_KEY = 'waha_net_log';
    const MAX_LOG = 100;

    function logEvent(msg){
      try{
        const log = JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]');
        log.push({t: new Date().toISOString(), m: msg});
        if(log.length > MAX_LOG) log.shift();
        sessionStorage.setItem(LOG_KEY, JSON.stringify(log));
      }catch(e){}
    }
    function getLog(){
      try{ return JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]'); }
      catch(e){ return []; }
    }
    function clearLog(){
      try{ sessionStorage.removeItem(LOG_KEY); }catch(e){}
    }

    /* فحص فعلي للإنترنت */
    async function checkRealInternet(){
      try{
        const ctrl = new AbortController();
        const timer = setTimeout(()=> ctrl.abort(), 3000);
        const testUrl = asset('favicon.ico') + '?_=' + Date.now();
        await fetch(testUrl, {
          method: 'HEAD',
          cache: 'no-store',
          signal: ctrl.signal
        });
        clearTimeout(timer);
        return true;
      }catch(e){ return false; }
    }

    /* قياس السرعة */
    async function measureSpeed(){
      try{
        const ctrl = new AbortController();
        const timer = setTimeout(()=> ctrl.abort(), 5000);
        const testUrl = asset('favicon.ico') + '?_=' + Date.now();
        const t0 = performance.now();
        await fetch(testUrl, {cache:'no-store', signal: ctrl.signal});
        clearTimeout(timer);
        return Math.round(performance.now() - t0);
      }catch(e){ return -1; }
    }

    let lastState = null;
    let checking = false;

    async function updateStatus(){
      if(checking) return;
      checking = true;
      const online = await checkRealInternet();
      checking = false;

      if(lastState === null){
        lastState = online;
        if(!online){
          show('⚠️ لا يوجد اتصال بالإنترنت', 'linear-gradient(90deg,#b91c1c,#dc2626)', 0);
        }
        return;
      }

      if(online === lastState) return;
      lastState = online;

      if(online){
        show('✅ عاد الاتصال بالإنترنت', 'linear-gradient(90deg,#059669,#10b981)', 2500);
      } else {
        show('⚠️ لا يوجد اتصال بالإنترنت', 'linear-gradient(90deg,#b91c1c,#dc2626)', 0);
      }
    }

    window.addEventListener('online', ()=> setTimeout(updateStatus, 300));
    window.addEventListener('offline', ()=> setTimeout(updateStatus, 300));
    setInterval(updateStatus, 20000);
    setTimeout(updateStatus, 2000);

    /* أداة IT Analyst */
    window.__testNetBar = {
      offline: ()=> show('⚠️ لا يوجد اتصال بالإنترنت', 'linear-gradient(90deg,#b91c1c,#dc2626)', 0),
      online:  ()=> show('✅ عاد الاتصال بالإنترنت', 'linear-gradient(90deg,#059669,#10b981)', 2500),
      slow:    ()=> show('🐌 الاتصال بطيء — قد يتأخر التحميل', 'linear-gradient(90deg,#b45309,#f59e0b)', 3500),
      hide:    ()=> hide(),
      check:   ()=> updateStatus(),
      speed:   async ()=>{
        const ms = await measureSpeed();
        if(ms < 0){
          show('❌ فشل قياس السرعة', 'linear-gradient(90deg,#b91c1c,#dc2626)', 2500);
          return -1;
        }
        const label = ms < 200 ? '⚡ سريع' : ms < 800 ? '👍 جيد' : '🐌 بطيء';
        show(`${label} — ${ms}ms`, 'linear-gradient(90deg,#0369a1,#0ea5e9)', 3000);
        return ms;
      },
      log: ()=>{
        const log = getLog();
        if(log.length === 0){
          console.log('📋 السجل فارغ');
          return [];
        }
        console.log('📋 سجل أحداث الشبكة (' + log.length + '):');
        console.log('─────────────────────────────────────');
        log.forEach((e,i)=>{
          const time = new Date(e.t).toLocaleTimeString('ar-YE', {hour12:false});
          console.log(`  ${String(i+1).padStart(3)}  ${time}  ${e.m}`);
        });
        console.log('─────────────────────────────────────');
        return log;
      },
      clear: ()=>{
        clearLog();
        console.log('🗑️ تم مسح سجل أحداث الشبكة');
      },
      status: async ()=>{
        const online = await checkRealInternet();
        const ms = online ? await measureSpeed() : -1;
        const log = getLog();
        const info = {
          online,
          latency_ms: ms,
          effectiveType: navigator.connection?.effectiveType || 'unknown',
          downlink: navigator.connection?.downlink || 'unknown',
          rtt: navigator.connection?.rtt || 'unknown',
          log_count: log.length,
          protocol: location.protocol,
          host: location.host
        };
        console.log('📊 حالة الشبكة:');
        console.table(info);
        return info;
      }
    };

    window.addEventListener('error', (e)=>{
      if(e.message && /network|fetch|hangup|failed/i.test(e.message)){
        logEvent('❌ ' + e.message.slice(0, 100));
      }
    }, true);

    window.addEventListener('unhandledrejection', (e)=>{
      const msg = String(e.reason || '');
      if(/network|fetch|hangup|failed|abort/i.test(msg)){
        logEvent('❌ ' + msg.slice(0, 100));
      }
    });
  })();

  /* ============ 8) التهيئة ============ */
  async function init(){
    try{
      const lang = location.pathname.toLowerCase().startsWith('/en') ? 'en' : 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';

      if(PAGE_MODE === 'full') createSplash('جارٍ التحميل...');

      setSplashMsg('📥 تحميل الهيدر...');
      const headerOK = await loadHTMLFile('header-placeholder', 'header.html');
      document.dispatchEvent(new CustomEvent('headerLoaded', {detail:{ok:headerOK}}));
      console.log(headerOK ? '✅ الهيدر تحمّل' : '⚠️ فشل تحميل الهيدر');

      setSplashMsg('📥 تحميل الفوتر...');
      const footerOK = await loadHTMLFile('footer-placeholder', 'footer.html');
      console.log(footerOK ? '✅ الفوتر تحمّل' : '⚠️ فشل تحميل الفوتر');

      if(!document.getElementById('header-placeholder') &&
         !document.getElementById('footer-placeholder')){
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

  if(document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();
})();