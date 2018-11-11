/* eslint-disable no-inline-comments */
/* eslint-disable line-comment-position */
/* eslint-disable lines-around-comment */
/* eslint-disable valid-jsdoc */
//Constants

const port = 1337;
const dbPromise = idb.open("restaurantReviews", 3, upgradeDb => {
  switch (upgradeDb.oldVersion) {
    case 0:
      upgradeDb.createObjectStore("restaurantData", { keyPath: "id" });
    case 1:
      upgradeDb
        .createObjectStore("reviewData", { keypath: "id" })
        .createIndex("restaurant_id", "restaurant_id");
    case 2:
      upgradeDb.createObjectStore("updateData", {
        keyPath: "id",
        autoIncrement: true
      });
  }
});

/*
 * Common database helper functions.
 */
class DBHelper {
  /*
   * Database URLs.
   */
  static get DATABASE_URL() {
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_URL_REVIEWS() {
    return `http://localhost:${port}/reviews`;
  }

  /*
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let requestURL = DBHelper.DATABASE_URL;
    fetch(requestURL, { method: "GET" })
      .then(function(response) {
        // If response returns ok, return json of restaurant data
        if (response.ok) return response.json();
      })
      .then(function(restaurantData) {
        callback(null, restaurantData);
      })
      .catch(function(error) {
        console.log("In fetchRestaurants catch, error: ", error.message);
      });
  }

  /*
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

  /*
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

  /*
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

  /*
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

  /*
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
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /*
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }
  /*
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

  /*
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

  /*
   * Fetch reviews by restaurant ID
   */
  static fetchReviewsById(id) {
    let requestURL = DBHelper.DATABASE_URL_REVIEWS + "/?restaurant_id=" + id;
    console.log(
      `In DBHelper.fetchReviewsById - request: ${requestURL}, id: ${id}`
    );
    return fetch(requestURL, { method: "GET" })
      .then(function(response) {
        console.log("response: ", response);
        if (response.ok) return response.json();
      })
      .then(function(reviewData) {
        // If fetch successful
        console.log("reviewData: ", reviewData);
        return reviewData;
      })
      .catch(function(error) {
        console.log("In fetchReviewsBy...ID catch, error:", error.message);
      });
  }

  /*
   * Function to update the Restaurant Data stored in idb store: restaurantData
   */
  static updateRestaurantCache(id, update) {
    console.log(`In updateRestaurantCache - id: ${id}, update: ${update}`);
    let dbPromise = idb.open("restaurantReviews");

    // Update all restaurant data
    dbPromise.then(function(db) {
      //let restaurantStore =
      db.transaction("restaurantData", "readwrite")
        .objectStore("restaurantData")
        .get("-1")
        .then(function(value) {
          if (!value) {
            console.log("No value, update all, in updateRestaurantCache");
            return;
          }
          let restaurants = value.data.filter(r => r.id === id);
          let updaterestaurant = restaurants[0];
          if (!updaterestaurant) return;
          // Update restaurant with new data
          let keys = Object.keys(update);
          keys.forEach(key => {
            updaterestaurant[key] = update[key];
          });

          // Store updated information back in idb
          dbPromise.then(function(db) {
            let trans = db
              .transaction("restaurantData", "readwrite")
              .objectStore("restaurantData")
              .put({ id: "-1", data: value.data });
            return trans.complete;
          });
        });
    });

    // Update individual restaurant data
    dbPromise.then(function(db) {
      db.transaction("restaurantData", "readwrite")
        .objectStore("restaurantData")
        .get(id + "")
        .then(function(value) {
          if (!value) {
            console.log(
              "No value, update individual, in updateRestaurantCache"
            );
            return;
          }
          let updaterestaurant = value.data;
          if (!updaterestaurant) return;
          // Update restaurant wiht new data
          let keys = Object.keys(update);
          keys.forEach(key => {
            updaterestaurant[key] = update[key];
          });

          // Store updated information back in idb
          dbPromise.then(function(db) {
            let trans = db
              .transaction("restaurantData", "readwrite")
              .objectStore("restaurantData")
              .put({ id: id + "", data: value.data });
            return trans.complete;
          });
        });
    });
  }

  /*
   * Function to update the Reviews Data stored in idb store: reviewData
   */
  static updateReviewCache(id, update) {
    console.log(`In updateReviewCache - id: ${id}, update: ${update}`);
    let dbPromise = idb.open("restaurantReviews");

    dbPromise.then(function(db) {
      let trans = db
        .transaction("reviewData", "readwrite")
        .objectStore("reviewData")
        .put({ id: Date.now(), restaurant_id: id, data: update });
      return trans.complete;
    });
  }

  /*
   * Function to update data being held in idb for updates, store: updateData
   * Updated data is put in this store regardless of on/off-line status.
   */
  static addToUpdateQueue(url, method, update) {
    console.log(
      `In addToUpdateQueue - url: ${url}, method: ${method}, update: ${update}`
    );
    let dbPromise = idb.open("restaurantReviews");
    dbPromise
      .then(function(db) {
        db.transaction("updateData", "readwrite")
          .objectStore("updateData")
          .put({ data: { url, method, update } });
      })
      .catch(function(error) {
        console.log("In addToUpdateQueue catch, error: ", error.message);
      });
  }

  /*
   * Function to push updates in the idb update store to the server.
   */
  static pushUpdates() {
    console.log(`In pushUpdates`);
    let dbPromise = idb.open("restaurantReviews");
    dbPromise.then(function(db) {
      db.transaction("updateData", "readwrite")
        .objectStore("updateData")
        .openCursor()
        .then(function(cursor) {
          // No updates, so get outta here!
          if (!cursor) return;
          let update = cursor.value.data;
          let params = {
            body: JSON.stringify(update.body),
            method: update.method
          };

          fetch(update.url, params)
            .then(function(response) {
              if (!response.ok) return;
            })
            .then(function() {
              db.transaction("updateData", "readwrite")
                .objectStore("updateData")
                .openCursor()
                .then(function(cursor) {
                  cursor.delete().then(function() {
                    console.log("Record deleted, calling next...");
                  });
                });
            });
        })
        .catch(function(error) {
          console.log("In pushUpdates catch, error: ", error.message);
          return;
        });
    });
  }

  /*
   * Function for saving a new review.
   */
  static saveReview(id, name, rating, comments, date /*, callback*/) {
    let url = `${DBHelper.DATABASE_URL_REVIEWS}`;
    let method = "POST";
    let body = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comments,
      createdAt: date
    };
    console.log(
      `In saveReview - url: ${url}, method: ${method}, body: ${body}`
    );
    DBHelper.updateReviewCache(id, body);
    DBHelper.addToUpdateQueue(url, method, body);
  }
}
