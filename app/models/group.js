'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const GroupSchema = new Schema({
    created: {
        type: Date,
        required: true
    },
    task: {
        type: String,
        required: true
    },
    members: {
        type: [Schema.Types.Mixed],
        default: []
    },
    topic: {
        type: Schema.Types.Mixed
    },
    meta: {
        type: Schema.Types.Mixed
    }
}, {minimize: false});

module.exports = mongoose.model('Group', GroupSchema);