'use strict';

const mongoose = require('mongoose');
const PopularQuery = mongoose.model('PopularQuery');
const stopwords = require('stopword')

exports.fetch = async function(query){
    query = query.toLowerCase().trim().split(/\s+/).join(' ');
    let regex = RegExp(`^${query}`);
    let results = await PopularQuery.find({_id: regex}).sort({count: -1}).limit(11);
    results = results.map((result) => result._id);
    results = results.filter(result => result !== query);
    if (results.length < 10) {
        let terms = query.split(/\s+/);
        if (terms.length == 1 || terms.length > 4) {
            return results;
        }
        let lastTerm = terms.slice(-1)[0]
        if (stopwords.en.includes(lastTerm)){
            return results;
        }
        regex = RegExp(`^${lastTerm} `);
        let popularSuffixes = await PopularQuery
             .find({_id: regex})
             .sort({count: -1}).limit(results.length*2);
        popularSuffixes = popularSuffixes.map((result) => result._id);
        for (let i in popularSuffixes){
            let newQuery = terms.slice(0, terms.length - 1).join(' ') + " " + popularSuffixes[i]
            if (!results.includes(newQuery) & !terms.includes(popularSuffixes[i])) {
                results.push(newQuery);
            }
            if (results.length === 10){
                break;
            }
        }
    }
    return results;
}