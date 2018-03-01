# SearchX Backend

SearchX is a scalable collaborative search system being developed by [Lambda Lab](http://www.wis.ewi.tudelft.nl/projects/learning-analytics/) of [TU Delft](https://www.tudelft.nl/).
It is based on [Pienapple Search](http://onlinelibrary.wiley.com/doi/10.1002/pra2.2016.14505301122/full) and is further developed to facilitate collaborative search and sensemaking. SearchX includes features that enable crowdsourced user studies on collaborative search, and is easily extensible for new research.

The backend is responsible for fetching search requests to the search provider and managing the application's data. 
It is built on NodeJS and exposes its endpoints through [express](https://expressjs.com/) (API) and [socket.io](https://socket.io/) (Websockets). Use it together with the [SearchX Front End](https://github.com/felipemoraes/searchx-frontend) to get a web-based collaborative search interface.

# Setup
These instructions are for Ubuntu Linux, but the steps can be adapted for all major platforms.

- Install NodeJS: https://nodejs.org/en/ (at least version 8.0)
```
sudo apt install npm

// Check if node is installed
which node
```

- Install MongoDB: https://www.mongodb.com/
Execute the four steps of the [MongoDB installation instructions](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition).
```
// Check if MongoDB is running
mongo
// You should see the mongo client connect to the MongoDB server and show its version number.
// Exit the client using:
> exit
```

- Install Redis: https://redis.io/
```
sudo apt install redis-server

// Start Redis
redis-server

// Check if Redis is running
redis-cli
> PING
// Should return PONG
> QUIT
```

- Install Elasticsearch: https://www.elastic.co/products/elasticsearch
Execute the [Elasticsearch installation instructions](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/deb.html).

- Set up Server
```
// Clone the repository
git clone https://github.com/felipemoraes/searchx-api.git

// Install dependencies
npm install

// Install foreman
npm -g install foreman

// Start the development server
npm run start

// If you get any errors connecting to MongoDB or Redis they may be running on a different
// port, instructions for changing the port are in the configuration section below.

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

## Configuration
SearchX requires a Bing API key to use the Bing web search provider. If you do not have a Bing key, you can use SearchX with your own dataset using the Elasticsearch provider.

```
// For development, inside app/config/env/development.js set:
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
```

# Modifications
SearchX can be modified to support new providers for search results, and to define tasks for user studies. Tasks can define extra functionality that can be added to the frontend, for example to give the user search instructions and ask them questions on what they found.

## Search providers
New search providers can be implemented in `app/services/search/providers/`. The new provider also needs to be added in `app/services/search/provider.js`.
A provider needs to implement the `fetch` function to request the appropriate resource from the search provider
and `formatResults` to transform the results received into the format we use. The used format is:

```
{ matches: <number of matches>,
  results: [
    {
      name: <name of the result>,
      url: <full url>,
      displayUrl: <url formatted for display>,
      snippet: <part of text to display on search engine results page>
    },
    ...
]}
```

## Tasks
Two example tasks have been added in `app/services/session/tasks/`. You can modify these tasks as follows:

1. Adding new topics   
The learning topics that are passed to the front end is defined inside `app/services/session/tasks/data/topics.json`.
To add a new topic, you can add a new entry to the json file.

2. Increasing group size   
The `numMembers` configuration can be changed inside `app/config/env/all.js`.

### Creating a custom task
To define a new task in the backend, you can add a new service inside `app/services/session/tasks/` 
and then change `app/services/session/index.js` to serve the task description from the new service.

# License

[MIT](https://opensource.org/licenses/MIT) License