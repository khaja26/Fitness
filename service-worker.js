const CACHE_NAME = 'my-reminders-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html', // Add your HTML file
  '/styles.css', // Adjust if CSS file is named differently
  '/scripts.js', // Adjust if you have JS scripts
  '/images/icon.png', // Include any images used in your project
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// Fetch event to serve cached resources
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached resource if available, otherwise fetch from network
      return (
        response ||
        fetch(event.request).then((fetchResponse) =>
          caches.open(CACHE_NAME).then((cache) => {
            // Optional: Cache new resources dynamically
            if (event.request.url.startsWith('http')) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          })
        )
      );
    })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
}
