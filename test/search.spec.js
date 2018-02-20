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

    it('should handle web search', async function(done) {
        try {
            const res = await search.search('business', 'web', 1, sid, uid);
            res.should.have.property('results');
            res.results.length.should.be.exactly(10);
            done();
        } catch(err) {
            console.log(err);
        }
    });

    it('should handle news search', async function(done) {
        try {
            const res = await search.search('business', 'news', 1, sid, uid);
            res.should.have.property('results');
            res.results.length.should.be.exactly(10);
            done();
        } catch(err) {
            console.log(err);
        }
    });

    it('should handle image search', async function(done) {
        try {
            const res = await search.search('business', 'images', 1, sid, uid);
            res.should.have.property('results');
            res.results.length.should.be.exactly(12);
            done();
        } catch(err) {
            console.log(err);
        }
    });

    it('should handle video search', async function(done) {
        try {
            const res = await search.search('business', 'videos', 1, sid, uid);
            res.should.have.property('results');
            res.results.length.should.be.exactly(12);
            done();
        } catch(err) {
            console.log(err);
        }
    });
});