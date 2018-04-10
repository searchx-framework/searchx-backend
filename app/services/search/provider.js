'use strict';

const bing = require('./providers/bing');
const elasticsearch = require('./providers/elasticsearch');
const indri = require('./providers/indri');

// mapping of providerName to search provider module
const providers = {
    'bing': bing,
    'elasticsearch': elasticsearch,
    'indri': indri
};

/*
 * Fetches data from search provider and returns the formatted result
 *
 * @params {query} the search query
 * @params {vertical} type of search results (web, images, etc)
 * @params {pageNumber} result pagination number
 * @params {providerName} the name of the search provider to use (bing by default)
 * @params {relevanceFeedbackDocuments} the set of documents to use for relevance feedback (if supported by provider)
 */
exports.fetch = function (query, vertical, pageNumber, providerName, relevanceFeedbackDocuments) {
    if (!(providerName in providers)) {
        return Promise.reject({
            name: 'Bad Request',
            message: 'Provider does not exist'
        });
    }
    let provider = providers[providerName];

    return provider.fetch(query, vertical, pageNumber, relevanceFeedbackDocuments);
};
