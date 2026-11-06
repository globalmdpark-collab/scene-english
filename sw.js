// Scene English 오프라인 캐시: 화면(index.html)은 항상 새 버전을 먼저 받고, 인터넷이 없을 때만 저장본 사용
const CACHE = 'scene-english-v4';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // API 요청 등은 그대로 통과
  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  e.respondWith(caches.open(CACHE).then(async c => {
    if (isPage) {
      try { const r = await fetch(e.request, {cache: 'no-store'}); if (r.ok) c.put(e.request, r.clone()); return r; }
      catch (_) { return (await c.match(e.request, {ignoreSearch: true})) || (await c.match('./index.html')); }
    }
    const hit = await c.match(e.request, {ignoreSearch: true});
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
