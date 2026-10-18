/* ============================================================
   /js/config.js — التوجيه المطلق الشامل (روابط + وسائط)
   يحل مشكلة المجلدات الناقصة ومجلد /image/ في النسخ القديمة
   ============================================================ */

const ABSOLUTE_BASE = 'https://jabri-com.vercel.app';
// أضفنا /image/ هنا لتوفير مساحة الرفع
const ABSOLUTE_DIRS = ['/publish/', '/game/', '/Jabri_5/', '/tree/', '/image/'];

function fixAbsolutePaths() {
  // 🛡️ حماية الواحة الأم — تبقى روابطها نسبية وسريعة
  if (location.hostname.includes('jabri-com')) return;
  
  // 1. إصلاح الروابط (a)
  document.querySelectorAll('a[href^="/"]').forEach(a => {
    const href = a.getAttribute('href');
    if (ABSOLUTE_DIRS.some(dir => href.startsWith(dir))) {
      a.href = ABSOLUTE_BASE + href;
    }
  });
  
  // 2. إصلاح الصور (img)
  document.querySelectorAll('img[src^="/image/"]').forEach(img => {
    if (!img.src.startsWith('http')) {
      img.src = ABSOLUTE_BASE + img.getAttribute('src');
    }
  });
  
  // 3. إصلاح الفيديو (video)
  document.querySelectorAll('video[src^="/image/"]').forEach(video => {
    if (!video.src.startsWith('http')) {
      video.src = ABSOLUTE_BASE + video.getAttribute('src');
    }
  });
  
  // 4. إصلاح الصوت (audio)
  document.querySelectorAll('audio[src^="/image/"]').forEach(audio => {
    if (!audio.src.startsWith('http')) {
      audio.src = ABSOLUTE_BASE + audio.getAttribute('src');
    }
  });
  
  // 5. إصلاح المصادر داخل الفيديو/الصوت (source)
  document.querySelectorAll('source[src^="/image/"]').forEach(source => {
    if (!source.src.startsWith('http')) {
      source.src = ABSOLUTE_BASE + source.getAttribute('src');
    }
  });
}

// التشغيل عند اكتمال الـ DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixAbsolutePaths);
} else {
  fixAbsolutePaths();
}

// التشغيل عند تحميل الهيدر والفوتر (لضمان التقاط الصور فيهما)
document.addEventListener('headerLoaded', fixAbsolutePaths);
document.addEventListener('footerLoaded', fixAbsolutePaths);

// مراقب لتغييرات DOM (لضمان التقاط الصور التي تُحمّل ديناميكياً)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      fixAbsolutePaths();
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });

console.log('%c🌐 config.js — محول الروابط والوسائط المطلقة جاهز', 'color:#ffd700;font-weight:bold;');