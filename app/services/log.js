'use strict';

const mongoose = require('mongoose');
const Log = mongoose.model('Log');

exports.createLog = async function(userId, queue) {
    queue.forEach(event => {
        if (typeof event !== 'object' || event.userId !== userId){
            throw new Error('Bad Request')
        }

        event.date = new Date();
    });

    Log.insertMany(queue);
};