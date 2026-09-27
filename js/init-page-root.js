// init-page-root.js — v10.0 FINAL "المرعبة -> all-links.html"
(function(){
  'use strict';
  console.log('👁️ [init] v10.0 FINAL — Anti-404 -> all-links');

  const IS_APK = location.protocol === 'file:' || location.hostname === '' ||!!window.AndroidBridge;
  const FALLBACK_LIST = [
    "index.html", "logo.html", "catalog.html", "all-links.html", "table-all.html", "monitor.html",
    "Page1.html", "Page2.html", "Page3.html", "Page4.html", "Page5.html", "Page6.html",
    "Page7.html", "Page8.html", "Page9.html", "Page10.html", "Page11.html", "Page12.html",
    "about.html", "about-ar.html", "about-en.html", "about-waha.html",
    "Author-cv.html", "author-history.html", "cv-2026a.html", "cv-2026e.html", "founder.html", "profile.html", "profile-en.html",
    "theory-ar.html", "theory-en.html", "Sindbad-theory.html", "Sindbad-Brdoni.html",
    "research.html", "research-deep.html", "Pages-Researches.html",
    "Sanaa.html", "Shibam.html", "Soqatra.html", "Yemen-library.html", "gallery.html", "yemen-photo.html", "yemen-photo2.html",
    "journal.html", "journal2.html", "journal3.html", "journal4.html", "History-pdf.html",
    "calculator.html", "handsa.html", "char-balance.html", "Check.html", "magic-translator.html", "diagnose.html",
    "Dbase.html", "Dbase-deep.html", "microtik.html", "Office.html", "source.html", "citations.html", "music.html",
    "taraif.html", "Nezar.html", "wonder.html", "heaven-info.html", "visitor.html", "who-we.html", "project.html", "poster.html",
    "contact.html", "FAQPage.html", "FAQPage-en.html", "privacy-policy.html", "404.html",
    "file-structure.html", "Router-all.html", "repos-auto.html", "explore.html",
    "dashboard.html", "dashboard-pro.html", "catalogue.html",
    "ar/index.html", "ar/about.html", "ar/about-waha.html", "ar/contact.html", "ar/journal.html", "ar/profile.html", "ar/project.html", "ar/Router-all.html", "ar/Page4.html", "ar/Page10.html", "ar/Page11.html", "ar/Page12.html", "ar/dashboard.html", "ar/all-links.html",
    "en/index.html", "en/about.html", "en/about-waha.html", "en/contact.html", "en/journal.html", "en/profile.html", "en/project.html", "en/Router-all.html", "en/Page4.html", "en/Page10.html", "en/Page11.html", "en/Page12.html", "en/dashboard.html", "en/all-links.html",
    "game/game-auto.html", "publish/publish.html",
    "technical-guide.html", "all-link-doc.html", "update-tracker.html"
  ];

  let FILE_LIST = []; let fileListReady = false;
  function asset(p){ const c=String(p||'').replace(/^\//,''); return IS_APK? c : '/' + c; }
  async function loadFileList(){
    if(IS_APK){ FILE_LIST=FALLBACK_LIST; fileListReady=true; return; }
    try{
      let res=await fetch(asset('file-all4.txt')+'?_t='+Date.now(),{cache:'no-store'});
      if(!res.ok) res=await fetch(asset('file-all3.txt')+'?_t='+Date.now(),{cache:'no-store'});
      if(!res.ok) throw new Error(res.status);
      const text=await res.text(); const set=new Set();
      const regex=/^\s*\d{1,4}[\.\)\-]\s*([a-z0-9\/\-_]+\.(?:html|txt|json|xml|js|css))\b/gim;
      let m; while((m=regex.exec(text))!==null){ const f=m[1].trim(); if(!f.includes('dashboard-pro')) set.add(f); }
      if(set.size<10){ text.split('\n').forEach(line=>{ const t=line.trim(); if(!t||t.startsWith('#')) return; const cl=t.split(/\s+/).pop(); if(/\.html$/i.test(cl)) set.add(cl); }); }
      FILE_LIST=set.size>10? [...set] : FALLBACK_LIST;
    }catch(e){ FILE_LIST=FALLBACK_LIST; } fileListReady=true;
  }
  function detectPageMode(){ const s=document.currentScript; const m=[document.body?.dataset?.pageMode, document.documentElement?.dataset?.pageMode, s?.dataset?.pageMode].map(v=>String(v||'').toLowerCase()).find(v=>['safe','full','minimal'].includes(v)); if(m) return m; if(s?.hasAttribute('data-no-splash')) return 'safe'; return 'full'; }
  const PAGE_MODE=detectPageMode();
  let splashEl=null;
  function createSplash(msg){ if(PAGE_MODE!=='full'||document.getElementById('splashScreen')) return; const style=document.createElement('style'); style.textContent=`#splashScreen{position:fixed;inset:0;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;transition:opacity.5s}#splashScreen.hidden{opacity:0;pointer-events:none}`; document.head.appendChild(style); const d=document.createElement('div'); d.id='splashScreen'; d.innerHTML=`<div id="splashMsg" style="color:#6ae3ff;font-weight:900;margin-top:15px">${msg||'جارٍ التحميل...'}</div>`; document.body.prepend(d); splashEl=d; }
  const setSplashMsg=(m)=>{ const e=document.getElementById('splashMsg'); if(e) e.textContent=m; };
  const hideSplash=()=>{ if(!splashEl) return; const el=splashEl; splashEl=null; el.classList.add('hidden'); setTimeout(()=>el.remove(),700); };
  window.addEventListener('load',()=>setTimeout(hideSplash,800)); setTimeout(hideSplash,6000);
  async function loadHTMLFile(id,file){ const ph=document.getElementById(id); if(!ph) return false; try{ const res=await fetch(asset(file)+'?_t='+Date.now(),{cache:'no-store'}); if(!res.ok) throw new Error(res.status); ph.innerHTML=await res.text(); ph.dataset.loaded='true'; return true; }catch{ return false; } }

  // === هذا هو التعديل القاتل للمرعبة ===
  const existsCache=new Map(); const visitedTargets=new Set();
  async function fileExists(url){
    const clean=url.replace(/^\//,'').toLowerCase().split('?')[0].split('#')[0];
    if(existsCache.has(clean)) return existsCache.get(clean);
    const inMem=FILE_LIST.map(f=>f.toLowerCase()).includes(clean)||FALLBACK_LIST.map(f=>f.toLowerCase()).includes(clean);
    if(inMem){ existsCache.set(clean,true); return true; }
    if(IS_APK){ existsCache.set(clean,false); return false; }
    try{ const r=await fetch(asset(url),{method:'GET',cache:'no-store'}); existsCache.set(clean,r.ok); return r.ok; }catch{ existsCache.set(clean,false); return false; }
  }

  function buildTripleCandidates(requestPath){
    let clean=requestPath.replace(/^\/+/,'').trim(); let folder=''; let name=clean;
    if(clean.includes('/')){ const parts=clean.split('/'); name=parts.pop()||''; folder=parts.join('/')+'/'; }
    let baseName=name.replace(/\.html$/i,'').toLowerCase(); if(!baseName) return [];
    const cands=[];
    cands.push(`${baseName}.html`); cands.push(`ar/${baseName}.html`); cands.push(`en/${baseName}.html`);
    if(folder) cands.push(`${folder}${baseName}.html`);
    return [...new Set(cands)];
  }
  function findInTriple(requestPath){
    if(!fileListReady||!FILE_LIST.length) return null;
    const cands=buildTripleCandidates(requestPath); const lowerList=FILE_LIST.map(f=>f.toLowerCase());
    for(const cand of cands){ const idx=lowerList.indexOf(cand.toLowerCase()); if(idx!==-1) return FILE_LIST[idx]; const base=cand.split('/').pop(); const idx2=lowerList.findIndex(f=>f.toLowerCase().split('/').pop()===base.toLowerCase()); if(idx2!==-1) return FILE_LIST[idx2]; }
    return null;
  }

  async function smart404(){
    if(IS_APK) return;
    const path=location.pathname; const pathClean=path.replace(/\/+$/,'')||'/'; const lowerPath=pathClean.toLowerCase();
    if(['/','/ar','/en','/index.html','/ar/index','/en/index','/all-links.html','/ar/all-links.html','/en/all-links.html'].includes(lowerPath)) return;
    if(/\.(js|css|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|map|json|txt|xml|pdf|mp3|mp4|webm|php)$/i.test(path)) return;
    const loopKey='waha_404_'+lowerPath;
    try{ if(sessionStorage.getItem(loopKey)||visitedTargets.has(lowerPath)) return; sessionStorage.setItem(loopKey,Date.now().toString()); visitedTargets.add(lowerPath); }catch(e){}
    if(lowerPath.includes('all-links')) return;
    if(!splashEl) createSplash('🔍 جارٍ البحث...');

    const candidates=buildTripleCandidates(pathClean);
    // جرب تلقى الملف
    for(const cand of candidates){
      const t='/'+cand;
      if(t.toLowerCase()===lowerPath) continue;
      if(await fileExists(t)){ location.replace(t+location.search+location.hash); return; }
    }
    const found=findInTriple(pathClean);
    if(found){ const target='/'+found; if(target.toLowerCase()!==lowerPath){ location.replace(target+location.search+location.hash); return; } }

    // === شرطك: لو فشل البحث → افتح all-links.html مباشرة ===
    const lang=lowerPath.startsWith('/en')? 'en' : 'ar';
    location.replace(`/${lang}/all-links.html?from=`+encodeURIComponent(pathClean));
  }

  window.switchLanguage=window.toggleLanguage=function(){
    const path=location.pathname; const clean=path.replace(/^\/(ar|en)(\/|$)/i,'/')||'/';
    const isAr=/^\/ar(\/|$)/i.test(path); location.href=(isAr? '/en':'/ar')+(clean==='/'? '/':clean)+location.search+location.hash;
  };

  async function init(){
    try{
      const lang=location.pathname.toLowerCase().startsWith('/en')? 'en':'ar';
      document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'? 'rtl':'ltr';
      if(PAGE_MODE==='full') createSplash('جارٍ التحميل...');
      await loadFileList();
      await loadHTMLFile('header-placeholder','header.html');
      await loadHTMLFile('footer-placeholder','footer.html');
      await smart404();
      setTimeout(hideSplash,200);
    }catch(e){ hideSplash(); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();