'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var GroupSchema = new Schema({

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

    assignedTopicId: {
        type: String
    },
    results: {
        type: Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Group', GroupSchema);