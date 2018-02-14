'use strict';

const underscore = require('underscore');
const config = require('../../../config/config');

const mongoose = require('mongoose');
const Group = mongoose.model('Group');

////

const nTopics = config.numTopics;
const nMembers = config.numMembers;
const colorPool = config.colorPool;

const topics = require('../../../../static/data/topics.json');
Object.keys(topics).forEach((index) => {
    topics[index].id = index;
});

////

function sample(a, n) {
    return underscore.take(underscore.shuffle(a), n);
}

function sampleTopics(n) {
    let validTopics = underscore.omit(topics, '0');
    let samples = sample(validTopics, n);

    samples[1] = topics[0];
    return samples;
}

////

const initializeGroup = async function() {
    const group = new Group({
        created: new Date(),
        topics: sampleTopics(nTopics)
    });

    await group.save();
    return group;
};

const addGroupMembersData = function(members) {
    return members.map((member, i) => {
        member.color = colorPool[i % colorPool.length];
        return member;
    });
};

////

const getGroupById = async function(groupId) {
    const query = Group.findOne({'_id': groupId});
    return await query.exec()
        .catch((err) => {
            console.log(err);
        });
};

const getGroupIdByUserId = async function(userId) {
    const query = {
        members: {
            $elemMatch: {
                userId: userId
            }
        }
    };

    const group = await Group.find(query, {}, {sort: {created: -1}});
    if (group.length > 0) {
        return group[0]._id;
    }

    return null;
};

const getAvailableGroup = async function() {
    const query = {
        topic: {$exists: false},
        nMembers: {$lt: nMembers}
    };

    let group = await Group.findOne(query, {}, {sort: {created: 1}});
    if (group === null) {
        group = await initializeGroup();
    }

    return group;
};

////

exports.getUserTask = async function(userId, collaborative) {
    if (!collaborative) {
        return {
            topics: sampleTopics(nTopics)
        }
    }

    const groupId = await getGroupIdByUserId(userId);
    if (groupId !== null) {
        return await getGroupById(groupId);
    }

    const group = await getAvailableGroup();
    group.members.push({userId: userId});
    group.nMembers = group.members.length;

    group.markModified('members');
    await group.save();
    return group;
};

exports.getGroup = async function(userId) {
    const groupId = await getGroupIdByUserId(userId);
    if (groupId === null) {
        return null;
    }

    return await getGroupById(groupId);
};

////

exports.savePretestScores = async function(userId, scores) {
    const groupId = await getGroupIdByUserId(userId);
    if (groupId === null) {
        return;
    }

    const group = await getGroupById(groupId);
    if (group.scores.filter(x => x.userId === userId).length <= 0) {
        group.scores.push({
            userId: userId,
            scores: scores
        });

        group.markModified('scores');
        await group.save();
    }
};

exports.setGroupTopic = async function(userId) {
    const groupId = await getGroupIdByUserId(userId);
    if (groupId === null) {
        return null;
    }

    const group = await getGroupById(groupId);

    const membersComplete = group.members.length >= nMembers;
    const pretestComplete = group.scores.length >= nMembers;
    if (!membersComplete || !pretestComplete) {
        return null;
    }

    ////

    let totals = {};
    group.scores.forEach(member => {
        member.scores.forEach(score => {
            const i = score.topicId;
            if (!totals[i]) totals[i] = 0;
            totals[i] += score.score;
        })
    });

    let minScore = Infinity;
    let minId = null;
    Object.keys(totals).forEach(topicId => {
        if (totals[topicId] < minScore) {
            minScore = totals[topicId];
            minId = topicId;
        }
    });

    group.topic = topics[minId.toString()];
    group.members = addGroupMembersData(group.members);
    group.markModified("members");
    await group.save();

    return group;
};

exports.removeUserFromGroup = async function(userId) {
    const groupId = await getGroupIdByUserId(userId);
    if (groupId === null) {
        return;
    }

    const group = await getGroupById(groupId);
    if (group.hasOwnProperty('topic')) {
        return;
    }

    group.members = group.members.filter(x => x.userId !== userId);
    group.scores = group.scores.filter(x => x.userId !== userId);
    group.nMembers = group.members.length;

    group.markModified('members');
    group.markModified('scores');
    await group.save();
};