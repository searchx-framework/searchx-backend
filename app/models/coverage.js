'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const CoverageSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    coverage: {
        type: Number,
        required: true
    },
    docid : {
        type: Number,
        required: true
    },
    aspect: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Coverage', CoverageSchema);
