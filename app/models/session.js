'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const BookmarkSchema = new Schema({
    sessionId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: true
    },

    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true
    },
});

const QueryHistorySchema = new Schema({
    sessionId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: true
    },
    query: {
        type: String,
        required: true
    },
});

module.exports = {
    Bookmark: mongoose.model('Bookmark', BookmarkSchema),
    QueryHistory: mongoose.model('QueryHistory', QueryHistorySchema),
};