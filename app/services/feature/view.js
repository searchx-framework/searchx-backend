'use strict';

const mongoose = require('mongoose');
const View = mongoose.model('View');

////

exports.getViews = async function(sessionId, url) {
    const views = await View.find({sessionId: sessionId, url: url});
    return views.length;
};

exports.pushView = async function(sessionId, userId, url) {
    if (url === null) {
        return;
    }

    const view = new View({
        sessionId: sessionId,
        userId: userId,
        created: new Date(),
        url: url,
    });
    view.save();
};