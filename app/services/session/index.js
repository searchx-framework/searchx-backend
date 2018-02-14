'use strict';

const learning = require('./task/learning');

exports.getUserTask = async function(userId, collaborative) {
    return await learning.getUserTask(userId, collaborative)
};