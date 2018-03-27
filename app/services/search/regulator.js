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
 * @params {relevanceFeedback} string indicating what type of relevance feedback to use (false, individual, shared)
 * @params {distributionOfLabour} string indicating what type of distribution of labour to use (false, unbookmarkedSoft, unbookmarkedOnly)
 */
exports.fetch = async function (query, vertical, pageNumber, sessionId, userId, providerName, relevanceFeedback, distributionOfLabour) {
    const count = (vertical === 'images' || vertical === 'videos') ? 12 : 10;
    const bookmarks = await bookmark.getBookmarks(sessionId);
    const bookmarkedUrls = bookmarks.map(bookmark => bookmark.url);

    let accumulatedResults = [];
    let response;

    // for loop to limit maximum number of repeated queries
    for (let i = 0; i < 10; i++) {
        response = await provider.fetch(query, vertical, pageNumber + i, providerName);
        let filteredResults = response.results;
        if (distributionOfLabour === "unbookmarkedOnly") {
            filteredResults = filteredResults.filter(resultsFilter(bookmarkedUrls));
        }
        accumulatedResults = accumulatedResults.concat(filteredResults);
        if (accumulatedResults.filter(resultsFilter(bookmarkedUrls)).length >= count) {
            break
        }
    }

    if (distributionOfLabour === "false") {
        accumulatedResults = accumulatedResults.slice(0, count);
    } else {
        // return count unbookmarked results
        // (total number of results returned is count + the number of judged results in the list)
        accumulatedResults = accumulatedResults.slice(0, count +
            (accumulatedResults.length - accumulatedResults.filter(resultsFilter(bookmarkedUrls)).length));
    }
    response.results = accumulatedResults;
    return response
};

function resultsFilter(bookmarkedUrls) {
    return result => !bookmarkedUrls.includes(result.url)
}