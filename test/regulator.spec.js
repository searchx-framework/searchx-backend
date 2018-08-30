'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const config = require('../app/config/config');
require('../app/config/initializers/mongoose')(config.testDb);

const should = require('should');
const mongoose = require('mongoose');
const Bookmark = mongoose.model('Bookmark');
const regulator = require('../app/services/search/regulator');
const bookmark = require("../app/services/features/bookmark");

describe('regulator (requires a working search provider)', function () {
    const uid1 = '123';
    const uid2 = '124';
    const sid = '123';

    const relevanceFeedbackTests = [
        {relevanceFeedback: false, expected: 0},
        {relevanceFeedback: 'individual', expected: 1},
        {relevanceFeedback: 'shared', expected: 2}
    ];

    const distributionOfLabourTests = [
        {distributionOfLabour: false, expected: 10},
        {distributionOfLabour: 'unbookmarkedSoft', expected: 12},
        {distributionOfLabour: 'unbookmarkedOnly', expected: 10}
    ];

    before(async function () {
        const data1 = {
            userId: uid1,
            url: 'ViMZ92EBU0zMMLnalHhD',
            title: 'Title 1',
            sessionId: sid,
            created: new Date('2018-03-28T20:03:34.833Z'),
            date: new Date('2018-03-28T20:03:34.833Z')
        };
        await bookmark.addBookmark(sid, data1);
        const data2 = {
            userId: uid2,
            url: 'WCMZ92EBU0zMMLnalHhD',
            title: 'Title 2',
            sessionId: sid,
            created: new Date('2018-03-28T20:24:20.922Z'),
            date: new Date('2018-03-28T20:24:20.922Z')
        };
        await bookmark.addBookmark(sid, data2);
    });

    // relevanceFeedbackTests.forEach(function (test) {
    //     it('should send correct number of documents to provider for relevanceFeedback ' + test.relevanceFeedback, async function () {
    //         const res = await regulator.fetch('business', 'web', 1, sid, uid1, 'bing', test.relevanceFeedback, false);
    //         res.should.have.property('results');
    //         res.results.length.should.be.exactly(test.expected);
    //     });
    // });

    distributionOfLabourTests.forEach(function (test) {
        it('should return the correct number of documents for distributionOfLabour ' + test.distributionOfLabour, async function () {
            const res = await regulator.fetch('business', 'text', 1, sid, uid1, 'elasticsearch', false, test.distributionOfLabour);
            res.should.have.property('results');
            res.results.length.should.be.exactly(test.expected);
        });
    });

    it('should throw an error with an invalid relevanceFeedback', async function () {
        try {
            const res = await regulator.fetch('business', 'text', 1, sid, uid1, 'elasticsearch', 'f6735f6f-3e1e-4f83-8e52-a1ce0eeed432', false);
        } catch (err) {
            err.name.should.be.exactly('Bad Request');
        }
    });

    it('should throw an error with an invalid distributionOfLabour', async function () {
        try {
            const res = await regulator.fetch('business', 'text', 1, sid, uid1, 'elasticsearch', false, 'f6735f6f-3e1e-4f83-8e52-a1ce0eeed432');
        } catch (err) {
            err.name.should.be.exactly('Bad Request');
        }
    });
});