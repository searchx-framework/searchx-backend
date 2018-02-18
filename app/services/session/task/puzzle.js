'use strict';

const TASK_ID = "lecture-puzzle";
const MAX_MEMBERS = 10000;

const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const helper = require('../helper');

const getAvailableGroup = async function() {
    const initializeGroup = async function() {
        const group = new Group({
            created: new Date(),
            task: TASK_ID,
            topic: {
                "title": "Puzzle 1",
                "task" : "What album was released three years after the death of the artist that’s tattooed on the upper left arm of the actor who played \"Irish\" Micky Ward in a 2010 film?",
                "answer": ["legend", "legends"]
            }
        });

        await group.save();
        return group;
    };

    const query = {
        task: TASK_ID
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