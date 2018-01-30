'use strict';

// Extend base configuration with an environment-specific configuration
module.exports = Object.assign(
    require(__dirname + '/env/all.js'),
    require(__dirname + '/env/' + process.env.NODE_ENV + '.js') || {}
);