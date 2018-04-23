'use strict';

const provider = require('./provider');
const bookmark = require('../../services/features/bookmark');
const viewedResults = require('./viewedResults');

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
    const bookmarkIdMap = {};
    bookmarkIds.forEach(id => {
        bookmarkIdMap[id] = true;
    });
    const collapsibleIdMap = {};
    collapsibleIds.forEach(id => {
        collapsibleIdMap[id] = true;
    });

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

    // Find all results on previous pages that the user has not viewed yet, they will be promoted to the current page
    // to make sure that the user does not miss any results that have recently been promoted by relevance feedback.
    const viewedResultIds = await viewedResults.getViewedResultIds(query, vertical, providerName, sessionId, userId);
    const viewedResultsIdMap = {};
    let accumulatedResults = [];
    if (viewedResultIds) {
        viewedResultIds.forEach(resultId => {
            viewedResultsIdMap[resultId] = true;
        });
        for (let i = 1; i < pageNumber; i++) {
            const response = await provider.fetch(query, vertical, i, providerName, []);
            const pageResults = response.results;
            if (pageResults) {
                accumulatedResults = accumulatedResults.concat(pageResults);
            }
        }
        accumulatedResults = accumulatedResults.filter(result => !viewedResultsIdMap[result.id]);
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
            filteredResults = filteredResults.filter(resultsFilter(bookmarkIdMap));
        }
        accumulatedResults = accumulatedResults.concat(filteredResults);
        if (accumulatedResults.filter(resultsFilter(collapsibleIdMap)).length >= count) {
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
    const resultIds = accumulatedResults.map(result => getId(result));

    await viewedResults.addViewedResultIds(query, vertical, providerName, sessionId, userId, resultIds)
        .catch(err => {
            console.log(err);
        });

    return accumulatedResults;
};

function resultsFilter(collapsibleIdMap) {
    return result => {
        if (result.id) {
            return !(result.id in collapsibleIdMap)
        } else {
            return !(result.url in collapsibleIdMap)
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