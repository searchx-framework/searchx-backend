'use strict';

const querySuggestions = require('./querySuggestions');
const informationScent = require('./informationScent');


exports.informationScent = async function(query, sessionId, userId) {

    const suggestions = await querySuggestions.fetch(query);
    
    if (process.env.INFOSCENT_TYPE == "noscent") {
        return wrapWithOneValues(suggestions);
    }
    if (process.env.INFOSCENT_TYPE == "single" ){ 
        return informationScent.singleInformationScent(userId, suggestions);
    } else if (process.env.INFOSCENT_TYPE == "collaborative") {
        return informationScent.collaborativeInformationScent(userId, sessionId, suggestions);
    }
};

function wrapWithOneValues(suggestions) {
    return suggestions.map((suggestion) => { return [suggestion, 1.0]});
}

exports.handleUserLogs = async function(logs){
    informationScent.handleUserLogs(logs);
}