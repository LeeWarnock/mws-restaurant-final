# Udacity Nanodegree Capstone for Google MWS

## Final Project for Google Mobile Web Specialist Certification Course

---

### Reviewer Please Note: Google Maps API Key set to only work on localhost

---

## Getting Started

## First Things First - Clone and start Dev Server

---

### Fork and clone into a seperate folder: [Development server](https://github.com/LeeWarnock/mws-restaurant-stage-3)

###

## What do I do from here?

### Development local API Server

_Location of server = /server_
Server depends on [node.js LTS Version: v6.11.2 ](https://nodejs.org/en/download/), [npm](https://www.npmjs.com/get-npm), and [sails.js](http://sailsjs.com/)
Please make sure you have these installed before proceeding forward.

Great, you are ready to proceed forward; awesome!

Let's start with running commands in your terminal, known as command line interface (CLI)

#### Install project dependancies

```Install project dependancies
# npm i
```

#### Install Sails.js globally

```Install sails global
# npm i sails -g
```

#### Start the server

```Start server
# node server
```

## You should now have access to your API server environment

debug: Environment : development
debug: Port : 1337

## Endpoints

### GET Endpoints

#### Get all restaurants

```
http://localhost:1337/restaurants/
```

#### Get favorite restaurants

```
http://localhost:1337/restaurants/?is_favorite=true
```

#### Get a restaurant by id

```
http://localhost:1337/restaurants/<restaurant_id>
```

#### Get all reviews for a restaurant

```
http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
```

#### Get all restaurant reviews

```
http://localhost:1337/reviews/
```

#### Get a restaurant review by id

```
http://localhost:1337/reviews/<review_id>
```

#### Get all reviews for a restaurant

```
http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
```

### POST Endpoints

#### Create a new restaurant review

```
http://localhost:1337/reviews/
```

###### Parameters

```
{
    "restaurant_id": <restaurant_id>,
    "name": <reviewer_name>,
    "rating": <rating>,
    "comments": <comment_text>
}
```

### PUT Endpoints

#### Favorite a restaurant

```
http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true
```

#### Unfavorite a restaurant

```
http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=false
```

#### Update a restaurant review

```
http://localhost:1337/reviews/<review_id>
```

###### Parameters

```
{
    "name": <reviewer_name>,
    "rating": <rating>,
    "comments": <comment_text>
}
```

### DELETE Endpoints

#### Delete a restaurant review

```
http://localhost:1337/reviews/<review_id>
```

If you find a bug in the source code or a mistake in the documentation, you can help us by
submitting an issue to our [Waffle Dashboard](https://waffle.io/udacity/mwnd-issues). Even better you can submit a Pull Request with a fix :)

# Serve the site

1. Fork and clone this repo. In the root folder of this project, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.
