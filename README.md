# SearchX Backend

SearchX is a scalable collaborative search system being developed by [Lambda Lab](http://www.wis.ewi.tudelft.nl/projects/learning-analytics/) of [TU Delft](https://www.tudelft.nl/).
It is based on [Pienapple Search](http://onlinelibrary.wiley.com/doi/10.1002/pra2.2016.14505301122/full) and is further developed to facilitate collaborative search and sensemaking. SearchX includes features that enable crowdsourced user studies on collaborative search, and is easily extensible for new research.

The backend is responsible for fetching search requests to the search provider and managing the application's data. 
It is built on NodeJS and exposes its endpoints through [express](https://expressjs.com/) (API) and [socket.io](https://socket.io/) (Websockets). Use it together with the [SearchX Front End](https://github.com/felipemoraes/searchx-frontend) to get a web-based collaborative search interface.

# Setup
These instructions are for Ubuntu Linux, but the steps can be adapted for all major platforms.

- Install [NodeJS](https://nodejs.org/en/) (at least version 8.0)
```
sudo apt install npm

// Check if node is installed
which node
```

- Install [MongoDB](https://www.mongodb.com/):

Execute the four steps of the [MongoDB installation instructions](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition)
```
// Check if MongoDB is running
mongo
// You should see the mongo client connect to the MongoDB server and show its version number.
// Exit the client using:
> exit
```

- Install [Redis](https://redis.io/)
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

- Install [Elasticsearch](https://www.elastic.co/products/elasticsearch)

Execute the [Elasticsearch installation instructions](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/deb.html)

- Set up Server
```
// Clone the repository
git clone https://github.com/felipemoraes/searchx-api.git

// Install dependencies
npm install

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
[address]/v1/search/[vertical]/?query=[query]&page=[pageNumber]&provider=[provider]
- address: address set in the configuration file
- vertical: web, images, videos, news
- query: query string
- page: page number
- provider: the search provider to use
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
SearchX can be extended to support new providers for search results, and to define tasks. Tasks define extra functionality that can be used in the frontend for user studies, for example placing users in groups according to predefined criteria, giving them search instructions, and asking them questions on what they found.

## Search providers
Two search provider services are included: Bing and Elasticsearch. These services can be found in `app/services/search/providers/`, and can serve as example of how to implement new search providers. New search providers can be implemented by adding a service in to the same folder, and adding it to the provider mapping in `app/services/search/provider.js`. The set of possible verticals and number of results per page can be defined as desired by the provider implementation. The provider service must implement the `fetch(query, vertical, pageNumber)` function, which must return a promise that resolves to an object containing the results if retrieving the search results is successful.

The object containing the results needs to have the following fields:
```
{ matches: <number of matches>,
  results: [
    <result>,
    ...
]}
```

The data structure of <result> depends on the result type, which is defined by the component that will be used to display the result in the frontend. See the [searchx-frontend documentation](https://github.com/felipemoraes/searchx-frontend#search-providers) for an explanation of how to add custom result types.

The included result types are (fields preceded by <OPTIONAL> are optional):

### Web
```
{
  name: <name of the result>,
  url: <full url>,
  displayUrl: <url formatted for display>,
  snippet: <part of text to display on search engine results page>
}
```
### Images
```
{
  name: <name of the image>,
  url: <full url>,
  thumbnailUrl: <url of the thumbnail to display for this image>
}
```

### Videos
```
{
  name: <name of the video>,
  thumbnailUrl: <url of the thumbnail to display for this result>,
  publisher: [
    {name: <name of the first publisher of this video}
    ...
  ],
  viewCount: <number of times this video has been viewed (integer)>,
  <OPTIONAL> creator: {name: <name of the creator of this video>},
}
```

### News
```
{
  name: <name of the news article>,
  url: <full url>,
  datePublished: <date the article has been published (in format compatible with Date() constructor)>,
  description: <description of the article to display on search engine results page>,
  provider: [
    {name: <name of the first news provider that published this story>}
    ...
  ],
  <OPTIONAL> image: {thumbnail: {contentUrl: <url of the thumbnail to display for this result>}}
}
```

## Tasks
Two example tasks have been added in `app/services/session/tasks/`:
- `exampleGroupAsync.js` is a basic example of a task that can be performed by a group. When a new user requests this task, they enter into a group and can try to start solving a search puzzle. When more new users request the task, they join the same group (until it is full) and can collaborate in solving the puzzle. This example is asynchronous, since it users do not need to search at the same time. Please note that the front-end part of this task contains more components to form the complete task (e.g. submitting the answer to the puzzle), but the task specification on the backend is not concerned with them, because they are handled by the standard logging functionality of the backend. See the frontend documentation for the complete task description.
- `exampleGroupSync.js` is a more elaborate example that shows how tasks can be used to for synchronous collaboration. After a user has completed a pre-test and needs to be assigned to a group, the frontend calls the `pushSyncsubmit` socket (see `app/api/controllers/socket/session.js` for the entry point), which causes the `handleSyncSubmit` function in the example to be called. Users are assigned to groups in a similar fashion to the async example, but the groups are stored in a database to ensure each topic is assigned to a group once. Also, the user is not assigned a task until the group has reached the required number of members, so they have to wait until the group is filled, causing the task to be synchronous. When the group is assigned a task, the socket is used to notify all other group members allowing them to start the task. The notification is automatically handled by SearchX's session management, so the task code only needs to mark the group as modified.

You can modify these tasks as follows:

1. Increasing group size 
- For the async example the `MAX_MEMBERS` constant in `exampleGroupAsync.js` can be changed.
- For the sync example the group size is defined by the frontend.

2. Adding new puzzles or topics
The puzzles for the asynchronous example are defined in `app/services/session/tasks/data/topics.json`. Learning topics for the synchronous example are defined inside `app/services/session/tasks/data/topics.json`. To add a new topic, you can add a new entry to these json files.

### Creating a custom task
To define a new task in the backend, you can add a new service inside `app/services/session/tasks/`  and then change `app/services/session/index.js` to serve the task description from the new service.

# License

[MIT](https://opensource.org/licenses/MIT) License