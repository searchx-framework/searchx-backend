'use strict';

const TASK_ID = "example-group-async";
const MAX_MEMBERS = 100;

const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const helper = require('../groupHelper');
const utils = require("../../../utils");
const puzzles = require('./data/puzzles');

const getAvailableGroup = async function() {
    const initializeGroup = async function() {
        const group = new Group({
            created: new Date(),
            taskId: TASK_ID,
            taskData: utils.sample(puzzles, 1)[0]
        });

        await group.save();
        return group;
    };

    const query = {
        taskId: TASK_ID
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

    group = await getAvailableGroup();
    if (group.members.length >= MAX_MEMBERS) {
        throw new Error("Task is full.");
    }

    group.members.push(helper.initializeMember(userId, {}));
    group.markModified('members');
    await group.save();
    return group;
};