'use strict';

// Load a utility library
var _ = require('lodash');

// Extend base configuration with an environment-specific configuration
module.exports = _.assign(
    require(__dirname + '/env/all.js'),
    require(__dirname + '/env/' + process.env.NODE_ENV + '.js') || {}
);