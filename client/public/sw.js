// Service Worker for Fresh Bites Café PWA
const CACHE_NAME = 'fresh-bites-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
]

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
  )
  self.skipWaiting()
})

// Fetch events - Network First Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone()
        
        // Cache the fetched response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        
        return response
      })
      .catch(() => {
        // If fetch fails, try to return from cache
        return caches.match(event.request).then((response) => {
          return response || caches.match('/index.html')
        })
      })
  )
})

// Activate Service Worker and remove old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Fresh Bites Café',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'fresh-bites-notification',
    requireInteraction: false
  }
  
  event.waitUntil(
    self.registration.showNotification('Fresh Bites Café', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow('/')
  )
})
