// hr-v13 — network-first, sem cache, auto-update
var VERSAO = 'hr-v13';

self.addEventListener('install', function(e) {
  // Ativa imediatamente, sem esperar abas fecharem
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() {
      // Assume controle de todas as abas abertas imediatamente
      return self.clients.claim();
    }).then(function() {
      // Avisa todas as abas que o SW novo assumiu
      return self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SW_ACTIVATED', version: VERSAO });
        });
      });
    })
  );
});

// Responde ao SKIP_WAITING enviado pelo app quando detecta novo SW esperando
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function(e) {
  // Sempre busca da rede. Se falhar, retorna mensagem de offline.
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).catch(function() {
      return new Response('Offline – recarregue quando houver conexão.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    })
  );
});
