'use strict';

const exampleGroupSync = require('./tasks/exampleGroupSync');
const exampleGroupAsync = require('./tasks/exampleGroupAsync');
const trecCovidNoSearch = require('./tasks/trecCovidNoSearch');
const trecCovidSearch = require('./tasks/trecCovidSearch');
const algorithmicMediationPilot = require('./tasks/algorithmicMediationPilot');
const roleBased = require('./tasks/roleBased');
const helper = require('./groupHelper');

function task(taskId) {
    console.log(taskId)
    switch (taskId) {
        
        case "example-group-sync":
            return exampleGroupSync;
        case "example-group-async":
            return exampleGroupAsync;
        case "algorithmic-mediation-pilot":
            return algorithmicMediationPilot;
        case "trec-covid-no-search":
            return trecCovidNoSearch;
        case "trec-covid-search":
            return trecCovidSearch;
        case "role-based":
            return roleBased;
        default:
            throw {
                name: "Bad Request",
                message: "Invalid task id."
            };
    }
}

exports.getUserTask = async function(userId, taskId, params) {
    return task(taskId).getUserTask(userId, params);
};

exports.getUserData = async function(userId, taskId) {
    const group = await helper.getGroupByUserId(userId, taskId);
    if (group !== null) {
        return group.members.filter(x => x.userId === userId)[0];
    }

    return null;
};

exports.postUserTask = async function(userId, taskId, data) {
    return task(taskId).postUserTask(userId, data);
};
exports.handleSyncSubmit = async function(userId, taskId, data) {
    return task(taskId).handleSyncSubmit(userId, data);
};

exports.handleSyncLeave = async function(userId, taskId) {
    return task(taskId).handleSyncLeave(userId);
};

exports.handleSyncTimeout = async function (userId, taskId) {
    return task(taskId).handleSyncTimeout(userId);
};
