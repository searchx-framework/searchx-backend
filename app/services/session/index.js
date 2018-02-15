'use strict';

const puzzle = require('./task/puzzle');
const helper = require('./helper');

exports.getUserTask = async function(userId, task, collaborative) {
    return await puzzle.getUserTask(userId);
};

exports.getUserData = async function(userId, task) {
    const groupId = await helper.getGroupIdByUserId(userId, task);
    if (groupId !== null) {
        const group = await helper.getGroupById(groupId);
        return group.members.filter(x => x.userId === userId)[0];
    }

    return null;
};

