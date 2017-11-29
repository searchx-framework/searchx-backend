'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var RatingSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    vertical: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    serpId: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Rating', RatingSchema);