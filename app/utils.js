'use strict';

const config = require('./config/config');

exports.isAString = function(s) {
    return !(typeof s === 'undefined' || s == null || typeof s !== 'string');
};

exports.isPosInteger = function(i) {
    return !(typeof i === 'undefined' || i == null || typeof i !== 'number' || i < 0);
};

exports.isObject = function(o) {
    return !(typeof o === 'undefined' || o == null || typeof o !== 'object');
};

exports.isFresh = function(date) {
    const currentDate = new Date;
    return (currentDate - date) / 1000 <= config.cacheFreshness;
};