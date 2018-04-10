'use strict';

const indri = require('../../../../lib/node-indri/node-indri');
const searcher = new indri.Searcher({
    "index": "./lib/node-indri/etc/poems_index",
    "rules" : "method:dirichlet,mu:1000",
    "fbTerms": 10,
    "fbMu": 1500,
    "includeFields": { "title": "headline", "docno": "docno"},
    "includeDocument" : true,
    "resultsPerPage": 10
});

const verticals = [
    'web'
];

/*
 * Fetches data from indri
 *
 * @params {query} the search query string
 * @params {vertical} type of search results (web, images, etc)
 * @params {pageNumber} the number of the page of results to show (1-based indexing)
 * @params {relevanceFeedbackDocuments} the set of documents to use for relevance feedback
 */
exports.fetch = function (query, vertical, pageNumber, relevanceFeedbackDocuments) {
    if (!verticals.includes(vertical)) {
        throw {
            name: 'Bad Request',
            message: 'Invalid vertical'
        }
    }

    return new Promise(function (resolve, reject) {
        const callback = function (error, results) {
            if (error) return reject(error);
            resolve(formatResults(results));
        };

        searcher.search(query, pageNumber, relevanceFeedbackDocuments, callback);
    });
};


function formatResults(results) {
    return {
        results: results
    };
}