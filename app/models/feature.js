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

const bookmarkExcludeFields = {
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
    deleted: {
        type: Boolean,
        default: false
    }
};

const ExcludeSchema = new Schema(bookmarkExcludeFields);

bookmarkExcludeFields.starred = {
    type: Boolean,
    default: false
};

const BookmarkSchema = new Schema(bookmarkExcludeFields);

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

const PopularQuerySchema = new Schema({
    _id : {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    }
});

module.exports = {
    QueryHistory: mongoose.model('QueryHistory', QueryHistorySchema),
    Bookmark: mongoose.model('Bookmark', BookmarkSchema),
    Exclude: mongoose.model('Exclude', ExcludeSchema),
    Annotation: mongoose.model('Annotation', AnnotationSchema),
    Rating: mongoose.model('Rating', RatingSchema),
    View: mongoose.model('View', ViewSchema),
    PopularQuery : mongoose.model('PopularQuery', PopularQuerySchema)
};