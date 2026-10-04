// ================================================================
// 🛡️ init-page-root.js
// Version: 8.3.0 — "المرعبة الخفيفة - ما تغلقش الأزرار"
// Build: 2026-10-04
// Author: Jabri-Com
// FIX: يحل روابط جوجل الغلط بدون ما يغلق الأزرار
// ================================================================

(function() {
  'use strict';
  const VERSION='8.3.0'; const BUILD_DATE='2026-10-04';
  const BASE_URL='https://jabri-com.vercel.app';
  const VERSION_FILE='/version.json';
  const DEFAULT_CONFIG={
    splash:true, header:true, footer:true, detect404:true,
    version:true, music:true, autoFixLinks:true, netToasts:true,
    autoHideSplashAfter:4000, auto404TryAfter:2000,
    allLinksPath:'/all-links.html', indexPath:'/index.html', wahaPath:'/Page11.html'
  };
  const CONFIG=Object.assign({},DEFAULT_CONFIG,window.JABRI_CONFIG||{});
  console.log(`🛡️ [init] v${VERSION} — المرعبة الخفيفة`,CONFIG);
  let splashHidden=false;

  function bustCache(url){ const sep=url.includes('?')?'&':'?'; return url+sep+'v='+VERSION+'&_t='+Date.now(); }
  function withVersion(url){ const sep=url.includes('?')?'&':'?'; return url+sep+'v='+VERSION; }

  // 🔥 fileExists - Range check
  async function fileExists(url){
    try{
      const c=new AbortController(); const tid=setTimeout(()=>c.abort(),3000);
      const res=await fetch(url,{method:'GET',headers:{'Range':'bytes=0-0'},signal:c.signal,cache:'no-store',redirect:'manual'});
      clearTimeout(tid); c.abort();
      return res.ok||res.status===206||res.status===0;
    }catch(e){ return false; }
  }

  // 🎯 resolveFile - يحل مشكلة بدون html
  async function resolveFile(rawPath){
    let clean=(rawPath||'').trim(); if(!clean) return null;
    const candidates=[clean];
    if(!clean.startsWith('/')) candidates.push('/'+clean);
    if(!clean.endsWith('.html')){
      candidates.push(clean+'.html');
      if(!clean.startsWith('/')) candidates.push('/'+clean+'.html');
    }
    const basePath=getBasePath();
    if(basePath&&!clean.startsWith('/')){
      candidates.push(basePath+'/'+clean);
      if(!clean.endsWith('.html')) candidates.push(basePath+'/'+clean+'.html');
    }
    const unique=[...new Set(candidates)];
    for(const c of unique){ if(await fileExists(c)) return c; }
    if(await fileExists('/all-links.html')) return '/all-links.html';
    return null;
  }

  function autoFixLinks(){
    if(!CONFIG.autoFixLinks) return; let fixed=0;
    document.querySelectorAll('a[href]').forEach(a=>{
      const orig=a.getAttribute('href'); if(!orig) return;
      const trimmed=orig.trim();
      if(/^(https?:|\/\/|mailto:|tel:|javascript:|#)/i.test(trimmed)) return;
      if(/\.[a-z0-9]{2,5}([?#]|$)/i.test(trimmed)) return;
      if(trimmed.endsWith('/')) return;
      const pathPart=trimmed.split(/[?#]/)[0]; if(!pathPart) return;
      const qs=trimmed.substring(pathPart.length);
      a.setAttribute('href',pathPart+'.html'+qs); fixed++;
    });
    if(fixed>0) console.log(`✅ [links] fixed ${fixed}`);
  }

  // 📂 FILE_LIST
  const FILE_LIST={files:new Set(),loaded:false,loading:null};
  async function loadFileList(){
    if(FILE_LIST.loaded) return FILE_LIST.files;
    if(FILE_LIST.loading) return FILE_LIST.loading;
    FILE_LIST.loading=(async()=>{
      try{
        if(typeof window.WAHA_FILE_LOADER==='function'){
          const arr=await window.WAHA_FILE_LOADER();
          if(Array.isArray(arr)&&arr.length){
            arr.forEach(p=>{ if(!p) return; FILE_LIST.files.add(p.startsWith('/')?p:'/'+p); });
            FILE_LIST.loaded=true; return FILE_LIST.files;
          }
        }
        const res=await fetch(bustCache('/file-all4.txt'),{cache:'no-store'});
        const text=await res.text();
        text.split(/\r?\n/).forEach(l=>{
          l=l.trim(); if(!l||l.startsWith('#')||l.includes('⛔')||l.includes('...')) return;
          l=l.replace(/^[A-Z]?\d+\.\s+/,'').replace(/\s*⭐.*$/,'').split(/\s+/)[0].replace(/["']/g,'');
          if(!/\.\w{2,5}$/.test(l)) return;
          FILE_LIST.files.add(l.startsWith('/')?l:'/'+l);
        });
        FILE_LIST.loaded=true; return FILE_LIST.files;
      }catch(e){ FILE_LIST.loaded=true; return FILE_LIST.files; }
    })(); return FILE_LIST.loading;
  }
  function fileInList(path){ if(!FILE_LIST.loaded||FILE_LIST.files.size===0) return null; return FILE_LIST.files.has(path); }

  // 📡 Network - خفيف ما يغطيش
  const NET={container:null,toastTimeout:4000,slowThreshold:5000,offlineShown:false,slowTimer:null,loadStart:{},autoDismissTimers:{}};
  function ensureNetContainer(){
    if(NET.container&&document.body.contains(NET.container)) return NET.container;
    const c=document.createElement('div');
    c.id='jabri-net-toasts';
    c.style.cssText='position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:10002;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:90vw;';
    document.body.appendChild(c); NET.container=c; return c;
  }
  function showNetToast(msg,type,dur){
    if(!CONFIG.netToasts) return null; type=type||'info'; dur=dur===undefined?NET.toastTimeout:dur;
    const colors={info:{bg:'linear-gradient(135deg,#6ae3ff,#3aa0c4)',fg:'#0a0a0f'},ok:{bg:'linear-gradient(135deg,#06d6a0,#05b98a)',fg:'#0a0a0f'},warn:{bg:'linear-gradient(135deg,#ffd166,#f0a500)',fg:'#0a0a0f'},err:{bg:'linear-gradient(135deg,#ff6b6b,#e85555)',fg:'#fff'},offline:{bg:'linear-gradient(135deg,#8b0000,#5c0000)',fg:'#fff'}};
    const c=colors[type]||colors.info;
    const toast=document.createElement('div');
    toast.style.cssText=`background:${c.bg};color:${c.fg};padding:12px 22px;border-radius:30px;font-weight:700;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:auto;display:flex;align-items:center;gap:8px;opacity:0;transform:translateY(-20px);transition:opacity.3s,transform.3s;white-space:nowrap;`;
    toast.innerHTML=`<span style="flex:1;text-align:right">${msg}</span><span style="cursor:pointer;opacity:.7" onclick="this.parentNode.remove()">✕</span>`;
    ensureNetContainer().appendChild(toast);
    requestAnimationFrame(()=>{toast.style.opacity='1';toast.style.transform='translateY(0)';});
    if(dur>0) setTimeout(()=>{ try{toast.remove();}catch(e){} },dur); return toast;
  }
  function removeToast(t){ if(!t||!t.parentNode) return; t.style.opacity='0'; setTimeout(()=>{try{t.remove();}catch(e){}},300); }
  function dismissLoadToasts(name){ if(!NET.container) return; NET.container.querySelectorAll('div').forEach(t=>{ if(t.textContent&&t.textContent.includes('جاري تحميل')&&(!name||t.textContent.includes(name))) removeToast(t); }); }
  function initNetworkWatcher(){
    if(!CONFIG.netToasts) return;
    if(!navigator.onLine){ showNetToast('🔴 لا يوجد اتصال','offline',0); NET.offlineShown=true; }
    window.addEventListener('online',()=>{ showNetToast('🟢 تم استعادة الاتصال','ok',3000); NET.offlineShown=false; });
    window.addEventListener('offline',()=>{ showNetToast('🔴 انقطع الاتصال','offline',0); NET.offlineShown=true; });
  }

  // 🎬 Splash - خفيف
  function createSplash(){
    if(!CONFIG.splash||!document.body||document.getElementById('splashScreen')) return;
    const html=`<div id="splashScreen"><div class="splash-title">واحة الجبري</div><div class="splash-sub">تراث اليمن العريق</div><div class="spinner"></div><div class="splash-version">v${VERSION}</div><style>#splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10003;transition:opacity.6s ease}#splashScreen.hidden{opacity:0;pointer-events:none}#splashScreen.splash-title{color:#6ae3ff;font-size:2.5rem;font-weight:900}.splash-sub{color:#888;font-size:1.1rem;margin-top:8px}.spinner{width:40px;height:40px;margin-top:30px;border:3px solid rgba(106,227,255,.1);border-top:3px solid #6ae3ff;border-radius:50%;animation:spin 1s linear infinite}.splash-version{position:absolute;bottom:20px;color:#444;font-size:12px}@keyframes spin{to{transform:rotate(360deg)}}</style></div>`;
    const div=document.createElement('div'); div.innerHTML=html; document.body.prepend(div.firstElementChild);
    setTimeout(hideSplash,CONFIG.autoHideSplashAfter);
  }
  function hideSplash(){ if(splashHidden) return; splashHidden=true; const el=document.getElementById('splashScreen'); if(el){ el.classList.add('hidden'); setTimeout(()=>{try{el.remove();}catch(e){}},800); } }

  function getBasePath(){ const p=location.pathname; const m=p.match(/^(.*?)\/(ar|en)(\/|$)/i); if(m) return m[1]; return p.substring(0,p.lastIndexOf('/')); }
  function getFileName(){ const p=location.pathname; const b=getBasePath(); const w=p.substring(b.length).replace(/^\/(ar|en)(\/|$)/i,'/').replace(/^\/+/,''); return w||'all-links.html'; }

  // 🌐 toggleLang
  async function toggleLang(){
    const path=location.pathname; const qs=location.search+location.hash; const lang=document.documentElement.lang;
    const base=getBasePath(); const file=getFileName(); const lower=path.toLowerCase();
    let targetLang= lower.includes('/en/')?'ar': lower.includes('/ar/')?'en': (lang==='ar'?'en':'ar');
    await loadFileList();
    const langFile=base+'/'+targetLang+'/'+file;
    if(fileInList(langFile)===true||(fileInList(langFile)===null&&await checkFileExists(langFile))){ window.location.href=langFile+qs; return; }
    const rootFile='/'+file;
    if(fileInList(rootFile)===true||(fileInList(rootFile)===null&&await checkFileExists(rootFile))){ window.location.href=rootFile+qs; return; }
    window.location.href=CONFIG.allLinksPath;
  }
  async function checkFileExists(url){
    try{ const c=new AbortController(); const tid=setTimeout(()=>c.abort(),3000);
      const res=await fetch(url,{method:'GET',headers:{'Range':'bytes=0-0'},signal:c.signal,cache:'no-store',redirect:'manual'});
      clearTimeout(tid); c.abort(); return res.ok||res.status===206||res.status===0;
    }catch(e){ return false; }
  }

  function safelyExecuteScripts(container){
    container.querySelectorAll('script').forEach(old=>{
      try{
        if(old.src){ const s=document.createElement('script'); s.src=withVersion(old.src); s.async=false; if(!document.querySelector(`script[src="${s.src}"]`)) document.head.appendChild(s); }
        else if(old.textContent.trim()){ try{ new Function(old.textContent).call(window); }catch(e){ const s=document.createElement('script'); s.textContent=old.textContent; document.head.appendChild(s); } }
      }catch(err){}
    });
  }

  const KNOWN_PARTIALS=['/header.html','/footer.html'];
  async function loadPartial(id,fileName,evt,isHeader){
    const el=document.getElementById(id); if(!el||el.dataset.loaded==='true'){ if(isHeader) setTimeout(hideSplash,500); return; }
    const fallback=el.innerHTML.trim(); const label=fileName.replace(/^\//,'').replace('.html','');
    let resolved=KNOWN_PARTIALS.includes(fileName)?fileName:await resolveFile(fileName).catch(()=>null);
    if(!resolved){ if(!fallback) el.innerHTML=`<div style="text-align:center;padding:15px;color:#888">⚠️ ${fileName}</div>`; el.dataset.loaded='true'; if(isHeader) setTimeout(hideSplash,500); return; }
    try{
      const res=await fetch(bustCache(resolved),{cache:'no-store'}); if(!res.ok) throw new Error(res.status);
      el.innerHTML=await res.text(); el.dataset.loaded='true'; el.dataset.version=VERSION; el.style.display='';
      safelyExecuteScripts(el); if(CONFIG.autoFixLinks) autoFixLinks();
      document.dispatchEvent(new CustomEvent(evt,{detail:{version:VERSION}}));
      console.log(`✅ [${fileName}] loaded`); if(isHeader) setTimeout(hideSplash,300);
    }catch(e){ console.error(e); if(fallback) el.dataset.loaded='true'; if(isHeader) setTimeout(hideSplash,500); }
  }

  // 🚨 404 Overlay - فقط لما 404 حقيقي + ما يغطيش الصفحة العادية
  function show404Overlay(){
    if(document.getElementById('jabri-404-overlay')||sessionStorage.getItem('jabri404Handled')) return;
    sessionStorage.setItem('jabri404Handled','true'); hideSplash();
    let count=localStorage.getItem('jabriVisitorCount'); count=count===null?Math.floor(Math.random()*80)+20:Number(count)+1; localStorage.setItem('jabriVisitorCount',count);
    const currentPath=location.pathname; const hasHtml=currentPath.toLowerCase().endsWith('.html');
    let targetPath=hasHtml?'/'+currentPath.split('/').filter(Boolean).pop():currentPath+'.html';
    const div=document.createElement('div'); div.id='jabri-404-overlay';
    div.style.cssText=`position:fixed;inset:0;background:linear-gradient(145deg,#0b1a2e,#1a2f44);color:#f0e6d3;z-index:10004;display:flex;justify-content:center;align-items:center;direction:rtl;padding:20px;overflow-y:auto;`;
    div.innerHTML=`
      <style>
        #jabri-404-overlay.ov-container{background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);padding:30px 22px;border-radius:30px;border:1px solid rgba(255,215,150,0.2);max-width:540px;width:100%;text-align:center}
        #jabri-404-overlay.ov-404-num{font-size:5.5rem;font-weight:900;color:#b48b5a;line-height:1}
        #jabri-404-overlay.ov-title{font-size:1.3rem;margin-bottom:22px}
        #jabri-404-overlay.ov-box{background:#0b1a2e;border:1px solid #b48b5a;border-radius:14px;padding:10px 14px;margin:8px 0;text-align:right}
        #jabri-404-overlay.ov-label{font-size:0.72rem;color:#b48b5a;font-weight:700}
        #jabri-404-overlay.ov-value{font-family:monospace;font-size:0.82rem;color:#6ae3ff;direction:ltr;text-align:left;word-break:break-all;padding:6px 10px;background:rgba(106,227,255,0.05);border-radius:6px;min-height:28px}
        #jabri-404-overlay.ov-visitors{margin:14px auto;background:linear-gradient(135deg,#b48b5a,#8b6a3f);color:#0a0a0f;border-radius:40px;padding:9px 20px;font-weight:700;display:inline-block}
        #jabri-404-overlay.loader{margin:12px auto;width:38px;height:38px;border:4px solid #b48b5a;border-top-color:transparent;border-radius:50%;animation:spin404 0.9s linear infinite}
        @keyframes spin404{to{transform:rotate(360deg)}}
        #jabri-404-overlay.ov-countdown{margin:8px 0;color:#6ae3ff;font-family:monospace;font-weight:700}
        #jabri-404-overlay.ov-options{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}
        #jabri-404-overlay.ov-btn{padding:12px;border:none;border-radius:14px;font-weight:900;cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center;transition:transform.2s}
        #jabri-404-overlay.ov-btn:hover{transform:scale(1.05)}
        #jabri-404-overlay.ov-btn-map{background:linear-gradient(135deg,#6ae3ff,#3aa0c4);color:#0a0a0f}
        #jabri-404-overlay.ov-btn-home{background:linear-gradient(135deg,#ffd700,#f0a500);color:#0a0a0f}
        #jabri-404-overlay.ov-btn-waha{background:linear-gradient(135deg,#06d6a0,#05b98a);color:#0a0a0f}
        #jabri-404-overlay.ov-btn-exit{background:linear-gradient(135deg,#ff6b6b,#e85555);color:#fff}
      </style>
      <div class="ov-container">
        <div class="ov-404-num">404</div>
        <div class="ov-title">🏝️ الدرب غير موجود</div>
        <div class="ov-box"><div class="ov-label">🔍 CURRENT</div><div class="ov-value">${currentPath}</div></div>
        <div class="ov-box"><div class="ov-label">➡️ TARGET</div><div class="ov-value" id="ovTarget">${targetPath}</div></div>
        <div class="ov-box"><div class="ov-label">📊 RESULT</div><div class="ov-value" id="ovResult">⏳ جاري البحث...</div></div>
        <div class="ov-visitors">👥 الزوار: <span>${count}</span></div>
        <div class="loader"></div>
        <div class="ov-countdown" id="ovCountdown">⏱️ 7s</div>
        <div class="ov-options">
          <a href="${CONFIG.allLinksPath}" class="ov-btn ov-btn-map">🗺️ خريطة</a>
          <a href="${CONFIG.indexPath}" class="ov-btn ov-btn-home">🏠 افتتاح</a>
          <a href="${CONFIG.wahaPath}" class="ov-btn ov-btn-waha">🏝️ الواحة</a>
          <button onclick="window.exitPage()" class="ov-btn ov-btn-exit">🚪 خروج</button>
        </div>
      </div>`;
    document.body.prepend(div);
    let s=7; const cEl=document.getElementById('ovCountdown');
    const iv=setInterval(()=>{ s--; if(cEl) cEl.textContent=`⏱️ ${s}s`; if(s<=0) clearInterval(iv); },1000);
    setTimeout(()=>handle404Redirect(),CONFIG.auto404TryAfter);
  }
  window.exitPage=function(){ try{window.close();}catch(e){} setTimeout(()=>history.back(),200); setTimeout(()=>{ if(document.getElementById('jabri-404-overlay')) location.href='/'; },800); };
  async function handle404Redirect(){
    const path=location.pathname; const hasHtml=path.toLowerCase().endsWith('.html');
    const resEl=document.getElementById('ovResult'); const targetEl=document.getElementById('ovTarget');
    if(!hasHtml){
      const newPath=path+'.html'; if(targetEl) targetEl.textContent=newPath; if(resEl) resEl.textContent='🔍 GET '+newPath;
      const exists=await fileExists(newPath);
      if(exists){ if(resEl) resEl.textContent='✅ FOUND → Redirecting'; setTimeout(()=>location.href=newPath,1200); }
      else{ if(resEl) resEl.textContent='❌ → /all-links.html'; setTimeout(()=>location.href=CONFIG.allLinksPath,1500); }
      return;
    }
    const file=path.split('/').filter(Boolean).pop(); const root='/'+file; if(targetEl) targetEl.textContent=root; if(resEl) resEl.textContent='🔍 GET '+root;
    const exists=await fileExists(root);
    if(exists){ if(resEl) resEl.textContent='✅ FOUND (root)'; setTimeout(()=>location.href=root,1200); }
    else{ if(resEl) resEl.textContent='❌ → /all-links.html'; setTimeout(()=>location.href=CONFIG.allLinksPath,1500); }
  }
  async function detect404(){
    if(!CONFIG.detect404||window.__jabri404Standalone) return;
    let is404=false; let reason='';
    if(document.body&&document.body.dataset.waha404==='true'){ is404=true; reason='data-waha-404'; }
    if(!is404&&document.title.toLowerCase().includes('404')){ is404=true; reason='title'; }
    if(!is404){
      try{
        const c=new AbortController(); const tid=setTimeout(()=>c.abort(),2500);
        const res=await fetch(location.href,{method:'GET',headers:{'Range':'bytes=0-0'},signal:c.signal,cache:'no-store',redirect:'manual'});
        clearTimeout(tid); c.abort(); if(res.status===404){ is404=true; reason='Range 404'; }
      }catch(e){}
    }
    if(is404){ console.warn(`🚨 [404] ${reason}`); show404Overlay(); } else console.log('✅ [404] OK');
  }

  function setCanonical(){ const url=location.href.split('?')[0].split('#')[0]; let link=document.querySelector('link[rel="canonical"]'); if(!link){ link=document.createElement('link'); link.rel='canonical'; document.head.appendChild(link); } link.href=url; }
  function addDynamicLinks(){ /* نفس كودك القديم */ }
  function initMusic(){ if(!CONFIG.music) return; const a=document.getElementById('bgMusic'), b=document.getElementById('musicBtn'); if(!a||!b) return; a.src='/image/music1.mp3'; }

  // 🚀 CSS حق البار - المرعبة الخفيفة اللي ما تغلقش
  function injectBarFix(){
    const style=document.createElement('style');
    style.id='jabri-bar-fix-v83';
    style.textContent=`
      /* المرعبة الخفيفة - تحل /ar بدون ما تغلق الأزرار */
      #header-placeholder{
        position:fixed!important; top:0!important; left:0!important; right:0!important;
        height:68px!important; z-index:10001!important;
        background:rgba(10,10,15,0.92)!important; backdrop-filter:blur(8px);
        pointer-events:none!important;
      }
     .top-header-buttons{
        position:fixed!important; top:12px!important; left:12px!important; right:12px!important;
        width:auto!important; height:44px!important;
        z-index:10002!important; background:transparent!important;
        pointer-events:none!important; display:flex!important;
        justify-content:space-between!important; align-items:center!important;
      }
     .top-header-buttons > *{ pointer-events:auto!important; }
      body{ padding-top:68px!important; }
     .brand-card,.btn-b,button,a{ position:relative!important; z-index:2!important; pointer-events:auto!important; }
     .waha-hero,.oasis-hero{ z-index:1!important; }
      #site-footer{ z-index:2!important; padding-bottom:90px!important; }
     .bottom-bar{ z-index:10000!important; }
    `;
    document.head.appendChild(style);
    console.log('✅ bar fix v8.3 injected');
  }

  function init(){
    loadFileList(); initNetworkWatcher(); if(CONFIG.splash) createSplash();
    injectBarFix(); // حقن البار الخفيف
    const hp=CONFIG.header?loadPartial('header-placeholder','/header.html','headerLoaded',true):Promise.resolve();
    const fp=CONFIG.footer?loadPartial('footer-placeholder','/footer.html','footerLoaded',false):Promise.resolve();
    Promise.all([hp,fp]).then(()=>{ if(CONFIG.detect404) detect404(); });
    if(CONFIG.autoFixLinks) autoFixLinks();
    document.addEventListener('headerLoaded',()=>{ setCanonical(); });
    window.addEventListener('error',()=>hideSplash()); window.addEventListener('load',()=>setTimeout(hideSplash,1000));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  window.Jabri={version:VERSION,config:CONFIG,fileExists,resolveFile,loadPartial,loadFileList,fileInList,hideSplash,show404Overlay,handle404Redirect,exitPage:window.exitPage,toggleLang,autoFixLinks,FILE_LIST};
  window.toggleLang=toggleLang; window.switchLanguage=toggleLang; window.toggleLanguage=toggleLang;
  console.log(`✅ المرعبة الخفيفة v${VERSION} ready`);
})();