'use strict';

const underscore = require('underscore');
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

exports.sample = function(a, n) {
    return underscore.take(underscore.shuffle(a), n);
};

exports.arraysEqual = function(_arr1, _arr2) {

    if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
      return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();

    for (var i = 0; i < arr1.length; i++) {

        if (arr1[i] !== arr2[i])
            return false;

    }

    return true;

}