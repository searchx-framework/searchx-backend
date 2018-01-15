'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const GroupSchema = new Schema({
    created: {
        type: Date,
        required: true
    },
    members: {
        type: Schema.Types.Mixed,
        required: true
    },
    topic: {
        type: Schema.Types.Mixed,
        required: true
    }
}, {minimize: false});

module.exports = mongoose.model('Group', GroupSchema);