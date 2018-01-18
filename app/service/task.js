'use strict';

const underscore = require('underscore');
const redis = require('../config/initializers/redis');
const config = require('../config/config');

const mongoose = require('mongoose');
const Group = mongoose.model('Group');

////

const topics = require('../../static/data/topics.json');
Object.keys(topics).forEach((index) => {
    topics[index].id = index;
});

////

const numTopics = config.numTopics;
const numMembers = config.numMembers;
const namePool = config.namePool;
const colorPool = config.colorPool;
const acceptableRank = Math.ceil((numTopics-1) / 2);

const REDIS_PREV_TOPIC_IDS = "prevTopicIds";
const REDIS_PRETEST_SCORES_QUEUE = "pretestScores";

////

function sample(a, n) {
    return underscore.take(underscore.shuffle(a), n);
}

async function sampleTopicsByPretest(a, n) {
    let samples = [];

    const pretestScores = JSON.parse(await redis.getAsync(REDIS_PRETEST_SCORES_QUEUE));
    if (pretestScores !== null && pretestScores.length > 0) {
        const oldestScoreIds = pretestScores[0].scores.map(x => x.topicId).slice(0,-1);
        const validTopics = underscore.omit(a, oldestScoreIds);

        samples = sample(validTopics, n - oldestScoreIds.length);
        oldestScoreIds.forEach(id => samples.push(topics[id]));
        return samples;
    }

    return null;
}

async function sampleTopicsByHistory(a, n) {
    let samples = [];

    const prevTopicIds = JSON.parse(await redis.getAsync(REDIS_PREV_TOPIC_IDS));
    if (prevTopicIds !== null) {
        const validTopics = underscore.omit(a, prevTopicIds);

        samples = sample(validTopics, n - prevTopicIds.length);
        prevTopicIds.forEach(id => samples.push(topics[id.toString()]));
        return samples;
    }

    return null;
}

async function sampleTopics(n) {
    let validTopics = underscore.omit(topics, '0');

    let samples = await sampleTopicsByPretest(validTopics, n);
    if (samples === null) samples = await sampleTopicsByHistory(validTopics, n);
    if (samples === null) samples = sample(validTopics, n);

    const savedTopicIds = samples.slice(1,-1).map(x => x.id);
    await redis.setAsync(REDIS_PREV_TOPIC_IDS, JSON.stringify(savedTopicIds));

    samples[0] = samples[1];
    samples[1] = topics[0];
    return samples;
}

////

const initializeGroup = async function(topicId, members) {
    const group = new Group({
        created: new Date(),
        members: initializeGroupMembers(members),
        topic: topics[topicId]
    });

    group.save();
    return group;
};

const initializeGroupMembers = function(members) {
    const names = sample(namePool, numMembers);
    return members.map((member, i) => {
        return {
            userId: member,
            name: names[i % names.length],
            color: colorPool[i % colorPool.length]
        };
    });
};

////

const getGroupIdByUser = async function(userId) {
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

const getGroupById = async function(groupId) {
    const query = Group.findOne({'_id': groupId});
    return await query.exec()
        .catch((err) => console.log(err));
};

////

exports.getUserTask = async function(userId) {
    const data = {
        topics: await sampleTopics(numTopics)
    };

    const groupId = await getGroupIdByUser(userId);
    if (groupId !== null) {
        data.group = await getGroupById(groupId);
    }

    return data;
};

exports.getAvailableGroup = async function(userId, scores) {
    const topicId = scores[0].topicId;
    const results = await this.popPretestScores(userId);
    if (results === null) return null;

    let members = [userId];
    results.forEach(x => {
        Array(acceptableRank).fill().forEach((_, i) => {
            if (x.scores[i].topicId === topicId) members.push(x.userId);
        });
    });

    if (members.length >= numMembers) {
        return await initializeGroup(topicId, members.slice(0, numMembers));
    }

    return null;
};

////

exports.pushPretestScores = async function(userId, sessionId, scores) {
    let results = JSON.parse(await redis.getAsync(REDIS_PRETEST_SCORES_QUEUE));
    if (results === null) results = [];

    let found = false;
    results.forEach(result => {
        if (result.userId === userId) {
            found = true;
            result.scores = scores;
        }
    });

    if (!found) {
        results.push({
            userId: userId,
            scores: scores
        });
    }

    await redis.setAsync(REDIS_PRETEST_SCORES_QUEUE, JSON.stringify(results));
    return results;
};

exports.popPretestScores = async function(userId) {
    let results = JSON.parse(await redis.getAsync(REDIS_PRETEST_SCORES_QUEUE));
    if (results !== null) {
        results = results.filter(x => x.userId !== userId);
        await redis.setAsync(REDIS_PRETEST_SCORES_QUEUE, JSON.stringify(results));
    }

    return results;
};