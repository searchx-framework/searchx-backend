'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const PagePositionSchema = new Schema({
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
    pageNumber: {
        type: Number,
        required: true
    },
    sessionId: {
        type: String,
        required:true
    },
    userId: {
        type: String,
        required: true
    },
    lastPosition: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('PagePosition', PagePositionSchema);