'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const config   = require('../app/config/config');
require('../app/config/initializers/mongoose')(config.db);

const should = require('should');
const search = require('../app/services/search');

describe('search', function() {
    const uid = '123';
    const sid = '123';

    it('should handle web search', async function() {
        const res = await search.search('business', 'web', 1, sid, uid, 'bing');
        res.should.have.property('results');
        res.results.length.should.be.exactly(10);
    });

    it('should handle news search', async function() {
        const res = await search.search('business', 'news', 1, sid, uid, 'bing');
        res.should.have.property('results');
        res.results.length.should.be.exactly(10);
    });

    it('should handle image search', async function() {
        const res = await search.search('business', 'images', 1, sid, uid, 'bing');
        res.should.have.property('results');
        res.results.length.should.be.exactly(12);
    });

    it('should handle video search', async function() {
        const res = await search.search('business', 'videos', 1, sid, uid, 'bing');
        res.should.have.property('results');
        res.results.length.should.be.exactly(12);
    });

    it('should handle web search with elasticsearch provider', async function() {
        const res = await search.search('business', 'web', 1, sid, uid, 'elasticsearch');
        res.should.have.property('results');
        res.results.length.should.be.exactly(10);
    });

    it('should throw an error with a non-existing provider', async function() {
        try {
            const res = await search.search('business', 'web', 1, sid, uid, '56f403a4-e2f3-44c5-bca5-5c430b218a89');
        } catch (err) {
            err.name.should.be.exactly('Bad Request');
        }
    });

    it('should throw an error with an invalid vertical', async function() {
        try {
            const res = await search.search('business', '56f403a4-e2f3-44c5-bca5-5c430b218a89', 1, sid, uid, 'bing');
        } catch (err) {
            err.name.should.be.exactly('Bad Request');
        }
    });
});