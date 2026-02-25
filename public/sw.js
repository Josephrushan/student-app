// Cache configuration
const CACHE_VERSION = 'educater-v1';
const RUNTIME_CACHE = 'educater-runtime';
const ASSETS_CACHE = 'educater-assets';
const API_CACHE = 'educater-api';

// List of assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_VERSION);
        await cache.addAll(PRECACHE_ASSETS);
        console.log('✅ Precache completed');
        await self.skipWaiting();
      } catch (error) {
        console.error('Install error:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const cachesToDelete = cacheNames.filter(name => 
          !name.includes(CACHE_VERSION) && 
          !name.includes(RUNTIME_CACHE) && 
          !name.includes(ASSETS_CACHE) && 
          !name.includes(API_CACHE)
        );
        
        await Promise.all(
          cachesToDelete.map(cacheName => {
            console.log(`🗑️  Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        
        await self.clients.claim();
        console.log('✅ Activation completed');
      } catch (error) {
        console.error('Activation error:', error);
      }
    })()
  );
});

// Fetch event - network first with fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests (only cache GET requests)
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(
      fetch(request)
        .then(response => {
          // Only cache successful GET responses
          if (request.method === 'GET' && response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // For GET requests, try to return cached response
          if (request.method === 'GET') {
            return caches.match(request).then(cachedResponse => {
              return cachedResponse || new Response(
                JSON.stringify({ error: 'Offline - cached response unavailable' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              );
            });
          }
          // For POST/other methods, just return error
          return new Response(
            JSON.stringify({ error: 'Network request failed' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
  }

  // Handle HTML requests
  if (request.headers.get('accept')?.includes('text/html')) {
    return event.respondWith(
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
  }

  // Handle static assets (CSS, JS, images, fonts)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'manifest'
  ) {
    return event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseClone = response.clone();
          caches.open(ASSETS_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        }).catch(() => {
          // Return a placeholder for failed assets
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ddd" width="100" height="100"/></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('', { status: 404 });
        });
      })
    );
  }

  // Default: network first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request) || caches.match('/index.html');
    })
  );
});

// Background Sync API - for deferred tasks when offline
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync triggered:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      (async () => {
        try {
          // Resync notifications or pending data
          const clients = await self.clients.matchAll({ type: 'window' });
          clients.forEach(client => {
            client.postMessage({
              type: 'BACKGROUND_SYNC',
              tag: event.tag
            });
          });
          console.log('✅ Background sync completed');
        } catch (error) {
          console.error('Background sync error:', error);
          throw error; // Retry the sync
        }
      })()
    );
  }
});

// Periodic Background Sync - for regular background updates
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic Sync triggered:', event.tag);
  
  if (event.tag === 'update-data') {
    event.waitUntil(
      (async () => {
        try {
          // Fetch updated data in the background
          const response = await fetch('/api/sync-data');
          if (response.ok) {
            const data = await response.json();
            // Cache the data for quick access
            const cache = await caches.open(API_CACHE);
            cache.put('/api/sync-data', response);
            
            // Notify clients of update
            const clients = await self.clients.matchAll({ type: 'window' });
            clients.forEach(client => {
              client.postMessage({
                type: 'PERIODIC_SYNC_UPDATE',
                data: data
              });
            });
          }
          console.log('✅ Periodic sync completed');
        } catch (error) {
          console.error('Periodic sync error:', error);
          throw error; // Retry the sync
        }
      })()
    );
  }
});

// Push Notification Handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();

  event.waitUntil(
    (async () => {
      try {
        // Show the notification
        await self.registration.showNotification(data.title, {
          body: data.message || data.body,
          icon: data.icon || '/educater-icon-192.png',
          badge: data.badge || '/educater-icon-192.png',
          tag: data.tag || 'notification',
          requireInteraction: data.requireInteraction || false,
          data: { url: data.data?.url || '/' }
        });
        
        // Set badge count to show notification indicator
        if (navigator.setAppBadge) {
          try {
            // Wait a moment for notification to be added, then count
            await new Promise(r => setTimeout(r, 100));
            const notifications = await self.registration.getNotifications();
            const count = notifications.length;
            console.log(`📬 Total notifications: ${count}, setting badge to ${count}`);
            await navigator.setAppBadge(count);
          } catch (err) {
            console.log('Badge not supported:', err);
          }
        }
      } catch (pushErr) {
        console.error('Push event error:', pushErr);
      }
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    (async () => {
      const path = event.notification.data?.url || '/';
      const fullUrl = self.location.origin + path;
      
      console.log('🔗 Notification clicked, navigating to:', fullUrl);
      
      // Send message to all clients to clear badge
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({ 
          type: 'CLEAR_BADGE'
        });
      });
      
      // Try to find and focus an existing window
      let opened = false;
      for (const client of clients) {
        if (client.url === fullUrl || client.url.includes(path)) {
          await client.focus();
          opened = true;
          break;
        }
      }
      
      // If no matching window found, open new one
      if (!opened) {
        await self.clients.openWindow(fullUrl);
      }
    })()
  );
});

self.addEventListener('notificationclose', (event) => {
  (async () => {
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({ type: 'CLEAR_BADGE' });
    });
  })();
});