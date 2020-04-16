'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const GroupSchema = new Schema({
    created: {
        type: Date,
        required: true
    },
    members: {
        type: [Schema.Types.Mixed],
        default: []
    },
    taskId: {
        type: String,
        required: true
    },
    taskData: {
        type: Schema.Types.Mixed
    },
    status: {
        type: String,
        default: "forming"
    }
}, {minimize: false});

module.exports = mongoose.model('Group', GroupSchema);