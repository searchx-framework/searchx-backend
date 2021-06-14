'use strict'

exports.index = process.env.ES_INDEX || 'NONE' 
exports.queryField = 'title'
const queryFields =  ['title', 'paperAbstract'];

exports.custom_query = function(user_query){
    return {
        query: {
            multi_match: {
                query: user_query,
                fields: queryFields,
                }
            },
            highlight:{
                fragment_size: 200,
                fields: [{title: {}},{paperAbstract:{}}]
            }
        }
    }

exports.formatHit = function (hit) {
    const source = hit._source;
    const title = source.title ? source.title.replace(/\s+/g, " ") : "";
    const snippet = hit.highlight['paperAbstract'].join("(...) ").replace(/\s+/g, " ").substr(0, 300);

    return {
        id: hit._id,
        name: source['title'],
        url: source['doiUrl'],
        source: source['sources'],
        venue: source['venue'] + " " +  source["year"],
        snippet: snippet
    };
};
