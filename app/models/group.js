'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const GroupSchema = new Schema({
    created: {
        type: Date,
        required: true
    },

    nMembers: {
        type: Number,
        default: 0
    },
    members: {
        type: [Schema.Types.Mixed],
        default: []
    },
    scores: {
        type: [Schema.Types.Mixed],
        default: []
    },

    topics: {
        type: Schema.Types.Mixed,
        required: true
    },
    topic: {
        type: Schema.Types.Mixed
    }
}, {minimize: false});

module.exports = mongoose.model('Group', GroupSchema);