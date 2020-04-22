'use strict';

const index_path = process.env.INDRI_INDEX;
let indri_searcher, indri_reader;
try {
    const indri = require('../../../../lib/node-indri/node-indri');
    indri_searcher = new indri.Searcher({
        "index": index_path,
        "rules": "method:dirichlet,mu:2500", // 0.2124
        "fbTerms": 10,
        "fbMu": 0,
        "includeFields": {
            "title": "title",
            "docno": "docno",
            "date": "date",
            "source": "source",
            "text": "text"
        },
        "includeDocument" : true
    });

    indri_reader = new indri.Reader(index_path);
} catch (e) {
    if (e instanceof Error && e.code === "MODULE_NOT_FOUND") {
        console.error("Node-indri was not found, please install it if you wish to use the indri provider. See the documentation for instructions.");
    } else {
        console.error(e);
    }
}

const verticals = [
    'AQUAINT', 'CW12B'
];

/**
 * Fetch data from indri.
 * @param query - The search query string.
 * @param vertical - Type of search results (web, images, etc).
 * @param pageNumber} - The number of the page of results to show (1-based indexing).
 * @param relevanceFeedbackDocuments - The set of documents to use for relevance feedback.
 */
exports.fetch = function (query, vertical, pageNumber, resultsPerPage, relevanceFeedbackDocuments) {
    if (!verticals.includes(vertical)) {
        throw {
            name: 'Bad Request',
            message: 'Invalid vertical'
        }
    }

    return new Promise(function (resolve, reject) {
        const callback = function (error, results) {
            if (error) {
                console.log(error)
                return reject(error);
            } else {
                resolve(formatResults(results));
            }
        };
        query = escape(query);
        relevanceFeedbackDocuments = relevanceFeedbackDocuments.map(string => parseInt(string));
        try {
            indri_searcher.search(query, pageNumber, resultsPerPage, relevanceFeedbackDocuments, callback);
        } catch (err){
            console.log(error);
            reject(error);
        }
    });
};

/**
 * Get document by id from search provider.
 * @param id - The id of the document to return.
 */
exports.getById = function (id) {
    return new Promise(function (resolve, reject) {
        const callback = function (error, result) {
            if (error) return reject(error);
            resolve(formatResult(result));
        };
        indri_reader.getDocument(parseInt(id), callback);
    });
};

function formatResults(results) {
    return {
        results: results.map(formatResult)
    };
}

function formatResult(result) {
    return {
        id: result.docid + "",
        collectionId: result.fields.docno,
        name: result.fields.title,
        date: result.fields.date,
        source: result.fields.source,
        snippet: result.snippet,
        text: result.fields.text
    }
}


function escape(query) {
    query = query.replace(/\(|\)|\'|\"|\`\$/g, '');
    query = query.replace(/\.|\:|\t|\/|\&|\,|\-|\?|\+|\+|\;|\<|\>|\%|\@|\\|\*/g, ' ');
    return query;
}