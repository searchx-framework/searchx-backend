'use strict';

const TASK_NAME = "lecture-puzzle";
const MAX_MEMBERS = 10000;

const randomColor = require('randomcolor');
const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const helper = require('../helper');

const initializeGroup = async function() {
    const group = new Group({
        created: new Date(),
        task: TASK_NAME,
        topic: {
            "title": "Puzzle 1",
            "task" : "What album was released three years after the death of the artist that’s tattooed on the upper left arm of the actor who played \"Irish\" Micky Ward in a 2010 film?",
            "answer": ["legend", "legends"]
        }
    });

    await group.save();
    return group;
};

const initializeMember = function(userId) {
    return {
        userId: userId,
        color: randomColor({luminosity: 'dark'}),
        joined: new Date()
    };
};

////

const getAvailableGroup = async function() {
    const query = {
        task: TASK_NAME
    };

    let group = await Group.findOne(query, {}, {sort: {created: 1}});
    if (group === null) {
        group = await initializeGroup();
    }

    return group;
};

exports.getUserTask = async function(userId) {
    const groupId = await helper.getGroupIdByUserId(userId, TASK_NAME);
    if (groupId !== null) {
        return await helper.getGroupById(groupId);
    }

    const group = await getAvailableGroup();
    if (group.members.length >= MAX_MEMBERS) {
        throw new Error("Task is full.");
    }

    group.members.push(initializeMember(userId));
    group.markModified('members');
    await group.save();
    return group;
};