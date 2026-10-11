const CACHE='atallam-v8';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.hostname.includes('firestore')||u.hostname.includes('googleapis.com')&&u.pathname.includes('identitytoolkit')) return;
  if(r.mode==='navigate'){ e.respondWith(fetch(r).then(res=>{const c=res.clone(); caches.open(CACHE).then(x=>x.put('index.html',c)); return res;}).catch(()=>caches.match('index.html'))); return; }
  if(u.origin===location.origin||u.hostname.endsWith('fonts.googleapis.com')||u.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok||res.type==='opaque'){const c=res.clone(); caches.open(CACHE).then(x=>x.put(r,c));} return res;})));
  }
});
