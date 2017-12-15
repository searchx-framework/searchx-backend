'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var BookmarkSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);