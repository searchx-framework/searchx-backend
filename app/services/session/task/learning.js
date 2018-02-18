'use strict';

const TASK_ID = "vocab-learning";
const NUM_TOPICS = 3;

const underscore = require('underscore');
const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const helper = require('../helper');

////

const topics = require('../../../../static/data/topics.json');
Object.keys(topics).forEach((index) => {
    topics[index].id = index;
});

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

const getAvailableGroup = async function(size) {
    const initializeGroup = async function() {
        const group = new Group({
            created: new Date(),
            task: TASK_ID,
            meta: {
                size: size,
                topics: sampleTopics(NUM_TOPICS)
            }
        });

        await group.save();
        return group;
    };

    const query = {
        topic: {$exists: false},
        "meta.size": size,
        "meta.nMembers": {$lt: nMembers}
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

    const size = params.size;
    group = await getAvailableGroup(size);

    group.members.push(helper.initializeMember(userId, {}));
    group.meta.nMembers = group.members.length;
    group.markModified('members');
    group.markModified('meta');

    await group.save();
    return group;
};

////

function getScoresFromResults(results) {
    function formatScores(scores) {
        return Object.keys(scores)
            .filter((key) => key !== '0')
            .map(key => {
                return {
                    topicId: key,
                    score: scores[key]
                };
            })
            .sort((a,b) => a.score - b.score);
    }

    let scores = {};
    Object.keys(results).forEach((result) => {
        const v = result.split("-");
        if (v[0] === "Q") {
            if(!scores[v[1]]) scores[v[1]] = 0;
            scores[v[1]] += parseInt(results[result]);
        }
    });

    return formatScores(scores);
}

exports.savePretestResults = async function(userId, results) {
    const group = await helper.getGroupByUserId(userId, TASK_ID);
    if (group === null) {
        return;
    }

    const scores = getScoresFromResults(results);
    if (group.meta.scores.filter(x => x.userId === userId).length <= 0) {
        group.meta.scores.push({
            userId: userId,
            scores: scores
        });

        group.markModified('meta');
        await group.save();
    }

    return null;
};

exports.setGroupTopic = async function(userId) {
    const group = await helper.getGroupByUserId(userId, TASK_ID);
    if (group === null) {
        return null;
    }

    const membersComplete = group.members.length >= nMembers;
    const pretestComplete = group.meta.scores.length >= nMembers;
    if (!membersComplete || !pretestComplete) {
        return null;
    }

    ////

    let totals = {};
    group.meta.scores.forEach(member => {
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
    group.markModified("members");
    await group.save();

    return group;
};

exports.removeUserFromGroup = async function(userId) {
    const group = await helper.getGroupByUserId(userId, TASK_ID);
    if (group === null || 'topic' in group) {
        return;
    }

    group.members = group.members.filter(x => x.userId !== userId);
    group.meta.scores = group.meta.scores.filter(x => x.userId !== userId);
    group.meta.nMembers = group.members.length;

    group.markModified('members');
    group.markModified('meta');
    await group.save();
};