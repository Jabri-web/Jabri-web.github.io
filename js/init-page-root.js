// ================================================================
// init-page-root.js — v6.3 (Final Stable - No White Screen)
// Heaven Al-Jabri | واحة الجبري
// ================================================================
(function() {
  'use strict';
  console.log('🛡️ [init] v6.3 Final Stable...');

  const IS_APK = location.protocol === 'file:' || navigator.userAgent.includes('wv');

  function detectPageMode() {
    const s = document.currentScript;
    const src = [document.body?.dataset?.pageMode, document.documentElement?.dataset?.pageMode, s?.dataset?.pageMode].map(v=>String(v||'').toLowerCase()).find(v=>['safe','minimal','full'].includes(v));
    if(src) return src;
    if(s?.hasAttribute('data-no-splash')) return 'safe';
    const path = location.pathname.toLowerCase();
    if(['/admin','/test','/debug','/temp','/dev','/redirect','/app/catalog'].some(p=>path.startsWith(p))) return 'safe';
    // v6.3: الافتراضي SAFE - لا شاشة بيضاء أبدا
    return 'safe';
  }

  let PAGE_MODE = 'safe';
  let splashHidden = true;
  function hideSplash(){
    if(splashHidden) return;
    splashHidden = true;
    const el = document.getElementById('splashScreen');
    if(el){ el.classList.add('hidden'); setTimeout(()=>el.remove(), 600); }
  }
  // fail-safe إجباري
  setTimeout(hideSplash, 3500);

  function createSplash(){
    if(PAGE_MODE!== 'full') return;
    if(document.getElementById('splashScreen')) return;
    splashHidden = false;
    const style = document.createElement('style');
    style.textContent = `#splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;transition:opacity.5s}#splashScreen.hidden{opacity:0;pointer-events:none}.splash-logo{width:90px;height:90px;border-radius:50%;border:3px solid #c9a84c}`;
    document.head.appendChild(style);
    const div = document.createElement('div');
    div.id = 'splashScreen';
    div.innerHTML = `<img src="/icon-192.png" onerror="this.style.display='none'" class="splash-logo"><div style="color:#6ae3ff;font-weight:900;margin-top:15px">واحة الجبري</div>`;
    (document.body||document.documentElement).prepend(div);
  }

  function loadHTMLFile(id, file, onOk){
    const ph = document.getElementById(id);
    if(!ph){ onOk?.(); return; }
    fetch(file+(IS_APK?'':'?_t='+Date.now())).then(r=>{if(!r.ok)throw new Error(r.status); return r.text()}).then(html=>{
      ph.innerHTML = html;
      ph.dataset.loaded='true';
      [...ph.querySelectorAll('script')].forEach(old=>{
        if(old.src && old.src.includes('menu.js')) return;
        const s=document.createElement('script');
        [...old.attributes].forEach(a=>s.setAttribute(a.name,a.value));
        if(old.src){ s.src=old.src; old.replaceWith(s); } else { s.textContent=old.textContent; old.replaceWith(s); }
      });
      onOk?.();
    }).catch(()=>{ ph.innerHTML='<div style="height:60px"></div>'; onOk?.(); hideSplash(); });
  }

  function _getCurrentLang(){ return location.pathname.toLowerCase().startsWith('/en/')?'en':'ar'; }
  function _getCurrentFile(){ let p=location.pathname.replace(/^\/(ar|en)(\/|$)/i,'/').replace(/\/+$/,''); if(p===''||p==='/')return 'index.html'; const f=p.split('/').pop(); return (!f||f.indexOf('.')===-1)?'index.html':f; }
  function switchLanguage(){ const c=_getCurrentLang(); const t=c==='ar'?'en':'ar'; location.href='/'+t+'/'+_getCurrentFile(); }
  window.switchLanguage=switchLanguage; window.toggleLang=switchLanguage;

  function init(){
    try{
      PAGE_MODE = detectPageMode();
      window.__WAHA_PAGE_MODE = PAGE_MODE;
      document.documentElement.lang=_getCurrentLang();
      document.documentElement.dir=document.documentElement.lang==='ar'?'rtl':'ltr';
      console.log('📋 [mode]',PAGE_MODE);
      if(PAGE_MODE==='full') createSplash();
      let loaded=0; const done=()=>{ if(++loaded>=2) setTimeout(hideSplash,200); };
      loadHTMLFile('header-placeholder','header.html',()=>{ document.dispatchEvent(new CustomEvent('headerLoaded')); done(); });
      loadHTMLFile('footer-placeholder','footer.html',()=>{ document.dispatchEvent(new CustomEvent('footerLoaded')); done(); });
      if(!document.getElementById('header-placeholder')) setTimeout(hideSplash,100);
    }catch(e){ console.error(e); hideSplash(); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();