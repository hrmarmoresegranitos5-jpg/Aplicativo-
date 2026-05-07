const CACHE = 'hr-v4';
const FILES = [
    '/HR_APP/',
    '/HR_APP/index.html',
    '/HR_APP/manifest.json',
    '/HR_APP/icon-192.png',
    '/HR_APP/icon-512.png',
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
  ];

self.addEventListener('install', function(e){
    e.waitUntil(
          caches.open(CACHE).then(function(cache){
                  return cache.addAll(FILES).catch(function(err){
                            console.log('Cache addAll error:', err);
                  });
          })
        );
    self.skipWaiting();
});

self.addEventListener('activate', function(e){
    e.waitUntil(
          caches.keys().then(function(keys){
                  return Promise.all(
                            keys.filter(function(k){
                                        return k !== CACHE;
                            }).map(function(k){
                                        console.log('Deleting old cache:', k);
                                        return caches.delete(k);
                            })
                          );
          })
        );
    self.clients.claim();
});

self.addEventListener('fetch', function(e){
    e.respondWith(
          caches.match(e.request).then(function(r){
                  return r || fetch(e.request).catch(function(){
                            return caches.match('/HR_APP/index.html');
                  });
          })
        );
});
