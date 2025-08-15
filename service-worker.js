const CACHE = 'foysal-cache-v1';
const CORE = [
  './',
  './index.html','./about.html','./stanford-fit.html','./research.html','./publications.html','./teaching.html','./awards.html','./news.html','./contact.html',
  './offline.html',
  './assets/style.css','./assets/app.js','./assets/pubs.json','./assets/posts.json','./assets/favicon.svg'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).catch(()=> caches.match('./offline.html')))
  );
});
