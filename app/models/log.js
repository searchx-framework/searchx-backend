'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const LogSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    meta: {
        type: Schema.Types.Mixed,
        required: true
    },
    task: {
        type: Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Log', LogSchema);