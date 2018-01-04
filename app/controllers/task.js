'use strict';

const underscore = require('underscore');
const mongoose = require('mongoose');
const Group    = mongoose.model('Group');

const topics = require('../../static/data/topics.json');
const codes = require('../../static/data/codes.json');

////

const numMembers = 2;
const namePool = ['Bailey', 'Jules', 'Alex', 'Micah', 'Kyle', 'Charlie', 'Drew', 'Logan', 'Taylor', 'Hayden', 'Nico', 'Jaden', 'Jordan', 'Riley', 'Rowan', 'Parker']; // http://www.cosmopolitan.com/lifestyle/a57226/popular-unisex-baby-names/

////

function sample(a, n) {
    return underscore.take(underscore.shuffle(a), n);
}

function sampleTopics(n) {
    const properTopics = underscore.omit(topics, "0");
    let samples = sample(properTopics, n + 1);
    samples['1'] = topics['0'];

    return samples;
}

////

// TODO : improve generation of group ID
const getGroupId = function(userId) {
    let index = 0;
    for (let key in codes) {
        index += 1;
        if (key === userId) break;
    }

    return Math.ceil(index/numMembers) - 1;
};

////

const initializeGroupMembers = function(groupId) {
    const keys = Object.keys(codes);
    const names = sample(namePool, numMembers);
    let members = {};

    Array(numMembers).fill().forEach((_,i) => {
        const index = groupId * numMembers + i;
        const userId = keys[index];
        members[userId] = names[i];
    });

    return members;
};

const initializeGroup = function(groupId, callback) {
    const query = Group.findOne({'groupId': groupId});

    query.lean().exec()
        .then((data) => {
            if (!data) {
                const group = {
                    groupId: groupId,
                    created: new Date(),
                    topics: sampleTopics(3),
                    members: initializeGroupMembers(groupId)
                };

                new Group(group).save((err) => {
                    if (err) {
                        console.log(err);
                        callback(true, {});
                    } else {
                        callback(false, group);
                    }
                });

            } else {
                callback(false, data);
            }
        })
        .catch((err) => {
            console.log(err);
            callback(true, {});
        });
};

const getGroupById = async function(groupId) {
    const query = Group.findOne({'groupId': groupId});
    return await query.exec()
        .catch((err) => console.log(err));
};

////

exports.getGroupId = function(userId) {
    return getGroupId(userId);
};

exports.getGroupMembers = async function(groupId) {
    const group = await getGroupById(groupId);
    return group.members;
};

exports.getGroupSession = async function(groupId) {
    const group = await getGroupById(groupId);
    return group.sessionId;
};

exports.savePretestScores = async function(userId, sessionId, scores) {
    const groupId = getGroupId(userId);
    const group = await getGroupById(groupId);

    if (group) {
        group.scores[userId] = scores;
        group.markModified('scores');

        if (!group.sessionId) {
            group.sessionId = sessionId;
        }

        await group.save((err) => {
            if (err) console.log(err);
        });
    }
};

exports.getGroupTopic = async function(groupId) {
    const group = await getGroupById(groupId);

    if (group) {
        if (group.assignedTopicId) {
            return group.assignedTopicId;
        }

        ////

        const nscores = Object.keys(group.scores).length;
        const nmembers = Object.keys(group.members).length;
        if (nscores < nmembers) {
            return null;
        }

        ////

        let totals = {};
        Object.values(group.scores).forEach((member) => {
            Object.keys(member).forEach((i) => {
                if (i !== '1') { // skip test score
                    if (!totals[i]) totals[i] = 0;
                    totals[i] += member[i];
                }
            });
        });

        const items = Object.keys(totals)
            .map((key) => {
                return [key, totals[key]];
            });

        items.sort((a,b) => {
            return a[1] - b[1];
        });

        const topicId = items[0][0];

        ////

        group.assignedTopicId = topicId;
        await group.save((err) => {
            if (err) console.log(err);
        });

        return topicId;
    }

    return '-1';
};

exports.disableGroup = async function(groupId) {
    const group = await getGroupById(groupId);

    if (group) {
        if (!group.assignedTopicId) {
            group.assignedTopicId = '-1';
            await group.save((err) => {
                if (err) console.log(err);
            });
        }

        return group.assignedTopicId
    }

    return '-1';
};

////

exports.getUserTask = function(req, res) {
    const userId = req.params.userId;
    const collaborative = req.query.collaborative === 'true';

    if(!codes[userId]) {
        res.status(503).json({
            error: true,
            message: 'Invalid ID.'
        });
    } else {

        if (collaborative) {
            const groupId = getGroupId(userId);
            initializeGroup(groupId, (err, data) => {
                if(err) {
                    res.status(503).json({
                        error: true,
                        message: 'The request resulted in a backend time out or backend error. The team is investigating the issue. We are sorry for the inconvenience.'
                    });
                } else {
                    data.code = codes[userId];
                    res.status(200).json(data);
                }
            });

        } else {
            const data = {
                topics: sampleTopics(3),
                code: codes[userId]
            };
            res.status(200).json(data);
        }
    }
};
