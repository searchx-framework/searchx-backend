'use strict';

const provider = require('./provider');
const cache = require('./cache');
const bookmark = require('../feature/bookmark');


/*
 * Fetches and processes search results from the search api
 *
 * @params {query} the search query
 * @params {pageNumber} result pagination number
 * @params {vertical} type of search results (web, images, etc)
 * @params {sessionId} session id of user
 */
exports.search = async function(query, vertical, pageNumber, sessionId) {
    let data = await cache.getSearchResultsFromCache(query, vertical, pageNumber);
    if (!data) {
        const date = new Date();
        data = await provider.fetch(query, vertical, pageNumber);
        data.id = query + '_' + pageNumber + '_' + vertical + '_' + date.getTime();

        cache.addSearchResultsToCache(query, vertical, pageNumber, date, data);
    } else {
        data = data.data;
    }

    data.results = await addMetadata(data.results, sessionId);
    return data;
};


/*
 * Add metadata from search results
 *
 * @params {results} formatted query results from api
 * @params {sessionId} session id of user
 */
async function addMetadata(results, sessionId) {
    const promises = results.map(async (result) => {
        try {
            const data = await bookmark.getBookmark(sessionId, result.url);
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