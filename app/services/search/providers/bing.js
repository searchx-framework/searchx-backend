'use strict';

const config = require('../../../config/config');
const BingApi = require('node-bing-api')({
    accKey: config.bingAccessKey,
    rootUri: "https://api.cognitive.microsoft.com/bing/v7.0/"
});

/*
 * Fetches data from bing
 *
 * @params {params} the search parameters
 * @params {vertical} type of search results (web, images, etc)
 * @params {callback} the callback function that is executed once the request returns
 */
exports.fetch = function (params, vertical, callback) {
    if (vertical === 'web') BingApi.web(...params, callback);
    else if (vertical === 'news') BingApi.news(...params, callback);
    else if (vertical === 'images') BingApi.images(...params, callback);
    else if (vertical === 'videos') BingApi.video(...params, callback);
    else throw {
            name: 'Bad Request',
            message: 'Invalid search type!'
        }
};

/*
 * Formats result body received from search api call
 *
 * @params {vertical} type of search results (web, images, etc)
 * @params {body} result body received from the api call
 */
exports.formatResults = function (vertical, res, body) {
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
};