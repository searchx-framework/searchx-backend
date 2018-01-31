'use strict';

const mongoose = require('mongoose');
const QueryHistory = mongoose.model('QueryHistory');

////

exports.getQueryHistory = async function(sessionId) {
    return await QueryHistory
        .find({sessionId: sessionId})
        .sort({created: 1});
};

exports.pushQueryHistory = async function(sessionId, userId, query) {
    const data = {
        sessionId: sessionId,
        userId: userId,
        query: query
    };

    const doc = await QueryHistory.findOne(data);
    if (!doc) {
        data.created = new Date();

        const Q = new QueryHistory(data);
        Q.save();
    }
};
