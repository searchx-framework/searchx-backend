'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const LogSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    task: {
        type: Schema.Types.Mixed
    },
    event: {
        type: String,
        required: true
    },
    meta: {
        type: Schema.Types.Mixed,
        required: true
    }
});

module.exports = mongoose.model('Log', LogSchema);