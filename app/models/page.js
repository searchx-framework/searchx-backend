'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var PageSchema = new Schema({
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
