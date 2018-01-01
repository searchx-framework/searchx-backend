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
    return sample(topics, n);
}

////

const getGroupId = function(userId) {
    // TODO : improve generation of group ID
    let index = 0;
    for (let key in codes) {
        index += 1;
        if (key === userId) break;
    }

    return Math.ceil(index/2);
};

const initializeGroup = function(groupId, callback) {
    const query = Group.findOne({'groupId': groupId}).select();

    query.lean().exec()
        .then((data) => {
            if (!data) {
                const group = {
                    groupId: groupId,
                    created: new Date(),
                    topics: sampleTopics(3)
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