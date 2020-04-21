'use strict';

const bing = require('./providers/bing');
const indri = require('./providers/indri');


exports.getQuerySuggestions = async function(query, sessionId, userId) {

    switch (process.env.SUGGESTIONS_TYPE) {
        case "none":
            return [];
        case "bing":
            return await bing.fetch(query);
        case "indri":
            return await indri.fetch(escape(query.toLowerCase()));
        default:
            throw {
                name: "Bad Request",
                message: "Invalid suggestion type."
            };
    }
};


function escape(query) {
    query = query.replace(/\(|\)|\'|\"|\`\$/g, '');
    query = query.replace(/\.|\:|\t|\/|\&|\,|\-|\?|\+|\+|\;|\<|\>|\%|\@|\\|\*/g, ' ');
    return query;
}