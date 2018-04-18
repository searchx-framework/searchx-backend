'use strict';

const provider = require('./provider');
const bookmark = require('../../services/features/bookmark');

function getId(result) {
    return result.id ? result.id : result.url;
}

/*
 * Fetches search results from the provider, applies algorithmic mediation and ensures that all required fields
 * are included in results.
 *
 * @params {query} the search query
 * @params (vertical) type of search results (web, images, etc)
 * @params {pageNumber} result pagination number
 * @params {sessionId} session id of the user
 * @params {userId} id of the user
 * @params {providerName} the name of the search provider to use (indri by default)
 * @params {relevanceFeedback} string indicating what type of relevance feedback to use (false, individual, shared)
 * @params {distributionOfLabour} string indicating what type of distribution of labour to use (false, unbookmarkedSoft, unbookmarkedOnly)
 */
exports.fetch = async function (query, vertical, pageNumber, sessionId, userId, providerName, relevanceFeedback, distributionOfLabour) {
    const count = (vertical === 'images' || vertical === 'videos') ? 12 : 10;
    const bookmarks = await bookmark.getBookmarks(sessionId);
    const excludes = await bookmark.getBookmarks(sessionId, true);
    const userBookmarks = await bookmark.getUserBookmarks(sessionId, userId);
    const bookmarkIds = bookmarks.map(bookmark => bookmark.url);
    const excludeIds = excludes.map(exclude => exclude.url);
    const collapsibleIds = bookmarkIds.concat(excludeIds);
    const userBookmarkIds = userBookmarks.map(bookmark => bookmark.url);

    let accumulatedResults = [];
    let response;

    if (![false, 'individual', 'shared'].includes(relevanceFeedback)) {
        throw {
            name: 'Bad Request',
            message: 'Invalid relevanceFeedback'
        };
    }

    if (![false, 'unbookmarkedSoft', 'unbookmarkedOnly'].includes(distributionOfLabour)) {
        throw {
            name: 'Bad Request',
            message: 'Invalid distributionOfLabour'
        };
    }

    // for loop to limit maximum number of repeated queries
    for (let i = 0; i < 10; i++) {
        if (relevanceFeedback === "individual") {
            response = await provider.fetch(query, vertical, pageNumber + i, providerName, userBookmarkIds);
        } else if (relevanceFeedback === "shared") {
            response = await provider.fetch(query, vertical, pageNumber + i, providerName, bookmarkIds);
        } else {
            response = await provider.fetch(query, vertical, pageNumber + i, providerName, []);
        }
        let filteredResults = response.results;
        if (filteredResults.length === 0) {
            break
        }
        if (distributionOfLabour === "unbookmarkedOnly") {
            filteredResults = filteredResults.filter(resultsFilter(bookmarkIds));
        }
        accumulatedResults = accumulatedResults.concat(filteredResults);
        if (accumulatedResults.filter(resultsFilter(collapsibleIds)).length >= count) {
            break
        }
    }

    if (distributionOfLabour === false) {
        accumulatedResults = accumulatedResults.slice(0, count);
    } else {
        // total number of results returned is such that there are always <count> uncollapsible results included)

        let unCollapsibleResults = 0;
        let i;
        for (i = 0; i < accumulatedResults.length; i++) {
            if (!collapsibleIds.includes(getId(accumulatedResults[i]))) {
                unCollapsibleResults++;
            }
            if (unCollapsibleResults >= count) {
                break
            }
        }
        accumulatedResults = accumulatedResults.slice(0, i + 1);
    }
    accumulatedResults = addMissingFields(accumulatedResults);
    return accumulatedResults;
};

function resultsFilter(collapsibleIds) {
    return result => {
        if (result.id) {
            return !collapsibleIds.includes(result.id)
        } else {
            return !collapsibleIds.includes(result.url)
        }
    }
}

/**
 * Add required fields when missing
 * @param results the set of results to add missing fields to
 * @returns set of results with missing fields added
 */
function addMissingFields(results) {
    return results.map(result => {
        if (!result.name.replace(/\s/g,'')) {
            result.name = "Untitled";
        }
        if (result.id && !result.text.replace(/\s/g,'')) {
            result.text = "No text available"
        }
        if (!result.snippet.replace(/\s/g,'')) {
            result.snippet = "No text available"
        }
        return result;
    });
}