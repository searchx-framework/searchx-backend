'use strict';

const config = require('../../config/config');
const Bing = require('node-bing-api')({accKey: config.bingAccessKey, rootUri: "https://api.cognitive.microsoft.com/bing/v7.0/"});


/*
 * Fetches data from search provider and returns the formatted result
 *
 * @params {query} the search query
 * @params {vertical} type of search results (web, images, etc)
 * @params {pageNumber} result pagination number
 */
exports.fetch = function(query, vertical, pageNumber) {
    const params = [query, constructOptions(vertical, pageNumber)];

    return new Promise(function(resolve, reject) {
        const callback = function(err, res, body) {
            if (err !== null) return reject(err);

            const data = formatResults(vertical, body);
            resolve(data);
        };

        if (vertical === 'web') Bing.web(...params, callback);
        else if (vertical === 'news') Bing.news(...params, callback);
        else if (vertical === 'images') Bing.images(...params, callback);
        else if (vertical === 'videos') Bing.video(...params, callback);
        else throw {
                name: 'Bad Request',
                message: 'Invalid search type!'
            }
    });
};


/*
 * Formats result body received from search api call
 *
 * @params {vertical} type of search results (web, images, etc)
 * @params {body} result body received from the api call
 */
function formatResults(vertical, body) {
    if (!body && !(body.value || body.webPages.value)) {
        throw new Error('No results from search api.');
    }

    if (vertical === 'web') {
        body = body.webPages
    }

    if (vertical === 'images' || vertical === 'videos') {
        for (let i = 0; i < body.value.length; i++) {
            body.value[i].url = body.value[i].contentUrl;
        }
    }

    return {
        results: body.value,
        matches: body.totalEstimatedMatches
    };
}


/*
 * Construct search query options according to search api (bing)
 *
 * https://www.npmjs.com/package/node-bing-api
 * https://docs.microsoft.com/en-us/azure/cognitive-services/bing-web-search/search-the-web
 *
 * @params The query parameters passed to the API via GET
 */
function constructOptions(vertical, pageNumber) {
    const count = (vertical === 'images' || vertical === 'videos') ? 12: 10;
    const mkt = 'en-US';
    const offset = (pageNumber-1) * count;

    return {
        offset: offset,
        count: count,
        mkt: mkt
    };
}