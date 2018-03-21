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
    const bookmarks = await bookmark.getBookmarks(sessionId);
    const bookmarkedUrls = bookmarks.map(bookmark => bookmark.url);
    let accumulatedResults = [];
    let response;

    // for loop to limit maximum number of repeated queries
    for (let i = 0; i < 10; i++) {
        console.log(i);
        response = await provider.fetch(query, vertical, pageNumber + i, providerName);
        let filteredResults = response.results;
        filteredResults = filteredResults.filter(result => {
            return !bookmarkedUrls.includes(result.url)
        });
        accumulatedResults = accumulatedResults.concat(filteredResults);
        if (accumulatedResults.length >= 10) {
            break
        }
    }
    accumulatedResults = accumulatedResults.slice(0, 10);
    response.results = accumulatedResults;
    return response
};
