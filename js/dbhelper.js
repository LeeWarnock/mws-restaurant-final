/* eslint-disable no-inline-comments */
/* eslint-disable line-comment-position */
/* eslint-disable lines-around-comment */
/* eslint-disable valid-jsdoc */
//Constants
const port = 1337;
/**
 * Common database helper functions.
 */

class DBHelper {
  static openDatabase() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open("rrx", 1, function(upgradeDb) {
      var storex = upgradeDb.createObjectStore("restaurants");
      var storey = upgradeDb.createObjectStore("reviews");
    });
  }

  static storeAllRestaurants(restaurantdata) {
    for (x = 0; x < restaurantdata.length; x++) {}
  }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
      .then(function(response) {
        let resp = response;
        return resp.json();
      })
      .then(function(restaurants) {
        DBHelper.openDatabase().then(function(response) {
          console.log(restaurants);
          var tx = response.transaction("restaurants", "readwrite");
          var storex = tx.objectStore("restaurants");
          for (let restaurant of restaurants) {
            storex.put(restaurant, restaurant.id);
          }
          callback(null, restaurants);
        });
      })
      .catch(function(err) {
        DBHelper.openDatabase()
          .then(function(response) {
            var tx = response.transaction("restaurants", "readwrite");
            var storex = tx.objectStore("restaurants");
            return storex.getAll();
          })
          .then(val => {
            console.log("offline" + val);
            callback(null, val);
          });
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);

        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);

        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);

        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;

        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
            (v, i) => restaurants[i].neighborhood
          ),
          // Remove duplicates from neighborhoods
          uniqueNeighborhoods = neighborhoods.filter(
            (v, i) => neighborhoods.indexOf(v) == i
          );

        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type),
          // Remove duplicates from cuisines
          uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);

        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `http://localhost:8000/img/${restaurant.photograph}.webp`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });

    return marker;
  }
}

  /**
   * Update restaurants cache
   */
  static updateCachedRestaurantData(id, updateObj) {
    const dbPromise = idb.open("fm-udacity-restaurant");
    // Update in the data for all restaurants first
    dbPromise.then(db => {
      console.log("Getting db transaction");
      const tx = db.transaction("restaurants", "readwrite");
      const value = tx
        .objectStore("restaurants")
        .get("-1")
        .then(value => {
          if (!value) {
            console.log("No cached data found");
            return;
          }
          const data = value.data;
          const restaurantArr = data.filter(r => r.id === id);
          const restaurantObj = restaurantArr[0];
          // Update restaurantObj with updateObj details
          if (!restaurantObj) return;
          const keys = Object.keys(updateObj);
          keys.forEach(k => {
            restaurantObj[k] = updateObj[k];
          });

          // Put the data back in IDB storage
          dbPromise.then(db => {
            const tx = db.transaction("restaurants", "readwrite");
            tx.objectStore("restaurants").put({ id: "-1", data: data });
            return tx.complete;
          });
        });
    });

    // Update the restaurant specific data
    dbPromise.then(db => {
      console.log("Getting db transaction");
      const tx = db.transaction("restaurants", "readwrite");
      const value = tx
        .objectStore("restaurants")
        .get(id + "")
        .then(value => {
          if (!value) {
            console.log("No cached data found");
            return;
          }
          const restaurantObj = value.data;
          console.log("Specific restaurant obj: ", restaurantObj);
          // Update restaurantObj with updateObj details
          if (!restaurantObj) return;
          const keys = Object.keys(updateObj);
          keys.forEach(k => {
            restaurantObj[k] = updateObj[k];
          });

          // Put the data back in IDB storage
          dbPromise.then(db => {
            const tx = db.transaction("restaurants", "readwrite");
            tx.objectStore("restaurants").put({
              id: id + "",
              data: restaurantObj
            });
            return tx.complete;
          });
        });
    });
  }

  /**
   * Adding and updating favorites
   */
  static updateFavorite(id, newState, callback) {
    // Push the request into the waiting queue in IDB
    const url = `${DBHelper.DATABASE_URL}/${id}/?is_favorite=${newState}`;
    const method = "PUT";
    DBHelper.updateCachedRestaurantData(id, { is_favorite: newState });
    DBHelper.addPendingRequestToQueue(url, method);

    // Update the favorite data on the selected ID in the cached data

    callback(null, { id, value: newState });
  }

static favoriteClick(id, newState) {
  // Block any more clicks on this until the callback
  const fav = document.getElementById("favorite-icon-" + id);
  fav.onclick = null;

  DBHelper.updateFavorite(id, newState, (error, resultObj) => {
    if (error) {
      console.log("Error updating favorite");
      return;
    }
    // Update the button background for the specified favorite
    const favorite = document.getElementById("favorite-icon-" + resultObj.id);
    favorite.style.background = resultObj.value
    ? `url("/img/icons/Favorite.svg") no-repeat`
    : `url("/img/icons/Notfavorite.svg") no-repeat`;
  });
}


const dbPromise = DBHelper.openDatabase();
