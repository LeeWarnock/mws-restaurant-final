importScripts("/js/idb.js");
importScripts("/js/idbhelper.js");

let staticCacheName = "restaurants-static";

self.addEventListener("install", event => {
  let UrlsToCache = [
    "/",
    "/index.html",
    "/restaurant.html",
    "/css/styles.css",
    "/js/idb.js",
    "/js/idbhelper.js",
    "/js/dbhelper.js",
    "/js/main.js",
    "/js/restaurant_info.js",
    "/img/"
  ];

  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll(UrlsToCache);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cachesNames => {
      return Promise.all(
        cachesNames
          .filter(cachesName => {
            return (
              cachesName.startsWith("restaurants-") &&
              cachesName != staticCacheName
            );
          })
          .map(cachesName => {
            return caches.delete(cachesName);
          })
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      if (response) return response;
      return fetch(event.request);
    })
  );
});

self.addEventListener("sync", function(event) {
  if (event.tag === "review-sync") {
    event.waitUntil(IDBHelper.syncOfflineReviews());
  }
});
