'use strict';

const elasticsearchApi = require('elasticsearch');
const esClient = new elasticsearchApi.Client({
    host: 'localhost:9200',
    log: 'error'
});

exports.fetch = function (params, vertical, callback) {
    if (vertical === 'web') esClient.search({
        index: 'clueweb-diskb-00',
        type: 'document',
        body: {
            query: {
                match: {
                    'parsed-content': params[0]
                }
            }
        }
    }, callback);
    else throw {
        name: 'Bad Request',
        message: 'Invalid search type!'
    }
};

exports.formatResults = function(vertical, res, body) {
    if (!res.hits || res.hits.length === 0) {
        throw new Error('No results from search api.');
    }
    let results = [];

    res.hits.hits.forEach(function (hit){
        const source = hit._source;
        // strip extra whitespace and limit snippet length
        // todo: pre-process the data in elasticsearch so whitespace stripping is not needed
        const snippet = source['parsed-content'].replace(/\\n|\\r/g, " ").replace(/\s+/g, " ").substr(3, 200);
        const result = {
            name: source.title.replace(/\\n|\\r/g, " ").replace(/\s+/g, " "),
            url: source['target-uri'],
            displayUrl: source['target-uri'],
            snippet: snippet
        };
        results.push(result);
    });

    return {
        results: results,
        matches: res.hits.total
    }
};