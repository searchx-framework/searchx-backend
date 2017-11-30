'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var TaskSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    topicId: {
        type: String,
        required: true
    },
    taskType: {
        type: String,
        required: true
    },
    taskDuration: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Task', TaskSchema);