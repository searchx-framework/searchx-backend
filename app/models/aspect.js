'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const AspectSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    aspects: {
        type: Array,
        required: true
    },
    novelty: {
        type: Map,
        require: true
    },
    documents : {
        type: Map,
        required: true
    },
    centroidvectors : {
        type: Map
    }
});

module.exports = mongoose.model('Aspect', AspectSchema);
