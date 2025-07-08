// Service Worker for Exam Platform
// Provides offline functionality and background sync for exams

const CACHE_NAME = 'exam-platform-v1';
const STATIC_CACHE_NAME = 'exam-static-v1';

// URLs to cache for offline functionality
const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets as needed
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('📦 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static resources');
        return cache.addAll(STATIC_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle Supabase API calls with special offline strategy
  if (url.hostname.includes('supabase')) {
    event.respondWith(handleSupabaseRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: network first, then cache
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle Supabase API requests with offline support
async function handleSupabaseRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses for exam data
    if (response.ok && request.url.includes('/examenes')) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('🔌 Offline: Serving Supabase request from cache');
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for exam updates
    if (request.method === 'PATCH' || request.method === 'POST') {
      return new Response(
        JSON.stringify({ 
          error: 'offline',
          message: 'Request queued for when online',
          offline: true 
        }), 
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Handle static assets
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('🔌 Offline: Static asset not available');
    throw error;
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('🔌 Offline: Serving navigation from cache');
    
    // Serve cached index.html for SPA routes
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Check if URL is a static asset
function isStaticAsset(url) {
  return url.includes('/assets/') || 
         url.endsWith('.js') || 
         url.endsWith('.css') || 
         url.endsWith('.png') || 
         url.endsWith('.jpg') || 
         url.endsWith('.svg') ||
         url.endsWith('.ico');
}

// Background Sync for exam data
self.addEventListener('sync', event => {
  console.log('🔄 Background Sync triggered:', event.tag);
  
  if (event.tag === 'exam-sync') {
    event.waitUntil(syncExamData());
  }
});

// Sync pending exam data when back online
async function syncExamData() {
  console.log('🔄 Syncing exam data...');
  
  try {
    // Get all clients (open tabs)
    const clients = await self.clients.matchAll();
    
    // Notify all clients to sync their pending data
    clients.forEach(client => {
      client.postMessage({ 
        type: 'SYNC_EXAM_DATA',
        timestamp: Date.now()
      });
    });
    
    console.log('✅ Exam sync notification sent to all clients');
  } catch (error) {
    console.error('❌ Exam sync failed:', error);
  }
}

// Push notifications for exam reminders (future feature)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.data,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});

// Console logging for debugging
console.log('🔧 Service Worker: Loaded and ready for exam platform');