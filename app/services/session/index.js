'use strict';

const learning = require('./learning');

exports.getUserTask = async function(userId, collaborative) {
    return await learning.getUserTask(userId, collaborative)
};