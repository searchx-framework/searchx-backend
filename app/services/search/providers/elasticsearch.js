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
    web: cranfield
};

/*
 * Fetches data from elasticsearch and returns the formatted result
 */
exports.fetch = function (query, vertical, pageNumber) {
    if (vertical in verticals) {
        const dataset = verticals[vertical];
        const size = 10;
        return esClient.search({
            index: dataset.index,
            type: 'document',
            from: (pageNumber - 1) * size,
            size: size,
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
            const source = hit._source;
            results.push(dataset.formatSource(source));
        });

        return {
            results: results,
            matches: result.hits.total
        }
    }
}
