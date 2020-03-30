'use strict';

const provider = require("./provider");
const regulator = require('./regulator');
const bookmark = require('../features/bookmark');
const annotation = require('../features/annotation');
const rating = require('../features/rating');
const view = require('../features/view');
const cache = require('./cache');
const config = require('../../config/config');

/*
 * Fetches search results from the regulator and processes them to include metadata
 *
 * @params {query} the search query
 * @params (vertical) type of search results (web, images, etc)
 * @params {pageNumber} result pagination number
 * @params {sessionId} session id of the user
 * @params {userId} id of the user
 * @params {providerName} the name of the search provider to use (indri by default)
 * @params {relevanceFeedback} string indicating what type of relevance feedback to use (false, individual, shared)
 * @params {distributionOfLabour} string indicating what type of distribution of labour to use (false,
 *         unbookmarkedSoft, unbookmarkedOnly)
 */
exports.search = async function (query, vertical, pageNumber, sessionId, userId, providerName, relevanceFeedback, distributionOfLabour) {
    const date = new Date();
    const data = await regulator.fetch(...arguments);
    data.id = query + '_' + pageNumber + '_' + vertical + '_' + date.getTime();
    data.results = await addMetadata(data.results, sessionId, userId);
    data.sessionId = sessionId;
    data.userId = userId;
    if (config.enableCache) {
        cache.addSearchResultsToCache(query, vertical, pageNumber, date, data, providerName);
    }
    return data;
};

/*
 * Get document by id from search provider
 *
 * @params {id} the id of the document to return
 * @params {providerName} the name of the search provider to use (indri by default)
 */
exports.getById = async function(id, providerName) {
    return {
        result: await provider.getById(id, providerName)
    }
};


/*
 * Add metadata to search results
 *
 * @params {results} formatted query results from api
 * @params {sessionId} session id of user
 */
async function addMetadata(results, sessionId, userId) {
    const promises = results.map(async (result) => {
        const id = result.id ? result.id : result.url;
        result.metadata = {
            bookmark: await bookmark.getBookmark(sessionId, id),
            exclude: await bookmark.getBookmark(sessionId, id, true),
            annotations: (await annotation.getAnnotations(sessionId, id)),
            rating: (await rating.getRating(sessionId, id, userId)),
            views: await view.getViews(sessionId, result.url),
        };
        return result;
    });

    return await Promise.all(promises);
}
