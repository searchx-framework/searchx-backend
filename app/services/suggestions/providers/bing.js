'use strict';

const request = require ('request');

let host = 'https://api.cognitive.microsoft.com';
let path = '/bing/v7.0/Suggestions';

let mkt = 'en-US';


exports.fetch = function(query){

    return new Promise ( (resolve, reject) => {
        let params = '?mkt=' + mkt + '&q=' + query;
        
        let request_params = {
            url : host + path + params,
            headers : {
            'Ocp-Apim-Subscription-Key' : process.env.BING_ACCESS_KEY,
            }
        }

        const callback = function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(formatResults(JSON.parse(body)));
            }
        };
        request.get(request_params, callback);
    });
}

function formatResults(body) {
    if (!body || !body.suggestionGroups) {
        throw new Error('No response from bing api.');
    }

    let webSuggestionGroup = body.suggestionGroups.filter((suggestionGroup) => { return suggestionGroup.name === "Web"});
    if (webSuggestionGroup.length == 0) {
        return [];
    }
    return webSuggestionGroup[0].searchSuggestions.map((suggestion) => { return suggestion.query });

}