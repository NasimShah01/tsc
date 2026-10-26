const VERSION = 'tsc-scorepro-v4';
const CORE = ['./','./index.html','./manifest.webmanifest','./icon-192-3.png','./icon-512-3.png','./maskable-192-3.png','./maskable-512-3.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const c2 = res.clone(); caches.open(VERSION).then(c => c.put(req, c2)); }
      return res; })));
    return;
  }
  if (u.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const c2 = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', c2)); return res; })
      .catch(() => caches.match('./index.html', { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const c2 = res.clone(); caches.open(VERSION).then(c => c.put(req, c2)); } return res; })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
    for (const c of list) { if (c.url === url && 'focus' in c) return c.focus(); }
    return self.clients.openWindow ? self.clients.openWindow(url) : null;
  }));
});
