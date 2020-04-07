'use strict';

const TrieSearch = require('trie-search');
const fs = require('fs');

let ts = new TrieSearch(null, {cache: true, min: 3});

if (process.env.SUGGESTIONS_TYPE == "indri") {
    const ngrams = require(process.env.INDRI_NGRAM_FILE);
    ts.addFromObject(ngrams);
}

exports.fetch = function(query){

    return new Promise ( (resolve, reject) => {
        let results = ts.get(query).filter((x) => x._key_.startsWith(query));
        results = results .sort((a, b) => (a.value > b.value) ? -1 : 1).slice(0,10);
        results = results.map((x) => x._key_);
        results = results.filter((x) => x.startsWith(query));
        resolve(results);
    });
}