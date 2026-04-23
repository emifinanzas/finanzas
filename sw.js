const CACHE = 'finanzas-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname.includes('google') || url.hostname.includes('cdnjs')) return;
  const isPage = url.pathname.endsWith('.html') || url.pathname.endsWith('/') || url.pathname.endsWith('/finanzas');
  if (isPage) {
    e.respondWith(
      fetch(e.request).then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(c => c || fetch(e.request).then(res => {
        caches.open(CACHE).then(cache => cache.put(e.request, res.clone()));
        return res;
      }))
    );
  }
});
