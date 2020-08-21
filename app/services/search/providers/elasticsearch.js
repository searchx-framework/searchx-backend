'use strict';

const elasticsearchApi = require('elasticsearch');
const esClient = new elasticsearchApi.Client({
    host: process.env.ELASTICSEARCH_URI ,
    log: 'error'
});
const clueweb = require('./es-datasets/clueweb');
const cranfield = require('./es-datasets/cranfield');
const amazon = require('./es-datasets/amazon');

// mapping of vertical to module for elasticsearch dataset
const verticals = {
    text: cranfield,
    shopping: amazon
};

const amazonCategories = ["All", "Electronics",  "Home and Kitchen", "Beauty", "Office Products", "Sports and Outdoors", "Toys and Games"]

/**
 * Fetch data from elasticsearch and return formatted results.
 */
exports.fetch = function (query, vertical, filters, pageNumber, resultsPerPage, relevanceFeedbackDocuments) {
    if (Array.isArray(relevanceFeedbackDocuments) && relevanceFeedbackDocuments.length > 0) {
        return Promise.reject({name: 'Bad Request', message: 'The Elasticsearch search provider does not support relevance feedback, but got relevance feedback documents.'})
    }
    if (amazonCategories.includes(vertical)) {
        const dataset = verticals['shopping'];

        return esClient.search({
            index: dataset.index,
            from: (pageNumber - 1) * resultsPerPage,
            size: resultsPerPage,
            body: dataset.getQuery(query, vertical, filters)
            
        }).then(formatResults('shopping'));
    }
    else if (vertical in verticals) {
        const dataset = verticals[vertical];
        return esClient.search({
            index: dataset.index,
            from: (pageNumber - 1) * resultsPerPage,
            size: resultsPerPage,
            body: dataset.getQuery(query, vertical, filters)
            
        }).then(formatResults(vertical));
    } else return Promise.reject({
        name: 'Bad Request',
        message: 'Invalid vertical'
    });
};

/**
 * Format the results returned by elasticsearch, using the dataset corresponding to the requested vertical.
 */
function formatResults(vertical) {
    return function (result) {
        const dataset = verticals[vertical];
        if (!result.hits || result.hits.length === 0) {
            throw new Error('No results from search api.');
        }
        let results = [];
        let facets = [];
        if (result.aggregations) {
            facets = Object.keys(result.aggregations).map((key, index) => [key, dataset.formatAggregation(key, result.aggregations)]);
            facets = facets.filter((data) => data[1].length > 0);
            facets = facets.reduce((map, obj) => { map[obj[0]] = obj[1]; return map}, {})
        }
        result.hits.hits.forEach(function (hit) {
            results.push(dataset.formatHit(hit));
        });

        return {
            results: results,
            facets: facets,
            matches: result.hits.total
        };
    }
}


exports.getById = function (id) {
    const dataset = verticals['shopping'];

    return esClient.get({
        index: dataset.index,
        id: id
    }).then(dataset.formatHit);
};