'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const PageSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now()
    },
    html: {
        type: String,
        required: false
    },
    screenshot: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Page', PageSchema);
