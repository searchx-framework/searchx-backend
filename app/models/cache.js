'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const CacheSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    query: {
        type: String,
        required: true
    },
    vertical: {
        type: String,
        required: true
    },
    page: {
        type: Number,
        required: true
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    },
    provider: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Cache', CacheSchema);