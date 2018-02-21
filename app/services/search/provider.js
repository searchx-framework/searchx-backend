'use strict';

const bing = require('./providers/bing');
const elasticsearch = require('./providers/elasticsearch');

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
 * @params {provider} the search provider to use (bing by default)
 */
exports.fetch = function (query, vertical, pageNumber, providerName) {
    let provider = providers[providerName];
    const params = [query, constructOptions(vertical, pageNumber)];

    return new Promise(function (resolve, reject) {
        const callback = function (err, res, body) {
            if (err) return reject(err);

            const data = provider.formatResults(vertical, res, body);
            resolve(data);
        };

        provider.fetch(params, vertical, callback);
    });
};

/*
 * Construct search query options according to search api (bing)
 *
 * https://www.npmjs.com/package/node-bing-api
 * https://docs.microsoft.com/en-us/azure/cognitive-services/bing-web-search/search-the-web
 *
 * @params The query parameters passed to the API via GET
 */
function constructOptions(vertical, pageNumber) {
    const count = (vertical === 'images' || vertical === 'videos') ? 12 : 10;
    const mkt = 'en-US';
    const offset = (pageNumber - 1) * count;

    return {
        offset: offset,
        count: count,
        mkt: mkt
    };
}