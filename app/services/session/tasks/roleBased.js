'use strict';

const TASK_ID = "role-based";

const _ = require('underscore');
const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const TopicOrder = mongoose.model('TopicOrder');
const helper = require('../groupHelper');
const utils = require("../../../utils");

const topics = require('./data/robust-topics.json');
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

    group = await setGroupTopic(group);
    group.isCompleted = true;
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
    let oldGroup = await helper.getGroupByUserId(userId, TASK_ID);
    if (oldGroup === null || 'topic' in oldGroup.taskData) {
        return null;
    }
    let newGroup = undefined;
    let newUser = undefined;
    const initialSize = oldGroup.members.length;
    const oldSize = oldGroup.taskData.size;
    if (initialSize === 3 || initialSize === 5) {
        let sortedGroupMembers = oldGroup.members
        .sort((a, b) => (a.joined > b.joined) ? 1 : -1);
        newUser = sortedGroupMembers[initialSize-1].userId
        oldGroup.members = sortedGroupMembers.slice(0, initialSize-1);
        await _updateGroupSize(oldGroup);
        newGroup = await exports.getUserTask(newUser, {groupSize: oldSize});
    } else {
        await _updateGroupSize(oldGroup);
    }

    oldGroup = await setGroupTopic(oldGroup);
    oldGroup = JSON.parse(JSON.stringify(oldGroup));
    oldGroup.newGroup = newGroup;
    oldGroup.newUser = newUser;
    return oldGroup;
};

async function _updateGroupSize(group) {
    group.taskData.size = group.members.length;
    group.taskData.nMembers = group.members.length;
    group.markModified('members');
    group.markModified('taskData');
    await group.save();
}

exports.handleSyncSubmit = async function(userId) {
    return await helper.getGroupByUserId(userId, TASK_ID);
};

async function setGroupTopic(group) {
    if (group === null) {
        return null;
    }

    const membersComplete = group.members.length >= group.taskData.size;
    if (!membersComplete) {
        return group;
    }

    let roles = [];
    for (let step = 0; step < group.taskData.size/2; step++) {
        roles.push("miner");
    }
    for (let step = 0; step < group.taskData.size/2; step++) {
        roles.push("prospector");
    }
    if (group.taskData.size === 1) {
        roles = [];
        roles.push("single");
    }
    roles = _.shuffle(roles);
    let orders = await TopicOrder.find({groupSize: group.taskData.size }).sort({count: 1});
    group.taskData.topics = orders[0].topics;
    order.count = order.count + 1;
    order.markModified("count");
    await order.save();
    for (let i = 0; i < group.members.length; i++) {
        group.members[i].role = roles[i];
    }
    group.status = "formed";
    group.markModified("status");
    group.markModified("members");
    group.markModified("taskData");
    await group.save();
    console.log("group formed: {size: " + group.taskData.size + ", members: [" + group.members.map(member => member.userId) + "]}");

    return group;
}