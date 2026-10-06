const V='rutaventas-static-v1.0.0';
const F=['./','index.html','manifest.webmanifest','version.json','css/styles.css','js/app.js','js/database.js','js/migrations.js','js/backup.js','js/reports.js','js/receipts.js','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('rutaventas-static-')&&x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('message',e=>{if(e.data==='SKIP')self.skipWaiting()}); // solo tras confirmación del usuario
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;
const net=/version\.json$|\/$|index\.html$/.test(u.pathname);
const store=x=>{const c=x.clone();caches.open(V).then(k=>k.put(r,c));return x};
e.respondWith(net?fetch(r).then(store).catch(()=>caches.match(r).then(x=>x||caches.match('index.html'))):
caches.match(r).then(x=>x||fetch(r).then(store)).catch(()=>caches.match('index.html')))});
