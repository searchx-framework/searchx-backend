'use strict';

const underscore = require('underscore');
const mongoose = require('mongoose');
const Group    = mongoose.model('Group');

const topics = require('../../static/data/topics.json');
const codes = require('../../static/data/codes.json');

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

////  TODO : improve generation of group ID

const groupMembers = 2;

const getGroupId = function(userId) {
    let index = 0;
    for (let key in codes) {
        index += 1;
        if (key === userId) break;
    }

    return Math.ceil(index/groupMembers) - 1;
};

const getGroupMembers = function(groupId) {
    const keys = Object.keys(codes);
    let members = [];

    Array(groupMembers).fill().forEach((_,i) => {
        members.push(keys[groupId * groupMembers + i]);
    });

    return members;
};

////

const initializeGroup = function(groupId, callback) {
    const query = Group.findOne({'groupId': groupId}).select();

    query.lean().exec()
        .then((data) => {
            if (!data) {
                const group = {
                    groupId: groupId,
                    created: new Date(),
                    topics: sampleTopics(3),
                    members: getGroupMembers(groupId)
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
