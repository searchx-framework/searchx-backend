module.exports = {
  apps : [{
    name : "api",
    script: 'scripts/server.js',
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "development",
      PORT: 4443,
      DB: "mongodb://localhost/searchx",
      REDIS : "redis://localhost:6379",
      DEFAULT_SEARCH_PROVIDER: "elasticsearch",
      INDRI_INDEX : "/Users/felipemoraes/data/Aquaint-Index",
      BING_ACCESS_KEY : "4d5e3b68ae3949f5b864bcac31f7ffd5",
      SUGGESTIONS_TYPE : "indri",
      INDRI_NGRAM_FILE : './../../../../lib/ngram_count.json'
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
