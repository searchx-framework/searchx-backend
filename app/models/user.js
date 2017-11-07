'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    vertical: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    courseId: {
        type: String,
        required: true
    },
    signal: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('User', UserSchema);