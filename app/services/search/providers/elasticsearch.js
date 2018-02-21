'use strict';

const cheerio = require('cheerio');
const elasticsearchApi = require('elasticsearch');
const esClient = new elasticsearchApi.Client({
    host: 'localhost:9200',
    log: 'error'
});

exports.fetch = function (params, vertical, callback) {
    if (vertical === 'web') esClient.search({
        index: 'clueweb-diskb-00-v2',
        type: 'document',
        body: {
            query: {
                match: {
                    'parsed-content': params[0]
                }
            }
        }
    }, callback);
    else throw {
        name: 'Bad Request',
        message: 'Invalid search type!'
    }
};

exports.formatResults = function (vertical, res, body) {
    if (!res.hits || res.hits.length === 0) {
        throw new Error('No results from search api.');
    }
    let results = [];

    res.hits.hits.forEach(function (hit) {
        const source = hit._source;
        // strip extra whitespace and limit snippet length
        // todo: pre-process the data in elasticsearch so whitespace stripping is not needed
        const $ = cheerio.load(source['raw-content'], {
            normalizeWhitespace: true
        });

        const firstParagraph = $('p').first().text().substr(0, 200);
        // if there is a non-empty (and not only containing whitespace) first paragraph use it as snippet,
        // else use parsed content
        const snippet = firstParagraph && firstParagraph.replace(/\s/g, '').length !== 0 ? firstParagraph
            : source['parsed-content'].replace(/\s+/g, " ").substr(0, 200);

        const result = {
            name: source.title.replace(/\s+/g, " "),
            url: source['target-uri'],
            displayUrl: source['target-uri'],
            snippet: snippet
        };
        results.push(result);
    });

    return {
        results: results,
        matches: res.hits.total
    }
};