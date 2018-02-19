'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const QueryHistorySchema = new Schema({
    sessionId: {
        type: String
    },
    userId: {
        type: String
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

const BookmarkSchema = new Schema({
    sessionId: {
        type: String
    },
    userId: {
        type: String
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

    starred: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
});

const AnnotationSchema = new Schema({
    sessionId: {
        type: String
    },
    userId: {
        type: String
    },
    created: {
        type: Date,
        required: true
    },

    url: {
        type: String,
        required: true
    },
    annotation: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
});

const RatingSchema = new Schema({
    sessionId: {
        type: String
    },
    userId: {
        type: String
    },
    created: {
        type: Date,
        required: true
    },

    url: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
});

const ViewSchema = new Schema({
    sessionId: {
        type: String
    },
    userId: {
        type: String
    },
    created: {
        type: Date,
        required: true
    },

    url: {
        type: String,
        required: true
    },
});

module.exports = {
    QueryHistory: mongoose.model('QueryHistory', QueryHistorySchema),
    Bookmark: mongoose.model('Bookmark', BookmarkSchema),
    Annotation: mongoose.model('Annotation', AnnotationSchema),
    Rating: mongoose.model('Rating', RatingSchema),
    View: mongoose.model('View', ViewSchema),
};