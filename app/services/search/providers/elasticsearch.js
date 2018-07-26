'use strict';

const elasticsearchApi = require('elasticsearch');
const esClient = new elasticsearchApi.Client({
    host: 'localhost:9200',
    log: 'error'
});
const clueweb = require('./es-datasets/clueweb');
const cranfield = require('./es-datasets/cranfield');

// mapping of vertical to module for elasticsearch dataset
const verticals = {
    text: cranfield
};

/*
 * Fetches data from elasticsearch and returns the formatted result
 */
exports.fetch = function (query, vertical, pageNumber, resultsPerPage) {
    if (vertical in verticals) {
        const dataset = verticals[vertical];
        return esClient.search({
            index: dataset.index,
            type: 'document',
            from: (pageNumber - 1) * resultsPerPage,
            size: resultsPerPage,
            body: {
                query: {
                    match: {
                        [dataset.queryField]: query
                    }
                }
            }
        }).then(formatResults(vertical));
    } else return Promise.reject({
        name: 'Bad Request',
        message: 'Invalid vertical'
    });
};

/*
 * Format the results returned by elasticsearch, using the dataset corresponding to the requested vertical
 */
function formatResults(vertical) {
    return function (result) {
        const dataset = verticals[vertical];
        if (!result.hits || result.hits.length === 0) {
            throw new Error('No results from search api.');
        }
        let results = [];

        result.hits.hits.forEach(function (hit) {
            results.push(dataset.formatHit(hit));
        });

        return {
            results: results,
            matches: result.hits.total
        };
    }
}
