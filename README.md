# SearchX Backend

SearchX is a scalable collaborative search system being developed by [Lambda Lab](http://www.wis.ewi.tudelft.nl/projects/learning-analytics/) of [TU Delft](https://www.tudelft.nl/).
It is based on [Pineapple Search](http://onlinelibrary.wiley.com/doi/10.1002/pra2.2016.14505301122/full) and is further developed to facilitate collaborative search and sensemaking.

The backend is responsible for fetching search requests to the search provider and managing the application's data. 
It is built on NodeJS and exposes its endpoints through [express](https://expressjs.com/) (API) and [socket.io](https://socket.io/) (Websockets).

# Setup

- Install NodeJS: https://nodejs.org/en/ (at least version 8.0)
```
sudo apt install npm

// Check if node is installed
which node
```

- Install MongoDB: https://www.mongodb.com/
```
sudo apt install mongodb-server

// Start MongoDB
mongod

// Check if MongoDB is running
mongo 
```

- Install Redis: https://redis.io/
```
sudo apt install redis-server

// Start Redis
redis-server

// Check if Redis is running
redis-cli
> PING (should return PONG) 

```

- Set up Server
```
// Clone the repository
git clone https://github.com/felipemoraes/searchx-api.git

// Install dependencies
npm install

// For development, inside app/env/config/development.js set:
-  MongoDB and redis address
-  Bing API Access Key
-  API port and address

module.exports = {
    port: 4443,
    url: 'http://localhost',
    client: 'http://localhost:3000',
    db: 'mongodb://localhost/searchx',
    redis: 'redis://localhost:6379',
    bingAccessKey: 'XXXXXX'
};

// Install foreman
npm -g install foreman

// Start the development server
./run.sh

// Check if API is running (curl or through browser)
curl http://localhost:4443/v1
```

## Running tests
```
// Perform all the steps above and run:
npm test
```

## API Specification 
```
// Search
[address]/v1/search/[vertical]/?query=[query]&page=[pageNumber]
- address: address set in the configuration file
- vertical: web, images, videos, news
- query: query string
- page: page number
```

# Modifications

### Changing the search provider
Communication with the search provider is encapsulated under `app/service/search/provider.js`.
You would need to change `fetch` to request the appropriate resource to the search provider
and `formatResults` to transform the results received into the format we use.

### Modifying the learning task
1. Adding new topics   
The learning topics that are passed to the front end is defined inside `static/data/topics.json`.
To add a new topic, you can add a new entry to the json file.

2. Increasing group size   
The `numMembers` configuration can be changed inside `app/config/all.js`.
Additionally, you might also need to add more colors into the `colorPool` configuration.

### Creating a custom task
To define a new task in the backend, you can add a new service inside `app/service/task/` 
and then change `index.js` to serve the task description from the new service.

# License

[MIT](https://opensource.org/licenses/MIT) License