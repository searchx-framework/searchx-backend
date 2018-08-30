'use strict';

const cheerio = require('cheerio');

exports.index = 'clueweb-diskb-00-v2';
exports.queryField = 'parsed-content';
exports.formatSource = function (hit) {
    const source = hit._source;
    // Strip extra whitespace and limit snippet length.
    // todo: pre-process the data in elasticsearch so whitespace stripping is not needed
    const $ = cheerio.load(source['raw-content'], {
        normalizeWhitespace: true
    });

    const firstParagraph = $('p').first().text().substr(0, 200);
    // If there is a non-empty (and not only containing whitespace) first paragraph use it as snippet,
    // else use parsed content.
    const snippet = firstParagraph && firstParagraph.replace(/\s/g, '').length !== 0 ? firstParagraph
        : source['parsed-content'].replace(/\s+/g, " ").substr(0, 200);
    const title = source.title ? source.title.replace(/\s+/g, " ") : "";

    return {
        id: hit._id,
        name: title,
        url: source['target-uri'],
        displayUrl: source['target-uri'],
        snippet: snippet
    };
};