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
exports.fetch = function (params, vertical, callback) {
    if (vertical in verticals) {
        const dataset = verticals[vertical];
        esClient.search({
            index: dataset.index,
            type: 'document',
            from: params[1].offset,
            size: params[1].count,
            body: {
                query: {
                    match: {
                        [dataset.queryField]: params[0]
                    }
                }
            }
        }, callback);
    } else throw {
        name: 'Bad Request',
        message: 'Invalid search type!'
    }
};

/*
 * Format the results returned by elasticsearch, using the dataset corresponding to the requested vertical
 */
exports.formatResults = function (vertical, res, body) {
    const dataset = verticals[vertical];
    if (!res.hits || res.hits.length === 0) {
        throw new Error('No results from search api.');
    }
    let results = [];

    res.hits.hits.forEach(function (hit) {
        const source = hit._source;
        results.push(dataset.formatSource(source));
    });

    return {
        results: results,
        matches: res.hits.total
    }
};