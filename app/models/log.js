'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const LogSchema = new Schema({
    event: {
        type: String,
        required: true
    },
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
    meta: {
        type: Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Log', LogSchema);