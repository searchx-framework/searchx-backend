'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const UserSchema = new Schema({
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
    signal: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);