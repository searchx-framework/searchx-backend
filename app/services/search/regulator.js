'use strict';

const provider = require('./provider');
const bookmark = require('../../services/features/bookmark');

/*
 * Fetches search results from the provider and applies algorithmic mediation
 *
 * @params {query} the search query
 * @params (vertical) type of search results (web, images, etc)
 * @params {pageNumber} result pagination number
 * @params {sessionId} session id of the user
 * @params {userId} id of the user
 * @params {providerName} the name of the search provider to use (bing by default)
 */
exports.fetch = async function (query, vertical, pageNumber, sessionId, userId, providerName) {
    const count = (vertical === 'images' || vertical === 'videos') ? 12 : 10;
    const bookmarks = await bookmark.getBookmarks(sessionId);
    const bookmarkedUrls = bookmarks.map(bookmark => bookmark.url);

    let accumulatedResults = [];
    let response;

    // for loop to limit maximum number of repeated queries
    for (let i = 0; i < 10; i++) {
        response = await provider.fetch(query, vertical, pageNumber + i, providerName);
        let filteredResults = response.results;
        filteredResults = filteredResults.filter(result => {
            return !bookmarkedUrls.includes(result.url)
        });
        accumulatedResults = accumulatedResults.concat(filteredResults);
        if (accumulatedResults.length >= count) {
            break
        }
    }
    accumulatedResults = accumulatedResults.slice(0, count);
    response.results = accumulatedResults;
    return response
};
