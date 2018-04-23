'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const ViewedResultsSchema = new Schema({
    query: {
        type: String,
        required: true
    },
    vertical: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required:true
    },
    userId: {
        type: String,
        required:true
    },
    resultIds: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('ViewedResults', ViewedResultsSchema);