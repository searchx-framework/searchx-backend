const session = require('../../services/session');
// const logs = mongoose.model('Log');
const querySugggestions = require('./querySuggestions');

exports.informationScent = async function(query, sessionId, userId, providerName, scentType) {

    const data = await querySugggestions.fetch(query);

    if (scentType == "noscent") {
        return wrapWithOneValues(data);
    }
    // const userData = await session.getUserData(userId);
    // const taskAspects = userTask.taskData.subtopics;
    // if (taskAspects === null) {
    //     // set aspects as bing and update groupUserInfo
    // }

    if (scentType == "single" ){ 
        return wrapWithOneValues(data);
    } else if (scentType == "collaborative") {
        return wrapWithTwoValues(data);
    }
};

function wrapWithOneValues(suggestions) {
    return suggestions.map((suggestion) => { return [suggestion, 1.0]});
}

function wrapWithTwoValues(suggestions) {
    return suggestions.map((suggestion) => { return [suggestion, 0.5, 0.5]});
}


var singleInformationScent = async function(userId, sessionId) {
            // return logs for user and sort by date;
            const logs = await logs.findOne({
                url: data.url,
                sessionId: data.sessionId
            });
            // compute coverage estimate
}


var collaborativeInformationScent = async function(userId, sessionId) {
    // return logs for user and sort by date;
    const logs = await logs.findOne({
        url: data.url,
        sessionId: data.sessionId
    });
    // compute coverage estimate
}