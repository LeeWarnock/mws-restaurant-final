self.importScripts("js/idb.js");

var CACHE_NAME = "static-cache";

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open("CACHE_NAME").then(function(cache) {
      return cache
        .addAll([
          "/index.html",
          "/restaurant.html",
          "/css/styles.css",
          "/js/dbhelper.js",
          "/js/main.js",
          "/js/restaurant_info.js",
          "/js/idb.js",
          "/img/"
        ])
        .catch(error => {
          console.log("Caches open failed: " + error);
        });
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
