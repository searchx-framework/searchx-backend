'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var ProfileSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    taskId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },

});

module.exports = mongoose.model('Profile', ProfileSchema);