'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const LogSchema = new Schema({
    userId: {
        type: String
    },
    sessionId: {
        type: String
    },
    date: {
        type: Date
    },
    task: {
        type: Schema.Types.Mixed
    },
    event: {
        type: String,
        required: true
    },
    meta: {
        type: Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Log', LogSchema);