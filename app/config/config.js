'use strict';

module.exports = {
    outDir: './out',
    testDb: 'mongodb://localhost/searchx-test',
    testUrl: 'http://localhost',
    cacheFreshness: 3600,
    scrapFreshness: 60 * 60 * 24,
    enableScrap : false,
    enableCache : true
};