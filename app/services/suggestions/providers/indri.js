'use strict';

const TrieSearch = require('trie-search');

let ts = new TrieSearch(null, {cache: true, min: 3});
const ngrams = require('./../../../../lib/ngram_count.json');

ts.addFromObject(ngrams);

exports.fetch = function(query){

    return new Promise ( (resolve, reject) => {
        let results = ts.get(query).sort((a, b) => (a.value > b.value) ? -1 : 1).slice(0,10)
        results = results.map((x) => x._key_);
        resolve(results);
    });
}