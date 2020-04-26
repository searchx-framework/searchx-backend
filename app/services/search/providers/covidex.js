'use strict';

const request = require ('request');

const verticals = [
    'cord19'
];

/**
 * Fetch data from indri.
 * @param query - The search query string.
 * @param vertical - Type of search results (web, images, etc).
 */
exports.fetch = function (query, vertical) {
    if (!verticals.includes(vertical)) {
        throw {
            name: 'Bad Request',
            message: 'Invalid vertical'
        }
    }
    let host = process.env.COVID_HOST;
    let params = '/api/search?query=' + query + '&vertical=' + vertical;
    
    let request_params = {
        url : host + params,
    }

    return new Promise ( (resolve, reject) => {

        const callback = function (err, resp, body) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(formatResults(JSON.parse(body)));
            }
        };
        request.get(request_params, callback);
    });
};


/**
 * Get document by id from search provider.
 * @param id - The id of the document to return.
 */
// exports.getById = function (id) {
//     return new Promise(function (resolve, reject) {
//         const callback = function (error, result) {
//             if (error) return reject(error);
//             resolve(formatResult(result));
//         };
//         indri_reader.getDocument(parseInt(id), callback);
//     });
// };

const parseAbstract = (abstract) => {
    return abstract.replace(/^\s*abstract\s*/gi, '');
    };


function formatResults(results) {
    return {
        results: results.response.map(formatResult)
    };
}

function formatResult(result) {
    return {
        id: result.id + "",
        name: result.title,
        abstract : parseAbstract(result.abstract),
        author: result.authors,
        text : result.paragraphs.join("\n"),
        url : result.url,
        highlights: result.highlights,
        collectionId: result.id,
        pubtime : result.publish_time,
        journal: result.journal
    }
}