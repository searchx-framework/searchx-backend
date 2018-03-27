'use strict';

const regulator = require('./regulator');
const cache = require('./cache');
const bookmark = require('../features/bookmark');
const annotation = require('../features/annotation');
const rating = require('../features/rating');
const view = require('../features/view');


/*
 * Fetches search results from the regulator and processes them to include metadata
 *
 * @params {query} the search query
 * @params (vertical) type of search results (web, images, etc)
 * @params {pageNumber} result pagination number
 * @params {sessionId} session id of the user
 * @params {userId} id of the user
 * @params {providerName} the name of the search provider to use (bing by default)
 * @params {relevanceFeedback} string indicating what type of relevance feedback to use (false, individual, shared)
 * @params {unjudgedOnly} boolean indicating whether to use unjudged-only distribution of labour
 */
exports.search = async function(query, vertical, pageNumber, sessionId, userId, providerName, relevanceFeedback, unjudgedOnly) {
    const date = new Date();
    let data = await regulator.fetch(...arguments);
    data.id = query + '_' + pageNumber + '_' + vertical + '_' + date.getTime();

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
