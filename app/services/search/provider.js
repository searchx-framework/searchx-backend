'use strict';

const bing = require('./providers/bing');
const elasticsearch = require('./providers/elasticsearch');

// mapping of providerName to search provider module
const providers = {
    bing: bing,
    elasticsearch: elasticsearch
};

/*
 * Fetches data from search provider and returns the formatted result
 *
 * @params {query} the search query
 * @params {vertical} type of search results (web, images, etc)
 * @params {pageNumber} result pagination number
 * @params {providerName} the name of the search provider to use (bing by default)
 */
exports.fetch = function (query, vertical, pageNumber, providerName) {
    if (!(providerName in providers)) {
        return Promise.reject({
            name: 'Bad Request',
            message: 'Provider does not exist'
        });
    }
    let provider = providers[providerName];

    return new Promise(function (resolve, reject) {
        const callback = function (err, res, body) {
            if (err) return reject(err);

            const data = provider.formatResults(vertical, res, body);
            resolve(data);
        };

        provider.fetch(query, vertical, pageNumber, callback);
    });
};
