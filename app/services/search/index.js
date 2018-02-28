'use strict';

const provider = require('./provider');
const cache = require('./cache');
const bookmark = require('../features/bookmark');
const annotation = require('../features/annotation');
const rating = require('../features/rating');
const view = require('../features/view');


/*
 * Fetches and processes search results from the search api
 *
 * @params {query} the search query
 * @params {pageNumber} result pagination number
 * @params {vertical} type of search results (web, images, etc)
 * @params {sessionId} session id of user
 */
exports.search = async function(query, vertical, pageNumber, sessionId, userId) {
    let data = await cache.getSearchResultsFromCache(query, vertical, pageNumber);
    if (!data) {
        const date = new Date();
        data = await provider.fetch(query, vertical, pageNumber);
        data.id = query + '_' + pageNumber + '_' + vertical + '_' + date.getTime();

        cache.addSearchResultsToCache(query, vertical, pageNumber, date, data)
            .catch(err => {
                console.log(err);
            });
    } else {
        data = data.data;
    }

    data.results = await addMetadata(data.results, sessionId, userId);
    return data;
};


/*
 * Add metadata to search results
 *
 * @params {results} formatted query results from api
 * @params {sessionId} session id of user
 */
async function addMetadata(results, sessionId, userId) {
    const promises = results.map(async (result) => {
        result.metadata = {
            bookmark: await bookmark.getBookmark(sessionId, result.url),
            annotations: (await annotation.getAnnotations(sessionId, result.url)).length,
            rating: (await rating.getRating(sessionId, result.url, userId)).total,
            views: await view.getViews(sessionId, result.url),
        };

        return result;
    });

    return await Promise.all(promises);
}
