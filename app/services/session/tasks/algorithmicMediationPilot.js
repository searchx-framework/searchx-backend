'use strict';

const TASK_ID = "algorithmic-mediation-pilot";

const _ = require('underscore');
const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const helper = require('../groupHelper');
const utils = require("../../../utils");

const topics = require('./data/pilot-topics.json');
Object.keys(topics).forEach((index) => {
    topics[index].id = index;
});

const getAvailableGroup = async function(groupSize) {
    const initializeGroup = async function() {
        const group = new Group({
            created: new Date(),
            taskId: TASK_ID,
            taskData: {
                size: groupSize,
            }
        });

        await group.save();
        return group;
    };

    const query = {
        "taskData.size": groupSize,
        "taskData.nMembers": {$lt: groupSize}
    };

    let group = await Group.findOne(query, {}, {sort: {created: 1}});
    if (group === null) {
        group = await initializeGroup();
    }

    return group;
};

exports.getUserTask = async function(userId, params) {
    let group = await helper.getGroupByUserId(userId, TASK_ID);
    if (group !== null) {
        return group;
    }

    const groupSize = parseInt(params.groupSize);
    group = await getAvailableGroup(groupSize);
    group.members.push(helper.initializeMember(userId, {}));
    group.taskData.nMembers = group.members.length;

    group.markModified('members');
    group.markModified('taskData');
    await group.save();

    group = await setGroupTopic(userId, group);

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

exports.handleSyncSubmit = async function(userId) {
    return await helper.getGroupByUserId(userId, TASK_ID);
};

async function setGroupTopic(userId, group) {
    if (!group) {
        group = await helper.getGroupByUserId(userId, TASK_ID);
    }

    if (group === null) {
        return null;
    }

    const membersComplete = group.members.length >= group.taskData.size;
    if (!membersComplete) {
        return group;
    }

    // assign random topic
    group.taskData.topic = _.sample(topics);
    group.markModified("members");
    group.markModified("taskData");
    await group.save();
    console.log("group formed: {size: " + group.taskData.size + ", topic: " + group.taskData.topic.id + ", members: [" + group.members.map(member => member.userId) + "]}");

    return group;
}