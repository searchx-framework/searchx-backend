'use strict';

const mongoose = require('mongoose');
const Log = mongoose.model('Log');
const sensemaking = require('./sensemaking');

exports.insertLogs = async function(userId, queue) {
    
    queue = queue
        .filter(event => {
            return typeof event === 'object' && event.userId === userId;
        })
        .map(event => {
            if (!('date' in event)) event.date = new Date();
            return event;
        });

    sensemaking.handleUserLogs(queue);
    
    return Log.insertMany(queue);
};