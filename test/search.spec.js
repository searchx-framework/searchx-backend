'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const config   = require('../app/config/config');
require('../app/config/initializers/mongoose')(config.testDb);

const should = require('should');
const search = require('../app/services/search');

describe('search (requires corresponding backend to be running)', function() {
    const uid = '123';
    const sid = '123';

    const tests = [
        {provider: 'elasticsearch', verticals: ['text'], expected: 10}
    ];

    // only execute bing tests if access key is set
    if (process.env.BING_ACCESS_KEY) {
        tests.push([
            {provider: 'bing', verticals: ['web', 'news'], expected: 10},
            {provider: 'bing', verticals: ['images', 'videos'], expected: 12}
        ]);
    }

    tests.forEach(function (test) {
        test.verticals.forEach(function (vertical) {
            it('should handle ' + vertical + ' search with the ' + test.provider + ' provider', async function() {
                const res = await search.search('business', vertical, 1, sid, uid, test.provider, 'false', 'false');
                res.should.have.property('results');
                res.results.length.should.be.exactly(test.expected);
            });
        });
    });

    it('should throw an error with a non-existing provider', async function() {
        try {
            const res = await search.search('business', 'web', 1, sid, uid, '56f403a4-e2f3-44c5-bca5-5c430b218a89', 'false', 'false');
        } catch (err) {
            err.name.should.be.exactly('Bad Request');
        }
    });

    it('should throw an error with an invalid vertical', async function() {
        try {
            const res = await search.search('business', '56f403a4-e2f3-44c5-bca5-5c430b218a89', 1, sid, uid, 'bing', 'false', 'false');
        } catch (err) {
            err.name.should.be.exactly('Bad Request');
        }
    });
});