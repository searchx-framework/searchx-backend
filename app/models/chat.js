'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const ChatSchema = new Schema({
    created: {
        type: Date,
        required: true
    },
    messageList: {
        type: [Schema.Types.Mixed],
        default: []
    },
    sessionId: {
        type: String,
        required: true
    }
}, {minimize: false});

module.exports = mongoose.model('Chat', ChatSchema);