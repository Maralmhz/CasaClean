// SERVICE WORKER - SUPORTE OFFLINE

const CACHE_NAME = 'casaclean-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/data.js',
  '/storage.js',
  '/app.js',
  '/manifest.webmanifest'
];

// INSTALA O SERVICE WORKER
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Erro ao fazer cache:', err))
  );
  self.skipWaiting();
});

// ATIVA O SERVICE WORKER
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH - CACHE FIRST, NETWORK FALLBACK
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            console.log('Offline - usando cache');
            return caches.match('/index.html');
          });
      })
  );
});

// SINCRONIZAÇÃO EM BACKGROUND
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      new Promise((resolve, reject) => {
        console.log('Sincronizando tarefas...');
        resolve();
      })
    );
  }
});

console.log('Service Worker carregado!');
