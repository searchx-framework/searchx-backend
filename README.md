# Current build

![Travis CI build status]()

# Pienapple API

- URL: http://api.pienapple.com
- API Specification: http://docs.pienapple.com

# Set up instructions

- Install NodeJS: https://nodejs.org/en/
- Install MongoDB: https://www.mongodb.com/
- Install Redis: https://redis.io/

```
// Clone the repository
git clone https://github.com/felipemoraes/pienapple-api.git

// Install dependencies
npm install

// In a new terminal window, start the external and internal databases

// Start MongoDB locally
mongod

// Start Redis locally
redis-server

// For development, inside app/env/config/development.js set:
-  MongoDB and redis address
-  Bing API Access Key
-  API port and address

module.exports = {
    db: 'mongodb://localhost/pienapple',
    url: 'http://localhost',
    port: 3001,
    client: 'http://localhost:3000',
    redis: 'redis://localhost:6379',
    bingAccessKey: 'XXXXXX'
};

// Start the development server
foreman start -f Procfile.development -e environment.development
```

// Now open the browser at http://localhost:3001/v1/ and check if API is alive

# API Specification 
```
[address]/v1/search/[vertical]/?query=[query]&page=[pageNumber]
- address: address set in the configuration file
- vertical: web, images, videos, news
- query: query string
- page: page number
```

# Running tests
```

// Perform all the steps above and run:
npm test

```
