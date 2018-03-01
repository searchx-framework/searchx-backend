'use strict';

const path     = require('path');
const rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
    rootPath: rootPath,
    port: process.env.PORT || 443,
    app: {
        name: 'SearchX Backend'
    },

    outDir: './out',
    cacheFreshness: 3600,
    scrapFreshness: 60 * 60 * 24,
};