/* ==========================================================================
   PIKKO - SERVICE WORKER (PWA Offline & Push Notifications)
   ========================================================================== */

const CACHE_NAME = 'pikko-v99';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching offline assets');
            return Promise.allSettled(ASSETS_TO_CACHE.map(asset => cache.add(asset)));
        }).then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[ServiceWorker] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Network only (no cache lock)
self.addEventListener('fetch', (event) => {
    return; // Bypass all caching; always load fresh from network
});

// Push Notification Handling
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || '⏰ Pikko Reminder';
    const options = {
        body: data.body || 'You have an upcoming note or task reminder!',
        icon: 'https://www.gstatic.com/labs-code/stitch/favicon-192x192.png',
        badge: 'https://www.gstatic.com/labs-code/stitch/favicon-48x48.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
