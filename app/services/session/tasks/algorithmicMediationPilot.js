'use strict';

const TASK_ID = "algorithmic-mediation-pilot";

const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const helper = require('../groupHelper');

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

    await setGroupTopic(userId);

    return group;
};

exports.handleSyncSubmit = async function(userId) {
    return await setGroupTopic(userId);
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

async function setGroupTopic(userId) {
    const group = await helper.getGroupByUserId(userId, TASK_ID);
    if (group === null) {
        return null;
    }

    const membersComplete = group.members.length >= group.taskData.size;
    if (!membersComplete) {
        return null;
    }

    // Todo: add topic assignment
    group.taskData.topic = topics[0];
    group.markModified("members");
    group.markModified("taskData");
    await group.save();

    return group;
}