// ================================================================
// 🛡️ init-page-root.js
// Version: 8.3.2 — "المرعبة المصلحة - النسخة النهائية"
// FIX: مقارنة case-sensitive + استرجاع toggleLang + تنفيذ السكربتات
// ================================================================
(function() {
  'use strict';
  const VERSION='8.3.2'; const BUILD_DATE='2026-10-06';
  const BASE_URL='https://jabri-com.vercel.app';
  const DEFAULT_CONFIG={
    splash:true, header:true, footer:true, detect404:true,
    version:true, music:true, autoFixLinks:true, netToasts:true,
    autoHideSplashAfter:4000, auto404TryAfter:1500,
    allLinksPath:'/all-links.html', indexPath:'/index.html', wahaPath:'/Page11.html'
  };
  const CONFIG=Object.assign({},DEFAULT_CONFIG,window.JABRI_CONFIG||{});
  let splashHidden=false;

  function bustCache(url){ const sep=url.includes('?')?'&':'?'; return url+sep+'v='+VERSION+'&_t='+Date.now(); }
  function withVersion(url){ const sep=url.includes('?')?'&':'?'; return url+sep+'v='+VERSION; }

  async function fileExists(url){
    try{
      const c=new AbortController(); const tid=setTimeout(()=>c.abort(),2500);
      const res=await fetch(url,{method:'GET',headers:{'Range':'bytes=0-0'},signal:c.signal,cache:'no-store',redirect:'manual'});
      clearTimeout(tid); c.abort();
      return res.ok||res.status===206||res.status===0;
    }catch(e){ return false; }
  }

  // 📂 قائمة الملفات
  const FILE_LIST={files:new Set(),loaded:false,loading:null, lowerMap:new Map()};
  async function loadFileList(){
    if(FILE_LIST.loaded) return FILE_LIST.files;
    if(FILE_LIST.loading) return FILE_LIST.loading;
    FILE_LIST.loading=(async()=>{
      try{
        // دعم WAHA_FILE_LOADER إن وُجد
        if(typeof window.WAHA_FILE_LOADER==='function'){
          const arr=await window.WAHA_FILE_LOADER();
          if(Array.isArray(arr)&&arr.length){
            arr.forEach(p=>{ if(!p) return; const full=p.startsWith('/')?p:'/'+p; FILE_LIST.files.add(full); FILE_LIST.lowerMap.set(full.toLowerCase(), full); });
            FILE_LIST.loaded=true; return FILE_LIST.files;
          }
        }
        const res=await fetch(bustCache('/file-all4.txt'),{cache:'no-store'});
        const text=await res.text();
        text.split(/\r?\n/).forEach(l=>{
          l=l.trim(); if(!l||l.startsWith('#')||l.includes('⛔')||l.includes('...')) return;
          l=l.replace(/^[A-Z]?\d+\.\s+/,'').replace(/\s*⭐.*$/,'').split(/\s+/)[0].replace(/["']/g,'');
          if(!/\.\w{2,5}$/.test(l)) return;
          const p=l.startsWith('/')?l:'/'+l;
          FILE_LIST.files.add(p);
          FILE_LIST.lowerMap.set(p.toLowerCase(), p);
        });
        FILE_LIST.loaded=true; return FILE_LIST.files;
      }catch(e){ FILE_LIST.loaded=true; return FILE_LIST.files; }
    })(); return FILE_LIST.loading;
  }
  function fileInList(path){ if(!FILE_LIST.loaded||FILE_LIST.files.size===0) return null; return FILE_LIST.files.has(path); }

  // 🎯 توليد صيغ بديلة للرابط
  function generateVariants(rawPath){
    const variants=new Set();
    let clean=rawPath.trim();
    if(!clean.startsWith('/')) clean='/'+clean;

    variants.add(clean);
    variants.add(clean.toLowerCase());

    // /AR-project.html -> /project-ar.html
    let m=clean.match(/^\/(AR|EN)[-_](.+)/i);
    if(m){ variants.add('/'+m[2].replace(/\.html$/i,'')+'-'+m[1].toLowerCase()+'.html'); }

    // /project-AR.html -> /project-ar.html
    m=clean.match(/^\/(.+)[-_](AR|EN)\.html$/i);
    if(m){ variants.add('/'+m[1].toLowerCase()+'-'+m[2].toLowerCase()+'.html'); }

    return [...variants];
  }

  async function resolveFileSmart(rawPath){
    await loadFileList();
    const vars=generateVariants(rawPath);
    // 1. فحص سريع من الخريطة
    for(const v of vars){
      const found=FILE_LIST.lowerMap.get(v.toLowerCase());
      if(found) return found;
    }
    // 2. فحص عبر fetch
    for(const v of vars){
      if(await fileExists(v)) return v;
    }
    return null;
  }

  function autoFixLinks(){
    if(!CONFIG.autoFixLinks) return;
    document.querySelectorAll('a[href]').forEach(a=>{
      const orig=a.getAttribute('href'); if(!orig) return;
      const trimmed=orig.trim();
      if(/^(https?:|\/\/|mailto:|tel:|javascript:|#)/i.test(trimmed)) return;
      if(/\.[a-z0-9]{2,5}([?#]|$)/i.test(trimmed)) return;
      if(trimmed.endsWith('/')) return;
      const pathPart=trimmed.split(/[?#]/)[0]; if(!pathPart) return;
      const qs=trimmed.substring(pathPart.length);
      a.setAttribute('href',pathPart+'.html'+qs);
    });
  }

  // 🚨 404: يصلح الاسم أو يروح للخريطة
  async function handle404Redirect(){
    const path=location.pathname;
    console.log('🔍 404 trying to fix:',path);
    const fixed=await resolveFileSmart(path);
    
    // ⚡ المقارنة يجب أن تكون حساسة لحالة الأحرف
    if(fixed && fixed !== path){
      console.log(`✅ Fixed ${path} -> ${fixed}`);
      location.href=fixed; 
      return;
    }
    
    console.log('❌ No fix -> map');
    location.href=CONFIG.allLinksPath;
  }

  async function detect404(){
    if(!CONFIG.detect404||window.__jabri404Standalone) return;
    let is404=false;
    if(document.body&&document.body.dataset.waha404==='true') is404=true;
    if(!is404&&document.title.toLowerCase().includes('404')) is404=true;
    if(!is404){
      try{
        const c=new AbortController(); const tid=setTimeout(()=>c.abort(),2000);
        const res=await fetch(location.href,{method:'GET',headers:{'Range':'bytes=0-0'},signal:c.signal,cache:'no-store',redirect:'manual'});
        clearTimeout(tid); c.abort(); if(res.status===404) is404=true;
      }catch(e){}
    }
    if(is404) await handle404Redirect();
  }

  function injectBarFix(){
    const style=document.createElement('style');
    style.id='jabri-bar-fix-v832';
    style.textContent=`
      #header-placeholder{position:fixed!important;top:0!important;left:0!important;right:0!important;height:68px!important;z-index:10001!important;background:rgba(10,10,15,0.92)!important;backdrop-filter:blur(8px);pointer-events:none!important;}
     .top-header-buttons{position:fixed!important;top:12px!important;left:12px!important;right:12px!important;width:auto!important;height:44px!important;z-index:10002!important;background:transparent!important;pointer-events:none!important;display:flex!important;justify-content:space-between!important;align-items:center!important;}
     .top-header-buttons > *{pointer-events:auto!important;}
      body{padding-top:68px!important;}
     .brand-card,.btn-b,button,a{position:relative!important;z-index:2!important;pointer-events:auto!important;}
      #site-footer{z-index:2!important;padding-bottom:90px!important;}
     .bottom-bar{z-index:10000!important;}
    `;
    document.head.appendChild(style);
  }

  function hideSplash(){ if(splashHidden) return; splashHidden=true; const el=document.getElementById('splashScreen'); if(el){ el.classList.add('hidden'); setTimeout(()=>{try{el.remove();}catch(e){}},600); } }
  function createSplash(){ if(!CONFIG.splash||!document.body||document.getElementById('splashScreen')) return; const html=`<div id="splashScreen"><div class="splash-title">واحة الجبري</div><div class="splash-sub">تراث اليمن العريق</div><div class="spinner"></div><div class="splash-version">v${VERSION}</div><style>#splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10003;transition:opacity.6s ease}#splashScreen.hidden{opacity:0;pointer-events:none}#splashScreen.splash-title{color:#6ae3ff;font-size:2.5rem;font-weight:900}.splash-sub{color:#888;font-size:1.1rem;margin-top:8px}.spinner{width:40px;height:40px;margin-top:30px;border:3px solid rgba(106,227,255,.1);border-top:3px solid #6ae3ff;border-radius:50%;animation:spin 1s linear infinite}.splash-version{position:absolute;bottom:20px;color:#444;font-size:12px}@keyframes spin{to{transform:rotate(360deg)}}</style></div>`; const div=document.createElement('div'); div.innerHTML=html; document.body.prepend(div.firstElementChild); setTimeout(hideSplash,CONFIG.autoHideSplashAfter); }

  // 🛠️ تنفيذ السكربتات داخل الجزء المحقون
  function safelyExecuteScripts(container){
    container.querySelectorAll('script').forEach(old=>{
      try{
        if(old.src){ const s=document.createElement('script'); s.src=withVersion(old.src); s.async=false; if(!document.querySelector(`script[src="${s.src}"]`)) document.head.appendChild(s); }
        else if(old.textContent.trim()){ try{ new Function(old.textContent).call(window); }catch(e){ const s=document.createElement('script'); s.textContent=old.textContent; document.head.appendChild(s); } }
      }catch(err){}
    });
  }

  async function loadPartial(id,fileName,evt,isHeader){
    const el=document.getElementById(id);
    if(!el||el.dataset.loaded==='true'){ if(isHeader) setTimeout(hideSplash,500); return; }
    const fallback=el.innerHTML.trim();
    try{
      const res=await fetch(bustCache(fileName),{cache:'no-store'});
      if(!res.ok) throw new Error(res.status);
      el.innerHTML=await res.text();
      el.dataset.loaded='true';
      el.dataset.version=VERSION;
      el.style.display='';
      safelyExecuteScripts(el);          // ✅ تنفيذ السكربتات
      if(CONFIG.autoFixLinks) autoFixLinks(); // ✅ إصلاح الروابط
      document.dispatchEvent(new CustomEvent(evt,{detail:{version:VERSION}}));
      if(isHeader) setTimeout(hideSplash,300);
    }catch(e){ if(fallback) el.dataset.loaded='true'; if(isHeader) setTimeout(hideSplash,500); }
  }

  // 🌐 toggleLang — استرجاع الدالة
  function getBasePath(){ const p=location.pathname; const m=p.match(/^(.*?)\/(ar|en)(\/|$)/i); if(m) return m[1]; return p.substring(0,p.lastIndexOf('/')); }
  function getFileName(){ const p=location.pathname; const b=getBasePath(); const w=p.substring(b.length).replace(/^\/(ar|en)(\/|$)/i,'/').replace(/^\/+/,''); return w||'all-links.html'; }
  async function toggleLang(){
    const path=location.pathname; const qs=location.search+location.hash; const lang=document.documentElement.lang;
    const base=getBasePath(); const file=getFileName(); const lower=path.toLowerCase();
    let targetLang= lower.includes('/en/')?'ar': lower.includes('/ar/')?'en': (lang==='ar'?'en':'ar');
    await loadFileList();
    const isArSuffix=/-ar\.html$/i.test(file);
    let candidates=[];
    if(targetLang==='ar'){
      candidates.push(file.replace(/-e?n?\.html$/i,'-ar.html'));
      candidates.push(file.replace(/\.html$/i,'-ar.html'));
    } else {
      if(isArSuffix){
        candidates.push(file.replace(/-ar\.html$/i,'.html'));
        candidates.push(file.replace(/-ar\.html$/i,'-en.html'));
      } else {
        candidates.push(file.replace(/\.html$/i,'-en.html'));
      }
    }
    candidates.push(base+'/'+targetLang+'/'+file);
    candidates.push('/'+targetLang+'/'+file);
    candidates.push('/'+file);
    candidates=[...new Set(candidates)];
    for(let cand of candidates){
      if(!cand.startsWith('/')) cand='/'+cand;
      if(fileInList(cand)===true){ location.href=cand+qs; return; }
      if(fileInList(cand)===null && await fileExists(cand)){ location.href=cand+qs; return; }
    }
    location.href=CONFIG.allLinksPath;
  }

  function init(){
    loadFileList(); createSplash(); injectBarFix();
    if(CONFIG.header) loadPartial('header-placeholder','/header.html','headerLoaded',true);
    if(CONFIG.footer) loadPartial('footer-placeholder','/footer.html','footerLoaded',false);
    if(CONFIG.autoFixLinks) autoFixLinks();
    setTimeout(()=>detect404(),800);
    window.addEventListener('load',()=>setTimeout(hideSplash,1000));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();

  // 📤 التصدير الكامل
  window.Jabri={
    version:VERSION, config:CONFIG, fileExists, resolveFileSmart, generateVariants,
    handle404Redirect, loadPartial, loadFileList, fileInList, hideSplash,
    autoFixLinks, FILE_LIST, toggleLang
  };
  window.toggleLang=toggleLang;
  window.switchLanguage=toggleLang;
  window.toggleLanguage=toggleLang;

  console.log(`✅ المرعبة v${VERSION} ready`);
})();