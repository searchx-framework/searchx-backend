
'use strict';

const BingApi = require('node-bing-api')({
    accKey: process.env.BING_ACCESS_KEY,
    rootUri: "https://api.bing.microsoft.com/v7.0/"
});

/**
 * Fetch data from bing and return formatted results.
 */
exports.fetch = function (query, vertical, pageNumber, resultsPerPage, relevanceFeedbackDocuments) {
    return new Promise(function (resolve, reject) {
        const callback = function (err, res, body) {
            if (err) return reject(err);

            const data = formatResults(vertical, body);
            resolve(data);
        };
        if ((resultsPerPage !== 12 && vertical === 'images') || (resultsPerPage !== 10 && vertical === 'web') || (resultsPerPage !== 12 && vertical === 'videos') || (resultsPerPage !== 10 && vertical === 'news')) {
            throw {name: 'Bad Request', message: 'Invalid number of results per page (Bing only supports a fixed number of results per page, and can therefore not support Distribution of Labour)'}
        }
        if (Array.isArray(relevanceFeedbackDocuments) && relevanceFeedbackDocuments.length > 0) {
            throw {name: 'Bad Request', message: 'The Bing search provider does not support relevance feedback, but got relevance feedback documents.'}
        }

        const options = constructOptions(vertical, pageNumber);
        if (vertical === 'web') BingApi.web(query, options, callback);
        else if (vertical === 'news') BingApi.news(query, options, callback);
        else if (vertical === 'images') BingApi.images(query, options, callback);
        else if (vertical === 'videos') BingApi.video(query, options, callback);
        else throw {name: 'Bad Request', message: 'Invalid vertical'}
    });
};

/**
 * Format result body received from search api call.
 */
function formatResults(vertical, body) {
    if (!body) {
        throw new Error('No response from bing api.');
    }

    if (!("value" in body || "webPages" in body)) {
        return {
            results: [],
            matches: 0
        };
    }

    ////

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

/**
 * Construct search query options according to search api (bing).
 * https://www.npmjs.com/package/node-bing-api
 * https://docs.microsoft.com/en-us/azure/cognitive-services/bing-web-search/search-the-web
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
