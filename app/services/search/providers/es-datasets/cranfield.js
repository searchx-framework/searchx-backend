'use strict';

exports.index = 'cranfield';
exports.queryField = 'content';
exports.formatSource = function (source) {
    const snippet = source['content'].replace(/\s+/g, " ").substr(0, 200);
    const title = source.title ? source.title.replace(/\s+/g, " ") : "";

    // todo: adapt result specification to work for datasets without url
    return {
        name: source['title'],
        url: source['source'],
        displayUrl: source['source'],
        snippet: snippet
    };
};