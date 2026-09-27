// init-page-root.js v12.1 FINAL - clean
(function(){
'use strict';
console.log('[init] v12.1');

const IS_APK = location.protocol==='file:' || location.hostname==='' ||!!window.AndroidBridge;
function asset(p){ const c=String(p||'').replace(/^\//,''); return IS_APK? c : '/'+c; }

const MEMORY = ["about-waha.html","ar/about-waha.html","en/about-waha.html","all-links.html","ar/all-links.html","en/all-links.html","index.html","Sanaa.html","Shibam.html"];

async function loadHTMLFile(id,file){
 const ph=document.getElementById(id); if(!ph) return false;
 try{
  const res=await fetch(asset(file)+'?_t='+Date.now(),{cache:'no-store'});
  if(!res.ok) return false;
  ph.innerHTML=await res.text(); ph.dataset.loaded='true';
  ph.querySelectorAll('script').forEach(old=>{
    if(old.src && old.src.includes('menu.js')) return;
    const s=document.createElement('script');
    [...old.attributes].forEach(a=>s.setAttribute(a.name,a.value));
    s.textContent=old.textContent; if(old.src) s.src=old.src;
    old.replaceWith(s);
  }); return true;
 }catch{ return false; }
}

function buildCandidates(p){
 let clean=p.replace(/^\/+/,'').replace(/\/+$/,'').trim(); if(!clean) return [];
 let pure=clean.replace(/^(ar|en)\//i,''); let base=pure.split('/').pop().replace(/\.html$/i,''); if(!base) return [];
 return [...new Set([base+'.html','ar/'+base+'.html','en/'+base+'.html', pure+'.html'])];
}

window.switchLanguage = window.toggleLanguage = function(){
 const path=location.pathname;
 const pure=path.replace(/^\/(ar|en)(\/|$)/i,'/').replace(/^\/+/,'') || 'all-links.html';
 const lower=path.toLowerCase();
 if(lower.startsWith('/en')) location.href='/ar/'+pure+location.search+location.hash;
 else if(lower.startsWith('/ar')) location.href='/en/'+pure+location.search+location.hash;
 else location.href='/en/'+pure+location.search+location.hash;
};

async function fileExists(url){
 const clean=url.replace(/^\//,'').toLowerCase();
 if(MEMORY.includes(clean)) return true;
 try{ const r=await fetch(url,{cache:'no-store'}); return r.ok; }catch{ return false; }
}

async function smart404(){
 if(IS_APK) return;
 const path=location.pathname; const lower=path.toLowerCase().replace(/\/+$/,'');
 if(['','/','/ar','/en','/index.html','/ar/index.html','/en/index.html','/ar/all-links.html','/en/all-links.html','/all-links.html'].includes(lower)) return;
 if(/\.(js|css|png|jpg|jpeg|svg|webp|json|txt|xml|ico|woff2?|map|pdf|mp3|mp4)$/i.test(lower)) return;
 for(const c of buildCandidates(path)){
   const t='/'+c; if(t.toLowerCase()===lower) continue;
   if(await fileExists(t)){ location.replace(t+location.search+location.hash); return; }
 }
 const isEn=lower.startsWith('/en');
 location.replace((isEn?'/en/all-links.html':'/ar/all-links.html')+'?from='+encodeURIComponent(path));
}

async function init(){
 let lang=location.pathname.toLowerCase().startsWith('/en')? 'en':'ar';
 document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'? 'rtl':'ltr';
 await loadHTMLFile('header-placeholder','header.html');
 await loadHTMLFile('footer-placeholder','footer.html');
 await smart404();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();