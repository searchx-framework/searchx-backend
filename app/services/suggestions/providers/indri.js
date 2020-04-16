'use strict';

const TrieSearch = require('trie-search');

let ts = null;


exports.fetch = function(query){
    if (ts === null) {
        const ngrams = require(process.env.INDRI_NGRAM_FILE);
        ts = new TrieSearch(null, {cache: true, min: 3});
        ts.addFromObject(ngrams);
    }

    return new Promise ( (resolve, reject) => {
        let results = ts.get(query).filter((x) => x._key_.startsWith(query));
        results = results .sort((a, b) => (a.value > b.value) ? -1 : 1).slice(0,10);
        results = results.map((x) => x._key_);
        results = results.filter((x) => x.startsWith(query));
        resolve(results);
    });
}