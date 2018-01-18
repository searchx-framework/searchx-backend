'use strict';

const mongoose = require('mongoose');
const Log = mongoose.model('Log');

exports.createLog = async function(userId, eventData) {
    let error = false;
    for (let i = 0; i < eventData.length; i++) {
        if (typeof eventData[i] !== 'object' || eventData[i].userId !== userId){
            error = true;
            break;
        }
    }

    if (error) {
        throw new Error('Bad Request')
    }

    await Log.insertMany(eventData);
};