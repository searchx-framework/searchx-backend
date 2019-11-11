'use strict';

const provider = require('./provider');
const bookmark = require('../../services/features/bookmark');
const viewedResults = require('./viewedResults');

/**
 * Fetch search results from the provider, apply algorithmic mediation and ensure that all required fields are included
 * in results.
 * @param query - The search query.
 * @param vertical - Type of search results (web, images, etc).
 * @param pageNumber - Result pagination number.
 * @param sessionId - The session id of the user.
 * @param userId - The id of the user.
 * @param providerName - The name of the search provider to use (indri by default).
 * @param relevanceFeedback - String indicating what type of relevance feedback to use (false, individual, shared).
 * @param distributionOfLabour - String indicating what type of distribution of labour to use (false, unbookmarkedSoft, unbookmarkedOnly).
 */
exports.fetch = async function (query, vertical, pageNumber, sessionId, userId, providerName, relevanceFeedback, distributionOfLabour) {
    // Convert falsy string to false boolean for cleaner if statements below.
        relevanceFeedback = false;
        distributionOfLabour = false;
    
    

    const resultPerPageCount = (vertical === 'images' || vertical === 'videos') ? 12 : 10;
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

    let relevanceFeedbackIds = [];
    if (relevanceFeedback === "individual") {
        relevanceFeedbackIds = userBookmarkIds;
    } else if (relevanceFeedback === "shared") {
        relevanceFeedbackIds = bookmarkIds;
    } else {
        relevanceFeedbackIds = [];
    }

    if (!distributionOfLabour) {
        const response = await provider.fetch(providerName, query, vertical, pageNumber, resultPerPageCount, relevanceFeedbackIds);
        response.results = addMissingFields(response.results);
        return response;
    }

    // Fetch as many results as may be needed.
    // Due to the collapsing of results we need to fetch extra results from the provider. Also, because we check
    // whether previous pages contain results the user has not yet seen, we also need to fetch the results for all
    // lower page numbers.
    const resultCount = resultPerPageCount * pageNumber + collapsibleIds.length;
    const response = await provider.fetch(providerName, query, vertical, pageNumber, resultPerPageCount, relevanceFeedbackIds);
    const matches = response.matches;
    const allResults = response.results;

    // Get the list of results for the current page.
    const previousPagePosition = await viewedResults.getLastPosition(query, vertical, providerName, sessionId, userId);
    const startPosition = getStartPosition(pageNumber, resultPerPageCount, previousPagePosition, allResults, collapsibleIdMap);
    const resultsOnPreviousPages = allResults.slice(0, startPosition);
    const viewedResultIds = await viewedResults.getViewedResultIds(query, vertical, providerName, sessionId, userId);
    const promotedResults = getPromotedResults(viewedResultIds, resultsOnPreviousPages);
    let {results, unpromotedResultCount} = getPageOfResults(promotedResults, resultPerPageCount, collapsibleIdMap, startPosition, allResults);
    if (distributionOfLabour === "unbookmarkedOnly") {
        results = results.filter(resultsFilter(bookmarkIdMap));
    }
    results = addMissingFields(results);

    // Add viewedResultIds and lastPosition entries in the database for this page of results.
    const resultIds = results.map(result => getId(result));
    await viewedResults.addViewedResultIds(query, vertical, providerName, sessionId, userId, resultIds)
        .catch(err => {
            console.log(err);
        });
    const lastPosition = unpromotedResultCount + startPosition;
    await viewedResults.setLastPosition(query, vertical, providerName, pageNumber, sessionId, userId, lastPosition);

    return {
        results: results,
        matches: matches
    };
};

/**
 * Get the start position in the list of all results of the current page.
 * @param pageNumber - The page number the user has requested.
 * @param count - The number of results per page.
 * @param previousPagePosition - The page number and position of the last element of the previous page.
 * @param allResults - The list of all results.
 * @param collapsibleIdMap - The map of results that are collapsible (and therefore not counted towards the number of
 *        results per page).
 * @returns {number} - The start position of the current page.
 */
function getStartPosition(pageNumber, count, previousPagePosition, allResults, collapsibleIdMap) {
    const uncollapsibleResultsOnPreviousPages = (pageNumber - 1) * count;
    let i = 0;
    if (uncollapsibleResultsOnPreviousPages > 0) {
        // If the user navigates to the next page, we always start the next page at the first result they have not seen
        // to prevent skipping results if unviewed results have been moved to a previous page.
        if (previousPagePosition && previousPagePosition.pageNumber === pageNumber - 1) {
            i = previousPagePosition.lastPosition + 1;
        } else {
            // Otherwise, we count the number of uncollapsible results per page. A page is defined as having <count>
            // uncollapsible results, so the user is always shown the same number of uncollapsible results.
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
        }
    }
    return i;
}

/**
 * Results on previous pages that the user has not yet seen are promoted to the current page, to prevent the user from
 * missing results that have been moved to a previous page by e.g. relevance feedback.
 * @param viewedResultIds - The list of ids of results that the user has viewed.
 * @param resultsOnPreviousPages - The list of results on previous pages.
 * @returns {Array} - The list of search results that have been promoted to the current page.
 */
function getPromotedResults(viewedResultIds, resultsOnPreviousPages) {
    // Find all results on previous pages that the user has not viewed yet, they will be promoted to the current page
    // to make sure that the user does not miss any results that have recently been promoted by relevance feedback.
    let results = [];
    const viewedResultIdsMap = {};
    if (viewedResultIds) {
        viewedResultIds.forEach(resultId => {
            viewedResultIdsMap[resultId] = true;
        });

        results = resultsOnPreviousPages.filter(result => !viewedResultIdsMap[getId(result)]);
    }
    return results;
}

/**
 * Construct a single page of results. The page starts with promoted unviewed results from previous pages, and then
 * contains the results starting at startposition. A page contains at most <count> uncollapsible results.
 * @param promotedResults - The list of results to be promoted to the current page.
 * @param count - The maximum number of results on this page.
 * @param collapsibleIdMap - The map of results that are collapsible (and therefore not counted towards the number of
 *        results per page).
 * @param startPosition - The position in the list of all results at which the non-promoted results for this page start.
 * @param allResults - The list of all results returned for the user's query.
 * @returns {{results: Array, unpromotedResultCount: *}} - The list of results for this page and the number of
 *          unpromoted results on the page.
 */
function getPageOfResults(promotedResults, count, collapsibleIdMap, startPosition, allResults) {
    let results = [];
    let uncollapsibleResults = 0;
    for (let l = 0; l < promotedResults.length && !(uncollapsibleResults >= count); l++) {
        const result = promotedResults[l];
        results.push(result);
        if (!collapsibleIdMap[getId(result)]) {
            uncollapsibleResults++;
        }
    }
    let unpromotedResultCount = 0;
    for (let j = startPosition; j < allResults.length && !(uncollapsibleResults >= count); j++) {
        const result = allResults[j];
        results.push(result);
        unpromotedResultCount++;
        if (!collapsibleIdMap[getId(result)]) {
            uncollapsibleResults++;
        }
    }
    return {results, unpromotedResultCount};
}

/**
 * Add required fields when missing
 * @param results - The set of results to add missing fields to.
 * @returns {Array} - The set of results with missing fields added.
 */
function addMissingFields(results) {
    return results.map(result => {
        // use document text to set name if it is available
        if (!result.name.replace(/\s/g,'') && result.text) {
            result.name = result.text.slice(0, 80) + "...";
        }
        if (!result.name.replace(/\s/g,'')) {
            result.name = "No name available"
        }
        if (result.id && result.text && !result.text.replace(/\s/g,'')) {
            result.text = "No text available"
        }
        if (result.snippet && !result.snippet.replace(/\s/g,'')) {
            result.snippet = "No text available"
        }
        return result;
    });
}


/**
 * Filter function that returns true if a results identifier is in the collapsibleIdMap.
 */
function resultsFilter(collapsibleIdMap) {
    return result => {
        const id = getId(result);
        return !(id in collapsibleIdMap)
    }
}

/**
 * Get the identifier for a result. This hack is needed to deal with the old bing-style results with only a url instead
 * of an identifier. Once we fix this and all results use the id field as identifier, this function should no longer
 * be needed.
 */
function getId(result) {
    return result.id ? result.id : result.url;
}

/**
 * Check whether relevanceFeedback and distributionOfLabour have valid values.
 */
function checkStringValues(relevanceFeedback, distributionOfLabour) {
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
}
