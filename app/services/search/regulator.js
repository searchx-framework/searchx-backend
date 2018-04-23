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

    let response;

    if (!distributionOfLabour && !relevanceFeedback) {
        response = await provider.fetch(query, vertical, pageNumber, providerName);
        return response.results;
    }

    const numberOfResults = count * pageNumber + collapsibleIds.length;
    if (relevanceFeedback === "individual") {
        response = await provider.fetch(query, vertical, 1, providerName, numberOfResults, userBookmarkIds);
    } else if (relevanceFeedback === "shared") {
        response = await provider.fetch(query, vertical, 1, providerName, numberOfResults, bookmarkIds);
    } else {
        response = await provider.fetch(query, vertical, 1, providerName, numberOfResults, []);
    }

    const allResults = response.results;

    if (!distributionOfLabour) {
        const start = (pageNumber - 1) * count;
        return allResults.slice(start, start + count);
    }

    // Count number of uncollapsible results to determine where to start current page.
    // Each previous page has exactly <count> uncollapsed results.
    const uncollapsibleResultsOnPreviousPages = (pageNumber - 1) * count;
    let resultsOnPreviousPages;
    let i = 0;
    if (uncollapsibleResultsOnPreviousPages > 0) {
        let uncollapsibleResults = 0;
        for (i = 0; i < allResults.length; i++) {
            if (!collapsibleIdMap[getId(allResults[i])]) {
                uncollapsibleResults++;
            }
            if (uncollapsibleResults >= uncollapsibleResultsOnPreviousPages) {
                break;
            }
        }
        i++;
        resultsOnPreviousPages = allResults.slice(0, i);
    } else {
        resultsOnPreviousPages = [];
    }

    // Find all results on previous pages that the user has not viewed yet, they will be promoted to the current page
    // to make sure that the user does not miss any results that have recently been promoted by relevance feedback.
    const viewedResultIds = await viewedResults.getViewedResultIds(query, vertical, providerName, sessionId, userId);
    const viewedResultsIdMap = {};
    let results = [];
    if (viewedResultIds) {
        viewedResultIds.forEach(resultId => {
            viewedResultsIdMap[resultId] = true;
        });

        results = resultsOnPreviousPages.filter(result => !viewedResultsIdMap[result.id]);
    }

    let uncollapsibleResults = results.filter(resultsFilter(collapsibleIdMap)).length;
    for (let j = i; j < allResults.length; j++) {
        const result = allResults[j];
        results.push(result);
        if (!collapsibleIdMap[getId(result)]) {
            uncollapsibleResults++;
        }
        if (uncollapsibleResults >= count) {
            break;
        }
    }
    if (distributionOfLabour === "unbookmarkedOnly") {
        results = results.filter(resultsFilter(bookmarkIdMap));
    }
    results = addMissingFields(results);
    const resultIds = results.map(result => getId(result));

    await viewedResults.addViewedResultIds(query, vertical, providerName, sessionId, userId, resultIds)
        .catch(err => {
            console.log(err);
        });

    return results;
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