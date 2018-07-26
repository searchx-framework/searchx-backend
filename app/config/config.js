'use strict';

module.exports = {
    outDir: './out',
    testDb: 'mongodb://localhost/searchx-test',
    testUrl: 'http://localhost',
    cacheFreshness: 3600,
    scrapFreshness: 60 * 60 * 24,
    bingAccessKey: undefined, /* fe.moraesg@outlook.com */
    defaultProvider: 'bing',
};