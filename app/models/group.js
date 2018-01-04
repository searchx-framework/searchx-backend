'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const GroupSchema = new Schema({
    groupId: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: true
    },
    topics: {
        type: Schema.Types.Mixed,
        required: true
    },
    members: {
        type: Schema.Types.Mixed,
        required: true
    },

    scores: {
        type: Schema.Types.Mixed,
        default: {}
    },
    sessionId: {
        type: String
    },
    assignedTopicId: {
        type: String
    }
}, {minimize: false});

module.exports = mongoose.model('Group', GroupSchema);