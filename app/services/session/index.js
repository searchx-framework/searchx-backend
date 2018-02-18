'use strict';

const puzzle = require('./task/puzzle');
const learning = require('./task/learning');
const helper = require('./helper');

exports.getUserTask = async function(userId, task, params) {
    switch (task) {
        case "vocab-learning":
            return learning.getUserTask(userId, params);
        case "lecture-puzzle":
            return puzzle.getUserTask(userId, params);
        default:
            return null;
    }
};

exports.getUserData = async function(userId, task) {
    const group = await helper.getGroupByUserId(userId, task);
    if (group !== null) {
        return group.members.filter(x => x.userId === userId)[0];
    }

    return null;
};

