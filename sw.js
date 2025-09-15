// Service Worker for Catch The Falling Stars
// Version 1.0.2

const CACHE_NAME = 'falling-stars-v1.0.2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './tailwind.min.css',
  './game.js',
  './confetti.min.js',
  './manifest.json',
  './assets/images/basket.svg',
  './assets/images/star.svg',
  './assets/images/heart.svg',
  './assets/images/debris.svg',
  './assets/images/dangerous-debris.svg',
  './assets/images/night-sky.gif',
  './assets/images/space-star.svg',
  './assets/images/gear.svg',
  './assets/audio/background-music.mp3',
  './assets/audio/catch-star.mp3',
  './assets/audio/game-over.mp3',
  './assets/audio/catch-heart.mp3',
  './assets/audio/catch-debris.mp3'
];

// Install event - cache all resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
        // Continue even if some resources fail to cache
        return caches.open(CACHE_NAME)
          .then((cache) => {
            // Cache essential files only
            const essentialFiles = [
              './',
              './index.html',
              './styles.css',
              './tailwind.min.css',
              './game.js',
              './confetti.min.js',
              './manifest.json'
            ];
            return cache.addAll(essentialFiles);
          });
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});