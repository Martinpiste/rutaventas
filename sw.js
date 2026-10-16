// Service worker de RutaVentas para GitHub Pages (versión de UN SOLO index.html).
// Este archivo NO cambia entre versiones: se sube una vez. Para actualizar la app solo se reemplaza index.html.
// - Guarda index.html, el manifest y los íconos: la app abre sin internet.
// - Una versión nueva de index.html NO se activa sola: la app la detecta, respalda y luego pide REFRESH.
// - Nunca toca la caché de Firestore ni las bases IndexedDB (datos): solo sus propias cachés "rutaventas-*".
// - Al instalarse reemplaza al service worker de la versión anterior (1.x) y borra sus cachés de archivos.
const CACHE = 'rutaventas-gh-1';
const INDEX = new URL('./index.html', self.location).href;
const STATIC = ['./manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];

async function freshIndex() {
  // ?v= evita la caché del CDN de GitHub Pages; no-store evita la del navegador
  const res = await fetch(`${INDEX}?v=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`index.html HTTP ${res.status}`);
  const text = await res.clone().text();
  if (!text.includes('rutaventas-version')) throw new Error('index.html no es de RutaVentas');
  return res;
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    if (!(await cache.match(INDEX))) await cache.put(INDEX, await freshIndex());
    await Promise.all(STATIC.map(u => cache.add(new Request(u, { cache: 'reload' })).catch(() => null)));
    await self.skipWaiting(); // este archivo es fijo: activarlo de inmediato no cambia la versión de la app
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const old = keys.filter(k => k.startsWith('rutaventas') && k !== CACHE);
    await Promise.all(old.map(k => caches.delete(k)));
    await self.clients.claim();
    // Venía de la versión anterior (1.x): recargar las pestañas abiertas para que abran la versión nueva
    if (old.some(k => !k.startsWith('rutaventas-gh-'))) {
      for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url).catch(() => null);
    }
  })());
});

self.addEventListener('message', (event) => {
  const t = event.data?.type || event.data;
  const reply = (m) => event.ports?.[0]?.postMessage(m);
  if (t === 'REFRESH') {
    // La app ya respaldó y verificó pendientes: se guarda el index.html nuevo; la app recarga después.
    event.waitUntil((async () => {
      try { const cache = await caches.open(CACHE); await cache.put(INDEX, await freshIndex()); reply({ ok: true }); }
      catch (e) { reply({ ok: false, error: String(e.message || e) }); }
    })());
  }
  if (t === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Firebase, Google y demás van directo a la red
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  const isIndex = req.mode === 'navigate' || url.href.split('?')[0] === INDEX || url.pathname === scope.pathname;
  if (isIndex && !url.searchParams.has('v')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(INDEX);
      if (hit) return hit;
      try { const res = await freshIndex(); await cache.put(INDEX, res.clone()); return res; }
      catch { return fetch(req); }
    })());
    return;
  }
  if (url.searchParams.has('v')) return; // revisión de versión: siempre a la red
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok && res.type === 'basic' && /(\.png|manifest\.webmanifest)$/.test(url.pathname)) cache.put(req, res.clone());
      return res;
    } catch {
      return new Response('Sin conexión', { status: 503, statusText: 'offline' });
    }
  })());
});
