'use strict';

const TASK_ID = "ecomm";

const _ = require('underscore');
const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const helper = require('../groupHelper');
const utils = require("../../../utils");

const topics = require('./data/ecomm-topics.json');
Object.keys(topics).forEach((index) => {
    topics[index].id = index;
});




exports.getUserTask = async function(userId, params) {

    let group = await helper.getGroupByUserId(userId, TASK_ID);

    let groupIds = group.members.map((x) => x.userId);
    if (group.taskData.loggedIn.includes(userId)) {
        return group;
    }

    if (groupIds.includes(userId)) {
        group.taskData.loggedIn.push(userId);
        group.taskData.nMembers = group.taskData.loggedIn.length;
        group.markModified('taskData');
        if (utils.arraysEqual(groupIds, group.taskData.loggedIn)) {
            group.taskData.topics = topics;
            group.markModified("status");
            console.log("group formed: {size: " + group.taskData.size + ", members: [" + group.members.map(member => member.userId) + "]}");
        }
        await group.save();
        return group;
    }
    return null;
};

exports.addGroup = async function(groupData) {
    const group = new Group({
        created: new Date(),
        taskId: TASK_ID,
        members: groupData.members,
        taskData: groupData.taskData
    });

    await group.save();

    return group;
};


exports.handleSyncLeave = async function(userId) {
    const group = await helper.getGroupByUserId(userId, TASK_ID);
    if (group === null || 'topic' in group.taskData) {
        return;
    }

    group.members = group.members.filter(x => x.userId !== userId);
    group.taskData.nMembers = group.members.length;

    group.markModified('members');
    group.markModified('taskData');
    await group.save();
};

exports.handleSyncTimeout = async function(userId) {
};

exports.handleSyncSubmit = async function(userId) {
    return await helper.getGroupByUserId(userId, TASK_ID);
};