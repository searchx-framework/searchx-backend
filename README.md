# SearchX Backend

SearchX is a scalable collaborative search system being developed by [Lambda Lab](http://www.wis.ewi.tudelft.nl/projects/learning-analytics/) of [TU Delft](https://www.tudelft.nl/).
It is based on [Pienapple Search](http://onlinelibrary.wiley.com/doi/10.1002/pra2.2016.14505301122/full) and is further developed to facilitate collaborative search and sensemaking. SearchX includes features that enable crowdsourced user studies on collaborative search, and is easily extensible for new research.

The backend is responsible for fetching search requests to the search provider and managing the application's data. 
It is built on NodeJS and exposes its endpoints through [express](https://expressjs.com/) (API) and [socket.io](https://socket.io/) (Websockets). Use it together with the [SearchX Front End](https://github.com/felipemoraes/searchx-frontend) to get a web-based collaborative search interface.

# Setup
These instructions are for Ubuntu Linux. The steps can be adapted for all major platforms.

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
- Set up the server
    ```
    // Clone the repository
    git clone https://github.com/felipemoraes/searchx-backend.git
    
    // Change directory to repository
    cd searchx-backend
    
    // Install dependencies
    npm install
    
    // Copy example configuration
    cp .env.example .env
    ```
- Choose a search provider
    You can choose between one of the three search providers for which SearchX has included provider modules:
    
    1. [Elasticsearch](#elasticsearch)
    2. [Indri](#indri)
    3. [Bing](#bing)

    The Elasticsearch provider is the easiest to setup with your own dataset, while the Indri provider supports more advanced features such as relevance feedback. The Bing provider is suitable for web search, but requires a (paid) Bing API key. Please see the sections linked for each provider on how to configure and use them. The Bing provider is suitable for web search. If you wish to use another search provider, please see the [custom search providers](#custom-search-providers) section below.
- Run the server
    ```
    // Start the development server
    npm run start
    
    // If you get any errors connecting to MongoDB or Redis they may be running on a different
    // port, instructions for changing the port are in the configuration section below.
    
    // Check if API is running (curl or through browser)
    curl http://localhost:4443
    ```

## Search Providers
You can install the supported search providers as follows. See the [configuration section](#configuration) for how to configure which search provider is used by default.

### Elasticsearch
Execute the [Elasticsearch installation instructions](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/deb.html).

### Indri
1. Execute the [node-indri installation instructions](https://github.com/felipemoraes/node-indri#setup).
2. Copy the built node-indri module from `build/Release/node-indri` inside your node-indri folder to `lib/node-indri` inside your searchx-backend folder (you need to create the lib and node-indri folders first).

### Bing
SearchX requires a [Bing API key](https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/) to use the Bing web search provider.

Once you have a Bing API key, you can paste it into your `.env` file under the key `BING_ACCESS_KEY`. Be careful not to check the key into version control, since this may lead to abuse if the key leaks.

# API Specification 
```
// Search
[address]/v1/search/[vertical]/?query=[query]&page=[pageNumber]&provider=[provider]
- address: address set in the configuration file (testUrl:PORT)
- vertical: search vertical to use, as specified by search provider, eg. (web, images, videos, news) for bing
- userId: the identifier for the user that is issuing this API call
- sessionId: the identifier for the session that the this API call belongs to
- query: query string
- page: page number
- providerName [optional]: the search provider to use (elasticsearch, indri, bing), defaults to DEFAULT_SEARCH_PROVIDER if unset
- relevanceFeedback [optional, false by default]: whether to use relevance feedback (false, individual, shared)
- distributionOfLabour [optional, false by default]: whether to use distribution of labour (false, unbookmarkedSoft, unbookmarkedOnly)
```

# Configuration
The main production configuration keys can be set in the `.env` file, example values can be found in `.example.env`. These keys are:
- `NODE_ENV`: the node environment (production or development)
- `PORT`: the port server will run on
- `DB`: the database url
- `REDIS`: the redis server url
- `DEFAULT_SEARCH_PROVIDER`: the search provider that is used by default if the provider url parameter of the API is not set
- `BING_ACCESS_KEY` (optional): the API access key for when the Bing search provider is used
- `ELASTICSEARCH_URI` (optional): the Elasticsearch url
- `SUGGESTIONS_TYPE` (optional, defaul=none): choose from bing, indri, or none. Indri makes a suffix-prefix lookup.

Further development configuration can be found inside `app/config/config.js`:
```
module.exports = {
    outDir: './out',
    testDb: 'mongodb://localhost/searchx-test',
    testUrl: 'http://localhost',
    cacheFreshness: 3600,
    scrapFreshness: 60 * 60 * 24
};
```

# Running tests
The tests require that the [Elasticsearch search provider](#elasticsearch) is installed.

```
// Load the test dataset into elasticsearch
./node_modules/elasticdump/bin/elasticdump --input=test/data/test_index_mapping.json --output=http://localhost:9200/cranfield --type=mapping
./node_modules/elasticdump/bin/elasticdump --input=test/data/test_index.json --output=http://localhost:9200/cranfield --type=data

// Run tests
npm test
```

# Modifications
SearchX can be extended to define tasks, and to support new providers for search results.

## Tasks
Tasks define extra functionality that can be used in the frontend for user studies, for example placing users in groups according to predefined criteria, giving them search instructions, and asking them questions on what they found. Two example tasks have been added in `app/services/session/tasks/`:
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

## Custom search providers
Three search provider services are included: Elasticsearch, Indri, and Bing. These services can be found in `app/services/search/providers/`, and can serve as example of how to implement new search providers. New search providers can be implemented by adding a service in to the same folder, and adding it to the provider mapping in `app/services/search/provider.js`. The set of possible verticals and number of results per page can be defined as desired by the provider implementation. The provider service must implement the `fetch(query, vertical, pageNumber, resultsPerPage, relevanceFeedbackDocuments)` function, which must return a promise that resolves to an object containing the results if retrieving the search results is successful. The `resultsPerPage` and `relevanceFeedbackDocuments` can be ignored if the provider does not support these functions, see the bing provider for an example of how to handle this case by throwing errors for unsupported values.

The object containing the results needs to have the following fields:
```
{ matches: <number of matches>,
  results: [
    <result>,
    ...
]}
```

The data structure of the `<result>` depends on the result type, which is defined by the component that will be used to display the result in the frontend. See the [searchx-frontend documentation](https://github.com/felipemoraes/searchx-frontend#search-providers) for an explanation of how to add custom result types.

The included result types are (fields preceded by `<OPTIONAL>` are optional):

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
    {name: <name of the first publisher of this video>}
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

### Text
```
  id: <unique identifier of document>,
  name: <name of the document>,
  date: <date the document was published (in format compatible with Date() constructor)>,
  source: <name of the publisher of this document>,
  snippet: <part of text to display on search engine results page>,
  text: <full document text>
```

# Citation
If you use SearchX to produce results for your scientific publication, please refer to our [SIGIR 2018](http://fmoraes.nl/documents/moraes2018sigir.pdf) paper.
```
@inproceedings{putra2018searchx,
  title={SearchX: Empowering Collaborative Search Research.},
  author={Putra, Sindunuraga Rikarno and Moraes, Felipe and Hauff, Claudia},
  booktitle={SIGIR},
  pages={1265--1268},
  year={2018}
}
```


### Publications

    @article{moraes2019impact,
      title={On the impact of group size on collaborative search effectiveness},
      author={Moraes, Felipe and Grashoff, Kilian and Hauff, Claudia},
      journal={Information Retrieval Journal},
      pages={1--23},
      year={2019},
      publisher={Springer}
    }
    
    
    @inproceedings{moraes2019node,
        title={node-indri: moving the Indri toolkit to the modern Web stack},
        author={Moraes, Felipe and Hauff, Claudia},
        booktitle={ECIR},
        pages={241--245},
        year={2019}
    }

    @inproceedings{moraes2018contrasting,
      title={Contrasting Search as a Learning Activity with Instructor-designed Learning},
      author={Moraes, Felipe and Putra, Sindunuraga Rikarno and Hauff, Claudia},
      booktitle={CIKM},
      pages={167--176},
      year={2018}
    }
    
    @inproceedings{putra2018development,
        title={On the Development of a Collaborative Search System},
        author={Putra, Sindunuraga Rikarno and Grashoff, Kilian and Moraes, Felipe and Hauff, Claudia},
        booktitle={DESIRES},
        pages={76--82},
        year={2018}
    }
# License
[MIT](https://opensource.org/licenses/MIT) License
