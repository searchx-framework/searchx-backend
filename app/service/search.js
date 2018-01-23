'use strict';

const config = require('../config/config');
const Bing = require('node-bing-api')({accKey: config.bingAccessKey, rootUri: "https://api.cognitive.microsoft.com/bing/v7.0/"});

const cache = require('../service/cache');
const session = require('../service/session');


/*
 * Fetches and processes search results from the search api
 *
 * @params {query} the search query
 * @params {pageNumber} result pagination number
 * @params {vertical} type of search results (web, images, etc)
 * @params {sessionId} session id of user
 */
exports.search = async function(query, pageNumber, vertical, sessionId) {
    let data = await cache.getSearchResultsFromCache(query, vertical, pageNumber);
    if (!data) {
        const body = await searchAsync(query, pageNumber, vertical);
        const date = new Date();

        data = formatResults(vertical, body);
        data.id = query + '_' + pageNumber + '_' + vertical + '_' + date.getTime();

        cache.addSearchResultsToCache(query, vertical, pageNumber, date, data, body);
    } else {
        data = data.data;
    }

    data.results = await addMetadata(data.results, sessionId);
    return data;
};


/*
 * Search api call that returns a promise
 *
 * @params {query} the search query
 * @params {pageNumber} result pagination number
 * @params {vertical} type of search results (web, images, etc)
 */
function searchAsync(query, pageNumber, vertical) {
    const params = [query, constructOptions(pageNumber, vertical)];

    return new Promise(function(resolve, reject) {
        const callback = function(err, res, body) {
            if (err !== null) return reject(err);
            resolve(body);
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
}

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
function constructOptions(pageNumber, vertical) {
    const count = (vertical === 'images' || vertical === 'videos') ? 12: 10;
    const mkt = 'en-US';
    const offset = (pageNumber-1) * count;

    return {
        offset: offset,
        count: count,
        mkt: mkt
    };
}


/*
 * Add metadata from search results
 *
 * @params {results} formatted query results from api
 * @params {sessionId} session id of user
 */
async function addMetadata(results, sessionId) {
    const promises = results.map(async (result) => {
        try {
            const data = await session.getBookmark(sessionId, result.url);
            result.bookmark = true;
            result.bookmarkUserId = data.userId;
            result.bookmarkTime = data.date;
        }
        catch(err) {
            result.bookmark = false;
        }

        return result;
    });

    return await Promise.all(promises);
}