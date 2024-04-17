var CACHE_STATIC_NAME = 'static-v6';
var CACHE_DYNAMIC_NAME = 'dynamic-v3';
// Turned off dynamic caching because it prevented new word on page reload.

const cacheFiles = [
  '/error',
  '/js/index.js',
  '/css/style.css',
  '/img/favicon-32x32.png',
  '/img/favicon-16x16.png',
  '/img/favicon.ico',
  '/img/site.webmanifest',
  '/img/android-chrome-192x192.png',
  '/img/android-chrome-512x512.png',
  '/img/Hangman-desktop.png',
  '/img/Hangman-mobile.png',
  '/img/apple-touch-icon.png',
  '/img/mstile-150x150.png',
  '/img/safari-pinned-tab.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
  'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap',
];

self.addEventListener('install', (event) => {
  console.log('[Service worker] installing service worker...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(async (cache) => {
      console.log('[Service Worker] Precaching App Shell');
      let ok;
      try {
        ok = await cache.addAll(cacheFiles);
      } catch (error) {
        console.error('sw: cache.addAll');
        for (let i of cacheFiles) {
          try {
            ok = await cache.add(i);
          } catch (err) {
            console.warn('sw: cache.add', i);
          }
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service worker] activating service worker...', event);
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  console.log('[service worker] fetching something...', event);
  // event.respondWith(
  //   (async () => {
  //     const cachedResponse = await caches.match(event.request);
  //     if (cachedResponse) {
  //       return cachedResponse;
  //     }

  //     const response = await fetch(event.request);

  //     if (!response || response.status !== 200 || response.type !== 'basic') {
  //       return response;
  //     }

  //     return response;
  //   })()
  // );
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response;
        } else {
          return fetch(event.request);
        }
      })
      .catch((err) => {
        console.log(err);
        return caches.open(CACHE_STATIC_NAME).then((cache) => {
          return cache.match('/error');
        });
      })
  );
});

// self.addEventListener('install', function (event) {
//   console.log('[Service Worker] Installing Service Worker ...', event);
// });

// self.addEventListener('activate', function (event) {
//   console.log('[Service Worker] Activating Service Worker ...', event);
//   return self.clients.claim();
// });

// self.addEventListener('fetch', function (event) {
//   console.log('[Service Worker] Fetching something ....', event);
//   event.respondWith(fetch(event.request));
// });
